import { ChatRole, Prisma, UserRole } from '@prisma/client';
import { writeAuditLog } from '../lib/server/audit';
import { db } from '../lib/server/db';
import {
  ApiError,
  getRequestId,
  handleApiError,
  parseJsonBody,
  sendJson,
  sendMethodNotAllowed,
} from '../lib/server/http';
import { assertOrgAccess, getAuthContext, requireRole } from '../lib/server/rbac';

type ChatRequestBody = {
  query?: string;
  conversationId?: string;
  sessionId?: string;
  projectId?: string;
  userId?: string;
};

type DifyRetrieverResource = {
  document_name?: string;
  dataset_name?: string;
  segment_id?: string;
};

type DifyChatResponse = {
  answer?: string;
  conversation_id?: string;
  message_id?: string;
  metadata?: {
    retriever_resources?: DifyRetrieverResource[];
  };
};

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

const toSources = (data: DifyChatResponse): string[] => {
  const retrieverResources = Array.isArray(data.metadata?.retriever_resources)
    ? data.metadata?.retriever_resources
    : [];

  return Array.from(
    new Set(
      retrieverResources
        .map((item) => item.document_name || item.dataset_name || item.segment_id || '')
        .filter(Boolean)
    )
  );
};

export default async function handler(req: any, res: any): Promise<void> {
  const requestId = getRequestId(req, res);
  const auth = getAuthContext(req);
  const timeoutMs = Number(process.env.DIFY_TIMEOUT_MS || 60000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    requireRole(auth, [UserRole.ADMIN, UserRole.USER]);

    if (req.method !== 'POST') {
      sendMethodNotAllowed(res, ['POST'], requestId);
      return;
    }

    const difyBaseUrl = process.env.DIFY_BASE_URL;
    const difyApiKey = process.env.DIFY_APP_API_KEY;

    if (!difyBaseUrl || !difyApiKey) {
      sendJson(
        res,
        500,
        {
          error: 'Missing server configuration: DIFY_BASE_URL or DIFY_APP_API_KEY.',
        },
        requestId
      );
      return;
    }

    const body = parseJsonBody<ChatRequestBody>(req.body);
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    const conversationId =
      typeof body.conversationId === 'string' && body.conversationId.trim()
        ? body.conversationId.trim()
        : undefined;
    const userId =
      typeof body.userId === 'string' && body.userId.trim()
        ? body.userId.trim()
        : auth.userId || 'cnsc-web-user';

    if (!query) {
      throw new ApiError(400, 'query is required.');
    }

    const requestedSessionId =
      typeof body.sessionId === 'string' && body.sessionId.trim() ? body.sessionId.trim() : null;
    const requestedProjectId =
      typeof body.projectId === 'string' && body.projectId.trim() ? body.projectId.trim() : null;

    let sessionId: string | null = requestedSessionId;

    if (sessionId) {
      const existingSession = await db.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          project: {
            select: {
              orgId: true,
            },
          },
        },
      });

      if (!existingSession) {
        throw new ApiError(404, 'Chat session not found.');
      }

      if (existingSession.project?.orgId) {
        assertOrgAccess(auth, existingSession.project.orgId);
      }
    } else {
      if (requestedProjectId) {
        const project = await db.project.findUnique({
          where: { id: requestedProjectId },
        });

        if (!project) {
          throw new ApiError(404, 'Project not found.');
        }
        assertOrgAccess(auth, project.orgId);
      }

      const createdSession = await db.chatSession.create({
        data: {
          projectId: requestedProjectId,
        },
      });

      sessionId = createdSession.id;
    }

    const upstreamResponse = await fetch(`${normalizeBaseUrl(difyBaseUrl)}/v1/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: 'blocking',
        conversation_id: conversationId,
        user: userId,
      }),
      signal: controller.signal,
    });

    const rawText = await upstreamResponse.text();
    let upstreamData: DifyChatResponse | { [key: string]: unknown } = {};

    try {
      upstreamData = rawText ? (JSON.parse(rawText) as DifyChatResponse) : {};
    } catch {
      upstreamData = { raw: rawText };
    }

    if (!upstreamResponse.ok) {
      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'CHAT_UPSTREAM_ERROR',
        targetType: 'ChatSession',
        targetId: sessionId,
        metaJson: {
          statusCode: upstreamResponse.status,
          details: JSON.stringify(upstreamData),
        },
      });

      sendJson(
        res,
        upstreamResponse.status,
        {
          error: 'Dify request failed.',
          details: upstreamData,
          sessionId,
        },
        requestId
      );
      return;
    }

    const chatData = upstreamData as DifyChatResponse;
    const answer = chatData.answer || '';
    const sources = toSources(chatData);

    if (sessionId) {
      await db.$transaction([
        db.chatMessage.create({
          data: {
            sessionId,
            role: ChatRole.USER,
            content: query,
          },
        }),
        db.chatMessage.create({
          data: {
            sessionId,
            role: ChatRole.ASSISTANT,
            content: answer,
            citationsJson: sources.length > 0 ? ({ sources } as Prisma.InputJsonValue) : Prisma.JsonNull,
          },
        }),
      ]);
    }

    await writeAuditLog({
      requestId,
      userId: auth.userId,
      action: 'CHAT_MESSAGE',
      targetType: 'ChatSession',
      targetId: sessionId,
      metaJson: {
        difyConversationId: chatData.conversation_id || null,
      },
    });

    sendJson(
      res,
      200,
      {
        answer,
        conversationId: chatData.conversation_id || null,
        messageId: chatData.message_id || null,
        sessionId,
        sources,
      },
      requestId
    );
  } catch (error) {
    await writeAuditLog({
      requestId,
      userId: auth.userId,
      action: 'CHAT_ERROR',
      targetType: 'ChatSession',
      metaJson: {
        message: error instanceof Error ? error.message : String(error),
      },
    });
    handleApiError(res, error, requestId);
  } finally {
    clearTimeout(timer);
  }
}

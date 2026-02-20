import { DocumentStatus, DocumentType, UserRole } from '@prisma/client';
import { writeAuditLog } from '../../lib/server/audit';
import { db } from '../../lib/server/db';
import {
  ApiError,
  getQueryParam,
  getRequestId,
  handleApiError,
  parseJsonBody,
  sendJson,
  sendMethodNotAllowed,
} from '../../lib/server/http';
import { assertOrgAccess, getAuthContext, requireRole } from '../../lib/server/rbac';

type UpdateDocumentBody = {
  name?: string;
  type?: string;
  size?: number;
  status?: string;
  difyDocumentId?: string | null;
};

const parseType = (value: string): DocumentType => {
  const normalized = value.trim().toUpperCase();
  if ((Object.values(DocumentType) as string[]).includes(normalized)) {
    return normalized as DocumentType;
  }
  throw new ApiError(400, `Invalid document type: ${value}`);
};

const parseStatus = (value: string): DocumentStatus => {
  const normalized = value.trim().toUpperCase();
  if ((Object.values(DocumentStatus) as string[]).includes(normalized)) {
    return normalized as DocumentStatus;
  }
  throw new ApiError(400, `Invalid document status: ${value}`);
};

export default async function handler(req: any, res: any): Promise<void> {
  const requestId = getRequestId(req, res);
  const auth = getAuthContext(req);
  const documentId = getQueryParam(req, 'id');

  try {
    if (!documentId) {
      throw new ApiError(400, 'Document id is required.');
    }

    const document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        project: {
          select: { orgId: true },
        },
      },
    });

    if (!document) {
      throw new ApiError(404, 'Document not found.');
    }

    assertOrgAccess(auth, document.project.orgId);

    if (req.method === 'GET') {
      requireRole(auth, [UserRole.ADMIN, UserRole.USER]);

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'DOCUMENT_READ',
        targetType: 'Document',
        targetId: document.id,
      });

      sendJson(res, 200, { document }, requestId);
      return;
    }

    if (req.method === 'PATCH') {
      requireRole(auth, [UserRole.ADMIN]);
      const body = parseJsonBody<UpdateDocumentBody>(req.body);
      const data: {
        name?: string;
        type?: DocumentType;
        size?: number;
        status?: DocumentStatus;
        difyDocumentId?: string | null;
      } = {};

      if (typeof body.name === 'string') data.name = body.name.trim();
      if (typeof body.type === 'string') data.type = parseType(body.type);
      if (typeof body.status === 'string') data.status = parseStatus(body.status);
      if (typeof body.size !== 'undefined') {
        const numericSize = Number(body.size);
        if (Number.isNaN(numericSize) || numericSize < 0) {
          throw new ApiError(400, 'size must be a non-negative number.');
        }
        data.size = numericSize;
      }
      if (typeof body.difyDocumentId === 'string') data.difyDocumentId = body.difyDocumentId.trim();
      if (body.difyDocumentId === null) data.difyDocumentId = null;

      if (Object.keys(data).length === 0) {
        throw new ApiError(400, 'No updatable fields provided.');
      }

      const updated = await db.document.update({
        where: { id: document.id },
        data,
      });

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'DOCUMENT_UPDATE',
        targetType: 'Document',
        targetId: updated.id,
        metaJson: data,
      });

      sendJson(res, 200, { document: updated }, requestId);
      return;
    }

    if (req.method === 'DELETE') {
      requireRole(auth, [UserRole.ADMIN]);

      await db.document.delete({
        where: { id: document.id },
      });

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'DOCUMENT_DELETE',
        targetType: 'Document',
        targetId: document.id,
      });

      sendJson(res, 200, { deleted: true, id: document.id }, requestId);
      return;
    }

    sendMethodNotAllowed(res, ['GET', 'PATCH', 'DELETE'], requestId);
  } catch (error) {
    handleApiError(res, error, requestId);
  }
}

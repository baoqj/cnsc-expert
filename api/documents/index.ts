import { DocumentStatus, DocumentType, Prisma, UserRole } from '@prisma/client';
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

type CreateDocumentBody = {
  projectId?: string;
  name?: string;
  type?: string;
  size?: number;
  status?: string;
  difyDocumentId?: string;
};

const parseDocumentType = (value: string | undefined): DocumentType => {
  if (!value) return DocumentType.PDF;
  const normalized = value.trim().toUpperCase();
  if ((Object.values(DocumentType) as string[]).includes(normalized)) {
    return normalized as DocumentType;
  }
  throw new ApiError(400, `Invalid document type: ${value}`);
};

const parseDocumentStatus = (value: string | undefined): DocumentStatus => {
  if (!value) return DocumentStatus.UPLOADED;
  const normalized = value.trim().toUpperCase();
  if ((Object.values(DocumentStatus) as string[]).includes(normalized)) {
    return normalized as DocumentStatus;
  }
  throw new ApiError(400, `Invalid document status: ${value}`);
};

export default async function handler(req: any, res: any): Promise<void> {
  const requestId = getRequestId(req, res);
  const auth = getAuthContext(req);

  try {
    if (req.method === 'GET') {
      requireRole(auth, [UserRole.ADMIN, UserRole.USER]);
      if (auth.role !== UserRole.ADMIN && !auth.orgId) {
        throw new ApiError(400, 'x-org-id is required for non-admin requests.');
      }

      const projectId = getQueryParam(req, 'projectId');
      const orgIdQuery = getQueryParam(req, 'orgId');
      const effectiveOrgId = auth.role === UserRole.ADMIN ? orgIdQuery || auth.orgId : auth.orgId;
      const where: Prisma.DocumentWhereInput = {};

      if (projectId) where.projectId = projectId;
      if (effectiveOrgId) {
        where.project = {
          orgId: effectiveOrgId,
        };
      }

      const documents = await db.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'DOCUMENT_LIST',
        targetType: 'Document',
        metaJson: {
          orgId: effectiveOrgId ?? null,
          projectId: projectId ?? null,
          count: documents.length,
        },
      });

      sendJson(res, 200, { documents }, requestId);
      return;
    }

    if (req.method === 'POST') {
      requireRole(auth, [UserRole.ADMIN]);

      const body = parseJsonBody<CreateDocumentBody>(req.body);
      const projectId = body.projectId?.trim();
      const name = body.name?.trim();
      const type = parseDocumentType(body.type);
      const status = parseDocumentStatus(body.status);
      const size = Number(body.size);

      if (!projectId || !name || Number.isNaN(size) || size < 0) {
        throw new ApiError(400, 'projectId, name and valid size are required.');
      }

      const project = await db.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new ApiError(404, 'Project not found for document.');
      }

      assertOrgAccess(auth, project.orgId);

      const document = await db.document.create({
        data: {
          projectId,
          name,
          type,
          status,
          size,
          difyDocumentId: body.difyDocumentId?.trim() || null,
        },
      });

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'DOCUMENT_CREATE',
        targetType: 'Document',
        targetId: document.id,
        metaJson: {
          projectId: document.projectId,
          status: document.status,
        },
      });

      sendJson(res, 201, { document }, requestId);
      return;
    }

    sendMethodNotAllowed(res, ['GET', 'POST'], requestId);
  } catch (error) {
    handleApiError(res, error, requestId);
  }
}

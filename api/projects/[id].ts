import { ProjectStage, UserRole } from '@prisma/client';
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

type UpdateProjectBody = {
  name?: string;
  jurisdiction?: string;
  facilityType?: string;
  stage?: string;
};

const parseStage = (value: string): ProjectStage => {
  const normalized = value.trim().toUpperCase();
  if ((Object.values(ProjectStage) as string[]).includes(normalized)) {
    return normalized as ProjectStage;
  }
  throw new ApiError(400, `Invalid stage value: ${value}`);
};

export default async function handler(req: any, res: any): Promise<void> {
  const requestId = getRequestId(req, res);
  const auth = getAuthContext(req);
  const projectId = getQueryParam(req, 'id');

  try {
    if (!projectId) {
      throw new ApiError(400, 'Project id is required.');
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found.');
    }

    assertOrgAccess(auth, project.orgId);

    if (req.method === 'GET') {
      requireRole(auth, [UserRole.ADMIN, UserRole.USER]);

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'PROJECT_READ',
        targetType: 'Project',
        targetId: project.id,
      });

      sendJson(res, 200, { project }, requestId);
      return;
    }

    if (req.method === 'PATCH') {
      requireRole(auth, [UserRole.ADMIN]);
      const body = parseJsonBody<UpdateProjectBody>(req.body);

      const data: {
        name?: string;
        jurisdiction?: string;
        facilityType?: string;
        stage?: ProjectStage;
      } = {};

      if (typeof body.name === 'string') data.name = body.name.trim();
      if (typeof body.jurisdiction === 'string') data.jurisdiction = body.jurisdiction.trim();
      if (typeof body.facilityType === 'string') data.facilityType = body.facilityType.trim();
      if (typeof body.stage === 'string') data.stage = parseStage(body.stage);

      if (Object.keys(data).length === 0) {
        throw new ApiError(400, 'No updatable fields provided.');
      }

      const updated = await db.project.update({
        where: { id: project.id },
        data,
      });

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'PROJECT_UPDATE',
        targetType: 'Project',
        targetId: updated.id,
        metaJson: data,
      });

      sendJson(res, 200, { project: updated }, requestId);
      return;
    }

    if (req.method === 'DELETE') {
      requireRole(auth, [UserRole.ADMIN]);

      await db.project.delete({
        where: { id: project.id },
      });

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'PROJECT_DELETE',
        targetType: 'Project',
        targetId: project.id,
      });

      sendJson(res, 200, { deleted: true, id: project.id }, requestId);
      return;
    }

    sendMethodNotAllowed(res, ['GET', 'PATCH', 'DELETE'], requestId);
  } catch (error) {
    handleApiError(res, error, requestId);
  }
}

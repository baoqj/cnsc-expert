import { Prisma, ProjectStage, UserRole } from '@prisma/client';
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
import { getAuthContext, requireRole } from '../../lib/server/rbac';

type CreateProjectBody = {
  orgId?: string;
  name?: string;
  jurisdiction?: string;
  facilityType?: string;
  stage?: string;
};

const parseProjectStage = (stageInput: string | undefined): ProjectStage => {
  if (!stageInput) return ProjectStage.INITIATION;
  const normalized = stageInput.trim().toUpperCase();
  if ((Object.values(ProjectStage) as string[]).includes(normalized)) {
    return normalized as ProjectStage;
  }
  throw new ApiError(400, `Invalid stage value: ${stageInput}`);
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

      const queryOrgId = getQueryParam(req, 'orgId');
      const effectiveOrgId = auth.role === UserRole.ADMIN ? queryOrgId || auth.orgId : auth.orgId;
      const where: Prisma.ProjectWhereInput = effectiveOrgId ? { orgId: effectiveOrgId } : {};

      const projects = await db.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              documents: true,
              complianceRuns: true,
            },
          },
        },
      });

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'PROJECT_LIST',
        targetType: 'Project',
        metaJson: {
          orgId: effectiveOrgId ?? null,
          count: projects.length,
        },
      });

      sendJson(res, 200, { projects }, requestId);
      return;
    }

    if (req.method === 'POST') {
      requireRole(auth, [UserRole.ADMIN]);

      const body = parseJsonBody<CreateProjectBody>(req.body);
      const orgId = body.orgId?.trim() || auth.orgId;
      const name = body.name?.trim();
      const jurisdiction = body.jurisdiction?.trim();
      const facilityType = body.facilityType?.trim();
      const stage = parseProjectStage(body.stage);

      if (!orgId) {
        throw new ApiError(400, 'orgId is required.');
      }
      if (!name || !jurisdiction || !facilityType) {
        throw new ApiError(400, 'name, jurisdiction, and facilityType are required.');
      }

      const project = await db.project.create({
        data: {
          orgId,
          name,
          jurisdiction,
          facilityType,
          stage,
        },
      });

      await writeAuditLog({
        requestId,
        userId: auth.userId,
        action: 'PROJECT_CREATE',
        targetType: 'Project',
        targetId: project.id,
        metaJson: {
          orgId: project.orgId,
          stage: project.stage,
        },
      });

      sendJson(res, 201, { project }, requestId);
      return;
    }

    sendMethodNotAllowed(res, ['GET', 'POST'], requestId);
  } catch (error) {
    handleApiError(res, error, requestId);
  }
}

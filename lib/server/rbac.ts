import { UserRole } from '@prisma/client';
import { ApiError, ApiRequestLike, getHeader } from './http';

export type AuthContext = {
  userId: string | null;
  role: UserRole;
  orgId: string | null;
};

const normalizeRole = (input: string | undefined): UserRole => {
  if (!input) return UserRole.USER;
  const normalized = input.trim().toUpperCase();
  if (normalized === UserRole.ADMIN) return UserRole.ADMIN;
  return UserRole.USER;
};

export const getAuthContext = (req: ApiRequestLike): AuthContext => ({
  userId: getHeader(req, 'x-user-id') || null,
  role: normalizeRole(getHeader(req, 'x-user-role')),
  orgId: getHeader(req, 'x-org-id') || null,
});

export const requireRole = (auth: AuthContext, allowedRoles: UserRole[]): void => {
  if (!allowedRoles.includes(auth.role)) {
    throw new ApiError(403, 'Forbidden: insufficient role permission.');
  }
};

export const assertOrgAccess = (auth: AuthContext, resourceOrgId: string): void => {
  if (auth.role === UserRole.ADMIN) return;
  if (!auth.orgId || auth.orgId !== resourceOrgId) {
    throw new ApiError(403, 'Forbidden: tenant access denied.');
  }
};

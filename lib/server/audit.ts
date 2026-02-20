import { Prisma } from '@prisma/client';
import { db } from './db';

export type AuditLogInput = {
  requestId: string;
  userId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metaJson?: Prisma.InputJsonValue;
};

export const writeAuditLog = async (input: AuditLogInput): Promise<void> => {
  try {
    await db.auditLog.create({
      data: {
        requestId: input.requestId,
        userId: input.userId ?? null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        metaJson: input.metaJson ?? Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

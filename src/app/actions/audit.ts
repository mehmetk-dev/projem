'use server';

import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { getClientIP } from '@/lib/rate-limit';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'PUBLISH';
export type AuditEntity = 'blog' | 'project' | 'note' | 'todo' | 'bookmark' | 'snippet' | 'message' | 'comment' | 'guestbook' | 'user' | 'settings';

export async function logAudit(
  action: AuditAction,
  entity: AuditEntity,
  entityId?: number,
  oldValue?: string,
  newValue?: string,
  userId?: number
) {
  try {
    const ip = await getClientIP().catch(() => 'unknown');
    await db.insert(auditLogs).values({
      userId: userId || null,
      action,
      entity,
      entityId: entityId || null,
      oldValue: oldValue || null,
      newValue: newValue || null,
      ipAddress: ip,
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
}

export async function getAuditLogs() {
  await requireAdmin();
  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(200)
    .all();
}

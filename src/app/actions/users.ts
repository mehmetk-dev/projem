'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/app/actions/audit';

export interface UserActionState {
  error?: string;
  success?: string;
}

export async function getAllUsers() {
  await requireAdmin();
  return db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .all();
}

export async function updateUserRoleAction(formData: FormData): Promise<UserActionState> {
  await requireAdmin();
  const userId = Number(formData.get('userId'));
  const role = formData.get('role') as 'user' | 'admin';

  if (!userId || isNaN(userId)) return { error: 'Geçersiz kullanıcı ID.' };
  if (!role || !['user', 'admin'].includes(role)) return { error: 'Geçersiz rol.' };

  try {
    const existing = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).get();
    await db.update(users).set({ role }).where(eq(users.id, userId));
    await logAudit('UPDATE', 'user', userId, existing?.role, role);
    revalidatePath('/dashboard');
    return { success: 'Kullanıcı rolü güncellendi.' };
  } catch (error) {
    console.error('Update User Role Error:', error);
    return { error: 'Rol güncellenirken hata oluştu.' };
  }
}

export async function deleteUserAction(formData: FormData): Promise<UserActionState> {
  await requireAdmin();
  const userId = Number(formData.get('userId'));
  if (!userId || isNaN(userId)) return { error: 'Geçersiz kullanıcı ID.' };

  try {
    await db.delete(users).where(eq(users.id, userId));
    await logAudit('DELETE', 'user', userId);
    revalidatePath('/dashboard');
    return { success: 'Kullanıcı silindi.' };
  } catch (error) {
    console.error('Delete User Error:', error);
    return { error: 'Kullanıcı silinirken hata oluştu.' };
  }
}

'use server';

import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/app/actions/audit';

export interface SettingActionState {
  error?: string;
  success?: string;
}

export async function getSettings() {
  return db.select().from(siteSettings).all();
}

export async function getSettingValue(key: string): Promise<string | null> {
  const row = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).get();
  return row?.value ?? null;
}

export async function saveSettingAction(formData: FormData): Promise<SettingActionState> {
  await requireAdmin();
  const key = formData.get('key') as string;
  const value = formData.get('value') as string;

  if (!key) return { error: 'Anahtar gereklidir.' };

  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).get();
    if (existing) {
      await db.update(siteSettings).set({ value, updatedAt: new Date().toISOString() }).where(eq(siteSettings.id, existing.id));
      await logAudit('UPDATE', 'settings', existing.id, existing.value, value);
    } else {
      await db.insert(siteSettings).values({ key, value });
      await logAudit('CREATE', 'settings', undefined, undefined, `${key}=${value}`);
    }
    revalidatePath('/dashboard');
    return { success: 'Ayar kaydedildi.' };
  } catch (error) {
    console.error('Save Setting Error:', error);
    return { error: 'Ayar kaydedilirken hata oluştu.' };
  }
}

export async function deleteSettingAction(formData: FormData): Promise<SettingActionState> {
  await requireAdmin();
  const id = Number(formData.get('id'));
  if (!id || isNaN(id)) return { error: 'Geçersiz ID.' };

  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.id, id)).get();
    await db.delete(siteSettings).where(eq(siteSettings.id, id));
    if (existing) await logAudit('DELETE', 'settings', id, `${existing.key}=${existing.value}`);
    revalidatePath('/dashboard');
    return { success: 'Ayar silindi.' };
  } catch (error) {
    console.error('Delete Setting Error:', error);
    return { error: 'Silinirken hata oluştu.' };
  }
}

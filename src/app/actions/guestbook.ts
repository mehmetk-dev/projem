'use server';

import { db } from '@/db';
import { guestbookEntries } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { rateLimitCheck, getClientIP, formatRateLimitError } from '@/lib/rate-limit';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export interface GuestbookActionState {
  error?: string;
  success?: string;
}

const guestbookSchema = z.object({
  name: z.string().min(1, 'İsim gereklidir.').max(100, 'İsim en fazla 100 karakter olabilir.').trim(),
  email: z.string().email('Geçerli bir e-posta adresi girin.').max(200).trim(),
  message: z.string().min(1, 'Mesaj gereklidir.').max(2000, 'Mesaj en fazla 2000 karakter olabilir.').trim(),
});

export async function getApprovedGuestbookEntries() {
  try {
    return db
      .select()
      .from(guestbookEntries)
      .where(eq(guestbookEntries.approved, true))
      .orderBy(desc(guestbookEntries.createdAt))
      .all();
  } catch (error) {
    console.error('getApprovedGuestbookEntries error:', error);
    return [];
  }
}

export async function getAllGuestbookEntries() {
  await requireAdmin();
  return db
    .select()
    .from(guestbookEntries)
    .orderBy(desc(guestbookEntries.createdAt))
    .all();
}

export async function submitGuestbookAction(
  _prevState: GuestbookActionState | null,
  formData: FormData
): Promise<GuestbookActionState> {
  const ip = await getClientIP();
  const limit = await rateLimitCheck(`guestbook:${ip}`, 3, 300000);
  if (!limit.success) {
    return { error: formatRateLimitError(limit.resetInSeconds) };
  }

  const result = guestbookSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    await db.insert(guestbookEntries).values({
      ...result.data,
      approved: false,
    });
    revalidatePath('/guestbook');
    return { success: 'Mesajınız başarıyla gönderildi. Onaylandıktan sonra yayınlanacaktır.' };
  } catch (error) {
    console.error('Guestbook Error:', error);
    return { error: 'Mesaj gönderilirken bir hata oluştu.' };
  }
}

export async function approveGuestbookAction(formData: FormData): Promise<GuestbookActionState> {
  await requireAdmin();
  const id = Number(formData.get('id'));
  if (!id || isNaN(id)) return { error: 'Geçersiz ID.' };

  try {
    await db
      .update(guestbookEntries)
      .set({ approved: true })
      .where(eq(guestbookEntries.id, id));
    revalidatePath('/guestbook');
    revalidatePath('/dashboard');
    return { success: 'Mesaj onaylandı.' };
  } catch (error) {
    console.error('Approve Guestbook Error:', error);
    return { error: 'Onaylama sırasında bir hata oluştu.' };
  }
}

export async function deleteGuestbookAction(formData: FormData): Promise<GuestbookActionState> {
  await requireAdmin();
  const id = Number(formData.get('id'));
  if (!id || isNaN(id)) return { error: 'Geçersiz ID.' };

  try {
    await db.delete(guestbookEntries).where(eq(guestbookEntries.id, id));
    revalidatePath('/guestbook');
    revalidatePath('/dashboard');
    return { success: 'Mesaj silindi.' };
  } catch (error) {
    console.error('Delete Guestbook Error:', error);
    return { error: 'Silme sırasında bir hata oluştu.' };
  }
}

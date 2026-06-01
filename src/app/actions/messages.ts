'use server';

import { db } from '@/db';
import { messages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { rateLimitCheck, getClientIP, formatRateLimitError } from '@/lib/rate-limit';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export interface MessageActionState {
  error?: string;
  success?: string;
}

const contactSchema = z.object({
  name: z.string().min(1, 'Ad gereklidir.').max(100).trim(),
  email: z.string().email('Geçerli e-posta giriniz.').trim().toLowerCase(),
  subject: z.string().max(200).trim().optional(),
  content: z.string().min(1, 'Mesaj gereklidir.').max(5000).trim(),
});

export async function submitContactAction(
  _prevState: MessageActionState | null,
  formData: FormData
): Promise<MessageActionState> {
  const ip = await getClientIP();
  const limit = rateLimitCheck(`contact:${ip}`, 5, 60000);
  if (!limit.success) {
    return { error: formatRateLimitError(limit.resetInSeconds) };
  }

  const result = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject') || undefined,
    content: formData.get('content'),
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    await db.insert(messages).values(result.data);
    revalidatePath('/dashboard/messages');
    return { success: 'Mesajınız iletildi. En kısa sürede dönüş yapacağım.' };
  } catch (error) {
    console.error('Submit Contact Error:', error);
    return { error: 'Mesaj gönderilirken bir hata oluştu.' };
  }
}

export async function getMessages() {
  await requireAuth();
  return db.select().from(messages).orderBy(desc(messages.createdAt)).all();
}

export async function getUnreadMessageCount() {
  await requireAuth();
  const all = await db.select().from(messages).where(eq(messages.read, false)).all();
  return all.length;
}

export async function markMessageReadAction(formData: FormData): Promise<MessageActionState> {
  await requireAuth();
  const messageId = Number(formData.get('messageId'));
  if (!messageId || isNaN(messageId)) return { error: 'Geçersiz ID.' };

  try {
    await db.update(messages).set({ read: true }).where(eq(messages.id, messageId));
    revalidatePath('/dashboard/messages');
    return { success: 'Okundu olarak işaretlendi.' };
  } catch (error) {
    console.error('Mark Message Read Error:', error);
    return { error: 'İşlem sırasında hata oluştu.' };
  }
}

export async function deleteMessageAction(formData: FormData): Promise<MessageActionState> {
  await requireAuth();
  const messageId = Number(formData.get('messageId'));
  if (!messageId || isNaN(messageId)) return { error: 'Geçersiz ID.' };

  try {
    await db.delete(messages).where(eq(messages.id, messageId));
    revalidatePath('/dashboard/messages');
    return { success: 'Mesaj silindi.' };
  } catch (error) {
    console.error('Delete Message Error:', error);
    return { error: 'Silinirken hata oluştu.' };
  }
}

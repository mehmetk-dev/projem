'use server';

import { db } from '@/db';
import { directMessages, messages, users } from '@/db/schema';
import { and, asc, desc, eq, ne } from 'drizzle-orm';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
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

const directMessageSchema = z.object({
  content: z.string().min(1, 'Mesaj boş olamaz.').max(5000, 'Mesaj en fazla 5000 karakter olabilir.').trim(),
});

async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function submitContactAction(
  _prevState: MessageActionState | null,
  formData: FormData
): Promise<MessageActionState> {
  const ip = await getClientIP();
  const limit = await rateLimitCheck(`contact:${ip}`, 5, 60000);
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
  await requireAdmin();
  return db.select().from(messages).orderBy(desc(messages.createdAt)).all();
}

export async function getUnreadMessageCount() {
  await requireAdmin();
  const all = await db.select().from(messages).where(eq(messages.read, false)).all();
  return all.length;
}

export async function markMessageReadAction(formData: FormData): Promise<MessageActionState> {
  await requireAdmin();
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
  await requireAdmin();
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

export async function getDirectMessageDashboardData() {
  const user = await requireCurrentUser();
  const isAdmin = user.role === 'admin';

  if (isAdmin) {
    const [contacts, threadMessages] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(ne(users.id, user.id))
        .orderBy(desc(users.createdAt))
        .all(),
      db.select().from(directMessages).orderBy(asc(directMessages.createdAt)).all(),
    ]);

    return {
      currentUserId: user.id,
      isAdmin,
      contacts,
      directMessages: threadMessages,
    };
  }

  const [adminUser, threadMessages] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'admin'))
      .orderBy(asc(users.id))
      .get(),
    db
      .select()
      .from(directMessages)
      .where(eq(directMessages.userId, user.id))
      .orderBy(asc(directMessages.createdAt))
      .all(),
  ]);

  return {
    currentUserId: user.id,
    isAdmin,
    contacts: adminUser ? [adminUser] : [],
    directMessages: threadMessages,
  };
}

export async function sendDirectMessageAction(formData: FormData): Promise<MessageActionState> {
  const user = await requireCurrentUser();
  const result = directMessageSchema.safeParse({
    content: formData.get('content'),
  });

  if (!result.success) {
    return { error: result.error.errors.map((error) => error.message).join(' ') };
  }

  let threadUserId = user.id;
  if (user.role === 'admin') {
    threadUserId = Number(formData.get('userId'));
    if (!threadUserId || Number.isNaN(threadUserId) || threadUserId === user.id) {
      return { error: 'Mesaj göndermek için geçerli bir kullanıcı seçin.' };
    }

    const recipient = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, threadUserId), ne(users.id, user.id)))
      .get();

    if (!recipient) {
      return { error: 'Kullanıcı bulunamadı.' };
    }
  }

  try {
    await db.insert(directMessages).values({
      userId: threadUserId,
      senderId: user.id,
      content: result.data.content,
    });

    revalidatePath('/dashboard/messages');
    return { success: 'Mesaj gönderildi.' };
  } catch (error) {
    console.error('Send Direct Message Error:', error);
    return { error: 'Mesaj gönderilirken bir hata oluştu.' };
  }
}

export async function markDirectThreadReadAction(formData: FormData): Promise<MessageActionState> {
  const user = await requireCurrentUser();
  const now = new Date().toISOString();
  const threadUserId = user.role === 'admin' ? Number(formData.get('userId')) : user.id;

  if (!threadUserId || Number.isNaN(threadUserId)) {
    return { error: 'Geçersiz konuşma.' };
  }

  try {
    const senderId = user.role === 'admin' ? threadUserId : undefined;
    await db
      .update(directMessages)
      .set({ readAt: now })
      .where(
        senderId
          ? and(eq(directMessages.userId, threadUserId), eq(directMessages.senderId, senderId))
          : and(eq(directMessages.userId, threadUserId), ne(directMessages.senderId, user.id))
      );
    revalidatePath('/dashboard/messages');
    return { success: 'Konuşma okundu.' };
  } catch (error) {
    console.error('Mark Direct Thread Read Error:', error);
    return { error: 'Konuşma güncellenirken hata oluştu.' };
  }
}

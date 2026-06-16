'use server';

import { db } from '@/db';
import { socialLinks, subscribers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { rateLimitCheck, getClientIP, formatRateLimitError } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface SocialLinkActionState {
  error?: string;
  success?: string;
}

export async function getSocialLinks() {
  try {
    return db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.isActive, true))
      .orderBy(socialLinks.displayOrder)
      .all();
  } catch (error) {
    console.error('getSocialLinks error:', error);
    return [];
  }
}

export async function getAllSocialLinks() {
  await requireAdmin();
  return db
    .select()
    .from(socialLinks)
    .orderBy(socialLinks.displayOrder)
    .all();
}

export async function saveSocialLinkAction(formData: FormData): Promise<SocialLinkActionState> {
  await requireAdmin();
  const id = Number(formData.get('id')) || undefined;
  const platform = String(formData.get('platform') || '').trim();
  const url = String(formData.get('url') || '').trim();
  const icon = String(formData.get('icon') || 'link').trim();
  const displayOrder = Number(formData.get('displayOrder') || 0);
  const isActive = formData.get('isActive') === 'true';

  if (!platform || !url) return { error: 'Platform ve URL gereklidir.' };

  try {
    if (id) {
      await db.update(socialLinks).set({ platform, url, icon, displayOrder, isActive }).where(eq(socialLinks.id, id));
    } else {
      await db.insert(socialLinks).values({ platform, url, icon, displayOrder, isActive });
    }
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: 'Sosyal link kaydedildi.' };
  } catch (error) {
    console.error('Save Social Link Error:', error);
    return { error: 'Kaydedilirken hata oluştu.' };
  }
}

export async function deleteSocialLinkAction(formData: FormData): Promise<SocialLinkActionState> {
  await requireAdmin();
  const id = Number(formData.get('id'));
  if (!id || isNaN(id)) return { error: 'Geçersiz ID.' };

  try {
    await db.delete(socialLinks).where(eq(socialLinks.id, id));
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: 'Sosyal link silindi.' };
  } catch (error) {
    console.error('Delete Social Link Error:', error);
    return { error: 'Silinirken hata oluştu.' };
  }
}

// --- NEWSLETTER ---

const subscriberSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin.').trim().toLowerCase(),
});

export interface SubscriberActionState {
  error?: string;
  success?: string;
}

export async function getSubscribers() {
  await requireAdmin();
  return db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).all();
}

export async function subscribeAction(
  _prevState: SubscriberActionState | null,
  formData: FormData
): Promise<SubscriberActionState> {
  const ip = await getClientIP();
  const limit = await rateLimitCheck(`subscribe:${ip}`, 3, 3600000);
  if (!limit.success) {
    return { error: formatRateLimitError(limit.resetInSeconds) };
  }

  const result = subscriberSchema.safeParse({
    email: formData.get('email'),
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    await db.insert(subscribers).values({
      email: result.data.email,
      ipAddress: ip,
    });
    revalidatePath('/');
    return { success: 'Bültenimize başarıyla abone oldunuz!' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return { success: 'Bu e-posta adresi zaten abone.' };
    }
    console.error('Subscribe Error:', error);
    return { error: 'Abone olurken bir hata oluştu.' };
  }
}

export async function unsubscribeAction(formData: FormData): Promise<SubscriberActionState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!email) return { error: 'E-posta adresi gereklidir.' };

  const ip = await getClientIP();
  const limit = await rateLimitCheck(`unsubscribe:${ip}`, 5, 3600000);
  if (!limit.success) {
    return { error: formatRateLimitError(limit.resetInSeconds) };
  }

  try {
    await db.update(subscribers).set({ status: 'unsubscribed' }).where(eq(subscribers.email, email));
    revalidatePath('/dashboard');
    return { success: 'Abonelikten çıkıldı.' };
  } catch (error) {
    console.error('Unsubscribe Error:', error);
    return { error: 'İşlem sırasında hata oluştu.' };
  }
}

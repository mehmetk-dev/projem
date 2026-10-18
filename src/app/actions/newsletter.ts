'use server';

import { db } from '@/db';
import { subscribers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { sendNewsletterMessages } from '@/lib/mail';
import { renderNewsletter } from '@/lib/newsletter';
import { siteUrl } from '@/lib/site';
import { logAudit } from '@/app/actions/audit';

export interface NewsletterActionState {
  error?: string;
  success?: string;
}

const newsletterSchema = z.object({
  subject: z.string().min(3, 'Konu en az 3 karakter olmalı.').max(150, 'Konu en fazla 150 karakter olabilir.').trim(),
  body: z.string().min(10, 'İçerik en az 10 karakter olmalı.').max(20000).trim(),
  mode: z.enum(['test', 'all']),
});

const unsubscribeUrlFor = (email: string) => `${siteUrl}/bulten/ayril?email=${encodeURIComponent(email)}`;

/**
 * Bülteni gönderir. "test" yalnızca giriş yapmış yöneticinin adresine, "all" tüm aktif abonelere gider.
 */
export async function sendNewsletterAction(formData: FormData): Promise<NewsletterActionState> {
  await requireAdmin();
  const parsed = newsletterSchema.safeParse({
    subject: formData.get('subject'),
    body: formData.get('body'),
    mode: formData.get('mode'),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message || 'Geçersiz veri.' };
  const { subject, body, mode } = parsed.data;

  let recipients: string[];
  if (mode === 'test') {
    const user = await getCurrentUser();
    if (!user?.email) return { error: 'Test için hesabınızın e-posta adresi bulunamadı.' };
    recipients = [user.email];
  } else {
    const rows = await db.select({ email: subscribers.email }).from(subscribers).where(eq(subscribers.status, 'active')).all();
    recipients = rows.map((row) => row.email);
    if (recipients.length === 0) return { error: 'Aktif abone yok.' };
  }

  try {
    const messages = await Promise.all(
      recipients.map(async (to) => {
        const unsubscribeUrl = unsubscribeUrlFor(to);
        const { html, text } = await renderNewsletter({ subject, markdown: body, unsubscribeUrl, siteUrl });
        return { to, subject, html, text, unsubscribeUrl };
      })
    );
    const result = await sendNewsletterMessages(messages);
    if (!result.configured) return { error: 'SMTP ayarlı değil (.env içinde SMTP_USER ve SMTP_PASS gerekli).' };

    if (mode === 'all') {
      await logAudit('PUBLISH', 'settings', undefined, undefined, `Bülten: ${subject} (${result.sent} gönderildi, ${result.failed} başarısız)`);
    }
    if (result.sent === 0) return { error: 'E-posta gönderilemedi. Sunucu günlüğüne bakın.' };
    return {
      success:
        mode === 'test'
          ? `Test e-postası ${recipients[0]} adresine gönderildi.`
          : `${result.sent} aboneye gönderildi${result.failed ? `, ${result.failed} başarısız` : ''}.`,
    };
  } catch (error) {
    console.error('Send Newsletter Error:', error);
    return { error: 'Bülten gönderilirken hata oluştu.' };
  }
}

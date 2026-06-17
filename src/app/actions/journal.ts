'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { journalEntries } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { saveUploadedImage } from '@/lib/server/uploads';
import { userSafeMessage } from '@/lib/server/app-error';

export interface JournalActionState {
  error?: string;
  success?: string;
  data?: typeof journalEntries.$inferSelect;
}

const journalSchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli bir tarih seçin.'),
  title: z.string().min(1, 'Başlık gereklidir.').max(160, 'Başlık en fazla 160 karakter olabilir.').trim(),
  content: z.string().min(1, 'Günlük yazısı gereklidir.').max(12000, 'Günlük yazısı en fazla 12000 karakter olabilir.').trim(),
  mood: z.enum(['calm', 'good', 'hard', 'bright', 'tired']).default('calm'),
  image: z.string().trim().optional(),
});

function maxAllowedEntryDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

function validateEntryDate(entryDate: string) {
  if (entryDate > maxAllowedEntryDate()) {
    return 'En fazla yarın için günlük yazabilirsiniz.';
  }
  return null;
}

async function requireUser() {
  const session = await getSession();
  if (!session?.userId) {
    redirect('/login');
  }
  return session.userId;
}

export async function getJournalEntries() {
  const userId = await requireUser();

  return db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
    .all();
}

export async function createJournalEntryAction(
  _prevState: JournalActionState | null,
  formData: FormData
): Promise<JournalActionState> {
  const userId = await requireUser();
  let imagePath = String(formData.get('image') || '').trim() || undefined;
  const imageFile = formData.get('imageFile');

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = await saveUploadedImage(imageFile, 'gunluk');
    } catch (error) {
      return { error: userSafeMessage(error, 'Görsel yüklenemedi.') };
    }
  }

  const result = journalSchema.safeParse({
    entryDate: formData.get('entryDate'),
    title: formData.get('title'),
    content: formData.get('content'),
    mood: formData.get('mood') || 'calm',
    image: imagePath,
  });

  if (!result.success) {
    return { error: result.error.errors.map((error) => error.message).join(' ') };
  }

  const dateError = validateEntryDate(result.data.entryDate);
  if (dateError) {
    return { error: dateError };
  }

  try {
    const existing = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.entryDate, result.data.entryDate)))
      .get();

    if (existing) {
      return { error: 'Bu tarih için zaten bir günlük yazısı var. Listeden düzenleyebilirsiniz.' };
    }

    const [entry] = await db
      .insert(journalEntries)
      .values({ userId, ...result.data })
      .returning();

    revalidatePath('/dashboard');
    return { success: 'Günlük kaydedildi.', data: entry };
  } catch (error) {
    console.error('Create Journal Entry Error:', error);
    return { error: 'Günlük kaydedilirken bir hata oluştu.' };
  }
}

export async function updateJournalEntryAction(
  _prevState: JournalActionState | null,
  formData: FormData
): Promise<JournalActionState> {
  const userId = await requireUser();
  const entryId = Number(formData.get('entryId'));
  let imagePath = String(formData.get('image') || '').trim() || undefined;
  const imageFile = formData.get('imageFile');

  if (!entryId || Number.isNaN(entryId)) {
    return { error: 'Geçersiz günlük ID.' };
  }

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = await saveUploadedImage(imageFile, 'gunluk');
    } catch (error) {
      return { error: userSafeMessage(error, 'Görsel yüklenemedi.') };
    }
  }

  const result = journalSchema.safeParse({
    entryDate: formData.get('entryDate'),
    title: formData.get('title'),
    content: formData.get('content'),
    mood: formData.get('mood') || 'calm',
    image: imagePath,
  });

  if (!result.success) {
    return { error: result.error.errors.map((error) => error.message).join(' ') };
  }

  const dateError = validateEntryDate(result.data.entryDate);
  if (dateError) {
    return { error: dateError };
  }

  try {
    const existing = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .get();

    if (!existing) {
      return { error: 'Günlük bulunamadı veya erişim izniniz yok.' };
    }

    const sameDateEntry = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.entryDate, result.data.entryDate)))
      .get();

    if (sameDateEntry && sameDateEntry.id !== entryId) {
      return { error: 'Bu tarih başka bir günlük yazısında kullanılıyor.' };
    }

    const [entry] = await db
      .update(journalEntries)
      .set({ ...result.data, updatedAt: new Date().toISOString() })
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .returning();

    revalidatePath('/dashboard');
    return { success: 'Günlük güncellendi.', data: entry };
  } catch (error) {
    console.error('Update Journal Entry Error:', error);
    return { error: 'Günlük güncellenirken bir hata oluştu.' };
  }
}

export async function deleteJournalEntryAction(formData: FormData): Promise<JournalActionState> {
  const userId = await requireUser();
  const entryId = Number(formData.get('entryId'));

  if (!entryId || Number.isNaN(entryId)) {
    return { error: 'Geçersiz günlük ID.' };
  }

  try {
    const existing = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
      .get();

    if (!existing) {
      return { error: 'Günlük bulunamadı veya erişim izniniz yok.' };
    }

    await db.delete(journalEntries).where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)));
    revalidatePath('/dashboard');
    return { success: 'Günlük silindi.' };
  } catch (error) {
    console.error('Delete Journal Entry Error:', error);
    return { error: 'Günlük silinirken bir hata oluştu.' };
  }
}

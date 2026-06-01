'use server';

import { db } from '@/db';
import { notes } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { saveUploadedImage } from '@/lib/server/uploads';

// --- Types ---
export interface NoteActionState {
  error?: string;
  success?: string;
  data?: typeof notes.$inferSelect;
}

// --- Validation ---
const noteSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir.').max(200, 'Başlık en fazla 200 karakter olabilir.').trim(),
  content: z.string().max(10000, 'İçerik en fazla 10000 karakter olabilir.').trim(),
  image: z.string().trim().optional(),
  color: z.enum(['neutral', 'blue', 'green', 'amber', 'rose', 'violet']).default('neutral'),
  pinned: z.coerce.boolean().default(false),
});

async function requireUser() {
  const session = await getSession();
  if (!session?.userId) {
    redirect('/login');
  }
  return session.userId;
}

// --- Actions ---

export async function getNotes() {
  const userId = await requireUser();

  const userNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.pinned), desc(notes.updatedAt))
    .all();

  return userNotes;
}

export async function createNoteAction(
  _prevState: NoteActionState | null,
  formData: FormData
): Promise<NoteActionState> {
  const userId = await requireUser();
  let imagePath = String(formData.get('image') || '').trim() || undefined;
  const imageFile = formData.get('imageFile');

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = await saveUploadedImage(imageFile, 'not');
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Görsel yüklenemedi.' };
    }
  }

  const result = noteSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    image: imagePath,
    color: formData.get('color') || 'neutral',
    pinned: formData.get('pinned') === 'true',
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(' ');
    return { error: errors };
  }

  try {
    const [note] = await db.insert(notes).values({
      userId,
      ...result.data,
    }).returning();
    revalidatePath('/dashboard');
    return { success: 'Not oluşturuldu.', data: note };
  } catch (error) {
    console.error('Create Note Error:', error);
    return { error: 'Not oluşturulurken bir hata oluştu.' };
  }
}

export async function updateNoteAction(
  _prevState: NoteActionState | null,
  formData: FormData
): Promise<NoteActionState> {
  const userId = await requireUser();
  let imagePath = String(formData.get('image') || '').trim() || undefined;
  const imageFile = formData.get('imageFile');

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = await saveUploadedImage(imageFile, 'not');
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Görsel yüklenemedi.' };
    }
  }

  const noteId = Number(formData.get('noteId'));
  if (!noteId || isNaN(noteId)) {
    return { error: 'Geçersiz not ID.' };
  }

  const result = noteSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    image: imagePath,
    color: formData.get('color') || 'neutral',
    pinned: formData.get('pinned') === 'true',
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(' ');
    return { error: errors };
  }

  try {
    const existing = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .get();

    if (!existing) {
      return { error: 'Not bulunamadı veya erişim izniniz yok.' };
    }

    const [note] = await db
      .update(notes)
      .set({
        ...result.data,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();

    revalidatePath('/dashboard');
    return { success: 'Not güncellendi.', data: note };
  } catch (error) {
    console.error('Update Note Error:', error);
    return { error: 'Not güncellenirken bir hata oluştu.' };
  }
}

export async function deleteNoteAction(formData: FormData): Promise<NoteActionState> {
  const userId = await requireUser();

  const noteId = Number(formData.get('noteId'));
  if (!noteId || isNaN(noteId)) {
    return { error: 'Geçersiz not ID.' };
  }

  try {
    const existing = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .get();

    if (!existing) {
      return { error: 'Not bulunamadı veya erişim izniniz yok.' };
    }

    await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
    revalidatePath('/dashboard');
    return { success: 'Not silindi.' };
  } catch (error) {
    console.error('Delete Note Error:', error);
    return { error: 'Not silinirken bir hata oluştu.' };
  }
}

export async function togglePinNoteAction(formData: FormData): Promise<NoteActionState> {
  const userId = await requireUser();

  const noteId = Number(formData.get('noteId'));
  if (!noteId || isNaN(noteId)) {
    return { error: 'Geçersiz not ID.' };
  }

  try {
    const existing = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .get();

    if (!existing) {
      return { error: 'Not bulunamadı.' };
    }

    await db
      .update(notes)
      .set({ pinned: !existing.pinned, updatedAt: new Date().toISOString() })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

    revalidatePath('/dashboard');
    return { success: existing.pinned ? 'Notun sabitlemesi kaldırıldı.' : 'Not sabitlendi.' };
  } catch (error) {
    console.error('Toggle Pin Error:', error);
    return { error: 'İşlem sırasında bir hata oluştu.' };
  }
}

'use server';

import { db } from '@/db';
import { bookmarks } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export interface BookmarkActionState {
  error?: string;
  success?: string;
  data?: typeof bookmarks.$inferSelect;
}

const bookmarkSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir.').max(200).trim(),
  url: z.string().url('Geçerli bir URL giriniz.').trim(),
  description: z.string().max(2000).trim().optional(),
  tags: z.string().max(500).trim().optional(),
});

export async function getMyBookmarks() {
  const { userId } = await requireAuth();
  return db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt))
    .all();
}

export async function createBookmarkAction(
  _prevState: BookmarkActionState | null,
  formData: FormData
): Promise<BookmarkActionState> {
  const { userId } = await requireAuth();
  const result = bookmarkSchema.safeParse({
    title: formData.get('title'),
    url: formData.get('url'),
    description: formData.get('description') || undefined,
    tags: formData.get('tags') || undefined,
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    const [bookmark] = await db.insert(bookmarks).values({ userId, ...result.data }).returning();
    revalidatePath('/dashboard');
    return { success: 'Yer imi eklendi.', data: bookmark };
  } catch (error) {
    console.error('Create Bookmark Error:', error);
    return { error: 'Eklenirken hata oluştu.' };
  }
}

export async function deleteBookmarkAction(formData: FormData): Promise<BookmarkActionState> {
  const { userId } = await requireAuth();
  const bookmarkId = Number(formData.get('bookmarkId'));
  if (!bookmarkId || isNaN(bookmarkId)) return { error: 'Geçersiz ID.' };

  try {
    await db.delete(bookmarks).where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, userId)));
    revalidatePath('/dashboard');
    return { success: 'Silindi.' };
  } catch {
    return { error: 'Silinirken hata oluştu.' };
  }
}

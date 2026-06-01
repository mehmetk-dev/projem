'use server';

import { db } from '@/db';
import { codeSnippets } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export interface SnippetActionState {
  error?: string;
  success?: string;
  data?: typeof codeSnippets.$inferSelect;
}

const snippetSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir.').max(200).trim(),
  code: z.string().max(10000).trim(),
  language: z.string().min(1).trim().default('typescript'),
  description: z.string().max(2000).trim().optional(),
  tags: z.string().max(500).trim().optional(),
});

export async function getMySnippets() {
  const { userId } = await requireAuth();
  return db
    .select()
    .from(codeSnippets)
    .where(eq(codeSnippets.userId, userId))
    .orderBy(desc(codeSnippets.createdAt))
    .all();
}

export async function createSnippetAction(
  _prevState: SnippetActionState | null,
  formData: FormData
): Promise<SnippetActionState> {
  const { userId } = await requireAuth();
  const result = snippetSchema.safeParse({
    title: formData.get('title'),
    code: formData.get('code'),
    language: formData.get('language') || 'typescript',
    description: formData.get('description') || undefined,
    tags: formData.get('tags') || undefined,
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    const [snippet] = await db.insert(codeSnippets).values({ userId, ...result.data }).returning();
    revalidatePath('/dashboard');
    return { success: 'Snippet eklendi.', data: snippet };
  } catch (error) {
    console.error('Create Snippet Error:', error);
    return { error: 'Eklenirken hata oluştu.' };
  }
}

export async function deleteSnippetAction(formData: FormData): Promise<SnippetActionState> {
  const { userId } = await requireAuth();
  const snippetId = Number(formData.get('snippetId'));
  if (!snippetId || isNaN(snippetId)) return { error: 'Geçersiz ID.' };

  try {
    await db.delete(codeSnippets).where(and(eq(codeSnippets.id, snippetId), eq(codeSnippets.userId, userId)));
    revalidatePath('/dashboard');
    return { success: 'Silindi.' };
  } catch (error) {
    console.error('Delete Snippet Error:', error);
    return { error: 'Silinirken hata oluştu.' };
  }
}

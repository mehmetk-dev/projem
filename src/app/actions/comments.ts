'use server';

import { db } from '@/db';
import { comments, blogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { rateLimitCheck, getClientIP, formatRateLimitError } from '@/lib/rate-limit';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export interface CommentActionState {
  error?: string;
  success?: string;
}

const commentSchema = z.object({
  blogId: z.coerce.number().min(1, 'Blog ID gereklidir.'),
  parentId: z.coerce.number().optional(),
  name: z.string().min(1, 'İsim gereklidir.').max(100).trim(),
  email: z.string().email('Geçerli bir e-posta adresi girin.').max(200).trim(),
  content: z.string().min(1, 'Yorum gereklidir.').max(3000, 'Yorum en fazla 3000 karakter olabilir.').trim(),
});

export async function getApprovedComments(blogId: number) {
  return db
    .select()
    .from(comments)
    .where(and(eq(comments.blogId, blogId), eq(comments.approved, true)))
    .orderBy(desc(comments.createdAt))
    .all();
}

export async function getAllComments() {
  await requireAdmin();
  return db
    .select()
    .from(comments)
    .orderBy(desc(comments.createdAt))
    .all();
}

export async function submitCommentAction(
  _prevState: CommentActionState | null,
  formData: FormData
): Promise<CommentActionState> {
  const ip = await getClientIP();
  const limit = rateLimitCheck(`comment:${ip}`, 5, 60000);
  if (!limit.success) {
    return { error: formatRateLimitError(limit.resetInSeconds) };
  }

  const result = commentSchema.safeParse({
    blogId: formData.get('blogId'),
    parentId: formData.get('parentId') || undefined,
    name: formData.get('name'),
    email: formData.get('email'),
    content: formData.get('content'),
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    await db.insert(comments).values({
      ...result.data,
      approved: false,
    });
    const blogId = result.data.blogId;
    revalidatePath(`/blog/${blogId}`);
    return { success: 'Yorumunuz başarıyla gönderildi. Onaylandıktan sonra yayınlanacaktır.' };
  } catch (error) {
    console.error('Comment Error:', error);
    return { error: 'Yorum gönderilirken bir hata oluştu.' };
  }
}

export async function approveCommentAction(formData: FormData): Promise<CommentActionState> {
  await requireAdmin();
  const id = Number(formData.get('id'));
  if (!id || isNaN(id)) return { error: 'Geçersiz ID.' };

  try {
    await db.update(comments).set({ approved: true }).where(eq(comments.id, id));
    const row = await db
      .select({ slug: blogs.slug })
      .from(comments)
      .innerJoin(blogs, eq(comments.blogId, blogs.id))
      .where(eq(comments.id, id))
      .get();
    revalidatePath('/dashboard');
    if (row) revalidatePath(`/blog/${row.slug}`);
    return { success: 'Yorum onaylandı.' };
  } catch (error) {
    console.error('Approve Comment Error:', error);
    return { error: 'Onaylama sırasında bir hata oluştu.' };
  }
}

export async function deleteCommentAction(formData: FormData): Promise<CommentActionState> {
  await requireAdmin();
  const id = Number(formData.get('id'));
  if (!id || isNaN(id)) return { error: 'Geçersiz ID.' };

  try {
    const row = await db
      .select({ slug: blogs.slug })
      .from(comments)
      .innerJoin(blogs, eq(comments.blogId, blogs.id))
      .where(eq(comments.id, id))
      .get();
    await db.delete(comments).where(eq(comments.id, id));
    revalidatePath('/dashboard');
    if (row) revalidatePath(`/blog/${row.slug}`);
    return { success: 'Yorum silindi.' };
  } catch (error) {
    console.error('Delete Comment Error:', error);
    return { error: 'Silme sırasında bir hata oluştu.' };
  }
}

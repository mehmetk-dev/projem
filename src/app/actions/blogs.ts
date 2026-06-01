'use server';

import { db } from '@/db';
import { blogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession, requireAdmin } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { saveUploadedImage } from '@/lib/server/uploads';

export interface BlogActionState {
  error?: string;
  success?: string;
  data?: typeof blogs.$inferSelect;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await db.select().from(blogs).where(eq(blogs.slug, slug)).get();
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

const blogSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir.').max(300, 'Başlık en fazla 300 karakter olabilir.').trim(),
  content: z.string().max(50000, 'İçerik en fazla 50000 karakter olabilir.').trim(),
  excerpt: z.string().max(500, 'Özet en fazla 500 karakter olabilir.').trim().optional(),
  metaTitle: z.string().max(70, 'Meta başlık en fazla 70 karakter olabilir.').trim().optional(),
  metaDescription: z.string().max(160, 'Meta açıklama en fazla 160 karakter olabilir.').trim().optional(),
  ogImage: z.string().trim().optional(),
  coverImage: z.string().trim().optional(),
  category: z.string().min(1, 'Kategori gereklidir.').trim().default('Genel'),
  tags: z.string().trim().optional(),
  published: z.coerce.boolean().default(false),
});

export async function getPublishedBlogs({
  category,
  limit = 20,
  offset = 0,
}: { category?: string; limit?: number; offset?: number } = {}) {
  try {
    let query = db.select().from(blogs).where(eq(blogs.published, true)).orderBy(desc(blogs.publishedAt));

    if (category) {
      query = db.select().from(blogs).where(and(eq(blogs.published, true), eq(blogs.category, category))).orderBy(desc(blogs.publishedAt));
    }

    return query.limit(limit).offset(offset).all();
  } catch (error) {
    console.error('getPublishedBlogs error:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  const blog = await db.select().from(blogs).where(eq(blogs.slug, slug)).get();
  if (!blog) return null;
  if (!blog.published) {
    // Only allow viewing unpublished if owner
    const session = await getSession();
    if (!session || session.userId !== blog.userId) return null;
  }
  return blog;
}

export async function getMyBlogs() {
  const { userId } = await requireAdmin();
  return db
    .select()
    .from(blogs)
    .where(eq(blogs.userId, userId))
    .orderBy(desc(blogs.createdAt))
    .all();
}

export async function createBlogAction(
  _prevState: BlogActionState | null,
  formData: FormData
): Promise<BlogActionState> {
  const { userId } = await requireAdmin();
  let ogImagePath = String(formData.get('ogImage') || '').trim() || undefined;
  let coverImagePath = String(formData.get('coverImage') || '').trim() || undefined;
  const ogImageFile = formData.get('ogImageFile');
  const coverImageFile = formData.get('coverImageFile');

  try {
    if (ogImageFile instanceof File && ogImageFile.size > 0) {
      ogImagePath = await saveUploadedImage(ogImageFile, 'blog');
    }
    if (coverImageFile instanceof File && coverImageFile.size > 0) {
      coverImagePath = await saveUploadedImage(coverImageFile, 'blog');
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Görsel yüklenemedi.' };
  }

  const result = blogSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    excerpt: formData.get('excerpt') || undefined,
    metaTitle: formData.get('metaTitle') || undefined,
    metaDescription: formData.get('metaDescription') || undefined,
    ogImage: ogImagePath,
    coverImage: coverImagePath,
    category: formData.get('category') || 'Genel',
    tags: formData.get('tags') || undefined,
    published: formData.get('published') === 'true',
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  const data = result.data;
  const slug = await generateUniqueSlug(slugify(data.title));

  try {
    const [blog] = await db.insert(blogs).values({
      userId,
      slug,
      ...data,
      publishedAt: data.published ? new Date().toISOString() : null,
    }).returning();
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    return { success: 'Blog yazısı oluşturuldu.', data: blog };
  } catch (error) {
    console.error('Create Blog Error:', error);
    return { error: 'Blog oluşturulurken bir hata oluştu.' };
  }
}

export async function updateBlogAction(
  _prevState: BlogActionState | null,
  formData: FormData
): Promise<BlogActionState> {
  const { userId } = await requireAdmin();
  let ogImagePath = String(formData.get('ogImage') || '').trim() || undefined;
  let coverImagePath = String(formData.get('coverImage') || '').trim() || undefined;
  const ogImageFile = formData.get('ogImageFile');
  const coverImageFile = formData.get('coverImageFile');

  try {
    if (ogImageFile instanceof File && ogImageFile.size > 0) {
      ogImagePath = await saveUploadedImage(ogImageFile, 'blog');
    }
    if (coverImageFile instanceof File && coverImageFile.size > 0) {
      coverImagePath = await saveUploadedImage(coverImageFile, 'blog');
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Görsel yüklenemedi.' };
  }

  const blogId = Number(formData.get('blogId'));
  if (!blogId || isNaN(blogId)) return { error: 'Geçersiz blog ID.' };

  const result = blogSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    excerpt: formData.get('excerpt') || undefined,
    metaTitle: formData.get('metaTitle') || undefined,
    metaDescription: formData.get('metaDescription') || undefined,
    ogImage: ogImagePath,
    coverImage: coverImagePath,
    category: formData.get('category') || 'Genel',
    tags: formData.get('tags') || undefined,
    published: formData.get('published') === 'true',
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  const data = result.data;

  try {
    const existing = await db.select().from(blogs).where(and(eq(blogs.id, blogId), eq(blogs.userId, userId))).get();
    if (!existing) return { error: 'Blog bulunamadı veya erişim izniniz yok.' };

    const newSlug = data.title !== existing.title
      ? await generateUniqueSlug(slugify(data.title))
      : existing.slug;

    const [blog] = await db
      .update(blogs)
      .set({
        ...data,
        slug: newSlug,
        publishedAt: data.published && !existing.published ? new Date().toISOString() : existing.publishedAt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(blogs.id, blogId))
      .returning();

    revalidatePath('/blog');
    revalidatePath(`/blog/${newSlug}`);
    if (existing.slug !== newSlug) revalidatePath(`/blog/${existing.slug}`);
    return { success: 'Blog güncellendi.', data: blog };
  } catch (error) {
    console.error('Update Blog Error:', error);
    return { error: 'Blog güncellenirken bir hata oluştu.' };
  }
}

export async function deleteBlogAction(formData: FormData): Promise<BlogActionState> {
  const { userId } = await requireAdmin();
  const blogId = Number(formData.get('blogId'));
  if (!blogId || isNaN(blogId)) return { error: 'Geçersiz blog ID.' };

  try {
    await db.delete(blogs).where(and(eq(blogs.id, blogId), eq(blogs.userId, userId)));
    revalidatePath('/blog');
    return { success: 'Blog silindi.' };
  } catch (error) {
    console.error('Delete Blog Error:', error);
    return { error: 'Blog silinirken bir hata oluştu.' };
  }
}

export async function togglePublishBlogAction(formData: FormData): Promise<BlogActionState> {
  const { userId } = await requireAdmin();
  const blogId = Number(formData.get('blogId'));
  if (!blogId || isNaN(blogId)) return { error: 'Geçersiz blog ID.' };

  try {
    const existing = await db.select().from(blogs).where(and(eq(blogs.id, blogId), eq(blogs.userId, userId))).get();
    if (!existing) return { error: 'Blog bulunamadı.' };

    await db
      .update(blogs)
      .set({
        published: !existing.published,
        publishedAt: !existing.published ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(blogs.id, blogId), eq(blogs.userId, userId)));

    revalidatePath('/blog');
    return { success: existing.published ? 'Yayından kaldırıldı.' : 'Yayınlandı.' };
  } catch (error) {
    console.error('Toggle Publish Error:', error);
    return { error: 'İşlem sırasında bir hata oluştu.' };
  }
}

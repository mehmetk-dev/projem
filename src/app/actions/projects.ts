'use server';

import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { saveUploadedImage } from '@/lib/server/uploads';
import { userSafeMessage } from '@/lib/server/app-error';
import { cache } from 'react';

function slugify(text: string): string {
  const charMap: Record<string, string> = {
    'ç':'c', 'Ç':'c', 'ğ':'g', 'Ğ':'g', 'ı':'i', 'İ':'i',
    'ö':'o', 'Ö':'o', 'ş':'s', 'Ş':'s', 'ü':'u', 'Ü':'u',
  };
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => charMap[c] || c)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

async function generateUniqueProjectSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug || 'proje';
  let counter = 1;
  while (true) {
    const existing = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug)).get();
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export interface ProjectActionState {
  error?: string;
  success?: string;
  data?: typeof projects.$inferSelect;
}

const projectSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir.').max(200).trim(),
  description: z.string().max(5000).trim().optional(),
  image: z.string().trim().optional(),
  link: z.string().trim().optional(),
  category: z.string().min(1).trim().default('Genel'),
  displayOrder: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

export const getPublishedProjects = cache(async () => {
  try {
    return db
      .select()
      .from(projects)
      .where(eq(projects.published, true))
      .orderBy(projects.displayOrder)
      .all();
  } catch (error) {
    console.error('getPublishedProjects error:', error);
    return [];
  }
});

export const getProjectBySlug = cache(async (slug: string) => {
  try {
    return db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .get();
  } catch (error) {
    console.error('getProjectBySlug error:', error);
    return null;
  }
});

export const getProjectById = cache(async (id: number) => {
  try {
    return db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .get();
  } catch (error) {
    console.error('getProjectById error:', error);
    return null;
  }
});

export async function getMyProjects() {
  const { userId } = await requireAdmin();
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt))
    .all();
}

async function processProjectImages(formData: FormData): Promise<{ imageUrls?: string[]; error?: string }> {
  const orderField = String(formData.get('imagesOrder') || '').trim();
  const imageFiles = formData.getAll('imageFiles');

  // 1. Upload all new image files
  const uploadedUrls: string[] = [];
  for (const file of imageFiles) {
    if (file instanceof File && file.size > 0) {
      try {
        const path = await saveUploadedImage(file, 'proje');
        uploadedUrls.push(path);
      } catch (error) {
        return { error: userSafeMessage(error, 'Görsel yüklenemedi.') };
      }
    }
  }

  // 2. Reconstruct the ordered URLs list
  const imageUrls: string[] = [];
  if (orderField) {
    try {
      const order = JSON.parse(orderField);
      if (Array.isArray(order)) {
        for (const item of order) {
          if (typeof item === 'string') {
            if (item.startsWith('local:')) {
              const localIdx = parseInt(item.substring(6), 10);
              const uploadedUrl = uploadedUrls[localIdx];
              if (uploadedUrl) {
                imageUrls.push(uploadedUrl);
              }
            } else {
              imageUrls.push(item);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse imagesOrder:', e);
    }
  }

  // Fallback to R2 uploaded urls directly if order parsing failed or empty
  if (imageUrls.length === 0) {
    imageUrls.push(...uploadedUrls);
  }

  return { imageUrls };
}

export async function createProjectAction(
  _prevState: ProjectActionState | null,
  formData: FormData
): Promise<ProjectActionState> {
  const { userId } = await requireAdmin();

  const processResult = await processProjectImages(formData);
  if (processResult.error) {
    return { error: processResult.error };
  }
  const imageUrls = processResult.imageUrls || [];
  const finalImage = imageUrls.length > 0 ? JSON.stringify(imageUrls) : '/placeholder.svg';

  const result = projectSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    image: finalImage,
    link: formData.get('link') || undefined,
    category: formData.get('category') || 'Genel',
    displayOrder: Number(formData.get('displayOrder') || 0),
    published: formData.get('published') === 'true',
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    const slug = await generateUniqueProjectSlug(slugify(result.data.title));
    const [project] = await db.insert(projects).values({ userId, slug, ...result.data }).returning();
    revalidatePath('/');
    revalidatePath('/projects');
    return { success: 'Proje eklendi.', data: project };
  } catch (error) {
    console.error('Create Project Error:', error);
    return { error: 'Proje eklenirken hata oluştu.' };
  }
}

export async function updateProjectAction(
  _prevState: ProjectActionState | null,
  formData: FormData
): Promise<ProjectActionState> {
  const { userId } = await requireAdmin();
  const projectId = Number(formData.get('projectId'));
  if (!projectId || isNaN(projectId)) return { error: 'Geçersiz ID.' };

  const processResult = await processProjectImages(formData);
  if (processResult.error) {
    return { error: processResult.error };
  }
  const imageUrls = processResult.imageUrls || [];
  const finalImage = imageUrls.length > 0 ? JSON.stringify(imageUrls) : '/placeholder.svg';

  const result = projectSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    image: finalImage,
    link: formData.get('link') || undefined,
    category: formData.get('category') || 'Genel',
    displayOrder: Number(formData.get('displayOrder') || 0),
    published: formData.get('published') === 'true',
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    const existing = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId))).get();
    if (!existing) return { error: 'Proje bulunamadı.' };

    const newSlug = result.data.title !== existing.title
      ? await generateUniqueProjectSlug(slugify(result.data.title))
      : existing.slug;

    const [project] = await db.update(projects).set({ slug: newSlug, ...result.data, updatedAt: new Date().toISOString() }).where(and(eq(projects.id, projectId), eq(projects.userId, userId))).returning();
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath(`/projects/${project.slug}`);
    return { success: 'Proje güncellendi.', data: project };
  } catch (error) {
    console.error('Update Project Error:', error);
    return { error: 'Güncellenirken hata oluştu.' };
  }
}

export async function deleteProjectAction(formData: FormData): Promise<ProjectActionState> {
  const { userId } = await requireAdmin();
  const projectId = Number(formData.get('projectId'));
  if (!projectId || isNaN(projectId)) return { error: 'Geçersiz ID.' };

  try {
    const project = await db.select({ slug: projects.slug }).from(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId))).get();
    await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
    revalidatePath('/');
    revalidatePath('/projects');
    if (project) revalidatePath(`/projects/${project.slug}`);
    return { success: 'Proje silindi.' };
  } catch (error) {
    console.error('Delete Project Error:', error);
    return { error: 'Silinirken hata oluştu.' };
  }
}

'use server';

import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { saveUploadedImage } from '@/lib/server/uploads';

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

export async function getPublishedProjects() {
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
}

export async function getProjectById(id: number) {
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
}

export async function getMyProjects() {
  const { userId } = await requireAuth();
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt))
    .all();
}

export async function createProjectAction(
  _prevState: ProjectActionState | null,
  formData: FormData
): Promise<ProjectActionState> {
  const { userId } = await requireAuth();
  let imagePath = String(formData.get('image') || '').trim() || undefined;
  const imageFile = formData.get('imageFile');

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = await saveUploadedImage(imageFile, 'proje');
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Görsel yüklenemedi.' };
    }
  }

  const result = projectSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    image: imagePath,
    link: formData.get('link') || undefined,
    category: formData.get('category') || 'Genel',
    displayOrder: Number(formData.get('displayOrder') || 0),
    published: formData.get('published') === 'true',
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    const [project] = await db.insert(projects).values({ userId, ...result.data }).returning();
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
  const { userId } = await requireAuth();
  let imagePath = String(formData.get('image') || '').trim() || undefined;
  const imageFile = formData.get('imageFile');

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = await saveUploadedImage(imageFile, 'proje');
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Görsel yüklenemedi.' };
    }
  }
  const projectId = Number(formData.get('projectId'));
  if (!projectId || isNaN(projectId)) return { error: 'Geçersiz ID.' };

  const result = projectSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    image: imagePath,
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

    const [project] = await db.update(projects).set({ ...result.data, updatedAt: new Date().toISOString() }).where(and(eq(projects.id, projectId), eq(projects.userId, userId))).returning();
    revalidatePath('/');
    return { success: 'Proje güncellendi.', data: project };
  } catch (error) {
    console.error('Update Project Error:', error);
    return { error: 'Güncellenirken hata oluştu.' };
  }
}

export async function deleteProjectAction(formData: FormData): Promise<ProjectActionState> {
  const { userId } = await requireAuth();
  const projectId = Number(formData.get('projectId'));
  if (!projectId || isNaN(projectId)) return { error: 'Geçersiz ID.' };

  try {
    await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
    revalidatePath('/');
    return { success: 'Proje silindi.' };
  } catch (error) {
    console.error('Delete Project Error:', error);
    return { error: 'Silinirken hata oluştu.' };
  }
}

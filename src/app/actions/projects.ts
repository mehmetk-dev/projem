'use server';

import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { saveUploadedImage } from '@/lib/server/uploads';
import { userSafeMessage } from '@/lib/server/app-error';

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
  const { userId } = await requireAdmin();
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
  const { userId } = await requireAdmin();
  const imageUrls: string[] = [];

  // Get existing images from the hidden 'image' input (which will be JSON-serialized)
  const imageField = String(formData.get('image') || '').trim();
  if (imageField) {
    if (imageField.startsWith('[') && imageField.endsWith(']')) {
      try {
        const parsed = JSON.parse(imageField);
        if (Array.isArray(parsed)) {
          imageUrls.push(...parsed.filter(Boolean));
        }
      } catch {}
    } else {
      imageUrls.push(imageField);
    }
  }

  // Handle multiple file uploads
  const imageFiles = formData.getAll('imageFiles');
  for (const file of imageFiles) {
    if (file instanceof File && file.size > 0) {
      try {
        const path = await saveUploadedImage(file, 'proje');
        imageUrls.push(path);
      } catch (error) {
        return { error: userSafeMessage(error, 'Görsel yüklenemedi.') };
      }
    }
  }

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
  const { userId } = await requireAdmin();
  const projectId = Number(formData.get('projectId'));
  if (!projectId || isNaN(projectId)) return { error: 'Geçersiz ID.' };

  const imageUrls: string[] = [];

  // Get existing images from the hidden 'image' input
  const imageField = String(formData.get('image') || '').trim();
  if (imageField) {
    if (imageField.startsWith('[') && imageField.endsWith(']')) {
      try {
        const parsed = JSON.parse(imageField);
        if (Array.isArray(parsed)) {
          imageUrls.push(...parsed.filter(Boolean));
        }
      } catch {}
    } else {
      imageUrls.push(imageField);
    }
  }

  // Handle multiple file uploads
  const imageFiles = formData.getAll('imageFiles');
  for (const file of imageFiles) {
    if (file instanceof File && file.size > 0) {
      try {
        const path = await saveUploadedImage(file, 'proje');
        imageUrls.push(path);
      } catch (error) {
        return { error: userSafeMessage(error, 'Görsel yüklenemedi.') };
      }
    }
  }

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

    const [project] = await db.update(projects).set({ ...result.data, updatedAt: new Date().toISOString() }).where(and(eq(projects.id, projectId), eq(projects.userId, userId))).returning();
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
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
    await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return { success: 'Proje silindi.' };
  } catch (error) {
    console.error('Delete Project Error:', error);
    return { error: 'Silinirken hata oluştu.' };
  }
}

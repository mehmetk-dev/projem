'use server';

import { db } from '@/db';
import { projects, testimonials } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { z } from 'zod';
import { logAudit } from '@/app/actions/audit';

export interface TestimonialActionState {
  error?: string;
  success?: string;
}

const testimonialSchema = z.object({
  name: z.string().min(1, 'İsim gereklidir.').max(120).trim(),
  role: z.string().max(120).trim().default(''),
  company: z.string().max(120).trim().default(''),
  quote: z.string().min(10, 'Yorum en az 10 karakter olmalı.').max(800, 'Yorum en fazla 800 karakter olabilir.').trim(),
  avatar: z.string().max(500).trim().nullable(),
  projectId: z.number().int().positive().nullable(),
  displayOrder: z.number().int().default(0),
  published: z.boolean().default(true),
});

/** Yayındaki yorumlar, bağlı projenin adı ve adresiyle birlikte */
export const getPublishedTestimonials = cache(async () => {
  try {
    return await db
      .select({
        id: testimonials.id,
        name: testimonials.name,
        role: testimonials.role,
        company: testimonials.company,
        quote: testimonials.quote,
        avatar: testimonials.avatar,
        projectId: testimonials.projectId,
        projectTitle: projects.title,
        projectSlug: projects.slug,
      })
      .from(testimonials)
      .leftJoin(projects, eq(testimonials.projectId, projects.id))
      .where(eq(testimonials.published, true))
      .orderBy(asc(testimonials.displayOrder), asc(testimonials.id))
      .all();
  } catch (error) {
    console.error('getPublishedTestimonials error:', error);
    return [];
  }
});

export async function getAllTestimonials() {
  await requireAdmin();
  return db.select().from(testimonials).orderBy(asc(testimonials.displayOrder), asc(testimonials.id)).all();
}

export async function getTestimonialProjectOptions() {
  await requireAdmin();
  return db.select({ id: projects.id, title: projects.title }).from(projects).orderBy(projects.displayOrder).all();
}

// Yorumlar ana sayfada ve proje detaylarında görünür
function revalidateTestimonialPages() {
  revalidatePath('/dashboard');
  revalidatePath('/');
  revalidatePath('/projects/[slug]', 'page');
}

export async function saveTestimonialAction(formData: FormData): Promise<TestimonialActionState> {
  await requireAdmin();
  const id = Number(formData.get('id')) || undefined;
  const projectId = Number(formData.get('projectId'));
  const result = testimonialSchema.safeParse({
    name: formData.get('name'),
    role: String(formData.get('role') || ''),
    company: String(formData.get('company') || ''),
    quote: formData.get('quote'),
    avatar: String(formData.get('avatar') || '').trim() || null,
    projectId: Number.isInteger(projectId) && projectId > 0 ? projectId : null,
    displayOrder: Number(formData.get('displayOrder') || 0),
    published: formData.get('published') === 'true',
  });

  if (!result.success) return { error: result.error.errors[0]?.message || 'Geçersiz veri.' };

  try {
    if (id) {
      await db
        .update(testimonials)
        .set({ ...result.data, updatedAt: new Date().toISOString() })
        .where(eq(testimonials.id, id));
      await logAudit('UPDATE', 'testimonial', id, undefined, result.data.name);
    } else {
      const [row] = await db.insert(testimonials).values(result.data).returning({ id: testimonials.id });
      await logAudit('CREATE', 'testimonial', row?.id, undefined, result.data.name);
    }
    revalidateTestimonialPages();
    return { success: 'Referans kaydedildi.' };
  } catch (error) {
    console.error('Save Testimonial Error:', error);
    return { error: 'Kaydedilirken hata oluştu.' };
  }
}

export async function deleteTestimonialAction(formData: FormData): Promise<TestimonialActionState> {
  await requireAdmin();
  const id = Number(formData.get('id'));
  if (!id || isNaN(id)) return { error: 'Geçersiz ID.' };

  try {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    await logAudit('DELETE', 'testimonial', id);
    revalidateTestimonialPages();
    return { success: 'Referans silindi.' };
  } catch (error) {
    console.error('Delete Testimonial Error:', error);
    return { error: 'Silinirken hata oluştu.' };
  }
}

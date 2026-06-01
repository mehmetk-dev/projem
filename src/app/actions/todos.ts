'use server';

import { db } from '@/db';
import { todos } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export interface TodoActionState {
  error?: string;
  success?: string;
  data?: typeof todos.$inferSelect;
}

const todoSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir.').max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().trim().optional(),
});

export async function getMyTodos() {
  const { userId } = await requireAuth();
  return db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.completed), desc(todos.dueDate))
    .all();
}

export async function createTodoAction(
  _prevState: TodoActionState | null,
  formData: FormData
): Promise<TodoActionState> {
  const { userId } = await requireAuth();
  const result = todoSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    priority: formData.get('priority') || 'medium',
    dueDate: formData.get('dueDate') || undefined,
  });

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    const [todo] = await db.insert(todos).values({ userId, ...result.data }).returning();
    revalidatePath('/dashboard');
    return { success: 'Görev eklendi.', data: todo };
  } catch (error) {
    console.error('Create Todo Error:', error);
    return { error: 'Görev eklenirken hata oluştu.' };
  }
}

export async function toggleTodoAction(formData: FormData): Promise<TodoActionState> {
  const { userId } = await requireAuth();
  const todoId = Number(formData.get('todoId'));
  if (!todoId || isNaN(todoId)) return { error: 'Geçersiz ID.' };

  try {
    const existing = await db.select().from(todos).where(and(eq(todos.id, todoId), eq(todos.userId, userId))).get();
    if (!existing) return { error: 'Görev bulunamadı.' };

    await db
      .update(todos)
      .set({
        completed: !existing.completed,
        completedAt: !existing.completed ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));

    revalidatePath('/dashboard');
    return { success: existing.completed ? 'Görev aktifleştirildi.' : 'Görev tamamlandı.' };
  } catch (error) {
    console.error('Toggle Todo Error:', error);
    return { error: 'İşlem sırasında hata oluştu.' };
  }
}

export async function deleteTodoAction(formData: FormData): Promise<TodoActionState> {
  const { userId } = await requireAuth();
  const todoId = Number(formData.get('todoId'));
  if (!todoId || isNaN(todoId)) return { error: 'Geçersiz ID.' };

  try {
    await db.delete(todos).where(and(eq(todos.id, todoId), eq(todos.userId, userId)));
    revalidatePath('/dashboard');
    return { success: 'Görev silindi.' };
  } catch (error) {
    console.error('Delete Todo Error:', error);
    return { error: 'Silinirken hata oluştu.' };
  }
}

'use server';

import { db } from '@/db';
import { notes, todos, bookmarks, codeSnippets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

export async function exportUserData() {
  const { userId } = await requireAuth();

  const [userNotes, userTodos, userBookmarks, userSnippets] = await Promise.all([
    db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt)).all(),
    db.select().from(todos).where(eq(todos.userId, userId)).orderBy(desc(todos.createdAt)).all(),
    db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.createdAt)).all(),
    db.select().from(codeSnippets).where(eq(codeSnippets.userId, userId)).orderBy(desc(codeSnippets.createdAt)).all(),
  ]);

  return {
    notes: userNotes,
    todos: userTodos,
    bookmarks: userBookmarks,
    snippets: userSnippets,
    exportedAt: new Date().toISOString(),
  };
}

export async function importUserData(formData: FormData) {
  const { userId } = await requireAuth();
  const file = formData.get('file') as File;

  if (!file) return { error: 'Dosya seçilmedi.' };

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.notes && !data.todos && !data.bookmarks && !data.snippets) {
      return { error: 'Geçersiz dosya formatı.' };
    }

    let imported = 0;

    if (Array.isArray(data.notes)) {
      for (const n of data.notes) {
        await db.insert(notes).values({
          userId,
          title: n.title || 'İsimsiz',
          content: n.content || '',
          color: n.color || 'neutral',
          pinned: n.pinned || false,
        });
        imported++;
      }
    }

    if (Array.isArray(data.todos)) {
      for (const t of data.todos) {
        await db.insert(todos).values({
          userId,
          title: t.title || 'İsimsiz',
          description: t.description || '',
          priority: t.priority || 'medium',
          dueDate: t.dueDate || null,
          completed: t.completed || false,
        });
        imported++;
      }
    }

    if (Array.isArray(data.bookmarks)) {
      for (const b of data.bookmarks) {
        await db.insert(bookmarks).values({
          userId,
          title: b.title || 'İsimsiz',
          url: b.url || '',
          description: b.description || '',
          tags: b.tags || '',
        });
        imported++;
      }
    }

    if (Array.isArray(data.snippets)) {
      for (const s of data.snippets) {
        await db.insert(codeSnippets).values({
          userId,
          title: s.title || 'İsimsiz',
          code: s.code || '',
          language: s.language || 'typescript',
          description: s.description || '',
          tags: s.tags || '',
        });
        imported++;
      }
    }

    return { success: `${imported} kayıt içe aktarıldı.` };
  } catch (error) {
    console.error('Import Error:', error);
    return { error: 'Dosya işlenirken hata oluştu.' };
  }
}

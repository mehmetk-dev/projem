'use server';

import { db } from '@/db';
import { chatConversations, chatMessages, chatSettings } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { notes, blogs, todos, bookmarks, codeSnippets, projects, journalEntries } from '@/db/schema';
import type { ChatContextData } from '@/components/dashboard/types';

type ChatActionData =
  | typeof chatConversations.$inferSelect
  | typeof chatMessages.$inferSelect
  | typeof chatSettings.$inferSelect;

export interface ChatActionState {
  error?: string;
  success?: string;
  data?: ChatActionData;
}

// --- Conversations ---

export async function getConversations() {
  const { userId } = await requireAdmin();
  return db.select().from(chatConversations).where(eq(chatConversations.userId, userId)).orderBy(desc(chatConversations.updatedAt)).all();
}

export async function getMessages(conversationId: number) {
  const { userId } = await requireAdmin();
  const conversation = await db
    .select()
    .from(chatConversations)
    .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)))
    .get();
  if (!conversation) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId)).orderBy(chatMessages.createdAt).all();
}

export async function createConversationAction(model?: string): Promise<ChatActionState> {
  const { userId } = await requireAdmin();
  try {
    const settings = await db.select().from(chatSettings).where(eq(chatSettings.userId, userId)).get();
    const [conv] = await db.insert(chatConversations).values({
      userId,
      title: 'Yeni Sohbet',
      model: model || settings?.defaultModel || 'openai/gpt-4o-mini',
    }).returning();
    return { success: 'Sohbet oluşturuldu.', data: conv };
  } catch (error) {
    console.error('Create conversation error:', error);
    return { error: 'Sohbet oluşturulamadı.' };
  }
}

export async function deleteConversationAction(formData: FormData): Promise<ChatActionState> {
  const { userId } = await requireAdmin();
  const id = Number(formData.get('conversationId'));
  if (!id) return { error: 'Geçersiz ID.' };
  try {
    const conv = await db.select().from(chatConversations).where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId))).get();
    if (!conv) return { error: 'Bulunamadı.' };
    await db.delete(chatMessages).where(eq(chatMessages.conversationId, id));
    await db.delete(chatConversations).where(eq(chatConversations.id, id));
    return { success: 'Sohbet silindi.' };
  } catch (error) {
    console.error('Delete conversation error:', error);
    return { error: 'Silinemedi.' };
  }
}

export async function renameConversationAction(formData: FormData): Promise<ChatActionState> {
  const { userId } = await requireAdmin();
  const id = Number(formData.get('conversationId'));
  const title = formData.get('title') as string;
  if (!id || !title?.trim()) return { error: 'Geçersiz veri.' };
  try {
    await db
      .update(chatConversations)
      .set({ title: title.trim() })
      .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId)));
    return { success: 'Sohbet yeniden adlandirildi.' };
  } catch (error) {
    console.error('Rename conversation error:', error);
    return { error: 'Yeniden adlandirilamadi.' };
  }
}

export async function createMessageAction(formData: FormData): Promise<ChatActionState> {
  const { userId } = await requireAdmin();
  const conversationId = Number(formData.get('conversationId'));
  const role = formData.get('role') as 'user' | 'assistant' | 'system';
  const content = formData.get('content') as string;
  if (!conversationId || !role || !content) return { error: 'Eksik veri.' };
  try {
    const conversation = await db
      .select()
      .from(chatConversations)
      .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)))
      .get();
    if (!conversation) return { error: 'Sohbet bulunamadı.' };

    const [msg] = await db.insert(chatMessages).values({ conversationId, role, content }).returning();
    await db
      .update(chatConversations)
      .set({ updatedAt: new Date().toISOString() })
      .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)));
    return { success: 'Mesaj kaydedildi.', data: msg };
  } catch (error) {
    console.error('Create message error:', error);
    return { error: 'Mesaj kaydedilemedi.' };
  }
}

// --- Settings ---

export async function getChatSettings() {
  const { userId } = await requireAdmin();
  let settings = await db.select().from(chatSettings).where(eq(chatSettings.userId, userId)).get();
  if (!settings) {
    const [created] = await db.insert(chatSettings).values({ userId }).returning();
    settings = created;
  }
  return settings;
}

export async function updateChatSettingsAction(
  _prev: ChatActionState | null,
  formData: FormData
): Promise<ChatActionState> {
  const { userId } = await requireAdmin();
  const systemPrompt = formData.get('systemPrompt') as string;
  const defaultModel = formData.get('defaultModel') as string;
  const temperature = formData.get('temperature') as string;
  const apiKey = formData.get('apiKey') as string | null;
  try {
    const existing = await db.select().from(chatSettings).where(eq(chatSettings.userId, userId)).get();
    if (existing) {
      const [updated] = await db.update(chatSettings).set({
        systemPrompt: systemPrompt || existing.systemPrompt,
        defaultModel: defaultModel || existing.defaultModel,
        temperature: temperature || existing.temperature,
        apiKey: apiKey ?? existing.apiKey,
        updatedAt: new Date().toISOString(),
      }).where(eq(chatSettings.userId, userId)).returning();
      return { success: 'Ayarlar güncellendi.', data: updated };
    } else {
      const [created] = await db.insert(chatSettings).values({
        userId,
        systemPrompt: systemPrompt || '',
        defaultModel: defaultModel || 'openai/gpt-4o-mini',
        temperature: temperature || '0.7',
        apiKey: apiKey || null,
      }).returning();
      return { success: 'Ayarlar oluşturuldu.', data: created };
    }
  } catch (error) {
    console.error('Update chat settings error:', error);
    return { error: 'Ayarlar güncellenemedi.' };
  }
}

// --- Context ---

export async function getAllUserContext(): Promise<ChatContextData> {
  const { userId } = await requireAdmin();
  const [userNotes, userBlogs, userTodos, userBookmarks, userSnippets, userProjects, userJournal] = await Promise.all([
    db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt)).all(),
    db.select().from(blogs).where(eq(blogs.userId, userId)).orderBy(desc(blogs.updatedAt)).all(),
    db.select().from(todos).where(eq(todos.userId, userId)).orderBy(desc(todos.updatedAt)).all(),
    db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.createdAt)).all(),
    db.select().from(codeSnippets).where(eq(codeSnippets.userId, userId)).orderBy(desc(codeSnippets.updatedAt)).all(),
    db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt)).all(),
    db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.entryDate)).all(),
  ]);
  return {
    notes: userNotes.map((n) => ({ title: n.title, content: n.content, color: n.color, pinned: n.pinned })),
    blogs: userBlogs.map((b) => ({ title: b.title, slug: b.slug, category: b.category, tags: b.tags, published: b.published })),
    todos: userTodos.map((t) => ({ title: t.title, completed: t.completed, priority: t.priority })),
    bookmarks: userBookmarks.map((b) => ({ title: b.title, url: b.url, tags: b.tags })),
    snippets: userSnippets.map((s) => ({ title: s.title, language: s.language, code: s.code })),
    projects: userProjects.map((p) => ({ title: p.title, description: p.description, category: p.category })),
    journal: userJournal.map((j) => ({ entryDate: j.entryDate, title: j.title, content: j.content, mood: j.mood })),
  };
}

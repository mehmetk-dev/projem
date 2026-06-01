'use server';

import { db } from '@/db';
import { userPreferences } from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { normalizeHiddenTabs, parseHiddenTabs } from '@/lib/dashboard/preferences';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const CONFIGURABLE_TABS = [
  'overview',
  'notes',
  'projects',
  'messages',
  'todos',
  'payments',
  'bookmarks',
  'snippets',
  'analytics',
  'calendar',
  'timer',
  'guestbook',
  'comments',
] as const;

export interface UserPreferencesData {
  hiddenTabs: string[];
}

export interface PreferencesActionState {
  error?: string;
  success?: string;
  data?: UserPreferencesData;
}

export async function getMyPreferences(): Promise<UserPreferencesData> {
  const { userId } = await requireAuth();
  const row = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).get();
  return { hiddenTabs: normalizeHiddenTabs(parseHiddenTabs(row?.hiddenTabs), CONFIGURABLE_TABS) };
}

export async function saveHiddenTabsAction(formData: FormData): Promise<PreferencesActionState> {
  const { userId } = await requireAuth();
  const hiddenTabs = normalizeHiddenTabs(formData.getAll('hiddenTabs').map(String), CONFIGURABLE_TABS);
  const value = JSON.stringify(hiddenTabs);

  try {
    const existing = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).get();
    if (existing) {
      await db
        .update(userPreferences)
        .set({ hiddenTabs: value, updatedAt: new Date().toISOString() })
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({ userId, hiddenTabs: value });
    }

    revalidatePath('/dashboard');
    return { success: 'Menü tercihleri kaydedildi.', data: { hiddenTabs } };
  } catch (error) {
    console.error('Save Preferences Error:', error);
    return { error: 'Menü tercihleri kaydedilirken hata oluştu.' };
  }
}

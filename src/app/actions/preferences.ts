'use server';

import { db } from '@/db';
import { userPreferences } from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { normalizeHiddenTabs, parseHiddenTabs } from '@/lib/dashboard/preferences';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';

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
  pomodoroWork: number;
  pomodoroBreak: number;
}

export interface PreferencesActionState {
  error?: string;
  success?: string;
  data?: UserPreferencesData;
}

export const getMyPreferences = cache(async (): Promise<UserPreferencesData> => {
  const { userId } = await requireAuth();
  const row = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).get();
  return {
    hiddenTabs: normalizeHiddenTabs(parseHiddenTabs(row?.hiddenTabs), CONFIGURABLE_TABS),
    pomodoroWork: row?.pomodoroWork ?? 25,
    pomodoroBreak: row?.pomodoroBreak ?? 5,
  };
});

export async function savePomodoroSettingsAction(formData: FormData): Promise<PreferencesActionState> {
  const { userId } = await requireAuth();
  const pomodoroWork = Math.max(1, Math.min(120, Number(formData.get('pomodoroWork') ?? 25)));
  const pomodoroBreak = Math.max(1, Math.min(60, Number(formData.get('pomodoroBreak') ?? 5)));

  try {
    const existing = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).get();
    if (existing) {
      await db
        .update(userPreferences)
        .set({ pomodoroWork, pomodoroBreak, updatedAt: new Date().toISOString() })
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({ userId, pomodoroWork, pomodoroBreak });
    }

    revalidatePath('/dashboard');
    return { success: 'Pomodoro ayarları kaydedildi.', data: { hiddenTabs: [], pomodoroWork, pomodoroBreak } };
  } catch (error) {
    console.error('Save Pomodoro Error:', error);
    return { error: 'Pomodoro ayarları kaydedilirken hata oluştu.' };
  }
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
    return { success: 'Menü tercihleri kaydedildi.', data: { hiddenTabs, pomodoroWork: existing?.pomodoroWork ?? 25, pomodoroBreak: existing?.pomodoroBreak ?? 5 } };
  } catch (error) {
    console.error('Save Preferences Error:', error);
    return { error: 'Menü tercihleri kaydedilirken hata oluştu.' };
  }
}

'use server';

import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface GitHubEvent {
  type: string;
  repo: string;
  message: string;
  createdAt: string;
}

interface GitHubApiEvent {
  type: string;
  repo?: { name?: string };
  payload?: { commits?: { message?: string }[]; action?: string };
  created_at: string;
}

export async function getGitHubActivity(): Promise<GitHubEvent[] | null> {
  try {
    const usernameSetting = await db.select().from(siteSettings).where(eq(siteSettings.key, 'githubUsername')).get();
    const username = usernameSetting?.value;
    
    if (!username) return null;

    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/events/public`,
      { next: { revalidate: 3600 } }
    );
    
    if (!res.ok) return null;
    
    const data = (await res.json()) as GitHubApiEvent[];
    return data.slice(0, 10).map((event) => ({
      type: event.type.replace('Event', ''),
      repo: event.repo?.name || '',
      message: event.payload?.commits?.[0]?.message || event.payload?.action || '',
      createdAt: event.created_at,
    }));
  } catch (error) {
    console.error('GitHub Error:', error);
    return null;
  }
}

'use server';

import { db } from '@/db';
import { pageViews } from '@/db/schema';
import { sql, gte } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

export async function trackPageView(page: string, sessionId?: string) {
  try {
    await db.insert(pageViews).values({
      page,
      sessionId: sessionId || null,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // silently fail analytics
  }
}

export async function getAnalytics() {
  await requireAuth();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalViews, todayViews, weekViews, topPages] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(pageViews).get(),
    db.select({ count: sql<number>`count(*)` }).from(pageViews).where(gte(pageViews.createdAt, todayStart)).get(),
    db.select({ count: sql<number>`count(*)` }).from(pageViews).where(gte(pageViews.createdAt, weekAgo)).get(),
    db
      .select({ page: pageViews.page, count: sql<number>`count(*)` })
      .from(pageViews)
      .groupBy(pageViews.page)
      .orderBy(sql`count(*) desc`)
      .limit(10)
      .all(),
  ]);

  return {
    total: totalViews?.count || 0,
    today: todayViews?.count || 0,
    week: weekViews?.count || 0,
    topPages,
  };
}

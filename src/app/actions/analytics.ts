'use server';

import { db } from '@/db';
import { pageViews } from '@/db/schema';
import { sql, gte } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { cache } from 'react';

export async function trackPageView(page: string, sessionId?: string) {
  try {
    await db.insert(pageViews).values({
      page,
      sessionId: sessionId || null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics trackPageView Error:', error);
  }
}

export const getAnalytics = cache(async () => {
  await requireAuth();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalViews, todayViews, weekViews, topPages, dailyViews] = await Promise.all([
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
    db
      .select({
        dateStr: sql<string>`date(created_at)`,
        count: sql<number>`count(*)`,
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, weekAgo))
      .groupBy(sql`date(created_at)`)
      .orderBy(sql`date(created_at)`)
      .all(),
  ]);

  const chartDataMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    chartDataMap[dateStr] = 0;
  }

  for (const row of dailyViews) {
    if (row.dateStr && row.dateStr in chartDataMap) {
      chartDataMap[row.dateStr] = row.count;
    }
  }

  const chartData = Object.entries(chartDataMap).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    total: totalViews?.count || 0,
    today: todayViews?.count || 0,
    week: weekViews?.count || 0,
    topPages,
    chartData,
  };
});

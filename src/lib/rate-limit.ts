import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { lt, eq } from 'drizzle-orm';
import { db } from '@/db';
import { rateLimits } from '@/db/schema';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const fallbackStore = new Map<string, RateLimitRecord>();

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function cleanupStaleEntries() {
  const now = Date.now();
  for (const [key, record] of fallbackStore) {
    if (now > record.resetAt) {
      fallbackStore.delete(key);
    }
  }
}

export async function getClientIP(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return h.get('x-real-ip') || 'unknown';
}

function fallbackRateLimitCheck(key: string, limit: number, windowMs: number): { success: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const keyHash = hashKey(key);
  const record = fallbackStore.get(keyHash);

  // Periodic cleanup (every ~100 checks)
  if (Math.random() < 0.01) cleanupStaleEntries();

  if (!record || now > record.resetAt) {
    fallbackStore.set(keyHash, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetInSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetInSeconds: Math.ceil((record.resetAt - now) / 1000) };
}

export async function rateLimitCheck(key: string, limit: number, windowMs: number): Promise<{ success: boolean; remaining: number; resetInSeconds: number }> {
  const now = Date.now();
  const resetAt = now + windowMs;
  const keyHash = hashKey(key);

  try {
    if (Math.random() < 0.01) {
      await db.delete(rateLimits).where(lt(rateLimits.resetAt, now));
    }

    const record = await db
      .select()
      .from(rateLimits)
      .where(eq(rateLimits.keyHash, keyHash))
      .get();

    if (!record || now > record.resetAt) {
      if (record) {
        await db
          .update(rateLimits)
          .set({ count: 1, resetAt, updatedAt: new Date().toISOString() })
          .where(eq(rateLimits.keyHash, keyHash));
      } else {
        await db.insert(rateLimits).values({ keyHash, count: 1, resetAt });
      }
      return { success: true, remaining: limit - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
    }

    if (record.count >= limit) {
      return { success: false, remaining: 0, resetInSeconds: Math.ceil((record.resetAt - now) / 1000) };
    }

    const count = record.count + 1;
    await db
      .update(rateLimits)
      .set({ count, updatedAt: new Date().toISOString() })
      .where(eq(rateLimits.keyHash, keyHash));

    return { success: true, remaining: limit - count, resetInSeconds: Math.ceil((record.resetAt - now) / 1000) };
  } catch (error) {
    console.warn('Persistent rate limit unavailable, using in-memory fallback:', error instanceof Error ? error.name : 'unknown');
    return fallbackRateLimitCheck(key, limit, windowMs);
  }
}

export function formatRateLimitError(resetInSeconds: number, lang: 'tr' | 'en' = 'tr'): string {
  if (lang === 'en') {
    if (resetInSeconds < 60) {
      return `Too many requests. Please try again in ${resetInSeconds} seconds.`;
    }
    const minutes = Math.ceil(resetInSeconds / 60);
    return `Too many requests. Please try again in ${minutes} minute(s).`;
  }
  if (resetInSeconds < 60) {
    return `Çok fazla istek gönderdiniz. Lütfen ${resetInSeconds} saniye sonra tekrar deneyin.`;
  }
  const minutes = Math.ceil(resetInSeconds / 60);
  return `Çok fazla istek gönderdiniz. Lütfen ${minutes} dakika sonra tekrar deneyin.`;
}

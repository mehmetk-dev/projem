import { headers } from 'next/headers';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

function cleanupStaleEntries() {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) {
      store.delete(key);
    }
  }
}

export async function getClientIP(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return h.get('x-real-ip') || 'unknown';
}

export function rateLimitCheck(key: string, limit: number, windowMs: number): { success: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = store.get(key);

  // Periodic cleanup (every ~100 checks)
  if (Math.random() < 0.01) cleanupStaleEntries();

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetInSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetInSeconds: Math.ceil((record.resetAt - now) / 1000) };
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

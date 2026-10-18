import { NextResponse, type NextRequest } from 'next/server';
import { trackPageView } from '@/app/actions/analytics';
import { getCurrentUser } from '@/lib/auth';

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly/i;
const PATH_PATTERN = /^\/[\p{L}\p{N}\-_/.]*$/u;

/**
 * POST /api/track
 * Public sayfalardaki görüntülemeyi sayar (PageViewTracker gönderir).
 * Botlar, başka sitelerden gelen istekler ve yönetici ziyaretleri sayılmaz.
 */
export async function POST(req: NextRequest) {
  const noContent = new NextResponse(null, { status: 204 });

  if (req.headers.get('sec-fetch-site') !== 'same-origin') return noContent;
  if (BOT_PATTERN.test(req.headers.get('user-agent') || '')) return noContent;

  let body: { path?: unknown; referrer?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return noContent;
  }

  const path = typeof body.path === 'string' ? body.path : '';
  if (!path || path.length > 200 || !PATH_PATTERN.test(path)) return noContent;

  const user = await getCurrentUser().catch(() => null);
  if (user?.role === 'admin') return noContent;

  // Yalnızca başka bir siteden gelindiyse alan adı tutulur; tam adres ve sorgu parametreleri saklanmaz
  let referrerHost: string | null = null;
  if (typeof body.referrer === 'string' && body.referrer) {
    try {
      const host = new URL(body.referrer).hostname.replace(/^www\./, '');
      if (host && host !== req.nextUrl.hostname.replace(/^www\./, '')) referrerHost = host.slice(0, 100);
    } catch {
      // geçersiz referrer — yok say
    }
  }

  await trackPageView(path, referrerHost);
  return noContent;
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { jsonError, logServerError, unexpectedJsonError } from '@/lib/server/error-response';

export const dynamic = 'force-dynamic';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_PLAYER_URL = 'https://api.spotify.com/v1/me/player';

async function getAccessToken(): Promise<string | null> {
  const client_id = process.env.SPOTIFY_CLIENT_ID || '';
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET || '';
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN || '';
  if (!refresh_token) return null;

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token;
}

async function requireAdminUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!user || user.role !== 'admin') return null;
  return true;
}

async function spotifyRequest(method: string, path: string, body?: unknown) {
  const token = await getAccessToken();
  if (!token) return { error: 'Spotify token alınamadı', status: 502 };

  const res = await fetch(`${SPOTIFY_PLAYER_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return { success: true, status: 200 };
  if (res.status === 404) return { error: 'Aktif Spotify cihazı bulunamadı. Spotify\'ı telefonunda veya bilgisayarında aç.', status: 404 };
  if (!res.ok) {
    const text = await res.text();
    logServerError('Spotify player upstream error', text, { status: res.status });
    return { error: `Spotify hatası: ${res.status}`, status: 502 };
  }
  return { success: true, status: 200 };
}

export async function GET() {
  return jsonError({
    code: 'METHOD_NOT_ALLOWED',
    message: 'Bu endpoint sadece PUT metodu kabul eder.',
    status: 405,
  });
}

export async function PUT(request: Request) {
  try {
    if (!(await requireAdminUser())) {
      return jsonError({ code: 'UNAUTHORIZED', message: 'Yetkisiz erişim.', status: 401 });
    }

    let body: { action?: string };
    try {
      body = await request.json();
    } catch {
      return jsonError({ code: 'INVALID_JSON', message: 'Geçersiz JSON body.', status: 400 });
    }
    const { action } = body;

    let result;
    switch (action) {
      case 'play':
        result = await spotifyRequest('PUT', '/play');
        break;
      case 'pause':
        result = await spotifyRequest('PUT', '/pause');
        break;
      case 'next':
        result = await spotifyRequest('POST', '/next');
        break;
      case 'previous':
        result = await spotifyRequest('POST', '/previous');
        break;
      default:
        return jsonError({ code: 'VALIDATION_ERROR', message: 'Geçersiz action: play, pause, next, previous', status: 400 });
    }

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    return unexpectedJsonError('Spotify player API', error);
  }
}

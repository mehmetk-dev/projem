import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { unexpectedJsonError } from '@/lib/server/error-response';
import { ConfigurationError, ExternalServiceError, ForbiddenError, UnauthorizedError } from '@/lib/server/app-error';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      throw new UnauthorizedError();
    }

    const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError();
    }

    const client_id = process.env.SPOTIFY_CLIENT_ID || '';
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET || '';
    const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN || '';

    if (!refresh_token) {
      throw new ConfigurationError('Spotify bağlantısı henüz yapılandırılmamış.');
    }

    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const res = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token }),
    });

    if (!res.ok) {
      throw new ExternalServiceError('Spotify token yenileme başarısız.', { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    return unexpectedJsonError('Spotify token API', error);
  }
}

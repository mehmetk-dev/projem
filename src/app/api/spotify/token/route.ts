import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID || '';
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET || '';
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN || '';

  if (!refresh_token) {
    return NextResponse.json({ error: 'Spotify not configured' }, { status: 503 });
  }

  try {
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
      return NextResponse.json({ error: 'Token refresh failed' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

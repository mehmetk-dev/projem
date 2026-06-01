import { NextResponse } from 'next/server';
import { getSpotifyAuthUrl } from '@/lib/spotify';

/**
 * GET /api/spotify/login
 * Spotify OAuth yetkilendirmesini başlatır.
 * Kullanıcıyı Spotify'ın izin sayfasına yönlendirir.
 */
export async function GET() {
  const authUrl = getSpotifyAuthUrl();
  return NextResponse.redirect(authUrl);
}

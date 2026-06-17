import { NextResponse } from 'next/server';
import { getSpotifyAuthUrl } from '@/lib/spotify';
import { unexpectedJsonError } from '@/lib/server/error-response';
import { ConfigurationError } from '@/lib/server/app-error';

/**
 * GET /api/spotify/login
 * Spotify OAuth yetkilendirmesini başlatır.
 * Kullanıcıyı Spotify'ın izin sayfasına yönlendirir.
 */
export async function GET() {
  try {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_REDIRECT_URI) {
      throw new ConfigurationError('Spotify OAuth ayarları eksik.');
    }

    const authUrl = getSpotifyAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    return unexpectedJsonError('Spotify login API', error);
  }
}

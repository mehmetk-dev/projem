import { NextResponse } from 'next/server';
import { getNowPlaying } from '@/lib/spotify';
import { unexpectedJsonError } from '@/lib/server/error-response';
import { ConfigurationError } from '@/lib/server/app-error';

/**
 * GET /api/spotify/now-playing
 * Spotify'da şu an çalan veya en son dinlenen şarkıyı döndürür.
 * Refresh token ayarlanmamışsa bilgilendirici hata mesajı verir.
 */
export async function GET() {
  // Refresh token kontrolü
  if (!process.env.SPOTIFY_REFRESH_TOKEN) {
    return unexpectedJsonError('Spotify now-playing API', new ConfigurationError('Spotify bağlantısı henüz yapılandırılmamış.'));
  }

  try {
    const track = await getNowPlaying();

    if (!track) {
      return NextResponse.json({
        isPlaying: false,
        message: 'Şu an hiçbir şey çalmıyor.',
      });
    }

    return NextResponse.json(track, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
      },
    });
  } catch (error) {
    return unexpectedJsonError('Spotify now-playing API', error, 'Spotify verisi alınırken bir hata oluştu.');
  }
}

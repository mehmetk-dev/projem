import { NextResponse } from 'next/server';
import { getNowPlaying } from '@/lib/spotify';

/**
 * GET /api/spotify/now-playing
 * Spotify'da şu an çalan veya en son dinlenen şarkıyı döndürür.
 * Refresh token ayarlanmamışsa bilgilendirici hata mesajı verir.
 */
export async function GET() {
  // Refresh token kontrolü
  if (!process.env.SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json(
      {
        error: 'Spotify not configured',
        message: 'SPOTIFY_REFRESH_TOKEN henüz ayarlanmamış.',
        setup: 'Tarayıcıda /api/spotify/login adresine giderek Spotify hesabını bağla.',
      },
      { status: 503 }
    );
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
    console.error('[Spotify API Route] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Spotify verisi alınırken bir hata oluştu.',
      },
      { status: 500 }
    );
  }
}

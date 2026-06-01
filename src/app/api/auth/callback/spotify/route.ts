import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/spotify';

/**
 * GET /api/auth/callback/spotify
 * Spotify OAuth callback handler.
 * Code'u token'a çevirir ve refresh_token'ı gösterir.
 *
 * ÖNEMLİ: Bu route bir kez kullanılır. Aldığın refresh_token'ı
 * .env dosyasına SPOTIFY_REFRESH_TOKEN olarak kaydet.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Kullanıcı izni reddettiyse
  if (error) {
    return NextResponse.json(
      {
        error: 'Spotify authorization denied',
        detail: error,
        message: 'Spotify bağlantısı reddedildi. Tekrar denemek için /api/spotify/login adresine gidin.',
      },
      { status: 403 }
    );
  }

  // Code yoksa
  if (!code) {
    return NextResponse.json(
      {
        error: 'Missing authorization code',
        message: 'Geçersiz callback. Önce /api/spotify/login adresine gidin.',
      },
      { status: 400 }
    );
  }

  // Code ile token al
  let tokens;
  try {
    tokens = await getTokensFromCode(code);
  } catch (error) {
    console.error('Spotify token exchange error:', error);
    return NextResponse.json(
      {
        error: 'Token exchange failed',
        message: 'Spotify token alınamadı. Client ID/Secret veya Redirect URI hatalı olabilir. Lütfen .env dosyanızı kontrol edin.',
        detail: error instanceof Error ? error.message : String(error),
        troubleshooting: [
          'SPOTIFY_CLIENT_ID doğru mu?',
          'SPOTIFY_CLIENT_SECRET doğru mu?',
          'SPOTIFY_REDIRECT_URI, Spotify Dashboard\'daki Redirect URI ile birebir aynı mı?',
          'Redirect URI: ' + (process.env.SPOTIFY_REDIRECT_URI || 'AYARLANMAMIŞ'),
        ],
      },
      { status: 500 }
    );
  }

  if (!tokens) {
    return NextResponse.json(
      {
        error: 'Token exchange failed',
        message: 'Spotify token alınamadı. Client ID/Secret veya Redirect URI hatalı olabilir. Lütfen .env dosyanızı kontrol edin.',
        troubleshooting: [
          'SPOTIFY_CLIENT_ID doğru mu?',
          'SPOTIFY_CLIENT_SECRET doğru mu?',
          'SPOTIFY_REDIRECT_URI, Spotify Dashboard\'daki Redirect URI ile birebir aynı mı?',
          'Redirect URI: ' + (process.env.SPOTIFY_REDIRECT_URI || 'AYARLANMAMIŞ'),
        ],
      },
      { status: 500 }
    );
  }

  // Başarılı! Refresh token'ı göster
  return NextResponse.json({
    success: true,
    message: '🎉 Spotify bağlantısı başarılı!',
    instructions: [
      'Aşağıdaki refresh_token değerini kopyala.',
      '.env dosyanıza şu satırı ekleyin:',
      `SPOTIFY_REFRESH_TOKEN="${tokens.refresh_token}"`,
      'Sonra sunucuyu yeniden başlatın (npm run dev).',
      'Bu adımı sadece BİR KEZ yapmanız yeterli.',
    ],
    refresh_token: tokens.refresh_token,
    warning: 'Bu token\'ı kimseyle paylaşmayın! Sayfayı kapatmadan önce kopyaladığınızdan emin olun.',
  });
}

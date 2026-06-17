import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/spotify';
import { unexpectedJsonError } from '@/lib/server/error-response';
import { AppError, ValidationError } from '@/lib/server/app-error';

/**
 * GET /api/auth/callback/spotify
 * Spotify OAuth callback handler.
 * Code'u token'a çevirir ve refresh_token'ı gösterir.
 *
 * ÖNEMLİ: Bu route bir kez kullanılır. Aldığın refresh_token'ı
 * .env dosyasına SPOTIFY_REFRESH_TOKEN olarak kaydet.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Kullanıcı izni reddettiyse
    if (error) {
      throw new AppError(
        `Spotify authorization denied: ${error}`,
        'SPOTIFY_AUTH_DENIED',
        403,
        'Spotify bağlantısı reddedildi. Tekrar denemek için /api/spotify/login adresine gidin.',
      );
    }

    // Code yoksa
    if (!code) {
      throw new ValidationError('Geçersiz callback. Önce /api/spotify/login adresine gidin.');
    }

    const tokens = await getTokensFromCode(code);

    if (!tokens) {
      throw new AppError(
        'Spotify token exchange failed',
        'TOKEN_EXCHANGE_FAILED',
        500,
        'Spotify token alınamadı. Client ID/Secret veya Redirect URI ayarlarını kontrol edin.',
      );
    }

    // Başarılı! Refresh token'ı göster
    return NextResponse.json({
      success: true,
      message: 'Spotify bağlantısı başarılı.',
      instructions: [
        'Aşağıdaki refresh_token değerini kopyala.',
        '.env dosyanıza şu satırı ekleyin:',
        `SPOTIFY_REFRESH_TOKEN="${tokens.refresh_token}"`,
        'Sonra sunucuyu yeniden başlatın (npm run dev).',
        'Bu adımı sadece BİR KEZ yapmanız yeterli.',
      ],
      refresh_token: tokens.refresh_token,
      warning: 'Bu tokenı kimseyle paylaşmayın. Sayfayı kapatmadan önce kopyaladığınızdan emin olun.',
    });
  } catch (error) {
    return unexpectedJsonError('Spotify callback API', error);
  }
}

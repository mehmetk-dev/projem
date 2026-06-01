/**
 * Spotify Web API - Authorization Code Flow
 *
 * Akış:
 * 1. Kullanıcı /api/spotify/login adresine gider → Spotify'a yönlendirilir
 * 2. Spotify, callback URL'e code ile geri döner
 * 3. Code ile access_token + refresh_token alınır
 * 4. refresh_token .env'ye kaydedilir
 * 5. Artık "şu an çalan şarkı" her zaman çekilebilir
 */

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const SPOTIFY_RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

const client_id = process.env.SPOTIFY_CLIENT_ID || '';
const client_secret = process.env.SPOTIFY_CLIENT_SECRET || '';
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN || '';

const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

export interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
}

/**
 * Refresh token kullanarak yeni bir access_token alır
 */
async function getAccessToken(): Promise<string | null> {
  if (!client_id || !client_secret || !refresh_token) {
    console.error('[Spotify] Missing credentials. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN in .env');
    return null;
  }

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Spotify] Token refresh failed (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[Spotify] Token refresh error:', error);
    return null;
  }
}

/**
 * Spotify'dan şu an çalan şarkıyı veya en son dinlenen şarkıyı getirir
 */
export async function getNowPlaying(): Promise<SpotifyTrack | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    // Önce "şu an çalan" şarkıyı dene
    const nowPlayingRes = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 30 }, // 30 saniyede bir cache'i yenile
    });

    // 204 = hiçbir şey çalmıyor, son dinleneni getir
    if (nowPlayingRes.status === 204) {
      return await getRecentlyPlayed(accessToken);
    }

    if (!nowPlayingRes.ok) {
      console.error(`[Spotify] Now playing failed (${nowPlayingRes.status})`);
      return await getRecentlyPlayed(accessToken);
    }

    const data = await nowPlayingRes.json();

    // Podcast veya geçersiz veri kontrolü
    if (!data.item || data.currently_playing_type !== 'track') {
      return await getRecentlyPlayed(accessToken);
    }

    return {
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
      album: data.item.album.name,
      albumImageUrl: data.item.album.images?.[0]?.url || '',
      songUrl: data.item.external_urls.spotify,
    };
  } catch (error) {
    console.error('[Spotify] getNowPlaying error:', error);
    return null;
  }
}

/**
 * En son dinlenen şarkıyı getirir (hiçbir şey çalmıyorken)
 */
async function getRecentlyPlayed(accessToken: string): Promise<SpotifyTrack | null> {
  try {
    const res = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`[Spotify] Recently played failed (${res.status})`);
      return null;
    }

    const data = await res.json();
    const track = data.items?.[0]?.track;
    if (!track) return null;

    return {
      isPlaying: false,
      title: track.name,
      artist: track.artists.map((a: { name: string }) => a.name).join(', '),
      album: track.album.name,
      albumImageUrl: track.album.images?.[0]?.url || '',
      songUrl: track.external_urls.spotify,
    };
  } catch (error) {
    console.error('[Spotify] getRecentlyPlayed error:', error);
    return null;
  }
}

/**
 * OAuth yetkilendirme URL'ini oluşturur
 */
export function getSpotifyAuthUrl(): string {
  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-read-playback-state',
  ].join(' ');

  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || '';

  const params = new URLSearchParams({
    client_id,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes,
    show_dialog: 'true',
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * OAuth callback'ten gelen code ile token alır
 */
export async function getTokensFromCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
} | null> {
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || '';

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Spotify] Code exchange failed (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch (error) {
    console.error('[Spotify] Code exchange error:', error);
    return null;
  }
}

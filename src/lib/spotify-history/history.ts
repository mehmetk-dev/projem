export interface SpotifyRecentTrackInput {
  spotifyTrackId: string;
  track: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  trackUrl: string;
  playedAt: string;
}

interface SpotifyRecentApiPayload {
  items?: Array<{
    played_at?: string;
    track?: {
      id?: string;
      name?: string;
      artists?: Array<{ name?: string }>;
      album?: {
        name?: string;
        images?: Array<{ url?: string }>;
      };
      external_urls?: { spotify?: string };
    };
  }>;
}

export function formatRelativePlayedAt(value: string, now = new Date()): string {
  const date = new Date(value);
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'az önce';
  if (minutes < 60) return `${minutes} dakika önce`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;

  const years = Math.floor(months / 12);
  return `${years} yıl önce`;
}

export function formatPlayedAt(value: string): string {
  const date = new Date(value);
  const datePart = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Istanbul',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  }).format(date);

  return `${datePart}, ${timePart}`;
}

export function mapSpotifyRecentItems(payload: SpotifyRecentApiPayload): SpotifyRecentTrackInput[] {
  return (payload.items || [])
    .map((item) => {
      const track = item.track;
      if (!track?.id || !track.name || !item.played_at) return null;

      return {
        spotifyTrackId: track.id,
        track: track.name,
        artist: (track.artists || []).map((artist) => artist.name).filter(Boolean).join(', '),
        album: track.album?.name || '',
        albumImageUrl: track.album?.images?.[0]?.url || '',
        trackUrl: track.external_urls?.spotify || '',
        playedAt: item.played_at,
      } satisfies SpotifyRecentTrackInput;
    })
    .filter((item): item is SpotifyRecentTrackInput => Boolean(item));
}

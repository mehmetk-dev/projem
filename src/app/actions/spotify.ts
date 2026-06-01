'use server';

import { getNowPlaying } from '@/lib/spotify';

export interface SpotifyData {
  isPlaying: boolean;
  track: string;
  artist: string;
  albumImage: string;
  trackUrl: string;
}

export async function getSpotifyNowPlaying(): Promise<SpotifyData | null> {
  try {
    const result = await getNowPlaying();
    if (!result) return null;

    return {
      isPlaying: result.isPlaying,
      track: result.title,
      artist: result.artist,
      albumImage: result.albumImageUrl,
      trackUrl: result.songUrl,
    };
  } catch (error) {
    console.error('Spotify Error:', error);
    return null;
  }
}

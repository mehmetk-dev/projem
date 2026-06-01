'use server';

import { db } from '@/db';
import { spotifyRecentTracks } from '@/db/schema';
import { getNowPlaying, getRecentlyPlayedTracks } from '@/lib/spotify';
import { requireAdmin } from '@/lib/auth';
import { saveRemoteImage } from '@/lib/server/remote-images';
import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface SpotifyData {
  isPlaying: boolean;
  track: string;
  artist: string;
  albumImage: string;
  trackUrl: string;
  previewUrl: string | null;
}

export interface SpotifyRecentTrackData {
  id: number;
  spotifyTrackId: string;
  track: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  localImage: string | null;
  trackUrl: string;
  playedAt: string;
  createdAt: string;
}

export interface SpotifySyncResult {
  error?: string;
  success?: string;
  inserted?: number;
  data?: SpotifyRecentTrackData[];
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
      previewUrl: result.previewUrl,
    };
  } catch (error) {
    console.error('Spotify Error:', error);
    return null;
  }
}

export async function getSpotifyRecentTracks(limit = 30): Promise<SpotifyRecentTrackData[]> {
  await requireAdmin();

  return db
    .select()
    .from(spotifyRecentTracks)
    .orderBy(desc(spotifyRecentTracks.playedAt))
    .limit(limit)
    .all();
}

export async function syncSpotifyRecentTracksAction(): Promise<SpotifySyncResult> {
  await requireAdmin();

  try {
    const recentTracks = await getRecentlyPlayedTracks(20);
    let inserted = 0;

    for (const item of recentTracks) {
      const existing = await db
        .select({ id: spotifyRecentTracks.id })
        .from(spotifyRecentTracks)
        .where(and(
          eq(spotifyRecentTracks.spotifyTrackId, item.spotifyTrackId),
          eq(spotifyRecentTracks.playedAt, item.playedAt)
        ))
        .get();

      if (existing) continue;

      const localImage = item.albumImageUrl
        ? await saveRemoteImage(item.albumImageUrl, 'spotify', item.spotifyTrackId)
        : null;

      await db.insert(spotifyRecentTracks).values({
        spotifyTrackId: item.spotifyTrackId,
        track: item.track,
        artist: item.artist,
        album: item.album,
        albumImageUrl: item.albumImageUrl,
        localImage,
        trackUrl: item.trackUrl,
        playedAt: item.playedAt,
      });
      inserted += 1;
    }

    revalidatePath('/dashboard');
    const data = await getSpotifyRecentTracks();

    return {
      success: inserted > 0 ? `${inserted} yeni dinleme kaydedildi.` : 'Yeni dinleme bulunamadı.',
      inserted,
      data,
    };
  } catch (error) {
    console.error('Spotify Sync Error:', error);
    return { error: 'Spotify geçmişi kaydedilirken hata oluştu.' };
  }
}

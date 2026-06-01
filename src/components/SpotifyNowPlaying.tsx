'use client';

import { useEffect, useState, useCallback } from 'react';

interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
}

export default function SpotifyNowPlaying() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);

  const fetchTrack = useCallback(async () => {
    try {
      const res = await fetch('/api/spotify/now-playing', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.title) setTrack(data);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchTrack();
    const interval = setInterval(fetchTrack, 30000);
    return () => clearInterval(interval);
  }, [fetchTrack]);

  if (!track) return null;

  return (
    <a
      href={track.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors group"
      title={`${track.title} — ${track.artist}`}
    >
      {/* Spotify icon */}
      <svg viewBox="0 0 24 24" width="14" height="14" className="fill-[#1DB954] shrink-0">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>

      {/* Album art */}
      {track.albumImageUrl && (
        <img
          src={track.albumImageUrl}
          alt=""
          width={16}
          height={16}
          className="w-4 h-4 rounded-[3px] object-cover shrink-0"
        />
      )}

      {/* Equalizer bars (only when playing) */}
      {track.isPlaying && (
        <span className="inline-flex items-end gap-[2px] h-[10px]">
          <span className="w-[2px] bg-[#1DB954] rounded-sm animate-[eq-bar_1.2s_ease-in-out_infinite]" style={{ height: '4px', animationDelay: '0s' }} />
          <span className="w-[2px] bg-[#1DB954] rounded-sm animate-[eq-bar_1.2s_ease-in-out_infinite]" style={{ height: '7px', animationDelay: '0.2s' }} />
          <span className="w-[2px] bg-[#1DB954] rounded-sm animate-[eq-bar_1.2s_ease-in-out_infinite]" style={{ height: '5px', animationDelay: '0.4s' }} />
        </span>
      )}

      <span className="text-[11px] font-mono tracking-[0.05em] truncate max-w-[200px]">
        {track.title} — {track.artist}
      </span>
    </a>
  );
}

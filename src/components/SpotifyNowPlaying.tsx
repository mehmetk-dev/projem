'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  previewUrl: string | null;
}

/**
 * Spotify track URL'inden track ID'yi çıkarır
 * Örn: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC" → "4uLU6hMCjMI75M1A2tKUQC"
 */
function extractTrackId(songUrl: string): string | null {
  try {
    const url = new URL(songUrl);
    const parts = url.pathname.split('/');
    const trackIndex = parts.indexOf('track');
    if (trackIndex !== -1 && parts[trackIndex + 1]) {
      return parts[trackIndex + 1];
    }
  } catch { /* invalid URL */ }
  return null;
}

export default function SpotifyNowPlaying() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchTrack = useCallback(async () => {
    try {
      const res = await fetch('/api/spotify/now-playing', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.title) setTrack(data);
    } catch {
      /* network error */
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => { void fetchTrack(); }, 500);
    const interval = setInterval(fetchTrack, 30_000);
    return () => { clearTimeout(id); clearInterval(interval); };
  }, [fetchTrack]);

  // Dışarı tıklayınca dropdown'ı kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // ESC ile kapat
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [open]);

  if (!track) return null;

  const trackId = extractTrackId(track.songUrl);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Kompakt Header Göstergesi */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] hover:bg-[#1DB954]/10 hover:border-[#1DB954]/25 transition-all duration-300 group cursor-pointer min-w-0 shrink"
        title={`${track.title} — ${track.artist}${track.isPlaying ? ' (Dinleniyor)' : ''}`}
      >
        {/* Album Art */}
        {track.albumImageUrl && (
          <div className="relative w-5 h-5 shrink-0">
            <Image
              src={track.albumImageUrl}
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 rounded-[4px] object-cover"
            />
            {track.isPlaying && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#1DB954] border border-black shadow-[0_0_4px_rgba(29,185,84,0.6)]" />
            )}
          </div>
        )}

        {/* Equalizer Bars */}
        {track.isPlaying ? (
          <span className="inline-flex items-end gap-[1.5px] h-[10px] shrink-0">
            <span className="w-[2px] bg-[#1DB954] rounded-sm animate-[eq-bar_1.2s_ease-in-out_infinite]" style={{ height: '3px', animationDelay: '0s' }} />
            <span className="w-[2px] bg-[#1DB954] rounded-sm animate-[eq-bar_1.2s_ease-in-out_infinite]" style={{ height: '7px', animationDelay: '0.2s' }} />
            <span className="w-[2px] bg-[#1DB954] rounded-sm animate-[eq-bar_1.2s_ease-in-out_infinite]" style={{ height: '5px', animationDelay: '0.4s' }} />
          </span>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-50">
            <circle cx="12" cy="12" r="10" stroke="#1DB954" strokeWidth="2" />
            <polygon points="10,8 16,12 10,16" fill="#1DB954" />
          </svg>
        )}

        {/* Track Info */}
        <span className="text-[11px] font-mono tracking-[0.02em] truncate max-w-[110px] text-neutral-400 group-hover:text-white transition-colors">
          {track.title}
        </span>

        {/* Expand chevron */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-neutral-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Player */}
      {open && (
        <div
          className="absolute right-0 top-full mt-3 w-[320px] rounded-2xl border border-white/[0.08] bg-neutral-950/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
          style={{ animation: 'spotifyDropIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
              <path
                fill="#1DB954"
                d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#1DB954]">
                {track.isPlaying ? 'Şu an dinliyor' : 'Son dinlenen'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Kapat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Track Info */}
          <div className="flex items-center gap-3 px-4 pb-3">
            {track.albumImageUrl && (
              <Image
                src={track.albumImageUrl}
                alt={track.album || track.title}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{track.title}</p>
              <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
              {track.album && (
                <p className="text-[11px] text-neutral-600 truncate mt-0.5">{track.album}</p>
              )}
            </div>
          </div>

          {/* Spotify Embed Player — herkes dinleyebilir */}
          {trackId ? (
            <div className="px-3 pb-3">
              <iframe
                src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
                title={`${track.title} - Spotify Player`}
              />
            </div>
          ) : (
            <div className="px-4 pb-4">
              <a
                href={track.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-sm font-semibold transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Spotify&apos;da Dinle
              </a>
            </div>
          )}

          {/* Footer link */}
          <div className="px-4 pb-3 pt-1 border-t border-white/[0.05]">
            <a
              href={track.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-[11px] text-neutral-500 hover:text-white transition-colors py-1"
            >
              <span>Spotify&apos;da aç</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

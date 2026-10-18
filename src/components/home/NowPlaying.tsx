'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface Track {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
}

const REFRESH_MS = 60_000;

// Footer'da Spotify'da şu an çalan (ya da son dinlenen) şarkı.
// Yalnızca görünür olduğunda istek atar; Spotify bağlı değilse hiç görünmez.
export default function NowPlaying() {
  const ref = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: number | undefined;
    let visible = false;

    const load = async () => {
      try {
        const res = await fetch('/api/spotify/now-playing');
        if (!res.ok) return;
        const data = await res.json();
        setTrack(data?.title ? data : null);
      } catch {
        // Ağ hatası: rozet sessizce gizli kalır
      }
    };

    const schedule = () => {
      window.clearInterval(timer);
      if (visible && document.visibilityState === 'visible') {
        void load();
        timer = window.setInterval(load, REFRESH_MS);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    observer.observe(el);
    document.addEventListener('visibilitychange', schedule);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', schedule);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div ref={ref} className="min-h-px">
      {track && (
        <a
          href={track.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="home-reveal group mt-8 flex max-w-xs items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 pr-4 transition-colors hover:border-ink/15"
        >
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-2">
            {track.albumImageUrl && (
              <Image src={track.albumImageUrl} alt="" fill sizes="48px" className="object-cover" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted">
              {track.isPlaying ? (
                <>
                  <span className="home-eq flex h-2.5 items-end gap-[2px] text-[#1db954]" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  Şu an dinliyorum
                </>
              ) : (
                'Son dinlediğim'
              )}
            </span>
            <span className="mt-1 block truncate text-[14px] font-medium leading-tight text-ink">{track.title}</span>
            <span className="block truncate text-[13px] leading-tight text-ink-muted">{track.artist}</span>
          </span>
          <ArrowUpRight
            size={15}
            className="shrink-0 text-ink-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
            aria-hidden="true"
          />
        </a>
      )}
    </div>
  );
}

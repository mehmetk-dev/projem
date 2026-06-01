'use client';

import { Music } from 'lucide-react';

interface SpotifyData {
  isPlaying: boolean;
  track: string;
  artist: string;
  albumImage: string;
  trackUrl: string;
}

interface Props {
  data: SpotifyData | null;
  onConfigure?: () => void;
}

export default function SpotifyWidget({ data, onConfigure }: Props) {
  if (!data || !data.isPlaying) {
    return (
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02] text-center">
        <Music size={32} className="text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Şu an müzik dinlenmiyor.</p>
        {onConfigure && (
          <button
            type="button"
            onClick={onConfigure}
            className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Spotify ayarlarini ac
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onConfigure}
      className="w-full text-left p-5 rounded-2xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02] hover:border-neutral-400 dark:hover:border-white/15 transition-colors"
    >
      <div className="flex items-center gap-4">
        {data.albumImage && (
          <img src={data.albumImage} alt={data.track} className="w-16 h-16 rounded-lg object-cover" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{data.track}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{data.artist}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400">Şu an dinliyor</span>
          </div>
        </div>
      </div>
    </button>
  );
}

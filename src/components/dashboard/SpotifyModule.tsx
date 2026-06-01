'use client';

import { ExternalLink, Music } from 'lucide-react';
import * as T from './types';
import { Card } from './ui';

interface Props {
  spotifyData: T.SpotifyData | null;
  settings: T.SiteSetting[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function SpotifyModule({ spotifyData }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Spotify</h1>
        <p className="text-sm text-neutral-500 mt-1">Dinleme durumu (.env üzerinden yapılandırılmış)</p>
      </div>

      <Card className="min-h-[260px] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-5">
            <Music size={18} />
            <h2 className="font-bold text-sm uppercase tracking-wider">
              {spotifyData?.isPlaying ? 'Now Playing' : 'Son Dinlenen'}
            </h2>
          </div>

          {spotifyData ? (
            <div className="flex items-center gap-5">
              {spotifyData.albumImage && (
                <img
                  src={spotifyData.albumImage}
                  alt={spotifyData.track}
                  className="w-28 h-28 rounded-xl object-cover border border-white/10"
                />
              )}
              <div className="min-w-0">
                <p className="text-xl font-bold text-white truncate">{spotifyData.track}</p>
                <p className="text-sm text-neutral-400 mt-1 truncate">{spotifyData.artist}</p>
                <div className="flex items-center gap-2 mt-4 text-xs">
                  {spotifyData.isPlaying ? (
                    <span className="flex items-center gap-2 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif olarak dinleniyor
                    </span>
                  ) : (
                    <span className="text-neutral-500">En son dinlenen parça</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-sm text-neutral-400">
              Spotify verisi alınamadı. .env dosyasında SPOTIFY_REFRESH_TOKEN ayarlı olduğundan emin olun.
            </div>
          )}
        </div>

        {spotifyData?.trackUrl && (
          <a
            href={spotifyData.trackUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <ExternalLink size={14} />
            Spotify&apos;da aç
          </a>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="font-bold text-sm text-neutral-400">Bağlantı Durumu</h2>
        </div>
        <p className="text-xs text-neutral-500">
          Spotify API, .env dosyasındaki <code className="text-neutral-400">SPOTIFY_REFRESH_TOKEN</code> ile yapılandırılmış.
          Token otomatik olarak yenilenir, ekstra işlem gerekmez.
        </p>
      </Card>
    </div>
  );
}

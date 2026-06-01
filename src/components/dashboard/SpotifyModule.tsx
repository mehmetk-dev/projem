'use client';

import { useMemo, useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, Clock, ExternalLink, Music, RefreshCw } from 'lucide-react';
import { syncSpotifyRecentTracksAction } from '@/app/actions/spotify';
import { formatPlayedAt, formatRelativePlayedAt } from '@/lib/spotify-history/history';
import * as T from './types';
import { Card } from './ui';

interface Props {
  spotifyData: T.SpotifyData | null;
  recentTracks: T.SpotifyRecentTrack[];
  settings: T.SiteSetting[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function SpotifyModule({ spotifyData, recentTracks, toastFn }: Props) {
  const [tracks, setTracks] = useState(recentTracks);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const PAGE_SIZE = 10;

  const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE));
  const pagedTracks = useMemo(() => tracks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [tracks, page]);

  const handleSync = () => {
    startTransition(async () => {
      const result = await syncSpotifyRecentTracksAction();
      if (result.error) {
        toastFn(result.error, false);
        return;
      }

      if (result.data) {
        setTracks(result.data);
        setPage(1);
      }
      toastFn(result.success || 'Spotify geçmişi güncellendi.', true);
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spotify</h1>
          <p className="mt-1 text-sm text-neutral-500">Şu an çalan parça ve kaydedilen dinleme geçmişi</p>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} />
          {isPending ? 'Kaydediliyor' : 'Son dinlenenleri yenile'}
        </button>
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
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={spotifyData.albumImage}
                  alt={spotifyData.track}
                  className="h-28 w-28 rounded-xl border border-white/10 object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-xl font-bold text-white">{spotifyData.track}</p>
                <p className="mt-1 truncate text-sm text-neutral-400">{spotifyData.artist}</p>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  {spotifyData.isPlaying ? (
                    <span className="flex items-center gap-2 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
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
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-white">Son Dinlenenler</h2>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Dinleme zamanı ve albüm kapağıyla kayıtlı geçmiş</p>
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-neutral-400">{tracks.length} kayıt</span>
        </div>

        {tracks.length > 0 ? (
          <>
            <div className="space-y-2">
              {pagedTracks.map((track) => {
              const image = track.localImage || track.albumImageUrl;

              return (
                <div
                  key={`${track.spotifyTrackId}-${track.playedAt}`}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={track.album || track.track}
                      className="h-14 w-14 shrink-0 rounded-lg border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-neutral-900 text-neutral-500">
                      <Music size={18} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{track.track}</p>
                    <p className="truncate text-xs text-neutral-400">{track.artist}</p>
                    {track.album && <p className="mt-0.5 truncate text-[11px] text-neutral-600">{track.album}</p>}
                  </div>

                  <div className="hidden min-w-[132px] text-right sm:block">
                    <p className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-300">
                      <Clock size={13} />
                      {formatRelativePlayedAt(track.playedAt)}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-600">{formatPlayedAt(track.playedAt)}</p>
                  </div>

                  {track.trackUrl && (
                    <a
                      href={track.trackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-white/5 hover:text-white"
                      aria-label={`${track.track} Spotify bağlantısı`}
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Önceki
              </button>
              <span className="text-xs text-neutral-500">{page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Sonraki
                <ChevronRight size={14} />
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <Music className="mx-auto mb-3 text-neutral-600" size={24} />
            <p className="text-sm font-medium text-neutral-300">Henüz kayıtlı dinleme yok.</p>
            <p className="mt-1 text-xs text-neutral-500">Son dinlenenleri yenileyince Spotify geçmişi buraya kaydedilir.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

'use client';

import { useMemo, useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, Clock, ExternalLink, Music, RefreshCw } from 'lucide-react';
import { syncSpotifyRecentTracksAction } from '@/app/actions/spotify';
import { formatPlayedAt, formatRelativePlayedAt } from '@/lib/spotify-history/history';
import * as T from './types';
import { Card, PageHeader, ui } from './ui';

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
      <PageHeader title="Spotify" description="Şu an çalan parça ve kaydedilen dinleme geçmişi">
        <button
          type="button"
          onClick={handleSync}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-700 dark:text-emerald-200 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} />
          {isPending ? 'Kaydediliyor' : 'Son dinlenenleri yenile'}
        </button>
      </PageHeader>

      <Card className="min-h-[260px] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-5">
            <Music size={18} />
            <h2 className={ui.sectionTitle}>
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
                  className="h-28 w-28 rounded-xl border border-line object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-xl font-bold text-ink">{spotifyData.track}</p>
                <p className="mt-1 truncate text-sm text-ink-soft">{spotifyData.artist}</p>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  {spotifyData.isPlaying ? (
                    <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif olarak dinleniyor
                    </span>
                  ) : (
                    <span className="text-ink-muted">En son dinlenen parça</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-surface-2 p-5 text-sm text-ink-soft">
              Spotify verisi alınamadı. .env dosyasında SPOTIFY_REFRESH_TOKEN ayarlı olduğundan emin olun.
            </div>
          )}
        </div>

        {spotifyData?.trackUrl && (
          <a
            href={spotifyData.trackUrl}
            target="_blank"
            rel="noreferrer"
            className={`${ui.btnSecondary} mt-6 w-fit`}
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
              <h2 className={ui.sectionTitle}>Son Dinlenenler</h2>
            </div>
            <p className="mt-1 text-xs text-ink-muted">Dinleme zamanı ve albüm kapağıyla kayıtlı geçmiş</p>
          </div>
          <span className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-muted">{tracks.length} kayıt</span>
        </div>

        {tracks.length > 0 ? (
          <>
            <div className="space-y-2">
              {pagedTracks.map((track) => {
              const image = track.localImage || track.albumImageUrl;

              return (
                <div
                  key={`${track.spotifyTrackId}-${track.playedAt}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-paper p-3 transition-colors hover:border-ink/15 hover:bg-surface-2"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={track.album || track.track}
                      className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                      <Music size={18} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{track.track}</p>
                    <p className="truncate text-xs text-ink-soft">{track.artist}</p>
                    {track.album && <p className="mt-0.5 truncate text-[11px] text-ink-muted">{track.album}</p>}
                  </div>

                  <div className="hidden min-w-[132px] text-right sm:block">
                    <p className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                      <Clock size={13} />
                      {formatRelativePlayedAt(track.playedAt)}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-muted">{formatPlayedAt(track.playedAt)}</p>
                  </div>

                  {track.trackUrl && (
                    <a
                      href={track.trackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md p-2 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
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
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-muted hover:text-ink hover:border-ink/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Önceki
              </button>
              <span className="text-xs text-ink-muted">{page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-muted hover:text-ink hover:border-ink/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Sonraki
                <ChevronRight size={14} />
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-surface-2 p-6 text-center">
            <Music className="mx-auto mb-3 text-ink-muted" size={24} />
            <p className="text-sm font-medium text-ink-soft">Henüz kayıtlı dinleme yok.</p>
            <p className="mt-1 text-xs text-ink-muted">Son dinlenenleri yenileyince Spotify geçmişi buraya kaydedilir.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

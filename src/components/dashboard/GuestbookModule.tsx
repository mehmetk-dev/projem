'use client';

import { useState, useTransition } from 'react';
import { approveGuestbookAction, deleteGuestbookAction } from '@/app/actions/guestbook';
import { PageHeader } from './ui';

interface GuestbookEntry {
  id: number;
  name: string;
  email: string;
  message: string;
  approved: boolean;
  createdAt: string;
}

interface Props {
  entries: GuestbookEntry[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function GuestbookModule({ entries, toastFn }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<number | null>(null);

  const filtered = entries.filter((e) => {
    if (filter === 'pending') return !e.approved;
    if (filter === 'approved') return e.approved;
    return true;
  });

  const handleApprove = (id: number) => {
    setActionId(id);
    const fd = new FormData();
    fd.append('id', String(id));
    startTransition(async () => {
      const res = await approveGuestbookAction(fd);
      toastFn(res.success || res.error || 'İşlem tamamlandı.', !!res.success);
      setActionId(null);
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    setActionId(id);
    const fd = new FormData();
    fd.append('id', String(id));
    startTransition(async () => {
      const res = await deleteGuestbookAction(fd);
      toastFn(res.success || res.error || 'İşlem tamamlandı.', !!res.success);
      setActionId(null);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Ziyaretçi Defteri">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f
                  ? 'bg-surface-2 border-ink/30 text-ink'
                  : 'border-line text-ink-muted hover:border-ink/30 hover:text-ink'
              }`}
            >
              {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : 'Onaylı'}
            </button>
          ))}
      </PageHeader>

      {filtered.length === 0 ? (
        <p className="text-ink-muted text-sm">Bu kategoride mesaj bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className={`p-5 rounded-2xl border ${
                entry.approved ? 'border-line bg-surface' : 'border-amber-500/25 bg-amber-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink">{entry.name}</span>
                  <span className="text-[11px] text-ink-muted">{entry.email}</span>
                  {!entry.approved && (
                    <span className="text-[9px] text-amber-700 dark:text-amber-400 border border-amber-500/25 px-1.5 rounded">
                      onay bekliyor
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-ink-muted">
                  {new Date(entry.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <p className="text-ink-soft text-sm leading-relaxed mb-4 whitespace-pre-wrap">{entry.message}</p>
              <div className="flex gap-2">
                {!entry.approved && (
                  <button
                    onClick={() => handleApprove(entry.id)}
                    disabled={isPending && actionId === entry.id}
                    className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    {isPending && actionId === entry.id ? '...' : 'Onayla'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={isPending && actionId === entry.id}
                  className="text-xs px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                >
                  {isPending && actionId === entry.id ? '...' : 'Sil'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

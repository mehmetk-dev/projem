'use client';

import { useState, useTransition } from 'react';
import { approveGuestbookAction, deleteGuestbookAction } from '@/app/actions/guestbook';

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Ziyaretçi Defteri</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filter === f
                  ? 'bg-neutral-200 dark:bg-white/10 border-neutral-400 dark:border-white/20 text-neutral-900 dark:text-white'
                  : 'border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : 'Onaylı'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Bu kategoride mesaj bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className={`p-5 rounded-xl border ${
                entry.approved ? 'border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02]' : 'border-amber-500/20 bg-amber-500/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-neutral-900 dark:text-white">{entry.name}</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{entry.email}</span>
                  {!entry.approved && (
                    <span className="text-[9px] text-amber-400 border border-amber-500/20 px-1.5 rounded">
                      onay bekliyor
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {new Date(entry.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{entry.message}</p>
              <div className="flex gap-2">
                {!entry.approved && (
                  <button
                    onClick={() => handleApprove(entry.id)}
                    disabled={isPending && actionId === entry.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    {isPending && actionId === entry.id ? '...' : 'Onayla'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={isPending && actionId === entry.id}
                  className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
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

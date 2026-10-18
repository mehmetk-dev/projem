'use client';

import { PageHeader } from './ui';

interface Subscriber {
  id: number;
  email: string;
  status: string;
  ipAddress: string | null;
  createdAt: string;
}

interface Props {
  subscribers: Subscriber[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function SubscribersModule({ subscribers }: Props) {
  const activeCount = subscribers.filter((s) => s.status === 'active').length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Aboneler" />

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <div className="text-xs text-ink-muted mt-1">Aktif</div>
        </div>
        <div className="p-4 rounded-xl border border-line bg-surface text-center">
          <div className="text-2xl font-bold text-ink-muted">{unsubscribedCount}</div>
          <div className="text-xs text-ink-muted mt-1">Ayrılmış</div>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-ink-muted text-sm">Henüz abone yok.</p>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {subscribers.map((s) => (
            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-line bg-surface">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-ink">{s.email}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${s.status === 'active' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-ink-muted border-line bg-surface-2'}`}>
                  {s.status}
                </span>
              </div>
              <span className="text-[11px] text-ink-muted">{new Date(s.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

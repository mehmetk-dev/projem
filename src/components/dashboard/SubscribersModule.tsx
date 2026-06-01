'use client';

import { Mail } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail size={20} className="text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-2xl font-bold tracking-tight">Aboneler</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
          <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
          <div className="text-xs text-neutral-500 mt-1">Aktif</div>
        </div>
        <div className="p-4 rounded-xl border border-neutral-500/20 bg-neutral-500/5 text-center">
          <div className="text-2xl font-bold text-neutral-400">{unsubscribedCount}</div>
          <div className="text-xs text-neutral-500 mt-1">Ayrılmış</div>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Henüz abone yok.</p>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {subscribers.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-900 dark:text-white">{s.email}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${s.status === 'active' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-neutral-400 border-neutral-500/20 bg-neutral-500/10'}`}>
                  {s.status}
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{new Date(s.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

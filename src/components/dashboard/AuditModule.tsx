'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';

interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  entity: string;
  entityId: number | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface Props {
  logs: AuditLog[];
  toastFn: (msg: string, ok: boolean) => void;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  UPDATE: 'text-sky-600 dark:text-sky-400 border-sky-500/20 bg-sky-500/10',
  DELETE: 'text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10',
  LOGIN: 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/10',
  LOGOUT: 'text-neutral-600 dark:text-neutral-400 border-neutral-500/20 bg-neutral-500/10',
  APPROVE: 'text-violet-600 dark:text-violet-400 border-violet-500/20 bg-violet-500/10',
  PUBLISH: 'text-teal-600 dark:text-teal-400 border-teal-500/20 bg-teal-500/10',
};

export default function AuditModule({ logs }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const filtered = logs.filter((log) => {
    const actionMatch = filter === 'all' || log.action === filter;
    const entityMatch = entityFilter === 'all' || log.entity === entityFilter;
    return actionMatch && entityMatch;
  });

  const uniqueActions = [...new Set(logs.map((l) => l.action))];
  const uniqueEntities = [...new Set(logs.map((l) => l.entity))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{logs.length} kayıt</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white"
        >
          <option value="all" className="bg-neutral-100 dark:bg-neutral-900">Tüm Eylemler</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a} className="bg-neutral-100 dark:bg-neutral-900">{a}</option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white"
        >
          <option value="all" className="bg-neutral-100 dark:bg-neutral-900">Tüm Varlıklar</option>
          {uniqueEntities.map((e) => (
            <option key={e} value={e} className="bg-neutral-100 dark:bg-neutral-900">{e}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Kayıt bulunmuyor.</p>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {filtered.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02] text-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${ACTION_COLORS[log.action] || 'text-neutral-600 dark:text-neutral-400 border-neutral-500/20 bg-neutral-500/10'}`}>
                    {log.action}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">{log.entity}</span>
                  {log.entityId && <span className="text-neutral-500 dark:text-neutral-600">#{log.entityId}</span>}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>{log.ipAddress || '—'}</span>
                  <span>{new Date(log.createdAt).toLocaleString('tr-TR')}</span>
                </div>
              </div>
              {(log.oldValue || log.newValue) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                  {log.oldValue && (
                    <div className="bg-rose-500/5 rounded-lg p-2 border border-rose-500/10">
                      <span className="text-rose-600 dark:text-rose-400 font-medium">Eski:</span> {log.oldValue}
                    </div>
                  )}
                  {log.newValue && (
                    <div className="bg-emerald-500/5 rounded-lg p-2 border border-emerald-500/10">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Yeni:</span> {log.newValue}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

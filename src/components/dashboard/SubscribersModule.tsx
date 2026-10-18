'use client';

import { useState, useTransition } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendNewsletterAction } from '@/app/actions/newsletter';
import { markdownComponents, postBodyClass } from '@/components/blog/markdown';
import { PageHeader, ui } from './ui';

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

export default function SubscribersModule({ subscribers, toastFn }: Props) {
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

      <NewsletterComposer activeCount={activeCount} toastFn={toastFn} />

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

function NewsletterComposer({ activeCount, toastFn }: { activeCount: number; toastFn: Props['toastFn'] }) {
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  const send = (mode: 'test' | 'all') => {
    if (mode === 'all' && !confirm(`Bülten ${activeCount} aktif aboneye gönderilecek. Emin misiniz?`)) return;
    const fd = new FormData();
    fd.append('subject', subject);
    fd.append('body', body);
    fd.append('mode', mode);
    startTransition(async () => {
      const res = await sendNewsletterAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
      if (res.success && mode === 'all') {
        setSubject('');
        setBody('');
      }
    });
  };

  const tabClass = (active: boolean) =>
    `rounded px-3 py-1 text-xs transition-colors ${active ? 'bg-surface-2 font-semibold text-ink' : 'text-ink-muted hover:text-ink'}`;

  return (
    <div className={`${ui.card} space-y-3 p-5`}>
      <div>
        <h2 className="text-sm font-bold">Bülten gönder</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Markdown ile yazın. Her aboneye ayrı gönderilir; e-postanın altında “bültenden ayrılın” bağlantısı otomatik eklenir.
          Önce kendinize test gönderin.
        </p>
      </div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="Konu" className={ui.input} />
      <div className="flex gap-1">
        <button type="button" onClick={() => setTab('write')} className={tabClass(tab === 'write')}>
          Yaz
        </button>
        <button type="button" onClick={() => setTab('preview')} className={tabClass(tab === 'preview')}>
          Önizleme
        </button>
      </div>
      {tab === 'write' ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          placeholder={'Merhaba,\n\nBu ay neler oldu?\n\n- [Yeni yazı](https://...)\n- …'}
          className={`${ui.input} resize-y font-mono text-[13px]`}
        />
      ) : (
        <div className="max-h-[400px] min-h-[180px] overflow-y-auto rounded-xl border border-line bg-paper p-4">
          {subject && <p className="mb-4 text-xl font-semibold text-ink">{subject}</p>}
          <div className={postBodyClass}>
            <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {body || '_İçerik boş._'}
            </Markdown>
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => send('test')} disabled={isPending || !subject || !body} className={ui.btnSecondary}>
          Kendime test gönder
        </button>
        <button type="button" onClick={() => send('all')} disabled={isPending || !subject || !body || activeCount === 0} className={ui.btnPrimary}>
          {isPending ? 'Gönderiliyor…' : `${activeCount} aboneye gönder`}
        </button>
      </div>
    </div>
  );
}

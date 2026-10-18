'use client';

import { useState } from 'react';
import * as T from './types';
import { Empty, PlusIcon, Btn, PageHeader, ui } from './ui';
import { createSnippetAction, deleteSnippetAction } from '@/app/actions/snippets';

interface Props {
  snippets: T.Snippet[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function SnippetsModule({ snippets: initial, toastFn }: Props) {
  const [snippets, setSnippets] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ title: '', code: '', language: 'typescript', description: '', tags: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const res = await createSnippetAction(null, new FormData(e.currentTarget as HTMLFormElement));
    setBusy(false);
    if (res.error || !res.data) { toastFn(res.error || 'Hata', false); return; }
    const snippet = res.data;
    setSnippets((prev) => [...prev, snippet]);
    toastFn(res.success || 'Başarılı', true);
    setCreating(false); setF({ title: '', code: '', language: 'typescript', description: '', tags: '' });
  };

  const del = async (id: number) => { if (!confirm('Silinsin mi?')) return; setSnippets((prev) => prev.filter((s) => s.id !== id)); const fd = new FormData(); fd.append('snippetId', String(id)); const res = await deleteSnippetAction(fd); if (res.error) { toastFn(res.error, false); setSnippets(initial); } };

  return (
    <div className="space-y-5">
      <PageHeader title="Kod Snippet'ları" description={`${snippets.length} snippet`}>
          {!creating && <Btn onClick={() => setCreating(true)}><PlusIcon /> Yeni Snippet</Btn>}
        </PageHeader>

      {creating && (
        <form onSubmit={submit} className={`${ui.card} p-5 space-y-3 animate-in fade-in`}>
          <div className="flex justify-between items-center"><h2 className="text-sm font-semibold text-ink">Yeni Snippet</h2><Btn variant="ghost" onClick={() => setCreating(false)}>İptal</Btn></div>
          <input name="title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Başlık" required className={ui.input} />
          <textarea name="code" value={f.code} onChange={(e) => setF((s) => ({ ...s, code: e.target.value }))} placeholder="Kodunuzu yapıştırın..." rows={5} className={`${ui.input} resize-none font-mono text-xs`} />
          <div className="grid grid-cols-2 gap-3">
            <input name="language" value={f.language} onChange={(e) => setF((s) => ({ ...s, language: e.target.value }))} placeholder="Dil" aria-label="Dil" className={ui.input} />
            <input name="tags" value={f.tags} onChange={(e) => setF((s) => ({ ...s, tags: e.target.value }))} placeholder="Etiketler" className={ui.input} />
          </div>
          <input name="description" value={f.description} onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))} placeholder="Açıklama" className={ui.input} />
          <button type="submit" disabled={busy} className={ui.btnPrimary}>{busy ? 'Kaydediliyor...' : 'Ekle'}</button>
        </form>
      )}

      <div className="space-y-3">
        {snippets.length === 0 ? <Empty /> : snippets.map((s) => (
          <div key={s.id} className={`${ui.card} overflow-hidden`}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ink">{s.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-ink-muted">{s.language}</span>
              </div>
              <button onClick={() => del(s.id)} className="text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/25 transition-colors">Sil</button>
            </div>
            <pre className="p-4 text-xs font-mono text-ink-soft overflow-x-auto whitespace-pre-wrap">{s.code}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

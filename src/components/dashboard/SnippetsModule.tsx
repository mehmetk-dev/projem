'use client';

import { useState } from 'react';
import * as T from './types';
import { Empty, PlusIcon, Btn } from './ui';
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
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold tracking-tight">Kod Snippet&apos;ları</h1><p className="text-sm text-neutral-500 mt-0.5">{snippets.length} snippet</p></div>
        {!creating && <Btn onClick={() => setCreating(true)}><PlusIcon /> Yeni Snippet</Btn>}
      </div>

      {creating && (
        <form onSubmit={submit} className="bg-neutral-900/40 border border-white/10 rounded-2xl p-5 space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center"><h2 className="font-bold text-sm">Yeni Snippet</h2><Btn variant="ghost" onClick={() => setCreating(false)}>İptal</Btn></div>
          <input name="title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Başlık" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <textarea name="code" value={f.code} onChange={(e) => setF((s) => ({ ...s, code: e.target.value }))} placeholder="Kodunuzu yapıştırın..." rows={5} className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs font-mono text-neutral-300 placeholder:text-neutral-700 focus:outline-none focus:border-white/20 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input name="language" value={f.language} onChange={(e) => setF((s) => ({ ...s, language: e.target.value }))} placeholder="Dil" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
            <input name="tags" value={f.tags} onChange={(e) => setF((s) => ({ ...s, tags: e.target.value }))} placeholder="Etiketler" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          </div>
          <input name="description" value={f.description} onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))} placeholder="Açıklama" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <button type="submit" disabled={busy} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 disabled:opacity-50">{busy ? 'Kaydediliyor...' : 'Ekle'}</button>
        </form>
      )}

      <div className="space-y-3">
        {snippets.length === 0 ? <Empty /> : snippets.map((s) => (
          <div key={s.id} className="rounded-xl bg-neutral-900/30 border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{s.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-500">{s.language}</span>
              </div>
              <button onClick={() => del(s.id)} className="text-[11px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded border border-rose-500/20 transition-colors">Sil</button>
            </div>
            <pre className="p-4 text-xs font-mono text-neutral-400 overflow-x-auto whitespace-pre-wrap">{s.code}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import * as T from './types';
import { Empty, PlusIcon, Btn } from './ui';
import { createBookmarkAction, deleteBookmarkAction } from '@/app/actions/bookmarks';

interface Props {
  bookmarks: T.Bookmark[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function BookmarksModule({ bookmarks: initial, toastFn }: Props) {
  const [bookmarks, setBookmarks] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ title: '', url: '', description: '', tags: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const res = await createBookmarkAction(null, new FormData(e.currentTarget as HTMLFormElement));
    setBusy(false);
    if (res.error || !res.data) { toastFn(res.error || 'Hata', false); return; }
    const bookmark = res.data;
    setBookmarks((prev) => [...prev, bookmark]);
    toastFn(res.success || 'Başarılı', true);
    setCreating(false); setF({ title: '', url: '', description: '', tags: '' });
  };

  const del = async (id: number) => { if (!confirm('Silinsin mi?')) return; setBookmarks((prev) => prev.filter((b) => b.id !== id)); const fd = new FormData(); fd.append('bookmarkId', String(id)); const res = await deleteBookmarkAction(fd); if (res.error) { toastFn(res.error, false); setBookmarks(initial); } };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold tracking-tight">Linkler</h1><p className="text-sm text-neutral-500 mt-0.5">{bookmarks.length} yer imi</p></div>
        {!creating && <Btn onClick={() => setCreating(true)}><PlusIcon /> Yeni Link</Btn>}
      </div>

      {creating && (
        <form onSubmit={submit} className="bg-neutral-900/40 border border-white/10 rounded-2xl p-5 space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center"><h2 className="font-bold text-sm">Yeni Link</h2><Btn variant="ghost" onClick={() => setCreating(false)}>İptal</Btn></div>
          <input name="title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Başlık" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <input name="url" value={f.url} onChange={(e) => setF((s) => ({ ...s, url: e.target.value }))} placeholder="URL (https://...)" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <input name="description" value={f.description} onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))} placeholder="Açıklama" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <input name="tags" value={f.tags} onChange={(e) => setF((s) => ({ ...s, tags: e.target.value }))} placeholder="Etiketler" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <button type="submit" disabled={busy} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 disabled:opacity-50">{busy ? 'Kaydediliyor...' : 'Ekle'}</button>
        </form>
      )}

      <div className="space-y-2">
        {bookmarks.length === 0 ? <Empty /> : bookmarks.map((b) => (
          <div key={b.id} className="group flex items-center gap-3 p-3 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex-1 min-w-0">
              <a href={b.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sm hover:text-white transition-colors flex items-center gap-2">
                {b.title}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
              </a>
              <p className="text-[10px] text-neutral-500 truncate mt-0.5">{b.url}</p>
              {b.tags && <div className="flex flex-wrap gap-1 mt-1.5">{b.tags.split(',').map((t: string) => <span key={t} className="text-[10px] text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded-full">#{t.trim()}</span>)}</div>}
            </div>
            <button onClick={() => del(b.id)} className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
          </div>
        ))}
      </div>
    </div>
  );
}

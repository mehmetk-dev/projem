'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as T from './types';
import { Empty, PlusIcon, Btn } from './ui';
import { createBlogAction, updateBlogAction, deleteBlogAction, togglePublishBlogAction } from '@/app/actions/blogs';

interface Props {
  blogs: T.Blog[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function BlogsModule({ blogs: initialBlogs, toastFn }: Props) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [edit, setEdit] = useState<T.Blog | null>(null);
  const [f, setF] = useState({ title: '', content: '', excerpt: '', metaTitle: '', metaDescription: '', ogImage: '', coverImage: '', category: 'Genel', tags: '', published: false });
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEdit(null);
    setF({ title: '', content: '', excerpt: '', metaTitle: '', metaDescription: '', ogImage: '', coverImage: '', category: 'Genel', tags: '', published: false });
    setMode('list');
  };

  const openEdit = (b: T.Blog) => {
    setEdit(b);
    setF({ title: b.title, content: b.content, excerpt: b.excerpt || '', metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '', ogImage: b.ogImage || '', coverImage: b.coverImage || '', category: b.category, tags: b.tags, published: b.published });
    setMode('form');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    if (edit) fd.append('blogId', String(edit.id));
    const res = await (edit ? updateBlogAction : createBlogAction)(null, fd);
    setBusy(false);
    if (res.error || !res.data) { toastFn(res.error || 'Hata', false); return; }
    const blog = res.data;
    if (edit) { setBlogs((prev) => prev.map((b) => b.id === edit.id ? blog : b)); }
    else { setBlogs((prev) => [...prev, blog]); }
    toastFn(res.success || 'Başarılı', true);
    reset();
  };

  const del = async (id: number) => {
    if (!confirm('Silinsin mi?')) return;
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    const fd = new FormData();
    fd.append('blogId', String(id));
    const res = await deleteBlogAction(fd);
    if (res.error) { toastFn(res.error, false); setBlogs(initialBlogs); }
  };

  const pub = async (id: number) => {
    setBlogs((prev) => prev.map((b) => b.id === id ? { ...b, published: !b.published } : b));
    const fd = new FormData();
    fd.append('blogId', String(id));
    const res = await togglePublishBlogAction(fd);
    if (res.error) { toastFn(res.error, false); setBlogs(initialBlogs); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold tracking-tight">Blog Yönetimi</h1><p className="text-sm text-neutral-500 mt-0.5">{blogs.filter((b) => b.published).length} yayında, {blogs.filter((b) => !b.published).length} taslak</p></div>
        {mode === 'list' && <Btn onClick={() => setMode('form')}><PlusIcon /> Yeni Yazı</Btn>}
      </div>

      {mode === 'form' && (
        <form onSubmit={submit} className="bg-neutral-900/40 border border-white/10 rounded-2xl p-5 space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center"><h2 className="font-bold text-sm">{edit ? 'Yazıyı Düzenle' : 'Yeni Yazı'}</h2><Btn variant="ghost" onClick={reset}>İptal</Btn></div>
          <input name="title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Başlık" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <textarea name="content" value={f.content} onChange={(e) => setF((s) => ({ ...s, content: e.target.value }))} placeholder="İçerik..." rows={5} className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 resize-none" />
          <input name="excerpt" value={f.excerpt} onChange={(e) => setF((s) => ({ ...s, excerpt: e.target.value }))} placeholder="Özet" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="metaTitle" value={f.metaTitle} onChange={(e) => setF((s) => ({ ...s, metaTitle: e.target.value }))} placeholder="Meta Başlık" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
            <input name="metaDescription" value={f.metaDescription} onChange={(e) => setF((s) => ({ ...s, metaDescription: e.target.value }))} placeholder="Meta Açıklama" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input name="category" value={f.category} onChange={(e) => setF((s) => ({ ...s, category: e.target.value }))} placeholder="Kategori" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
            <input name="tags" value={f.tags} onChange={(e) => setF((s) => ({ ...s, tags: e.target.value }))} placeholder="Etiketler" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
            <input type="hidden" name="ogImage" value={f.ogImage} />
            <input type="hidden" name="coverImage" value={f.coverImage} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs text-neutral-500">OG Görseli</label>
              <input name="ogImageFile" type="file" accept="image/*" className="w-full text-xs text-neutral-400 file:bg-neutral-800 file:text-white file:border-0 file:px-3 file:py-1.5 file:rounded-lg file:mr-3" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-neutral-500">Kapak Görseli</label>
              <input name="coverImageFile" type="file" accept="image/*" className="w-full text-xs text-neutral-400 file:bg-neutral-800 file:text-white file:border-0 file:px-3 file:py-1.5 file:rounded-lg file:mr-3" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer"><input type="checkbox" name="published" value="true" checked={f.published} onChange={(e) => setF((s) => ({ ...s, published: e.target.checked }))} className="accent-white" /> Hemen yayınla</label>
          <button type="submit" disabled={busy} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 disabled:opacity-50">{busy ? 'Kaydediliyor...' : edit ? 'Güncelle' : 'Oluştur'}</button>
        </form>
      )}

      <div className="space-y-2">
        {blogs.length === 0 ? <Empty /> : blogs.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 transition-all">
            {b.coverImage ? <img src={b.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/5" /> : <div className={`w-2 h-2 rounded-full shrink-0 ${b.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />}
            <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{b.title}</p><div className="flex gap-2 mt-0.5"><span className="text-[10px] text-neutral-500 uppercase">{b.category}</span>{b.published ? <span className="text-[10px] text-emerald-500/80">{new Date(b.publishedAt || b.createdAt).toLocaleDateString('tr-TR')}</span> : <span className="text-[10px] text-amber-500/80">Taslak</span>}</div></div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link href={`/blog/${b.slug}`} target="_blank" className="text-[10px] text-neutral-400 hover:text-white px-2 py-1 rounded border border-white/10">Görüntüle</Link>
              <button onClick={() => pub(b.id)} className={`text-[10px] px-2 py-1 rounded border ${b.published ? 'text-amber-400 border-amber-500/20' : 'text-emerald-400 border-emerald-500/20'}`}>{b.published ? 'Kaldır' : 'Yayınla'}</button>
              <button onClick={() => openEdit(b)} className="text-[10px] text-neutral-400 hover:text-white px-2 py-1 rounded border border-white/10">Düzenle</button>
              <button onClick={() => del(b.id)} className="text-[10px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded border border-rose-500/20">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

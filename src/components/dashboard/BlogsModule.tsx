'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as T from './types';
import { Empty, PlusIcon, Btn } from './ui';
import { createBlogAction, updateBlogAction, deleteBlogAction, togglePublishBlogAction } from '@/app/actions/blogs';
import { getFileManagerData } from '@/app/actions/files';
import { FolderOpen, Image as ImageIcon, X } from 'lucide-react';

interface Props {
  blogs: T.Blog[];
  toastFn: (msg: string, ok: boolean) => void;
}

function parseMarkdown(text: string): string {
  if (!text) return '<p class="text-neutral-600 italic">İçerik boş. Markdown kullanarak yazmaya başlayın...</p>';
  
  // Basic HTML escaping
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mt-4 mb-2 text-white">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-5 mb-2.5 text-white border-b border-white/5 pb-1">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-6 mb-3 text-white">$1</h1>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs my-3 overflow-x-auto text-neutral-300">$1</pre>');
  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-rose-300">$1</code>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-neutral-300">$1</em>');
  
  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-white/30 pl-3 italic text-neutral-400 my-2">$1</blockquote>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li class="list-disc list-inside text-sm text-neutral-300 ml-2 my-0.5">$1</li>');

  // Paragraph splits
  html = html.replace(/\n\n/g, '</p><p class="text-sm text-neutral-300 leading-relaxed mb-3">');
  // Single newlines
  html = html.replace(/\n/g, '<br />');

  return `<p class="text-sm text-neutral-300 leading-relaxed mb-3">${html}</p>`;
}

export default function BlogsModule({ blogs: initialBlogs, toastFn }: Props) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [edit, setEdit] = useState<T.Blog | null>(null);
  const [f, setF] = useState({ title: '', content: '', excerpt: '', metaTitle: '', metaDescription: '', ogImage: '', coverImage: '', category: 'Genel', tags: '', published: false });
  const [busy, setBusy] = useState(false);
  
  // UI features states
  const [formTab, setFormTab] = useState<'write' | 'preview'>('write');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'coverImage' | 'ogImage' | null>(null);
  const [mediaFiles, setMediaFiles] = useState<{ key: string; url: string; fileName: string }[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaFolder, setMediaFolder] = useState('blog');

  const reset = () => {
    setEdit(null);
    setF({ title: '', content: '', excerpt: '', metaTitle: '', metaDescription: '', ogImage: '', coverImage: '', category: 'Genel', tags: '', published: false });
    setMode('list');
    setFormTab('write');
  };

  const openEdit = (b: T.Blog) => {
    setEdit(b);
    setF({ title: b.title, content: b.content, excerpt: b.excerpt || '', metaTitle: b.metaTitle || '', metaDescription: b.metaDescription || '', ogImage: b.ogImage || '', coverImage: b.coverImage || '', category: b.category, tags: b.tags, published: b.published });
    setMode('form');
    setFormTab('write');
  };

  // Fetch R2 items for media library
  useEffect(() => {
    if (!mediaPickerOpen) return;
    
    const loadMedia = async () => {
      setMediaLoading(true);
      try {
        const res = await getFileManagerData(mediaFolder);
        setMediaFiles(res.files);
      } catch {
        toastFn('Dosyalar yüklenirken hata oluştu.', false);
      } finally {
        setMediaLoading(false);
      }
    };
    void loadMedia();
  }, [mediaPickerOpen, mediaFolder, toastFn]);

  const selectMedia = (url: string) => {
    if (mediaTarget) {
      setF((prev) => ({ ...prev, [mediaTarget]: url }));
    }
    setMediaPickerOpen(false);
    setMediaTarget(null);
  };

  const openMediaPicker = (target: 'coverImage' | 'ogImage') => {
    setMediaTarget(target);
    setMediaPickerOpen(true);
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
        <form onSubmit={submit} className="bg-neutral-900/40 border border-white/10 rounded-2xl p-5 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center"><h2 className="font-bold text-sm">{edit ? 'Yazıyı Düzenle' : 'Yeni Yazı'}</h2><Btn variant="ghost" onClick={reset}>İptal</Btn></div>
          
          <input name="title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Başlık" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          
          {/* Write / Preview Tab System */}
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormTab('write')}
                  className={`text-xs px-3 py-1 rounded transition-colors ${formTab === 'write' ? 'bg-white/10 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
                >
                  Yaz
                </button>
                <button
                  type="button"
                  onClick={() => setFormTab('preview')}
                  className={`text-xs px-3 py-1 rounded transition-colors ${formTab === 'preview' ? 'bg-white/10 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
                >
                  Önizleme
                </button>
              </div>
              <span className="text-[10px] text-neutral-600">Markdown desteği</span>
            </div>

            {formTab === 'write' ? (
              <textarea 
                name="content" 
                value={f.content} 
                onChange={(e) => setF((s) => ({ ...s, content: e.target.value }))} 
                placeholder="İçerik... (# Başlık, **Kalın**, - Liste)" 
                rows={10} 
                className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 font-sans" 
              />
            ) : (
              <div 
                className="w-full min-h-[220px] max-h-[400px] overflow-y-auto bg-black/10 border border-white/5 rounded-xl p-4 prose prose-invert max-w-none text-left"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(f.content) }}
              />
            )}
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OG Image Row */}
            <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="block text-xs font-bold text-neutral-400">OG Görseli (Paylaşım Resmi)</span>
              {f.ogImage ? (
                <div className="relative h-20 w-full rounded border border-white/10 overflow-hidden mb-2">
                  <Image src={f.ogImage} alt="OG" fill className="object-cover" />
                  <button type="button" onClick={() => setF(s => ({ ...s, ogImage: '' }))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"><X size={10} /></button>
                </div>
              ) : (
                <input name="ogImageFile" type="file" accept="image/*" className="w-full text-xs text-neutral-500 file:bg-neutral-800 file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:mr-2" />
              )}
              <button type="button" onClick={() => openMediaPicker('ogImage')} className="inline-flex items-center gap-1.5 text-[10px] text-neutral-400 hover:text-white border border-white/10 px-2 py-1 rounded bg-black/20">
                <ImageIcon size={10} /> Kütüphaneden Seç
              </button>
            </div>

            {/* Cover Image Row */}
            <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="block text-xs font-bold text-neutral-400">Kapak Görseli (Detay Resmi)</span>
              {f.coverImage ? (
                <div className="relative h-20 w-full rounded border border-white/10 overflow-hidden mb-2">
                  <Image src={f.coverImage} alt="Kapak" fill className="object-cover" />
                  <button type="button" onClick={() => setF(s => ({ ...s, coverImage: '' }))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"><X size={10} /></button>
                </div>
              ) : (
                <input name="coverImageFile" type="file" accept="image/*" className="w-full text-xs text-neutral-500 file:bg-neutral-800 file:text-white file:border-0 file:px-2 file:py-1 file:rounded file:mr-2" />
              )}
              <button type="button" onClick={() => openMediaPicker('coverImage')} className="inline-flex items-center gap-1.5 text-[10px] text-neutral-400 hover:text-white border border-white/10 px-2 py-1 rounded bg-black/20">
                <ImageIcon size={10} /> Kütüphaneden Seç
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer"><input type="checkbox" name="published" value="true" checked={f.published} onChange={(e) => setF((s) => ({ ...s, published: e.target.checked }))} className="accent-white" /> Hemen yayınla</label>
          <button type="submit" disabled={busy} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 disabled:opacity-50">{busy ? 'Kaydediliyor...' : edit ? 'Güncelle' : 'Oluştur'}</button>
        </form>
      )}

      {/* R2 Media Library Picker Modal */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => { setMediaPickerOpen(false); setMediaTarget(null); }}>
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900 p-5 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FolderOpen size={16} className="text-neutral-400" />
                Medya Seçici ({mediaTarget === 'coverImage' ? 'Kapak Resmi' : 'OG Resmi'})
              </h3>
              <button onClick={() => { setMediaPickerOpen(false); setMediaTarget(null); }} className="text-neutral-400 hover:text-white"><X size={18} /></button>
            </div>

            {/* Folder Select tabs */}
            <div className="flex gap-2 border-b border-white/5 pb-2">
              {['blog', 'proje', 'not', 'gunluk'].map((folder) => (
                <button
                  key={folder}
                  onClick={() => setMediaFolder(folder)}
                  className={`text-xs px-3 py-1 rounded-lg capitalize border ${mediaFolder === folder ? 'bg-white/10 border-white/10 text-white font-medium' : 'border-transparent text-neutral-400 hover:text-white'}`}
                >
                  {folder}
                </button>
              ))}
            </div>

            {mediaLoading ? (
              <div className="h-48 flex items-center justify-center text-xs text-neutral-500">Yükleniyor...</div>
            ) : mediaFiles.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-neutral-500">Bu klasörde görsel bulunamadı.</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[45vh] overflow-y-auto pr-1">
                {mediaFiles.map((file) => {
                  const isImg = /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.fileName);
                  return (
                    <button
                      key={file.key}
                      onClick={() => selectMedia(file.url)}
                      className="group relative h-24 rounded-lg border border-white/10 bg-black/20 overflow-hidden transition-all hover:border-white/30"
                    >
                      {isImg ? (
                        <Image src={file.url} alt={file.fileName} fill sizes="100px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500">{file.fileName}</div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold">Seç</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {blogs.length === 0 ? <Empty /> : blogs.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 transition-all">
            {b.coverImage ? <Image src={b.coverImage} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/5" /> : <div className={`w-2 h-2 rounded-full shrink-0 ${b.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />}
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

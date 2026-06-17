'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as T from './types';
import { Empty, PlusIcon, Btn } from './ui';
import { createProjectAction, updateProjectAction, deleteProjectAction } from '@/app/actions/projects';
import { getProjectImages } from '@/lib/utils';

interface Props {
  projects: T.Project[];
  toastFn: (msg: string, ok: boolean) => void;
  initialMode?: 'list' | 'form';
}

type ProjectFormState = {
  title: string;
  description: string;
  link: string;
  category: string;
  displayOrder: number;
  published: boolean;
};

type ImageItem =
  | { type: 'existing'; url: string }
  | { type: 'local'; id: string; file: File; previewUrl: string };

export default function ProjectsModule({ projects: initialProjects, toastFn, initialMode = 'list' }: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [mode, setMode] = useState<'list' | 'form'>(initialMode);
  const [edit, setEdit] = useState<T.Project | null>(null);
  const [f, setF] = useState<ProjectFormState>({ title: '', description: '', link: '', category: 'Genel', displayOrder: 0, published: true });
  const [images, setImages] = useState<ImageItem[]>([]);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEdit(null);
    setF({ title: '', description: '', link: '', category: 'Genel', displayOrder: 0, published: true });
    images.forEach((img) => {
      if (img.type === 'local') URL.revokeObjectURL(img.previewUrl);
    });
    setImages([]);
    setMode('list');
  };

  const openEdit = (p: T.Project) => {
    setEdit(p);
    setF({
      title: p.title,
      description: p.description,
      link: p.link || '',
      category: p.category,
      displayOrder: p.displayOrder,
      published: p.published,
    });
    setImages(getProjectImages(p.image).map(url => ({ type: 'existing', url })));
    setMode('form');
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newItems = files.map(file => ({
      type: 'local' as const,
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newItems]);
    e.target.value = ''; // Reset input
  };

  const removeImage = (index: number) => {
    const item = images[index];
    if (item.type === 'local') {
      URL.revokeObjectURL(item.previewUrl);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setCover = (index: number) => {
    setImages(prev => {
      const next = [...prev];
      const [target] = next.splice(index, 1);
      return [target, ...next];
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      if (edit) fd.append('projectId', String(edit.id));

      const localFiles: File[] = [];
      const order: string[] = [];

      images.forEach(img => {
        if (img.type === 'existing') {
          order.push(img.url);
        } else {
          order.push(`local:${localFiles.length}`);
          localFiles.push(img.file);
        }
      });

      localFiles.forEach(file => {
        fd.append('imageFiles', file);
      });

      fd.append('imagesOrder', JSON.stringify(order));

      const res = await (edit ? updateProjectAction : createProjectAction)(null, fd);
      if (res.error || !res.data) { toastFn(res.error || 'Hata', false); return; }
      const project = res.data;
      if (edit) { setProjects((prev) => prev.map((p) => p.id === edit.id ? project : p)); }
      else { setProjects((prev) => [...prev, project]); }
      toastFn(res.success || 'Başarılı', true);
      reset();
    } catch (error) {
      console.error('Submit project error:', error);
      toastFn('İşlem başarısız oldu.', false);
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: number) => { if (!confirm('Silinsin mi?')) return; setProjects((prev) => prev.filter((p) => p.id !== id)); const fd = new FormData(); fd.append('projectId', String(id)); const res = await deleteProjectAction(fd); if (res.error) { toastFn(res.error, false); setProjects(initialProjects); } };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold tracking-tight">Projeler</h1><p className="text-sm text-neutral-500 mt-0.5">{projects.length} proje</p></div>
        {mode === 'list' && <Btn onClick={() => setMode('form')}><PlusIcon /> Yeni Proje</Btn>}
      </div>

      {mode === 'form' && (
        <form onSubmit={submit} className="bg-neutral-900/40 border border-white/10 rounded-2xl p-5 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center"><h2 className="font-bold text-sm">{edit ? 'Projeyi Düzenle' : 'Yeni Proje'}</h2><Btn variant="ghost" onClick={reset}>İptal</Btn></div>
          <input name="title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Proje Adı" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <textarea name="description" value={f.description} onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))} placeholder="Açıklama" rows={2} className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 resize-none" />
          
          <div className="space-y-2">
            <label className="block text-xs text-neutral-500 font-medium">Proje Görselleri (Sürükleyip Bırakabilir & Kapak Seçebilirsiniz)</label>
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 rounded-2xl bg-neutral-950/50 border border-white/5">
                {images.map((img, idx) => {
                  const isCover = idx === 0;
                  const src = img.type === 'existing' ? img.url : img.previewUrl;
                  return (
                    <div key={img.type === 'existing' ? img.url : img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shrink-0 flex flex-col justify-between">
                      <img src={src} alt="Proje görseli" className="w-full h-full object-cover absolute inset-0 z-0" />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2 transition-opacity z-10">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="bg-rose-950/80 hover:bg-rose-900 border border-rose-500/20 text-[10px] text-rose-200 px-2 py-1 rounded-lg cursor-pointer"
                          >
                            Kaldır
                          </button>
                        </div>
                        
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => setCover(idx)}
                            className="w-full bg-white text-black font-bold text-[9px] py-1.5 rounded-lg text-center hover:bg-neutral-200 cursor-pointer"
                          >
                            Kapak Yap
                          </button>
                        )}
                      </div>

                      {isCover && (
                        <div className="absolute top-2 left-2 bg-emerald-500/90 border border-emerald-400/20 text-[9px] text-white px-2 py-0.5 rounded-md font-mono z-10">
                          Kapak
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all cursor-pointer relative bg-neutral-900/20">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center space-y-1">
                <div className="text-neutral-400 flex justify-center mb-1 scale-150"><PlusIcon /></div>
                <p className="text-xs text-neutral-300 font-medium">Görsel Eklemek İçin Tıklayın veya Sürükleyin</p>
                <p className="text-[10px] text-neutral-500">Birden fazla görsel seçebilirsiniz. İlk görsel kapak fotoğrafı olacaktır.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input name="link" value={f.link} onChange={(e) => setF((s) => ({ ...s, link: e.target.value }))} placeholder="Proje Linki" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
            <input name="category" value={f.category} onChange={(e) => setF((s) => ({ ...s, category: e.target.value }))} placeholder="Kategori" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="displayOrder" type="number" value={f.displayOrder} onChange={(e) => setF((s) => ({ ...s, displayOrder: Number(e.target.value) }))} placeholder="Sıra" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
            <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer"><input type="checkbox" name="published" value="true" checked={f.published} onChange={(e) => setF((s) => ({ ...s, published: e.target.checked }))} className="accent-white" /> Yayında</label>
          </div>
          <button type="submit" disabled={busy} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 disabled:opacity-50">{busy ? 'Kaydediliyor...' : edit ? 'Güncelle' : 'Oluştur'}</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {projects.length === 0 ? <Empty /> : projects.map((p) => {
          const pImages = getProjectImages(p.image);
          const pThumbnail = pImages[0] || '/placeholder.svg';
          return (
            <div key={p.id} className="group flex items-start gap-3 p-3 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 transition-all">
              <Image src={pThumbnail} alt={p.title} width={48} height={48} className="w-12 h-12 rounded-lg object-cover shrink-0 bg-neutral-800" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{p.category} • Sıra {p.displayOrder} {p.published ? '' : '• Gizli'} ({pImages.length} Görsel)</p>
                <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(p)} className="text-[10px] text-neutral-400 hover:text-white px-2 py-1 rounded border border-white/10">Düzenle</button>
                <button onClick={() => del(p.id)} className="text-[10px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded border border-rose-500/20">Sil</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

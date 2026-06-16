'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as T from './types';
import { Empty, PlusIcon, Btn } from './ui';
import { createProjectAction, updateProjectAction, deleteProjectAction } from '@/app/actions/projects';

interface Props {
  projects: T.Project[];
  toastFn: (msg: string, ok: boolean) => void;
  initialMode?: 'list' | 'form';
}

type ProjectFormState = {
  title: string;
  description: string;
  image: string;
  link: string;
  category: string;
  displayOrder: number;
  published: boolean;
};

export default function ProjectsModule({ projects: initialProjects, toastFn, initialMode = 'list' }: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [mode, setMode] = useState<'list' | 'form'>(initialMode);
  const [edit, setEdit] = useState<T.Project | null>(null);
  const [f, setF] = useState<ProjectFormState>({ title: '', description: '', image: '/placeholder.svg', link: '', category: 'Genel', displayOrder: 0, published: true });
  const [busy, setBusy] = useState(false);

  const reset = () => { setEdit(null); setF({ title: '', description: '', image: '/placeholder.svg', link: '', category: 'Genel', displayOrder: 0, published: true }); setMode('list'); };
  const openEdit = (p: T.Project) => { setEdit(p); setF({ title: p.title, description: p.description, image: p.image, link: p.link || '', category: p.category, displayOrder: p.displayOrder, published: p.published }); setMode('form'); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    if (edit) fd.append('projectId', String(edit.id));
    const res = await (edit ? updateProjectAction : createProjectAction)(null, fd);
    setBusy(false);
    if (res.error || !res.data) { toastFn(res.error || 'Hata', false); return; }
    const project = res.data;
    if (edit) { setProjects((prev) => prev.map((p) => p.id === edit.id ? project : p)); }
    else { setProjects((prev) => [...prev, project]); }
    toastFn(res.success || 'Başarılı', true);
    reset();
  };

  const del = async (id: number) => { if (!confirm('Silinsin mi?')) return; setProjects((prev) => prev.filter((p) => p.id !== id)); const fd = new FormData(); fd.append('projectId', String(id)); const res = await deleteProjectAction(fd); if (res.error) { toastFn(res.error, false); setProjects(initialProjects); } };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold tracking-tight">Projeler</h1><p className="text-sm text-neutral-500 mt-0.5">{projects.length} proje</p></div>
        {mode === 'list' && <Btn onClick={() => setMode('form')}><PlusIcon /> Yeni Proje</Btn>}
      </div>

      {mode === 'form' && (
        <form onSubmit={submit} className="bg-neutral-900/40 border border-white/10 rounded-2xl p-5 space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center"><h2 className="font-bold text-sm">{edit ? 'Projeyi Düzenle' : 'Yeni Proje'}</h2><Btn variant="ghost" onClick={reset}>İptal</Btn></div>
          <input name="title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Proje Adı" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <textarea name="description" value={f.description} onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))} placeholder="Açıklama" rows={2} className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input type="hidden" name="image" value={f.image} />
            <div className="space-y-2">
              <label className="block text-xs text-neutral-500">Proje Görseli</label>
              <input name="imageFile" type="file" accept="image/*" className="w-full text-xs text-neutral-400 file:bg-neutral-800 file:text-white file:border-0 file:px-3 file:py-1.5 file:rounded-lg file:mr-3" />
            </div>
            <input name="link" value={f.link} onChange={(e) => setF((s) => ({ ...s, link: e.target.value }))} placeholder="Proje Linki" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="category" value={f.category} onChange={(e) => setF((s) => ({ ...s, category: e.target.value }))} placeholder="Kategori" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
            <input name="displayOrder" type="number" value={f.displayOrder} onChange={(e) => setF((s) => ({ ...s, displayOrder: Number(e.target.value) }))} placeholder="Sıra" className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer"><input type="checkbox" name="published" value="true" checked={f.published} onChange={(e) => setF((s) => ({ ...s, published: e.target.checked }))} className="accent-white" /> Yayında</label>
          <button type="submit" disabled={busy} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 disabled:opacity-50">{busy ? 'Kaydediliyor...' : edit ? 'Güncelle' : 'Oluştur'}</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {projects.length === 0 ? <Empty /> : projects.map((p) => (
          <div key={p.id} className="group flex items-start gap-3 p-3 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 transition-all">
            <Image src={p.image} alt={p.title} width={48} height={48} className="w-12 h-12 rounded-lg object-cover shrink-0 bg-neutral-800" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{p.title}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">{p.category} • Sıra {p.displayOrder} {p.published ? '' : '• Gizli'}</p>
              <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2">{p.description}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(p)} className="text-[10px] text-neutral-400 hover:text-white px-2 py-1 rounded border border-white/10">Düzenle</button>
              <button onClick={() => del(p.id)} className="text-[10px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded border border-rose-500/20">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

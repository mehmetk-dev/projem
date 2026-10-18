'use client';

import { useState, useTransition } from 'react';
import { saveTestimonialAction, deleteTestimonialAction } from '@/app/actions/testimonials';
import { Empty, PageHeader, ui } from './ui';
import type * as T from './types';

interface Props {
  testimonials: T.Testimonial[];
  projects: { id: number; title: string }[];
  toastFn: (msg: string, ok: boolean) => void;
}

const EMPTY_FORM = { name: '', role: '', company: '', quote: '', avatar: '', projectId: '', displayOrder: 0, published: true };

export default function TestimonialsModule({ testimonials, projects, toastFn }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<T.Testimonial | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const projectTitle = (id: number | null) => projects.find((project) => project.id === id)?.title;

  const reset = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    if (editing) fd.append('id', String(editing.id));
    Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)));
    startTransition(async () => {
      const res = await saveTestimonialAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
      if (res.success) reset();
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bu referans silinsin mi?')) return;
    const fd = new FormData();
    fd.append('id', String(id));
    startTransition(async () => {
      const res = await deleteTestimonialAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
    });
  };

  const startEdit = (item: T.Testimonial) => {
    setEditing(item);
    setForm({
      name: item.name,
      role: item.role,
      company: item.company,
      quote: item.quote,
      avatar: item.avatar ?? '',
      projectId: item.projectId ? String(item.projectId) : '',
      displayOrder: item.displayOrder,
      published: item.published,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referanslar"
        description="Müşteri yorumları ana sayfada; projeye bağlananlar o projenin vaka çalışmasında da görünür."
      />

      <form onSubmit={handleSave} className={`${ui.card} space-y-3 p-5`}>
        <h2 className="text-sm font-bold">{editing ? 'Referansı düzenle' : 'Yeni referans'}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ad soyad" className={ui.input} required />
          <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Unvan (ör. Kurucu)" className={ui.input} />
          <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Şirket / marka" className={ui.input} />
        </div>
        <textarea
          value={form.quote}
          onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
          placeholder="Yorum — müşterinin kendi sözleri, izin alarak"
          rows={4}
          maxLength={800}
          className={`${ui.input} resize-y`}
          required
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_90px]">
          <input value={form.avatar} onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))} placeholder="Fotoğraf URL'si (boşsa baş harfler)" className={ui.input} />
          <select value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))} className={ui.input} aria-label="Bağlı proje">
            <option value="">Projeye bağlı değil</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} aria-label="Sıra" placeholder="Sıra" className={ui.input} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="accent-[var(--accent)]" />
            Yayında
          </label>
          <div className="ml-auto flex gap-2">
            {editing && (
              <button type="button" onClick={reset} className={ui.btnSecondary}>
                İptal
              </button>
            )}
            <button type="submit" disabled={isPending} className={ui.btnPrimary}>
              {editing ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      </form>

      {testimonials.length === 0 ? (
        <Empty text="Henüz referans yok. İlk müşteri yorumunu yukarıdan ekleyin." />
      ) : (
        <div className="space-y-2">
          {testimonials.map((item) => (
            <div key={item.id} className={`${ui.card} flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between`}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{item.name}</span>
                  {(item.role || item.company) && (
                    <span className="text-xs text-ink-muted">{[item.role, item.company].filter(Boolean).join(' · ')}</span>
                  )}
                  {!item.published && <span className={ui.badge}>taslak</span>}
                  {projectTitle(item.projectId) && <span className={ui.badge}>{projectTitle(item.projectId)}</span>}
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">“{item.quote}”</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => startEdit(item)} className={ui.btnSecondary}>
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-full border border-rose-500/20 px-3 py-1 text-xs text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

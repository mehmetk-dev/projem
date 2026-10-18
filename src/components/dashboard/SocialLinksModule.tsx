'use client';

import { useState, useTransition } from 'react';
import { saveSocialLinkAction, deleteSocialLinkAction } from '@/app/actions/social';
import { PageHeader, ui } from './ui';

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface Props {
  links: SocialLink[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function SocialLinksModule({ links, toastFn }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [form, setForm] = useState({ platform: '', url: '', icon: 'link', displayOrder: 0, isActive: true });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    if (editing) fd.append('id', String(editing.id));
    fd.append('platform', form.platform);
    fd.append('url', form.url);
    fd.append('icon', form.icon);
    fd.append('displayOrder', String(form.displayOrder));
    fd.append('isActive', String(form.isActive));
    startTransition(async () => {
      const res = await saveSocialLinkAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
      if (res.success) {
        setForm({ platform: '', url: '', icon: 'link', displayOrder: 0, isActive: true });
        setEditing(null);
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    const fd = new FormData();
    fd.append('id', String(id));
    startTransition(async () => {
      const res = await deleteSocialLinkAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
    });
  };

  const startEdit = (link: SocialLink) => {
    setEditing(link);
    setForm({ platform: link.platform, url: link.url, icon: link.icon, displayOrder: link.displayOrder, isActive: link.isActive });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Sosyal Linkler" />

      <form onSubmit={handleSave} className="flex flex-wrap gap-2">
        <input value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))} placeholder="Platform" className={`${ui.input} min-w-[120px] flex-1 !w-auto`} required />
        <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="URL" className={`${ui.input} min-w-[200px] flex-[2] !w-auto`} required />
        <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="İkon" className={`${ui.input} !w-24`} />
        <input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} placeholder="Sıra" aria-label="Sıra" className={`${ui.input} !w-20`} />
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-[var(--accent)] dark:accent-[var(--accent)]" />
          Aktif
        </label>
        <button type="submit" disabled={isPending} className={ui.btnPrimary}>
          {editing ? 'Güncelle' : 'Ekle'}
        </button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ platform: '', url: '', icon: 'link', displayOrder: 0, isActive: true }); }} className="text-sm text-ink-muted hover:text-ink">İptal</button>}
      </form>

      <div className="space-y-2">
        {links.length === 0 && <p className="text-sm text-ink-muted">Henüz link yok.</p>}
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-ink">{link.platform}</span>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-muted hover:text-ink truncate max-w-[200px]">{link.url}</a>
              {!link.isActive && <span className="text-[9px] text-ink-muted border border-line px-1.5 rounded">pasif</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(link)} className="text-xs text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 px-2 py-1 rounded-full border border-sky-500/20 hover:bg-sky-500/10 transition-colors">Düzenle</button>
              <button onClick={() => handleDelete(link.id)} className="text-xs text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 px-2 py-1 rounded-full border border-rose-500/20 hover:bg-rose-500/10 transition-colors">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

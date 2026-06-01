'use client';

import { useState, useTransition } from 'react';
import { saveSocialLinkAction, deleteSocialLinkAction } from '@/app/actions/social';
import { Link2 } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 size={20} className="text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-2xl font-bold tracking-tight">Sosyal Linkler</h2>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-wrap gap-2">
        <input value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))} placeholder="Platform" className="flex-1 min-w-[120px] bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500" required />
        <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="URL" className="flex-[2] min-w-[200px] bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500" required />
        <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="İkon" className="w-24 bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500" />
        <input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} placeholder="Sıra" className="w-20 bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white" />
        <label className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-neutral-900 dark:accent-white" />
          Aktif
        </label>
        <button type="submit" disabled={isPending} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-50">
          {editing ? 'Güncelle' : 'Ekle'}
        </button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ platform: '', url: '', icon: 'link', displayOrder: 0, isActive: true }); }} className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">İptal</button>}
      </form>

      <div className="space-y-2">
        {links.length === 0 && <p className="text-sm text-neutral-500 dark:text-neutral-400">Henüz link yok.</p>}
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-900 dark:text-white">{link.platform}</span>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white truncate max-w-[200px]">{link.url}</a>
              {!link.isActive && <span className="text-[9px] text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-white/10 px-1.5 rounded">pasif</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(link)} className="text-xs text-sky-400 hover:text-sky-300 px-2 py-1 rounded border border-sky-500/20 hover:bg-sky-500/10 transition-colors">Düzenle</button>
              <button onClick={() => handleDelete(link.id)} className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded border border-rose-500/20 hover:bg-rose-500/10 transition-colors">Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

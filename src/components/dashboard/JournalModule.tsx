'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  createJournalEntryAction,
  deleteJournalEntryAction,
  updateJournalEntryAction,
} from '@/app/actions/journal';
import * as T from './types';

interface Props {
  entries: T.JournalEntry[];
  toastFn: (msg: string, ok: boolean) => void;
}

const moodOptions: { value: T.JournalMood; label: string; className: string }[] = [
  { value: 'calm', label: 'Sakin', className: 'bg-sky-950/50 text-sky-100 border-sky-400/20' },
  { value: 'good', label: 'İyi', className: 'bg-emerald-950/50 text-emerald-100 border-emerald-400/20' },
  { value: 'bright', label: 'Parlak', className: 'bg-yellow-950/50 text-yellow-100 border-yellow-400/20' },
  { value: 'hard', label: 'Zor', className: 'bg-rose-950/50 text-rose-100 border-rose-400/20' },
  { value: 'tired', label: 'Yorgun', className: 'bg-neutral-900 text-neutral-100 border-white/10' },
];

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function maxEntryDateValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(new Date(`${value}T12:00:00`));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T12:00:00`));
}

function getMood(value: T.JournalMood) {
  return moodOptions.find((mood) => mood.value === value) || moodOptions[0];
}

export default function JournalModule({ entries: initialEntries, toastFn }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [editing, setEditing] = useState<T.JournalEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const maxEntryDate = maxEntryDateValue();

  const [createForm, setCreateForm] = useState({
    entryDate: todayValue(),
    title: '',
    content: '',
    mood: 'calm' as T.JournalMood,
  });
  const [editForm, setEditForm] = useState({
    entryDate: todayValue(),
    title: '',
    content: '',
    mood: 'calm' as T.JournalMood,
    image: '',
  });

  const createFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  const latest = entries[0];
  const recentEntries = entries.slice(0, 5);
  const journalStats = useMemo(() => {
    const month = todayValue().slice(0, 7);
    return {
      total: entries.length,
      thisMonth: entries.filter((entry) => entry.entryDate.startsWith(month)).length,
      withPhoto: entries.filter((entry) => entry.image).length,
    };
  }, [entries]);

  const resetCreate = () => {
    if (createPreview) { URL.revokeObjectURL(createPreview); setCreatePreview(null); }
    if (createFileRef.current) createFileRef.current.value = '';
    setCreateForm({ entryDate: todayValue(), title: '', content: '', mood: 'calm' });
  };

  const resetEdit = () => {
    if (editPreview) { URL.revokeObjectURL(editPreview); setEditPreview(null); }
    if (editFileRef.current) editFileRef.current.value = '';
    setEditing(null);
  };

  const startEdit = (entry: T.JournalEntry) => {
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditPreview(null);
    if (editFileRef.current) editFileRef.current.value = '';
    setEditing(entry);
    setEditForm({
      entryDate: entry.entryDate,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      image: entry.image || '',
    });
  };

  const handleCreateFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (createPreview) URL.revokeObjectURL(createPreview);
    setCreatePreview(URL.createObjectURL(file));
  };

  const handleEditFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditPreview(URL.createObjectURL(file));
  };

  const submitCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);

    const formEl = event.currentTarget;
    const formData = new FormData(formEl);

    const result = await createJournalEntryAction(null, formData);
    setBusy(false);

    if (result.error || !result.data) {
      toastFn(result.error || 'Bir hata oluştu.', false);
      return;
    }

    setEntries((current) => [result.data as T.JournalEntry, ...current].sort((a, b) => b.entryDate.localeCompare(a.entryDate)));
    toastFn(result.success || 'Kaydedildi.', true);
    resetCreate();
    formEl.reset();
  };

  const submitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);

    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    formData.append('entryId', String(editing.id));

    const result = await updateJournalEntryAction(null, formData);
    setBusy(false);

    if (result.error || !result.data) {
      toastFn(result.error || 'Bir hata oluştu.', false);
      return;
    }

    const nextEntry = result.data as T.JournalEntry;
    setEntries((current) => current.map((entry) => (entry.id === nextEntry.id ? nextEntry : entry)).sort((a, b) => b.entryDate.localeCompare(a.entryDate)));
    toastFn(result.success || 'Güncellendi.', true);
    resetEdit();
    formEl.reset();
  };

  const remove = async (entry: T.JournalEntry) => {
    if (!confirm(`${formatShortDate(entry.entryDate)} tarihli günlük silinsin mi?`)) return;

    setEntries((current) => current.filter((item) => item.id !== entry.id));
    const formData = new FormData();
    formData.append('entryId', String(entry.id));
    const result = await deleteJournalEntryAction(formData);

    if (result.error) {
      setEntries(initialEntries);
      toastFn(result.error, false);
      return;
    }

    toastFn(result.success || 'Silindi.', true);
    if (editing?.id === entry.id) resetEdit();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Günlük</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Tarih bazlı günlük yazıları ve fotoğraflar</p>
        </div>
      </div>

      <form onSubmit={submitCreate} className="rounded-2xl border border-white/10 bg-neutral-900/40 p-5 space-y-4">
        <h2 className="text-sm font-bold">Yeni Gün Yaz</h2>

        <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
          <label className="space-y-1.5">
            <span className="text-xs text-neutral-400">Tarih</span>
            <input
              type="date"
              name="entryDate"
              value={createForm.entryDate}
              max={maxEntryDate}
              onChange={(event) => setCreateForm((c) => ({ ...c, entryDate: event.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs text-neutral-400">Başlık</span>
            <input
              name="title"
              value={createForm.title}
              onChange={(event) => setCreateForm((c) => ({ ...c, title: event.target.value }))}
              placeholder="Bugünün adı ne olsun?"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
          <label className="space-y-1.5">
            <span className="text-xs text-neutral-400">Yazı</span>
            <textarea
              name="content"
              value={createForm.content}
              onChange={(event) => setCreateForm((c) => ({ ...c, content: event.target.value }))}
              placeholder="Bugün ne oldu, ne düşündün, ne hissettin?"
              rows={8}
              className="min-h-52 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
              required
            />
          </label>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs text-neutral-400">Ruh hali</span>
              <div className="grid grid-cols-2 gap-1.5">
                {moodOptions.map((mood) => (
                  <label key={mood.value} className={`cursor-pointer rounded-lg border px-2 py-1.5 text-[11px] ${createForm.mood === mood.value ? mood.className : 'border-white/10 bg-black/20 text-neutral-400'}`}>
                    <input type="radio" name="mood" value={mood.value} checked={createForm.mood === mood.value} onChange={() => setCreateForm((c) => ({ ...c, mood: mood.value }))} className="sr-only" />
                    {mood.label}
                  </label>
                ))}
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs text-neutral-400">Fotoğraf</span>
              <span className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-black/20 p-3 text-center text-xs text-neutral-500 hover:border-white/20">
                <Camera size={18} />
                {createPreview ? 'Değiştir' : 'Fotoğraf seç'}
                <input ref={createFileRef} name="imageFile" type="file" accept="image/*" onChange={handleCreateFile} className="sr-only" />
              </span>
            </label>

            {createPreview ? (
              <span className="relative block h-24 w-full overflow-hidden rounded-xl border border-white/10">
                <Image src={createPreview} alt="Önizleme" fill sizes="190px" className="object-cover" />
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-neutral-500">Bugün veya yarın için yazılır; her tarihe tek kayıt tutulur.</p>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:bg-neutral-200 disabled:opacity-50">
            <Plus size={16} />
            {busy ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-16 overflow-y-auto" onClick={resetEdit}>
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-900 p-5 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Günü Düzenle</h2>
              <button type="button" onClick={resetEdit} className="text-neutral-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={submitEdit} className="space-y-4">
              <input type="hidden" name="image" value={editForm.image} />

              <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
                <label className="space-y-1.5">
                  <span className="text-xs text-neutral-400">Tarih</span>
                  <input type="date" name="entryDate" value={editForm.entryDate} max={maxEntryDate} onChange={(event) => setEditForm((c) => ({ ...c, entryDate: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30" required />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs text-neutral-400">Başlık</span>
                  <input name="title" value={editForm.title} onChange={(event) => setEditForm((c) => ({ ...c, title: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30" required />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
                <label className="space-y-1.5">
                  <span className="text-xs text-neutral-400">Yazı</span>
                  <textarea name="content" value={editForm.content} onChange={(event) => setEditForm((c) => ({ ...c, content: event.target.value }))} rows={10} className="min-h-52 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30" required />
                </label>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-xs text-neutral-400">Ruh hali</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {moodOptions.map((mood) => (
                        <label key={mood.value} className={`cursor-pointer rounded-lg border px-2 py-1.5 text-[11px] ${editForm.mood === mood.value ? mood.className : 'border-white/10 bg-black/20 text-neutral-400'}`}>
                          <input type="radio" name="mood" value={mood.value} checked={editForm.mood === mood.value} onChange={() => setEditForm((c) => ({ ...c, mood: mood.value }))} className="sr-only" />
                          {mood.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-xs text-neutral-400">Fotoğraf</span>
                    <span className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-black/20 p-3 text-center text-xs text-neutral-500 hover:border-white/20">
                      <Camera size={18} />
                      {editPreview || editForm.image ? 'Değiştir' : 'Fotoğraf seç'}
                      <input ref={editFileRef} name="imageFile" type="file" accept="image/*" onChange={handleEditFile} className="sr-only" />
                    </span>
                  </label>

                  {(editPreview || editForm.image) ? (
                    <span className="relative block h-24 w-full overflow-hidden rounded-xl border border-white/10">
                      <Image src={editPreview || editForm.image} alt="" fill sizes="190px" className="object-cover" />
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetEdit} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:text-white">İptal</button>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:bg-neutral-200 disabled:opacity-50">
                  <Pencil size={16} />
                  {busy ? 'Kaydediliyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Toplam" value={journalStats.total} />
        <Stat label="Bu ay" value={journalStats.thisMonth} />
        <Stat label="Foto" value={journalStats.withPhoto} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Gün Gün</h2>
            <span className="text-xs text-neutral-500">{entries.length} sayfa</span>
          </div>

          {entries.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {entries.map((entry) => {
                const mood = getMood(entry.mood);
                return (
                  <article key={entry.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/30 transition hover:-translate-y-1 hover:border-white/20">
                    {entry.image ? (
                      <div className="relative h-44 w-full">
                        <Image src={entry.image} alt="" fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                      </div>
                    ) : <div className="h-6 bg-white/[0.02]" />}
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-xs text-neutral-500">{formatLongDate(entry.entryDate)}</span>
                        <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] ${mood.className}`}>{mood.label}</span>
                      </div>
                      <h3 className="text-lg font-bold leading-tight">{entry.title}</h3>
                      <p className="mt-2 line-clamp-4 text-sm leading-6 text-neutral-400">{entry.content}</p>
                      <div className="mt-4 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                        <button onClick={() => startEdit(entry)} className="rounded-lg border border-white/10 p-1.5 text-neutral-400 hover:text-white" title="Düzenle">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => remove(entry)} className="rounded-lg border border-rose-500/20 p-1.5 text-rose-400 hover:text-rose-300" title="Sil">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
              İlk günlük sayfanı yukarıdan yaz.
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 mb-3">Son Yazdıkların</p>
            {recentEntries.length ? (
              <div className="space-y-2">
                {recentEntries.map((entry) => {
                  const mood = getMood(entry.mood);
                  return (
                    <button key={entry.id} onClick={() => startEdit(entry)} className="grid w-full grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-lg border border-white/5 bg-black/20 p-3 text-left transition hover:border-white/10">
                      <span className="text-sm font-bold text-white">{formatShortDate(entry.entryDate)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">{entry.title}</span>
                        <span className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[10px] ${mood.className}`}>{mood.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Henüz günlük kaydı yok.</p>
            )}
          </div>

          {latest ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              {latest.image ? (
                <div className="relative h-48 w-full">
                  <Image src={latest.image} alt="" fill sizes="280px" className="object-cover" />
                </div>
              ) : null}
              <div className="p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-500">En son sayfa</p>
                <h3 className="text-xl font-bold">{latest.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-neutral-400">{latest.content}</p>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-neutral-500">{label}</div>
    </div>
  );
}

'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  createJournalEntryAction,
  deleteJournalEntryAction,
  updateJournalEntryAction,
} from '@/app/actions/journal';
import { normalizeMediaUrl } from '@/lib/media-url';
import * as T from './types';
import { PageHeader, ui } from './ui';

interface Props {
  entries: T.JournalEntry[];
  toastFn: (msg: string, ok: boolean) => void;
}

const moodOptions: { value: T.JournalMood; label: string; className: string }[] = [
  { value: 'calm', label: 'Sakin', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-100 border-sky-500/25' },
  { value: 'good', label: 'İyi', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-100 border-emerald-500/25' },
  { value: 'bright', label: 'Parlak', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-100 border-yellow-500/25' },
  { value: 'hard', label: 'Zor', className: 'bg-rose-500/10 text-rose-700 dark:text-rose-100 border-rose-500/25' },
  { value: 'tired', label: 'Yorgun', className: 'bg-surface-2 text-ink-soft border-line' },
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

function normalizeJournalEntry(entry: T.JournalEntry): T.JournalEntry {
  return { ...entry, image: normalizeMediaUrl(entry.image) || null };
}

export default function JournalModule({ entries: initialEntries, toastFn }: Props) {
  const [entries, setEntries] = useState(() => initialEntries.map(normalizeJournalEntry));
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
      image: normalizeMediaUrl(entry.image),
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

    setEntries((current) => [normalizeJournalEntry(result.data as T.JournalEntry), ...current].sort((a, b) => b.entryDate.localeCompare(a.entryDate)));
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

    const nextEntry = normalizeJournalEntry(result.data as T.JournalEntry);
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
      <PageHeader title="Günlük" description="Tarih bazlı günlük yazıları ve fotoğraflar" />

      <form onSubmit={submitCreate} className={`${ui.card} p-5 space-y-4`}>
        <h2 className={ui.sectionTitle}>Yeni Gün Yaz</h2>

        <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
          <label className="space-y-1.5">
            <span className="text-xs text-ink-muted">Tarih</span>
            <input
              type="date"
              name="entryDate"
              value={createForm.entryDate}
              max={maxEntryDate}
              onChange={(event) => setCreateForm((c) => ({ ...c, entryDate: event.target.value }))}
              className={ui.input}
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs text-ink-muted">Başlık</span>
            <input
              name="title"
              value={createForm.title}
              onChange={(event) => setCreateForm((c) => ({ ...c, title: event.target.value }))}
              placeholder="Bugünün adı ne olsun?"
              className={ui.input}
              required
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
          <label className="space-y-1.5">
            <span className="text-xs text-ink-muted">Yazı</span>
            <textarea
              name="content"
              value={createForm.content}
              onChange={(event) => setCreateForm((c) => ({ ...c, content: event.target.value }))}
              placeholder="Bugün ne oldu, ne düşündün, ne hissettin?"
              rows={8}
              className={`${ui.input} min-h-52 resize-none`}
              required
            />
          </label>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs text-ink-muted">Ruh hali</span>
              <div className="grid grid-cols-2 gap-1.5">
                {moodOptions.map((mood) => (
                  <label key={mood.value} className={`cursor-pointer rounded-full border px-2.5 py-1.5 text-center text-[11px] ${createForm.mood === mood.value ? mood.className : 'border-line bg-paper text-ink-muted'}`}>
                    <input type="radio" name="mood" value={mood.value} checked={createForm.mood === mood.value} onChange={() => setCreateForm((c) => ({ ...c, mood: mood.value }))} className="sr-only" />
                    {mood.label}
                  </label>
                ))}
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs text-ink-muted">Fotoğraf</span>
              <span className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper p-3 text-center text-xs text-ink-muted hover:border-ink/30">
                <Camera size={18} />
                {createPreview ? 'Değiştir' : 'Fotoğraf seç'}
                <input ref={createFileRef} name="imageFile" type="file" accept="image/*" onChange={handleCreateFile} className="sr-only" />
              </span>
            </label>

            {createPreview ? (
              <span className="relative block h-24 w-full overflow-hidden rounded-xl border border-line">
                <Image src={createPreview} alt="Önizleme" fill sizes="190px" className="object-cover" />
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-ink-muted">Bugün veya yarın için yazılır; her tarihe tek kayıt tutulur.</p>
          <button type="submit" disabled={busy} className={ui.btnPrimary}>
            <Plus size={16} />
            {busy ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 backdrop-blur-sm p-4 pt-16 overflow-y-auto" onClick={resetEdit}>
          <div className="w-full max-w-xl rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className={ui.sectionTitle}>Günü Düzenle</h2>
              <button type="button" onClick={resetEdit} aria-label="Kapat" className="text-ink-muted hover:text-ink"><X size={18} /></button>
            </div>

            <form onSubmit={submitEdit} className="space-y-4">
              <input type="hidden" name="image" value={editForm.image} />

              <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
                <label className="space-y-1.5">
                  <span className="text-xs text-ink-muted">Tarih</span>
                  <input type="date" name="entryDate" value={editForm.entryDate} max={maxEntryDate} onChange={(event) => setEditForm((c) => ({ ...c, entryDate: event.target.value }))} className={ui.input} required />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs text-ink-muted">Başlık</span>
                  <input name="title" value={editForm.title} onChange={(event) => setEditForm((c) => ({ ...c, title: event.target.value }))} className={ui.input} required />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
                <label className="space-y-1.5">
                  <span className="text-xs text-ink-muted">Yazı</span>
                  <textarea name="content" value={editForm.content} onChange={(event) => setEditForm((c) => ({ ...c, content: event.target.value }))} rows={10} className={`${ui.input} min-h-52 resize-none`} required />
                </label>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-xs text-ink-muted">Ruh hali</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {moodOptions.map((mood) => (
                        <label key={mood.value} className={`cursor-pointer rounded-full border px-2.5 py-1.5 text-center text-[11px] ${editForm.mood === mood.value ? mood.className : 'border-line bg-paper text-ink-muted'}`}>
                          <input type="radio" name="mood" value={mood.value} checked={editForm.mood === mood.value} onChange={() => setEditForm((c) => ({ ...c, mood: mood.value }))} className="sr-only" />
                          {mood.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-xs text-ink-muted">Fotoğraf</span>
                    <span className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper p-3 text-center text-xs text-ink-muted hover:border-ink/30">
                      <Camera size={18} />
                      {editPreview || editForm.image ? 'Değiştir' : 'Fotoğraf seç'}
                      <input ref={editFileRef} name="imageFile" type="file" accept="image/*" onChange={handleEditFile} className="sr-only" />
                    </span>
                  </label>

                  {(editPreview || editForm.image) ? (
                    <span className="relative block h-24 w-full overflow-hidden rounded-xl border border-line">
                      <Image src={editPreview || editForm.image} alt="" fill sizes="190px" className="object-cover" />
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetEdit} className={ui.btnSecondary}>İptal</button>
                <button type="submit" disabled={busy} className={ui.btnPrimary}>
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
            <h2 className={ui.sectionTitle}>Gün Gün</h2>
            <span className="text-xs text-ink-muted">{entries.length} sayfa</span>
          </div>

          {entries.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {entries.map((entry) => {
                const mood = getMood(entry.mood);
                return (
                  <article key={entry.id} className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-1 hover:border-ink/15">
                    {entry.image ? (
                      <div className="relative h-44 w-full">
                        <Image src={entry.image} alt="" fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                      </div>
                    ) : <div className="h-6 bg-surface-2" />}
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-xs text-ink-muted">{formatLongDate(entry.entryDate)}</span>
                        <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] ${mood.className}`}>{mood.label}</span>
                      </div>
                      <h3 className="text-lg font-bold leading-tight text-ink">{entry.title}</h3>
                      <p className="mt-2 line-clamp-4 text-sm leading-6 text-ink-soft">{entry.content}</p>
                      <div className="mt-4 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                        <button onClick={() => startEdit(entry)} className="rounded-full border border-line p-1.5 text-ink-muted hover:text-ink" title="Düzenle" aria-label="Düzenle">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => remove(entry)} className="rounded-full border border-rose-500/20 p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-500" title="Sil" aria-label="Sil">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">
              İlk günlük sayfanı yukarıdan yaz.
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className={`${ui.card} p-4`}>
            <p className={`${ui.sectionTitle} mb-3`}>Son Yazdıkların</p>
            {recentEntries.length ? (
              <div className="space-y-2">
                {recentEntries.map((entry) => {
                  const mood = getMood(entry.mood);
                  return (
                    <button key={entry.id} onClick={() => startEdit(entry)} className="grid w-full grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-xl border border-line bg-paper p-3 text-left transition hover:border-ink/15">
                      <span className="text-sm font-bold text-ink">{formatShortDate(entry.entryDate)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{entry.title}</span>
                        <span className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[10px] ${mood.className}`}>{mood.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Henüz günlük kaydı yok.</p>
            )}
          </div>

          {latest ? (
            <div className={`${ui.card} overflow-hidden`}>
              {latest.image ? (
                <div className="relative h-48 w-full">
                  <Image src={latest.image} alt="" fill sizes="280px" className="object-cover" />
                </div>
              ) : null}
              <div className="p-4">
                <p className={`${ui.sectionTitle} mb-2`}>En son sayfa</p>
                <h3 className="text-xl font-bold text-ink">{latest.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-ink-soft">{latest.content}</p>
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
    <div className={`${ui.card} p-4 text-center`}>
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">{label}</div>
    </div>
  );
}

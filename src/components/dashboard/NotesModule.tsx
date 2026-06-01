'use client';

import { useState } from 'react';
import * as T from './types';
import { Empty, PlusIcon, Btn, ActionBtn, Input } from './ui';
import { createNoteAction, updateNoteAction, deleteNoteAction, togglePinNoteAction } from '@/app/actions/notes';

interface Props {
  notes: T.Note[];
  fmt: (d: string | null) => string;
  toastFn: (msg: string, ok: boolean) => void;
}

export default function NotesModule({ notes: initialNotes, fmt, toastFn }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [edit, setEdit] = useState<T.Note | null>(null);
  const [f, setF] = useState({ title: '', content: '', image: '', color: 'neutral', pinned: false });
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEdit(null);
    setF({ title: '', content: '', image: '', color: 'neutral', pinned: false });
    setMode('list');
  };

  const openEdit = (n: T.Note) => {
    setEdit(n);
    setF({ title: n.title, content: n.content, image: n.image || '', color: n.color, pinned: n.pinned });
    setMode('form');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const fd = new FormData(e.currentTarget as HTMLFormElement);
    if (edit) fd.append('noteId', String(edit.id));

    const res = await (edit ? updateNoteAction : createNoteAction)(null, fd);
    setBusy(false);

    if (res.error || !res.data) {
      toastFn(res.error || 'Bir hata oluştu', false);
      return;
    }

    const note = res.data;
    if (edit) {
      setNotes((prev) => prev.map((n) => (n.id === edit.id ? note : n)));
    } else {
      setNotes((prev) => [...prev, note]);
    }

    toastFn(res.success || 'Başarılı', true);
    reset();
  };

  const del = async (id: number) => {
    if (!confirm('Silinsin mi?')) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const fd = new FormData();
    fd.append('noteId', String(id));
    const res = await deleteNoteAction(fd);
    if (res.error) {
      toastFn(res.error, false);
      setNotes(initialNotes);
    }
  };

  const pin = async (id: number) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
    const fd = new FormData();
    fd.append('noteId', String(id));
    const res = await togglePinNoteAction(fd);
    if (res.error) {
      toastFn(res.error, false);
      setNotes(initialNotes);
    }
  };

  const pinned = notes.filter((n) => n.pinned);
  const other = notes.filter((n) => !n.pinned);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notlar</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{notes.length} not</p>
        </div>
        {mode === 'list' && (
          <Btn onClick={() => setMode('form')}>
            <PlusIcon /> Yeni Not
          </Btn>
        )}
      </div>

      {mode === 'form' && (
        <form onSubmit={submit} className="bg-neutral-900/40 border border-white/10 rounded-2xl p-5 space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-sm">{edit ? 'Notu Düzenle' : 'Yeni Not'}</h2>
            <Btn variant="ghost" onClick={reset}>İptal</Btn>
          </div>
          <Input name="title" value={f.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Başlık" required />
          <input type="hidden" name="image" value={f.image} />
          <div className="space-y-2">
            <label className="block text-xs text-neutral-500">Görsel (isteğe bağlı)</label>
            <input name="imageFile" type="file" accept="image/*" className="w-full text-xs text-neutral-400 file:bg-neutral-800 file:text-white file:border-0 file:px-3 file:py-1.5 file:rounded-lg file:mr-3" />
          </div>
          {f.image && <img src={f.image} alt="preview" className="w-full h-32 object-cover rounded-lg border border-white/10" />}
          <Input name="content" value={f.content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setF((s) => ({ ...s, content: e.target.value }))} placeholder="Notunuzu yazın..." rows={4} />
          <div className="flex items-center gap-2 pt-1">
            {(['neutral', 'blue', 'green', 'amber', 'rose', 'violet'] as const).map((c) => (
              <button key={c} type="button" onClick={() => setF((s) => ({ ...s, color: c }))} className={`w-5 h-5 rounded-full border-2 transition-all ${f.color === c ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'} ${c === 'neutral' ? 'bg-neutral-700' : c === 'blue' ? 'bg-sky-600' : c === 'green' ? 'bg-emerald-600' : c === 'amber' ? 'bg-amber-600' : c === 'rose' ? 'bg-rose-600' : 'bg-violet-600'}`} />
            ))}
            <input type="hidden" name="color" value={f.color} />
            <label className="flex items-center gap-2 ml-auto text-xs text-neutral-400 cursor-pointer">
              <input type="checkbox" name="pinned" value="true" checked={f.pinned} onChange={(e) => setF((s) => ({ ...s, pinned: e.target.checked }))} className="accent-white" /> Sabitle
            </label>
          </div>
          <button type="submit" disabled={busy} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 disabled:opacity-50">
            {busy ? 'Kaydediliyor...' : edit ? 'Güncelle' : 'Oluştur'}
          </button>
        </form>
      )}

      <NoteGrid notes={pinned} title="Sabitlenmiş" onEdit={openEdit} onDel={del} onPin={pin} fmt={fmt} />
      <NoteGrid notes={other} title={pinned.length > 0 ? 'Diğer Notlar' : undefined} onEdit={openEdit} onDel={del} onPin={pin} fmt={fmt} />
    </div>
  );
}

function NoteGrid({ notes, title, onEdit, onDel, onPin, fmt }: { notes: T.Note[]; title?: string; onEdit: (n: T.Note) => void; onDel: (id: number) => void; onPin: (id: number) => void; fmt: (d: string | null) => string; }) {
  if (!notes.length && !title) return null;
  return (
    <div>
      {title && <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-3">{title}</h2>}
      {!notes.length ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.map((note) => {
            const c = T.COLOR_MAP[note.color] || T.COLOR_MAP.neutral;
            return (
              <div key={note.id} className={`group relative rounded-xl p-4 border transition-all hover:border-white/20 hover:-translate-y-0.5 ${c.bg} ${c.border}`}>
                {note.image && <img src={note.image} alt="" className="w-full h-28 object-cover rounded-lg mb-3 border border-white/5" />}
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold text-sm line-clamp-2 ${c.text}`}>{note.title}</h3>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionBtn onClick={() => onPin(note.id)} title={note.pinned ? 'Kaldır' : 'Sabitle'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" /></svg>
                    </ActionBtn>
                    <ActionBtn onClick={() => onEdit(note)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </ActionBtn>
                    <ActionBtn onClick={() => onDel(note.id)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </ActionBtn>
                  </div>
                </div>
                <p className={`text-sm line-clamp-3 mb-3 ${c.text} opacity-80`}>{note.content || <span className="italic opacity-40">İçerik yok</span>}</p>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${c.badge} ${c.text} opacity-60`}>{fmt(note.updatedAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

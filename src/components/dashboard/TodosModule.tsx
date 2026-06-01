'use client';

import { useState } from 'react';
import * as T from './types';
import { PlusIcon, Btn } from './ui';
import { createTodoAction, toggleTodoAction, deleteTodoAction } from '@/app/actions/todos';

interface Props {
  todos: T.Todo[];
  fmt: (d: string | null) => string;
  toastFn: (msg: string, ok: boolean) => void;
}

export default function TodosModule({ todos: initialTodos, fmt, toastFn }: Props) {
  const [todos, setTodos] = useState(initialTodos);
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const res = await createTodoAction(null, fd);
    setBusy(false);
    if (res.error || !res.data) { toastFn(res.error || 'Hata', false); return; }
    const todo = res.data;
    setTodos((prev) => [...prev, todo]);
    toastFn(res.success || 'Başarılı', true);
    setCreating(false); setF({ title: '', description: '', priority: 'medium', dueDate: '' });
  };

  const toggle = async (id: number) => { setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)); const fd = new FormData(); fd.append('todoId', String(id)); const res = await toggleTodoAction(fd); if (res.error) { toastFn(res.error, false); setTodos(initialTodos); } };
  const del = async (id: number) => { if (!confirm('Silinsin mi?')) return; setTodos((prev) => prev.filter((t) => t.id !== id)); const fd = new FormData(); fd.append('todoId', String(id)); const res = await deleteTodoAction(fd); if (res.error) { toastFn(res.error, false); setTodos(initialTodos); } };

  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold tracking-tight">Görevler</h1><p className="text-sm text-neutral-500 mt-0.5">{pending.length} bekleyen</p></div>
        {!creating && <Btn onClick={() => setCreating(true)}><PlusIcon /> Yeni Görev</Btn>}
      </div>

      {creating && (
        <form onSubmit={submit} className="bg-neutral-900/40 border border-white/10 rounded-2xl p-5 space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center"><h2 className="font-bold text-sm">Yeni Görev</h2><Btn variant="ghost" onClick={() => setCreating(false)}>İptal</Btn></div>
          <input name="title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Başlık" required className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30" />
          <textarea name="description" value={f.description} onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))} placeholder="Açıklama" rows={2} className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select name="priority" value={f.priority} onChange={(e) => setF((s) => ({ ...s, priority: e.target.value }))} className="bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none cursor-pointer">
              <option value="low" className="bg-neutral-900">Düşük</option>
              <option value="medium" className="bg-neutral-900">Orta</option>
              <option value="high" className="bg-neutral-900">Yüksek</option>
            </select>
            <input name="dueDate" type="date" value={f.dueDate} onChange={(e) => setF((s) => ({ ...s, dueDate: e.target.value }))} className="bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none" />
          </div>
          <button type="submit" disabled={busy} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 disabled:opacity-50">{busy ? 'Kaydediliyor...' : 'Ekle'}</button>
        </form>
      )}

      <div>
        <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Bekleyen ({pending.length})</h2>
        {pending.length === 0 ? <p className="text-sm text-neutral-600">Tebrikler, tamamlandı!</p> : (
          <div className="space-y-2">
            {pending.map((t) => (
              <div key={t.id} className="group flex items-center gap-3 p-3 rounded-xl bg-neutral-900/30 border border-white/5 hover:border-white/10 transition-all">
                <button onClick={() => toggle(t.id)} className="w-4 h-4 rounded border border-white/20 hover:border-white/40 shrink-0 flex items-center justify-center transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-[11px] text-neutral-500 line-clamp-1">{t.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.dueDate && <span className="text-[10px] text-neutral-500">{fmt(t.dueDate)}</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${t.priority === 'high' ? 'bg-rose-950/40 text-rose-300' : t.priority === 'medium' ? 'bg-amber-950/40 text-amber-300' : 'bg-emerald-950/40 text-emerald-300'}`}>{t.priority}</span>
                  <button onClick={() => del(t.id)} className="p-1 text-neutral-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Tamamlanan ({completed.length})</h2>
          <div className="space-y-2 opacity-50">
            {completed.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/20 border border-white/5">
                <div className="w-4 h-4 rounded border border-emerald-500/40 bg-emerald-500/10 shrink-0 flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>
                <div className="flex-1 min-w-0"><p className="text-sm line-through text-neutral-500">{t.title}</p></div>
                <button onClick={() => del(t.id)} className="p-1 text-neutral-600 hover:text-rose-400 transition-colors"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import * as T from './types';
import { PlusIcon, Btn, PageHeader, ui } from './ui';
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
      <PageHeader title="Görevler" description={`${pending.length} bekleyen`}>
          {!creating && <Btn onClick={() => setCreating(true)}><PlusIcon /> Yeni Görev</Btn>}
        </PageHeader>

      {creating && (
        <form onSubmit={submit} className={`${ui.card} p-5 space-y-3 animate-in fade-in`}>
          <div className="flex justify-between items-center"><h2 className="text-sm font-semibold text-ink">Yeni Görev</h2><Btn variant="ghost" onClick={() => setCreating(false)}>İptal</Btn></div>
          <input name="title" value={f.title} onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))} placeholder="Başlık" required className={ui.input} />
          <textarea name="description" value={f.description} onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))} placeholder="Açıklama" rows={2} className={`${ui.input} resize-none`} />
          <div className="grid grid-cols-2 gap-3">
            <select name="priority" value={f.priority} onChange={(e) => setF((s) => ({ ...s, priority: e.target.value }))} className={`${ui.input} cursor-pointer`}>
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
            </select>
            <input name="dueDate" type="date" value={f.dueDate} onChange={(e) => setF((s) => ({ ...s, dueDate: e.target.value }))} className={ui.input} />
          </div>
          <button type="submit" disabled={busy} className={ui.btnPrimary}>{busy ? 'Kaydediliyor...' : 'Ekle'}</button>
        </form>
      )}

      <div>
        <h2 className={`mb-3 ${ui.sectionTitle}`}>Bekleyen ({pending.length})</h2>
        {pending.length === 0 ? <p className="text-sm text-ink-muted">Tebrikler, tamamlandı!</p> : (
          <div className="space-y-2">
            {pending.map((t) => (
              <div key={t.id} className="group flex items-center gap-3 p-3 rounded-2xl bg-surface border border-line hover:border-ink/15 transition-colors">
                <button onClick={() => toggle(t.id)} aria-label="Tamamlandı olarak işaretle" className="w-4 h-4 rounded border border-line hover:border-accent shrink-0 flex items-center justify-center transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{t.title}</p>
                  <p className="text-[11px] text-ink-muted line-clamp-1">{t.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.dueDate && <span className="text-[10px] text-ink-muted">{fmt(t.dueDate)}</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${t.priority === 'high' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300' : t.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'}`}>{t.priority}</span>
                  <button onClick={() => del(t.id)} aria-label="Sil" className="p-1 text-ink-muted hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div>
          <h2 className={`mb-3 ${ui.sectionTitle}`}>Tamamlanan ({completed.length})</h2>
          <div className="space-y-2 opacity-50">
            {completed.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-line">
                <div className="w-4 h-4 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>
                <div className="flex-1 min-w-0"><p className="text-sm line-through text-ink-muted">{t.title}</p></div>
                <button onClick={() => del(t.id)} aria-label="Sil" className="p-1 text-ink-muted hover:text-rose-500 transition-colors"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

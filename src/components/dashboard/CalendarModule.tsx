'use client';

import { useState, useMemo } from 'react';
import type { ReactElement } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { ui } from './ui';

interface Todo {
  id: number;
  title: string;
  dueDate: string | null;
  completed: boolean;
  priority: string;
}

interface Props {
  todos: Todo[];
}

export default function CalendarModule({ todos }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    for (const todo of todos) {
      if (todo.dueDate) {
        const d = new Date(todo.dueDate).toISOString().split('T')[0];
        if (!map[d]) map[d] = [];
        map[d].push(todo);
      }
    }
    return map;
  }, [todos]);

  const selectedTodos = selectedDate ? todosByDate[selectedDate] || [] : [];

  const today = new Date().toISOString().split('T')[0];

  const cells: ReactElement[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(<div key={`empty-${i}`} className="h-24" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTodos = todosByDate[dateStr] || [];
    const isToday = dateStr === today;
    const isSelected = dateStr === selectedDate;
    const hasCompleted = dayTodos.some((t) => t.completed);
    const hasPending = dayTodos.some((t) => !t.completed);

    cells.push(
      <button
        key={day}
        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
        className={`h-24 rounded-xl border p-2 text-left transition-colors ${
          isSelected ? 'border-ink bg-ink text-paper' : 'border-line hover:bg-surface-2'
        } ${isToday ? 'ring-1 ring-accent' : ''}`}
      >
        <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-paper' : isToday ? 'text-accent' : 'text-ink-muted'}`}>{day}</div>
        {dayTodos.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hasPending && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            {hasCompleted && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </div>
        )}
        {dayTodos.length > 2 && (
          <div className="text-[9px] text-ink-muted mt-1">+{dayTodos.length - 2}</div>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-ink-muted" />
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-ink">Ajanda</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} aria-label="Önceki ay" className="p-2 rounded-full border border-line text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-ink min-w-[120px] text-center">{monthNames[month]} {year}</span>
          <button onClick={nextMonth} aria-label="Sonraki ay" className="p-2 rounded-full border border-line text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[11px] text-ink-muted font-medium py-2">{d}</div>
        ))}
        {cells}
      </div>

      {selectedDate && (
        <div className={`${ui.card} p-5`}>
          <h3 className="text-sm font-semibold mb-3 text-ink">{new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
          {selectedTodos.length === 0 ? (
            <p className="text-sm text-ink-muted">Bu gün için görev yok.</p>
          ) : (
            <div className="space-y-2">
              {selectedTodos.map((todo) => (
                <div key={todo.id} className={`flex items-center gap-3 p-2 rounded-lg ${todo.completed ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-amber-500/5 border border-amber-500/10'}`}>
                  <span className={`w-2 h-2 rounded-full ${todo.completed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className={`text-sm ${todo.completed ? 'text-emerald-600 dark:text-emerald-400 line-through' : 'text-ink'}`}>{todo.title}</span>
                  <span className="text-[10px] text-ink-muted ml-auto uppercase">{todo.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

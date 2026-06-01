'use client';

import { useState, useMemo } from 'react';
import type { ReactElement } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

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
        className={`h-24 rounded-xl border p-2 text-left transition-all hover:border-neutral-400 dark:hover:border-white/20 ${
          isSelected ? 'border-neutral-400 dark:border-white/30 bg-neutral-200 dark:bg-white/5' : 'border-neutral-200 dark:border-white/5'
        } ${isToday ? 'ring-1 ring-neutral-400 dark:ring-white/20' : ''}`}
      >
        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>{day}</div>
        {dayTodos.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hasPending && <span className="w-2 h-2 rounded-full bg-amber-400" />}
            {hasCompleted && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </div>
        )}
        {dayTodos.length > 2 && (
          <div className="text-[9px] text-neutral-500 dark:text-neutral-500 mt-1">+{dayTodos.length - 2}</div>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-2xl font-bold tracking-tight">Ajanda</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center">{monthNames[month]} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[11px] text-neutral-500 dark:text-neutral-400 font-medium py-2">{d}</div>
        ))}
        {cells}
      </div>

      {selectedDate && (
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02]">
          <h3 className="text-sm font-bold mb-3 text-neutral-900 dark:text-white">{new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
          {selectedTodos.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Bu gün için görev yok.</p>
          ) : (
            <div className="space-y-2">
              {selectedTodos.map((todo) => (
                <div key={todo.id} className={`flex items-center gap-3 p-2 rounded-lg ${todo.completed ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-amber-500/5 border border-amber-500/10'}`}>
                  <span className={`w-2 h-2 rounded-full ${todo.completed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className={`text-sm ${todo.completed ? 'text-emerald-400 line-through' : 'text-neutral-900 dark:text-white'}`}>{todo.title}</span>
                  <span className="text-[10px] text-neutral-500 ml-auto uppercase">{todo.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

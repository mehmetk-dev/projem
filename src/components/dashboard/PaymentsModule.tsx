'use client';

import { useMemo, useState } from 'react';
import { Briefcase, Car, Check, CircleDot, Home, HeartPulse, Pencil, Plus, Receipt, Repeat, ShoppingBag, Trash2, Utensils, Wallet } from 'lucide-react';
import * as T from './types';
import { createPaymentAction, deletePaymentAction, togglePaymentPaidAction, updatePaymentAction } from '@/app/actions/payments';
import { buildPaymentSummary, formatTRY, getCategoryMeta, isPaymentPaidForMonth, PAYMENT_CATEGORIES } from '@/lib/payments/summary';

interface Props {
  payments: T.Payment[];
  toastFn: (msg: string, ok: boolean) => void;
}

type Filter = 'month' | 'next' | 'subscriptions' | 'income' | 'all';

const iconMap = {
  utensils: Utensils,
  car: Car,
  home: Home,
  receipt: Receipt,
  repeat: Repeat,
  'shopping-bag': ShoppingBag,
  'heart-pulse': HeartPulse,
  wallet: Wallet,
  briefcase: Briefcase,
  'circle-dot': CircleDot,
};

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  sky: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  orange: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  red: 'bg-red-500/10 text-red-300 border-red-500/20',
  green: 'bg-green-500/10 text-green-300 border-green-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  neutral: 'bg-white/5 text-neutral-300 border-white/10',
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function occursInMonth(payment: T.Payment, date: Date) {
  if (payment.recurrence === 'monthly') return true;
  if (!payment.dueDate) return false;
  return monthKey(new Date(payment.dueDate)) === monthKey(date);
}

function paymentDay(payment: T.Payment) {
  if (payment.recurrence === 'monthly' && payment.recurringDay) return payment.recurringDay;
  if (payment.dueDate) return new Date(payment.dueDate).getDate();
  return 31;
}

function categoryIcon(category: string, size = 16) {
  const meta = getCategoryMeta(category);
  const Icon = iconMap[meta.icon as keyof typeof iconMap] || CircleDot;
  return <Icon size={size} />;
}

export default function PaymentsModule({ payments: initialPayments, toastFn }: Props) {
  const [payments, setPayments] = useState(initialPayments);
  const [filter, setFilter] = useState<Filter>('month');
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [edit, setEdit] = useState<T.Payment | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'expense' | 'income',
    category: 'food',
    dueDate: todayInputValue(),
    recurrence: 'none' as 'none' | 'monthly',
    recurringDay: new Date().getDate(),
    paid: false,
    notes: '',
  });

  const today = useMemo(() => new Date(), []);
  const nextMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 1, 1), [today]);
  const summary = useMemo(() => buildPaymentSummary(payments, today), [payments, today]);

  const visiblePayments = useMemo(() => {
    return payments
      .filter((payment) => {
        if (filter === 'month') return occursInMonth(payment, today);
        if (filter === 'next') return occursInMonth(payment, nextMonth);
        if (filter === 'subscriptions') return payment.recurrence === 'monthly';
        if (filter === 'income') return payment.type === 'income';
        return true;
      })
      .sort((a, b) => paymentDay(a) - paymentDay(b));
  }, [filter, payments, today, nextMonth]);

  const reset = () => {
    setEdit(null);
    setMode('list');
    setForm({ title: '', amount: '', type: 'expense', category: 'food', dueDate: todayInputValue(), recurrence: 'none', recurringDay: new Date().getDate(), paid: false, notes: '' });
  };

  const openEdit = (payment: T.Payment) => {
    setEdit(payment);
    setForm({
      title: payment.title,
      amount: String(payment.amountCents / 100),
      type: payment.type,
      category: payment.category,
      dueDate: payment.dueDate || todayInputValue(),
      recurrence: payment.recurrence,
      recurringDay: payment.recurringDay || paymentDay(payment),
      paid: isPaymentPaidForMonth(payment, today),
      notes: payment.notes || '',
    });
    setMode('form');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const fd = new FormData(event.currentTarget as HTMLFormElement);
    if (edit) fd.append('paymentId', String(edit.id));
    const res = await (edit ? updatePaymentAction : createPaymentAction)(null, fd);
    setBusy(false);

    if (res.error || !res.data) {
      toastFn(res.error || 'Hata', false);
      return;
    }

    if (edit) setPayments((prev) => prev.map((item) => item.id === edit.id ? res.data! : item));
    else setPayments((prev) => [res.data!, ...prev]);
    toastFn(res.success || 'Kaydedildi', true);
    reset();
  };

  const togglePaid = async (payment: T.Payment) => {
    const paidForMonth = isPaymentPaidForMonth(payment, today);
    setPayments((prev) => prev.map((item) => item.id === payment.id ? {
      ...item,
      paid: !paidForMonth,
      paidAt: !paidForMonth ? new Date().toISOString() : null,
    } : item));
    const fd = new FormData();
    fd.append('paymentId', String(payment.id));
    const res = await togglePaymentPaidAction(fd);
    if (res.error) {
      toastFn(res.error, false);
      setPayments(initialPayments);
    }
  };

  const del = async (id: number) => {
    if (!confirm('Silinsin mi?')) return;
    setPayments((prev) => prev.filter((payment) => payment.id !== id));
    const fd = new FormData();
    fd.append('paymentId', String(id));
    const res = await deletePaymentAction(fd);
    if (res.error) {
      toastFn(res.error, false);
      setPayments(initialPayments);
    }
  };

  const quickSet = (title: string, category: string, recurrence: 'none' | 'monthly' = 'none') => {
    setForm((current) => ({ ...current, title, category, recurrence, type: category === 'salary' || category === 'freelance' ? 'income' : 'expense' }));
    setMode('form');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ödemeler</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gelir, gider ve aylık abonelik takibi</p>
        </div>
        {mode === 'list' && (
          <button onClick={() => setMode('form')} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:bg-neutral-200">
            <Plus size={16} /> Yeni Kayıt
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Bu ay gider" value={formatTRY(summary.monthlyExpenseCents)} tone="rose" />
        <Stat label="Bu ay gelir" value={formatTRY(summary.monthlyIncomeCents)} tone="emerald" />
        <Stat label="Net durum" value={formatTRY(summary.netCents)} tone={summary.netCents >= 0 ? 'sky' : 'amber'} />
        <Stat label="Geciken" value={formatTRY(summary.overdueExpenseCents)} tone="amber" />
        <Stat label="Gelecek ay gider" value={formatTRY(summary.nextMonthTotalCents)} tone="violet" />
      </div>

      {mode === 'form' && (
        <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-neutral-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">{edit ? 'Kaydı Düzenle' : 'Hızlı Kayıt'}</h2>
            <button type="button" onClick={reset} className="text-xs text-neutral-400 hover:text-white">İptal</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-3">
            <input name="title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Yemek, Spotify, maaş..." required className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30" />
            <input name="amount" value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} placeholder="100 TL" required inputMode="decimal" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Segment active={form.type === 'expense'} onClick={() => setForm((s) => ({ ...s, type: 'expense', category: s.category === 'salary' || s.category === 'freelance' ? 'food' : s.category }))}>Gider</Segment>
            <Segment active={form.type === 'income'} onClick={() => setForm((s) => ({ ...s, type: 'income', category: 'salary' }))}>Gelir</Segment>
            <input type="hidden" name="type" value={form.type} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {PAYMENT_CATEGORIES.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => setForm((s) => ({ ...s, category: category.key }))}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${form.category === category.key ? colorMap[category.color] : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white'}`}
              >
                {categoryIcon(category.key, 14)}
                <span className="truncate">{category.label}</span>
              </button>
            ))}
            <input type="hidden" name="category" value={form.category} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input name="dueDate" type="date" value={form.dueDate} onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value, recurringDay: new Date(e.target.value).getDate() }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
            <input name="recurringDay" type="number" min={1} max={31} value={form.recurringDay} onChange={(e) => setForm((s) => ({ ...s, recurringDay: Number(e.target.value) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-neutral-300">
              <input type="checkbox" name="recurrence" value="monthly" checked={form.recurrence === 'monthly'} onChange={(e) => setForm((s) => ({ ...s, recurrence: e.target.checked ? 'monthly' : 'none' }))} className="accent-white" /> Aylık
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-neutral-300">
              <input type="checkbox" name="paid" value="true" checked={form.paid} onChange={(e) => setForm((s) => ({ ...s, paid: e.target.checked }))} className="accent-white" /> Ödendi
            </label>
          </div>

          <textarea name="notes" value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Not (isteğe bağlı)" rows={2} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-neutral-600 resize-none focus:outline-none focus:border-white/30" />
          <button type="submit" disabled={busy} className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:bg-neutral-200 disabled:opacity-50">{busy ? 'Kaydediliyor...' : edit ? 'Güncelle' : 'Kaydet'}</button>
        </form>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterButton active={filter === 'month'} onClick={() => setFilter('month')}>Bu Ay</FilterButton>
        <FilterButton active={filter === 'next'} onClick={() => setFilter('next')}>Gelecek Ay</FilterButton>
        <FilterButton active={filter === 'subscriptions'} onClick={() => setFilter('subscriptions')}>Aylıklar</FilterButton>
        <FilterButton active={filter === 'income'} onClick={() => setFilter('income')}>Gelirler</FilterButton>
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Tümü</FilterButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="space-y-2">
          {visiblePayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">Henüz kayıt yok.</div>
          ) : visiblePayments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} displayMonth={filter === 'next' ? nextMonth : today} onEdit={openEdit} onDelete={del} onTogglePaid={togglePaid} />
          ))}
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-400/80 mb-3">Geciken</p>
            {summary.overdue.length === 0 ? <p className="text-sm text-neutral-500">Geciken ödeme yok.</p> : summary.overdue.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm truncate">{payment.title}</p>
                  <p className="text-[11px] text-neutral-500">Ayın {paymentDay(payment)}. günü</p>
                </div>
                <span className="text-sm font-semibold text-amber-300">{formatTRY(payment.amountCents)}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 mb-3">Yaklaşan</p>
            {summary.upcoming.length === 0 ? <p className="text-sm text-neutral-500">Bu ay bekleyen ödeme yok.</p> : summary.upcoming.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm truncate">{payment.title}</p>
                  <p className="text-[11px] text-neutral-500">Ayın {paymentDay(payment)}. günü</p>
                </div>
                <span className="text-sm font-semibold text-rose-300">{formatTRY(payment.amountCents)}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 mb-3">Hızlı Ekle</p>
            <div className="grid grid-cols-2 gap-2">
              <Quick onClick={() => quickSet('Yemek', 'food')}>Yemek</Quick>
              <Quick onClick={() => quickSet('Market', 'shopping')}>Market</Quick>
              <Quick onClick={() => quickSet('Spotify', 'subscription', 'monthly')}>Spotify</Quick>
              <Quick onClick={() => quickSet('YouTube', 'subscription', 'monthly')}>YouTube</Quick>
              <Quick onClick={() => quickSet('Fatura', 'bills', 'monthly')}>Fatura</Quick>
              <Quick onClick={() => quickSet('Maaş', 'salary', 'monthly')}>Maaş</Quick>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  const toneClass = tone === 'rose' ? 'text-rose-300' : tone === 'emerald' ? 'text-emerald-300' : tone === 'amber' ? 'text-amber-300' : tone === 'violet' ? 'text-violet-300' : 'text-sky-300';
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function Segment({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-lg px-3 py-1.5 text-sm border ${active ? 'bg-white text-black border-white' : 'border-white/10 text-neutral-400 hover:text-white'}`}>{children}</button>;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs border ${active ? 'bg-white text-black border-white font-bold' : 'border-white/10 text-neutral-400 hover:text-white'}`}>{children}</button>;
}

function Quick({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:border-white/20">{children}</button>;
}

function PaymentRow({ payment, displayMonth, onEdit, onDelete, onTogglePaid }: { payment: T.Payment; displayMonth: Date; onEdit: (payment: T.Payment) => void; onDelete: (id: number) => void; onTogglePaid: (payment: T.Payment) => void }) {
  const meta = getCategoryMeta(payment.category);
  const paidForMonth = isPaymentPaidForMonth(payment, displayMonth);
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/30 p-3 hover:border-white/20">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${colorMap[meta.color]}`}>
        {categoryIcon(payment.category)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{payment.title}</p>
          {payment.recurrence === 'monthly' && <span className="rounded border border-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-300">aylık</span>}
          {paidForMonth && <span className="rounded border border-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">ödendi</span>}
        </div>
        <p className="mt-0.5 text-[11px] text-neutral-500">{meta.label} · {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('tr-TR') : `Ayın ${payment.recurringDay}. günü`}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${payment.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>{payment.type === 'income' ? '+' : '-'}{formatTRY(payment.amountCents)}</p>
        <div className="mt-1 flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <button onClick={() => onTogglePaid(payment)} title="Ödendi" className="rounded border border-white/10 p-1 text-neutral-400 hover:text-white"><Check size={13} /></button>
          <button onClick={() => onEdit(payment)} title="Düzenle" className="rounded border border-white/10 p-1 text-neutral-400 hover:text-white"><Pencil size={13} /></button>
          <button onClick={() => onDelete(payment.id)} title="Sil" className="rounded border border-rose-500/20 p-1 text-rose-400 hover:text-rose-300"><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}

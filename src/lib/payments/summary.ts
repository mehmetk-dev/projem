export type PaymentType = 'expense' | 'income';
export type PaymentRecurrence = 'none' | 'monthly';

export interface PaymentSummaryItem {
  id: number;
  type: PaymentType;
  title: string;
  amountCents: number;
  category: string;
  dueDate: string | null;
  recurrence: PaymentRecurrence;
  recurringDay: number | null;
  paid: boolean;
  paidAt?: string | null;
}

export interface CategoryMeta {
  key: string;
  label: string;
  icon: string;
  color: string;
}

export const PAYMENT_CATEGORIES: CategoryMeta[] = [
  { key: 'food', label: 'Yemek', icon: 'utensils', color: 'emerald' },
  { key: 'transport', label: 'Ulaşım', icon: 'car', color: 'sky' },
  { key: 'home', label: 'Ev', icon: 'home', color: 'amber' },
  { key: 'bills', label: 'Fatura', icon: 'receipt', color: 'orange' },
  { key: 'subscription', label: 'Abonelik', icon: 'repeat', color: 'violet' },
  { key: 'shopping', label: 'Alışveriş', icon: 'shopping-bag', color: 'rose' },
  { key: 'health', label: 'Sağlık', icon: 'heart-pulse', color: 'red' },
  { key: 'salary', label: 'Maaş', icon: 'wallet', color: 'green' },
  { key: 'freelance', label: 'Ek Gelir', icon: 'briefcase', color: 'cyan' },
  { key: 'other', label: 'Diğer', icon: 'circle-dot', color: 'neutral' },
];

export function getCategoryMeta(category: string): CategoryMeta {
  return PAYMENT_CATEGORIES.find((item) => item.key === category) ?? PAYMENT_CATEGORIES[PAYMENT_CATEGORIES.length - 1];
}

export function formatTRY(amountCents: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export function parseAmountToCents(value: FormDataEntryValue | null): number {
  const raw = String(value || '').replace(/[^\d.,]/g, '');
  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  const decimalIndex = Math.max(lastComma, lastDot);
  let normalized = raw.replace(/[.,]/g, '');

  if (decimalIndex >= 0) {
    const right = raw.slice(decimalIndex + 1).replace(/[^\d]/g, '');
    const left = raw.slice(0, decimalIndex).replace(/[^\d]/g, '');
    const hasBothSeparators = lastComma >= 0 && lastDot >= 0;
    const looksDecimal = right.length > 0 && right.length <= 2 && (hasBothSeparators || right.length !== 3);

    if (looksDecimal) {
      normalized = `${left}.${right}`;
    }
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function occursInMonth(item: PaymentSummaryItem, month: Date): boolean {
  if (item.recurrence === 'monthly') return true;
  if (!item.dueDate) return false;
  return monthKey(new Date(item.dueDate)) === monthKey(month);
}

function itemDay(item: PaymentSummaryItem): number {
  if (item.recurrence === 'monthly' && item.recurringDay) return item.recurringDay;
  if (item.dueDate) return new Date(item.dueDate).getDate();
  return 31;
}

export function isPaymentPaidForMonth(item: PaymentSummaryItem, month = new Date()): boolean {
  if (item.recurrence !== 'monthly') return item.paid;
  if (!item.paidAt) return false;
  return monthKey(new Date(item.paidAt)) === monthKey(month);
}

export function buildPaymentSummary<T extends PaymentSummaryItem>(items: T[], today = new Date()) {
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const currentMonthItems = items.filter((item) => occursInMonth(item, today));
  const nextMonthItems = items.filter((item) => occursInMonth(item, nextMonth));

  const monthlyIncomeCents = currentMonthItems
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + item.amountCents, 0);

  const monthlyExpenseCents = currentMonthItems
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amountCents, 0);

  const upcoming = currentMonthItems
    .filter((item) => item.type === 'expense' && !isPaymentPaidForMonth(item, today) && itemDay(item) >= today.getDate())
    .sort((a, b) => itemDay(a) - itemDay(b));

  const overdue = currentMonthItems
    .filter((item) => item.type === 'expense' && !isPaymentPaidForMonth(item, today) && itemDay(item) < today.getDate())
    .sort((a, b) => itemDay(a) - itemDay(b));

  const overdueExpenseCents = overdue.reduce((total, item) => total + item.amountCents, 0);

  const nextMonthTotalCents = nextMonthItems
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amountCents, 0);

  return {
    monthlyIncomeCents,
    monthlyExpenseCents,
    netCents: monthlyIncomeCents - monthlyExpenseCents,
    upcoming,
    overdue,
    overdueExpenseCents,
    nextMonthTotalCents,
  };
}

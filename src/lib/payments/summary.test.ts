import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPaymentSummary, getCategoryMeta, parseAmountToCents, type PaymentSummaryItem } from './summary';

const items: PaymentSummaryItem[] = [
  { id: 1, type: 'expense', title: 'Yemek', amountCents: 10000, category: 'food', dueDate: '2026-05-10', recurrence: 'none', recurringDay: null, paid: true },
  { id: 2, type: 'expense', title: 'Spotify', amountCents: 5999, category: 'subscription', dueDate: null, recurrence: 'monthly', recurringDay: 20, paid: false },
  { id: 3, type: 'income', title: 'Maaş', amountCents: 5000000, category: 'salary', dueDate: '2026-05-01', recurrence: 'monthly', recurringDay: 1, paid: true },
  { id: 4, type: 'expense', title: 'Geçen ay', amountCents: 25000, category: 'other', dueDate: '2026-04-12', recurrence: 'none', recurringDay: null, paid: true },
];

test('buildPaymentSummary calculates current month income, expense, net and upcoming monthly payments', () => {
  const summary = buildPaymentSummary(items, new Date('2026-05-16T12:00:00.000Z'));

  assert.equal(summary.monthlyIncomeCents, 5000000);
  assert.equal(summary.monthlyExpenseCents, 15999);
  assert.equal(summary.netCents, 4984001);
  assert.deepEqual(summary.upcoming.map((item) => item.title), ['Spotify']);
  assert.equal(summary.nextMonthTotalCents, 5999);
});

test('getCategoryMeta falls back to other for unknown categories', () => {
  assert.equal(getCategoryMeta('food').label, 'Yemek');
  assert.equal(getCategoryMeta('not-real').key, 'other');
});

test('buildPaymentSummary treats recurring paidAt as paid only for that month', () => {
  const summary = buildPaymentSummary([
    { id: 5, type: 'expense', title: 'YouTube', amountCents: 7999, category: 'subscription', dueDate: null, recurrence: 'monthly', recurringDay: 25, paid: false, paidAt: '2026-05-16' } as PaymentSummaryItem,
  ], new Date('2026-05-16T12:00:00.000Z'));

  assert.deepEqual(summary.upcoming.map((item) => item.title), []);
  assert.equal(summary.nextMonthTotalCents, 7999);
});

test('parseAmountToCents handles Turkish and plain decimal formats', () => {
  assert.equal(parseAmountToCents('1.234,56'), 123456);
  assert.equal(parseAmountToCents('1234.56'), 123456);
  assert.equal(parseAmountToCents('100 TL'), 10000);
});

test('buildPaymentSummary separates overdue unpaid expenses from upcoming expenses', () => {
  const summary = buildPaymentSummary([
    { id: 6, type: 'expense', title: 'Kira', amountCents: 1500000, category: 'home', dueDate: '2026-05-03', recurrence: 'monthly', recurringDay: 3, paid: false },
    { id: 7, type: 'expense', title: 'İnternet', amountCents: 30000, category: 'bills', dueDate: '2026-05-25', recurrence: 'monthly', recurringDay: 25, paid: false },
  ], new Date('2026-05-16T12:00:00.000Z'));

  assert.deepEqual(summary.overdue.map((item) => item.title), ['Kira']);
  assert.deepEqual(summary.upcoming.map((item) => item.title), ['İnternet']);
  assert.equal(summary.overdueExpenseCents, 1500000);
});

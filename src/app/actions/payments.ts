'use server';

import { db } from '@/db';
import { payments } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { isPaymentPaidForMonth, parseAmountToCents } from '@/lib/payments/summary';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface PaymentActionState {
  error?: string;
  success?: string;
  data?: typeof payments.$inferSelect;
}

const paymentSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir.').max(160).trim(),
  amountCents: z.number().int().positive('Tutar 0 TL’den büyük olmalıdır.'),
  type: z.enum(['expense', 'income']).default('expense'),
  category: z.string().min(1).trim().default('other'),
  dueDate: z.string().trim().optional(),
  recurrence: z.enum(['none', 'monthly']).default('none'),
  recurringDay: z.number().int().min(1).max(31).nullable(),
  paid: z.boolean().default(false),
  paidAt: z.string().nullable(),
  notes: z.string().max(1000).trim().optional(),
});

function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function normalizePaymentForm(formData: FormData) {
  const dueDate = String(formData.get('dueDate') || '').trim() || todayDateInputValue();
  const recurrence = formData.get('recurrence') === 'monthly' ? 'monthly' : 'none';
  const recurringDayValue = Number(formData.get('recurringDay') || new Date(dueDate).getDate());
  const paid = formData.get('paid') === 'true';

  return {
    title: formData.get('title'),
    amountCents: parseAmountToCents(formData.get('amount')),
    type: formData.get('type') === 'income' ? 'income' : 'expense',
    category: String(formData.get('category') || 'other'),
    dueDate,
    recurrence,
    recurringDay: recurrence === 'monthly' ? recurringDayValue : null,
    paid,
    paidAt: paid ? new Date().toISOString() : null,
    notes: formData.get('notes') || undefined,
  };
}

export async function getMyPayments() {
  const { userId } = await requireAuth();
  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .all();
}

export async function createPaymentAction(
  _prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
  const { userId } = await requireAuth();
  const result = paymentSchema.safeParse(normalizePaymentForm(formData));

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    const [payment] = await db.insert(payments).values({ userId, ...result.data }).returning();
    revalidatePath('/dashboard');
    return { success: 'Ödeme kaydı eklendi.', data: payment };
  } catch (error) {
    console.error('Create Payment Error:', error);
    return { error: 'Ödeme kaydı eklenirken hata oluştu.' };
  }
}

export async function updatePaymentAction(
  _prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
  const { userId } = await requireAuth();
  const paymentId = Number(formData.get('paymentId'));
  if (!paymentId || isNaN(paymentId)) return { error: 'Geçersiz ödeme ID.' };

  const result = paymentSchema.safeParse(normalizePaymentForm(formData));
  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(' ') };
  }

  try {
    const existing = await db.select().from(payments).where(and(eq(payments.id, paymentId), eq(payments.userId, userId))).get();
    if (!existing) return { error: 'Ödeme kaydı bulunamadı.' };

    const [payment] = await db
      .update(payments)
      .set({ ...result.data, updatedAt: new Date().toISOString() })
      .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)))
      .returning();

    revalidatePath('/dashboard');
    return { success: 'Ödeme kaydı güncellendi.', data: payment };
  } catch (error) {
    console.error('Update Payment Error:', error);
    return { error: 'Ödeme kaydı güncellenirken hata oluştu.' };
  }
}

export async function togglePaymentPaidAction(formData: FormData): Promise<PaymentActionState> {
  const { userId } = await requireAuth();
  const paymentId = Number(formData.get('paymentId'));
  if (!paymentId || isNaN(paymentId)) return { error: 'Geçersiz ödeme ID.' };

  try {
    const existing = await db.select().from(payments).where(and(eq(payments.id, paymentId), eq(payments.userId, userId))).get();
    if (!existing) return { error: 'Ödeme kaydı bulunamadı.' };

    await db
      .update(payments)
      .set({
        paid: existing.recurrence === 'monthly' ? !isPaymentPaidForMonth(existing, new Date()) : !existing.paid,
        paidAt: existing.recurrence === 'monthly'
          ? isPaymentPaidForMonth(existing, new Date()) ? null : new Date().toISOString()
          : !existing.paid ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)));

    revalidatePath('/dashboard');
    return { success: existing.paid ? 'Ödenecek olarak işaretlendi.' : 'Ödendi olarak işaretlendi.' };
  } catch {
    return { error: 'İşlem sırasında hata oluştu.' };
  }
}

export async function deletePaymentAction(formData: FormData): Promise<PaymentActionState> {
  const { userId } = await requireAuth();
  const paymentId = Number(formData.get('paymentId'));
  if (!paymentId || isNaN(paymentId)) return { error: 'Geçersiz ödeme ID.' };

  try {
    await db.delete(payments).where(and(eq(payments.id, paymentId), eq(payments.userId, userId)));
    revalidatePath('/dashboard');
    return { success: 'Ödeme kaydı silindi.' };
  } catch {
    return { error: 'Silinirken hata oluştu.' };
  }
}

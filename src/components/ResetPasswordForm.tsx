'use client';

import { useActionState } from 'react';
import { resetPasswordAction } from '@/app/actions/auth';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  return (
    <AuthLayout
      backHref="/login"
      backLabel="Girişe dön"
      title="Yeni Şifre Belirle."
      subtitle="Güvenliğin için şifreni sıfırlıyoruz."
    >
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-6">
          <div className="group">
            <label
              htmlFor="password"
              className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted"
            >
              Yeni Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-accent"
              placeholder="En az 8 karakter, büyük/küçük harf, rakam ve özel karakter"
            />
          </div>
        </div>

        {state?.error && <div className="text-sm text-rose-600">{state.error}</div>}

        {state?.success && (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600">
            {state.success}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

export function InvalidTokenState() {
  return (
    <AuthLayout
      backHref="/forgot-password"
      backLabel="Şifre sıfırlamaya dön"
      title="Geçersiz Bağlantı."
      subtitle="Bu şifre sıfırlama bağlantısı geçersiz, süresi dolmuş veya daha önce kullanılmış."
    >
      <div className="text-sm text-rose-600">
        Geçersiz veya eksik şifre sıfırlama tokenı. Lütfen yeni bir şifre sıfırlama talebinde bulunun.
      </div>
      <div>
        <Link
          href="/forgot-password"
          className="block w-full rounded-full bg-ink py-3.5 text-center text-sm font-medium text-paper transition-colors hover:bg-accent"
        >
          Yeni Bağlantı İste
        </Link>
      </div>
    </AuthLayout>
  );
}

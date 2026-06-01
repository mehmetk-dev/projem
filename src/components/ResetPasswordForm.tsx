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
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-6">
          <div className="group">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-widest text-neutral-500 group-focus-within:text-white transition-colors"
            >
              Yeni Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-transparent border-b border-neutral-800 py-3 text-white placeholder-neutral-700 focus:outline-none focus:border-white transition-colors"
              placeholder="En az 8 karakter, büyük/küçük harf, rakam ve özel karakter"
            />
          </div>
        </div>

        {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

        {state?.success && (
          <div className="text-white text-sm bg-white/10 p-4 rounded-xl border border-white/20">
            {state.success}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white text-black py-4 rounded-full font-medium tracking-wide hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="text-red-500 text-sm">
        Geçersiz veya eksik şifre sıfırlama tokenı. Lütfen yeni bir şifre sıfırlama talebinde bulunun.
      </div>
      <div className="pt-4">
        <Link
          href="/forgot-password"
          className="w-full block text-center bg-white text-black py-4 rounded-full font-medium tracking-wide hover:bg-neutral-200 transition-all"
        >
          Yeni Bağlantı İste
        </Link>
      </div>
    </AuthLayout>
  );
}

'use client';

import { useActionState } from 'react';
import { registerAction } from '@/app/actions/auth';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <AuthLayout
      backHref="/"
      backLabel="Ana sayfaya dön"
      title="Aramıza Katıl."
      subtitle="Sadece e-posta ve şifrenle anında kayıt ol."
    >
      <form action={formAction} className="space-y-6">
        <div className="space-y-6">
          <FormField label="E-Posta" name="email" type="email" autoComplete="email" placeholder="ornek@mail.com" />
          <FormField label="Şifre" name="password" type="password" autoComplete="new-password" placeholder="En az 8 karakter, büyük/küçük harf, rakam ve özel karakter" />
        </div>

        {state?.error && <div className="text-sm text-rose-600">{state.error}</div>}

        <p className="text-[12px] leading-relaxed text-ink-muted">
          Kayıt olarak kişisel verilerinizin{' '}
          <Link href="/gizlilik" className="underline underline-offset-2 hover:text-ink">
            Gizlilik Politikası
          </Link>{' '}
          kapsamında işlenmesini kabul etmiş olursunuz.
        </p>

        <SubmitButton isPending={isPending} label="Hesap Oluştur" pendingLabel="Oluşturuluyor..." />

        <AuthFooter text="Zaten hesabın var mı?" linkHref="/login" linkLabel="Giriş yap" />
      </form>
    </AuthLayout>
  );
}

function FormField({
  label,
  name,
  type,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  placeholder: string;
}) {
  return (
    <div className="group">
      <label
        htmlFor={name}
        className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-accent"
        placeholder={placeholder}
      />
    </div>
  );
}

function SubmitButton({
  isPending,
  label,
  pendingLabel,
}: {
  isPending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full rounded-full bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}

function AuthFooter({
  text,
  linkHref,
  linkLabel,
}: {
  text: string;
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <div className="text-center">
      <p className="text-sm text-ink-muted">
        {text}{' '}
        <Link
          href={linkHref}
          className="text-ink underline underline-offset-4 decoration-line transition-colors hover:decoration-ink"
        >
          {linkLabel}
        </Link>
      </p>
    </div>
  );
}

'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';
import AuthLayout from '@/components/AuthLayout';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <AuthLayout
      backHref="/"
      backLabel="Ana sayfaya dön"
      title="Tekrar Merhaba."
      subtitle="Hesabına erişmek için bilgilerini gir."
    >
      <form action={formAction} className="space-y-6">
        <div className="space-y-6">
          <FormField label="E-Posta" name="email" type="email" autoComplete="email" placeholder="ornek@mail.com" />
          <FormField label="Şifre" name="password" type="password" autoComplete="current-password" placeholder="••••••••">
            <Link href="/forgot-password" className="text-xs text-ink-muted transition-colors hover:text-ink">
              Unuttum
            </Link>
          </FormField>
        </div>

        {state?.error && <div className="text-sm text-rose-600">{state.error}</div>}

        <div>
          <SubmitButton isPending={isPending} label="Giriş Yap" pendingLabel="Giriş yapılıyor..." />
        </div>

        <AuthFooter text="Henüz hesabın yok mu?" linkHref="/register" linkLabel="Kayıt ol" />
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
  children,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="group">
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor={name}
          className="block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted"
        >
          {label}
        </label>
        {children}
      </div>
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

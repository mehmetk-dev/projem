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
      <form action={formAction} className="space-y-8">
        <div className="space-y-6">
          <FormField label="E-Posta" name="email" type="email" placeholder="ornek@mail.com" />
          <FormField label="Şifre" name="password" type="password" placeholder="••••••••">
            <Link href="/forgot-password" className="text-xs text-neutral-600 hover:text-white transition-colors">
              Unuttum
            </Link>
          </FormField>
        </div>

        {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

        <div className="pt-4">
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
  placeholder,
  children,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="group">
      <div className="flex justify-between items-center">
        <label
          htmlFor={name}
          className="text-xs uppercase tracking-widest text-neutral-500 group-focus-within:text-white transition-colors"
        >
          {label}
        </label>
        {children}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="w-full bg-transparent border-b border-neutral-800 py-3 text-white placeholder-neutral-700 focus:outline-none focus:border-white transition-colors"
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
      className="w-full bg-white text-black py-4 rounded-full font-medium tracking-wide hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      <p className="text-sm text-neutral-600">
        {text}{' '}
        <Link
          href={linkHref}
          className="text-white hover:text-neutral-300 transition-colors underline underline-offset-4 decoration-neutral-800 hover:decoration-white"
        >
          {linkLabel}
        </Link>
      </p>
    </div>
  );
}

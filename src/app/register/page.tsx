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
      <form action={formAction} className="space-y-8">
        <div className="space-y-6">
          <FormField label="E-Posta" name="email" type="email" placeholder="ornek@mail.com" />
          <FormField label="Şifre" name="password" type="password" placeholder="En az 8 karakter, büyük/küçük harf, rakam ve özel karakter" />
        </div>

        {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

        <div className="pt-4">
          <SubmitButton isPending={isPending} label="Hesap Oluştur" pendingLabel="Oluşturuluyor..." />
        </div>

        <AuthFooter text="Zaten hesabın var mı?" linkHref="/login" linkLabel="Giriş yap" />
      </form>
    </AuthLayout>
  );
}

function FormField({
  label,
  name,
  type,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="group">
      <label
        htmlFor={name}
        className="text-xs uppercase tracking-widest text-neutral-500 group-focus-within:text-white transition-colors"
      >
        {label}
      </label>
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

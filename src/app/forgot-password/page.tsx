'use client';

import { useActionState } from 'react';
import { forgotPasswordAction } from '@/app/actions/auth';
import AuthLayout from '@/components/AuthLayout';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  return (
    <AuthLayout
      backHref="/login"
      backLabel="Girişe dön"
      title="Şifre Sıfırlama."
      subtitle="Sorun değil. E-posta adresini gir, sana hesabına tekrar erişmen için bir bağlantı gönderelim."
    >
      <form action={formAction} className="space-y-8">
        <div className="space-y-6">
          <FormField label="E-Posta" name="email" type="email" placeholder="ornek@mail.com" />
        </div>

        {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

        {state?.success && (
          <div className="text-white text-sm bg-white/10 p-4 rounded-xl border border-white/20">
            {state.success}
          </div>
        )}

        <div className="pt-4">
          <SubmitButton
            isPending={isPending}
            disabled={!!state?.success}
            label="Bağlantı Gönder"
            pendingLabel="Gönderiliyor..."
          />
        </div>
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
  disabled,
  label,
  pendingLabel,
}: {
  isPending: boolean;
  disabled?: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={isPending || disabled}
      className="w-full bg-white text-black py-4 rounded-full font-medium tracking-wide hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}

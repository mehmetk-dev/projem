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
      <form action={formAction} className="space-y-6">
        <div className="space-y-6">
          <FormField label="E-Posta" name="email" type="email" autoComplete="email" placeholder="ornek@mail.com" />
        </div>

        {state?.error && <div className="text-sm text-rose-600">{state.error}</div>}

        {state?.success && (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600">
            {state.success}
          </div>
        )}

        <div>
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
      className="w-full rounded-full bg-ink py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}

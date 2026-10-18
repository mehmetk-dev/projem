'use client';

import { useActionState } from 'react';
import { Check } from 'lucide-react';
import { unsubscribeAction } from '@/app/actions/social';

export default function UnsubscribeForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction, isPending] = useActionState(unsubscribeAction, null);

  if (state?.success) {
    return (
      <p className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-[15px] text-emerald-700" role="status">
        <Check size={18} aria-hidden="true" />
        {state.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="unsubscribe-email" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          E-posta
        </label>
        <input
          id="unsubscribe-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          placeholder="ornek@mail.com"
          className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-accent"
        />
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-50"
      >
        {isPending ? 'İşleniyor...' : 'Abonelikten çık'}
      </button>
    </form>
  );
}

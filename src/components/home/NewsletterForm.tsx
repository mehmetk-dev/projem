'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { subscribeAction } from '@/app/actions/social';

// Footer'daki bülten kutusu: tek alanlı e-posta formu
export default function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeAction, null);

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div className="max-w-md">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">
          Yeni yazılardan <span className="font-serif-display text-accent">haberdar olun.</span>
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Yeni yazılar ve proje notları e-postanıza gelsin. İstediğiniz an{' '}
          <Link href="/bulten/ayril" className="underline underline-offset-2 transition-colors hover:text-ink">
            ayrılabilirsiniz
          </Link>
          .
        </p>
      </div>

      {state?.success ? (
        <p className="inline-flex items-center gap-2 text-[15px] font-medium text-emerald-600" role="status">
          <Check size={18} aria-hidden="true" />
          {state.success}
        </p>
      ) : (
        <form action={formAction} className="w-full md:max-w-sm">
          <div className="flex items-center gap-2 rounded-full border border-line bg-paper p-1.5 pl-5 transition-colors focus-within:border-accent">
            <label htmlFor="newsletter-email" className="sr-only">
              E-posta adresiniz
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="E-posta adresiniz"
              suppressHydrationWarning
              className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink placeholder:text-ink-muted/70 outline-none"
            />
            <button
              type="submit"
              disabled={isPending}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-60"
            >
              {isPending ? 'Gönderiliyor…' : 'Abone ol'}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          </div>
          {state?.error && <p className="mt-2 pl-5 text-sm text-rose-600">{state.error}</p>}
          <p className="mt-2 pl-5 text-[12px] text-ink-muted">
            Abone olarak{' '}
            <Link href="/gizlilik" className="underline underline-offset-2 transition-colors hover:text-ink">
              Gizlilik Politikası
            </Link>
            &apos;nı kabul etmiş olursunuz.
          </p>
        </form>
      )}
    </div>
  );
}

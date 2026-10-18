'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { submitGuestbookAction } from '@/app/actions/guestbook';
import { toast } from 'sonner';
import { useEffect } from 'react';

const fieldLabel = 'mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted';
const fieldInput =
  'w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-accent';

export default function GuestbookForm() {
  const [state, formAction, isPending] = useActionState(submitGuestbookAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      const form = document.getElementById('guestbook-form') as HTMLFormElement;
      form?.reset();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form
      id="guestbook-form"
      action={formAction}
      className="space-y-5 rounded-2xl border border-line bg-surface p-5 md:p-7"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={fieldLabel}>
            İsim
          </label>
          <input id="name" name="name" type="text" required maxLength={100} className={fieldInput} placeholder="Adınız" />
        </div>
        <div>
          <label htmlFor="email" className={fieldLabel}>
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            className={fieldInput}
            placeholder="ornek@mail.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="message" className={fieldLabel}>
          Mesaj
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={4}
          className={`${fieldInput} resize-none`}
          placeholder="Bir şeyler yazın..."
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-50"
      >
        {isPending ? 'Gönderiliyor...' : 'Gönder'}
      </button>
      <p className="text-[12px] leading-relaxed text-ink-muted">
        Mesajınız onaylandıktan sonra adınızla birlikte yayınlanır; e-posta adresiniz gösterilmez. Ayrıntılar için{' '}
        <Link href="/gizlilik" className="underline underline-offset-2 transition-colors hover:text-ink">
          Gizlilik Politikası
        </Link>
        .
      </p>
    </form>
  );
}

'use client';

import { useActionState } from 'react';
import { submitGuestbookAction } from '@/app/actions/guestbook';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
      className="mb-16 p-6 md:p-8 rounded-[2rem] bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
            İsim
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            className="w-full bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 transition-colors"
            placeholder="Adınız"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            className="w-full bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 transition-colors"
            placeholder="ornek@mail.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="block text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
          Mesaj
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={4}
          className="w-full bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 transition-colors resize-none"
          placeholder="Bir şeyler yazın..."
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-neutral-900 text-white dark:bg-white dark:text-black px-8 py-3.5 rounded-full font-medium hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isPending ? 'Gönderiliyor...' : 'Gönder'}
      </button>
      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
        Mesajınız onaylandıktan sonra yayınlanacaktır.
      </p>
    </form>
  );
}

'use client';

import { useActionState } from 'react';
import { subscribeAction } from '@/app/actions/social';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function NewsletterSection() {
  const [state, formAction, isPending] = useActionState(subscribeAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      const form = document.getElementById('newsletter-form') as HTMLFormElement;
      form?.reset();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <section className="newsletter animate-on-scroll py-32 bg-gradient-to-b from-transparent to-neutral-100 dark:to-neutral-900/30">
      <div className="container mx-auto px-6">
        <div className="newsletter-inner max-w-2xl mx-auto text-center">
          <h2 className="text-4xl mb-4 font-bold">Haberdar Ol</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-8">
            Tasarım, yazılım ve ürün düşünce yapısı hakkındaki son içgörüleri e-posta kutuna al.
          </p>
          <form id="newsletter-form" action={formAction} className="form-group flex flex-col md:flex-row gap-4">
            <input
              name="email"
              type="email"
              required
              suppressHydrationWarning
              placeholder="E-posta adresini gir"
              className="bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-white/10 rounded-full px-6 py-4 flex-1 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus:border-neutral-500 dark:focus:border-white focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isPending}
              className="bg-neutral-900 text-white dark:bg-white dark:text-black px-8 py-4 rounded-full font-bold hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors shrink-0 disabled:opacity-50"
            >
              {isPending ? 'Gönderiliyor...' : 'Abone Ol'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useActionState, useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { submitContactAction } from '@/app/actions/messages';
import ContactCat from './ContactCat';

const EMAIL = 'mehmetkerem2109@gmail.com';

const fieldInput =
  'w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-[15px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-white';

export default function ContactCta() {
  const [state, formAction, isPending] = useActionState(submitContactAction, null);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section id="contact" className="scroll-mt-16 px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative overflow-hidden rounded-[28px] bg-ink p-3 text-white md:rounded-[36px] md:p-5">
        <div className="relative grid items-stretch gap-3 md:grid-cols-2 md:gap-5">
          <div className="animate-on-scroll relative flex min-h-[340px] flex-col overflow-hidden rounded-[22px] border border-white/10 bg-black p-6 md:min-h-0 md:rounded-[28px] md:p-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]"
              aria-hidden="true"
            />
            <p className="relative inline-flex items-center gap-2 text-[13px] text-white/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Yeni projelere açığım
            </p>
            <div className="relative flex flex-1 items-center justify-center py-4">
              <ContactCat />
            </div>
          </div>

          <div className="animate-on-scroll flex flex-col rounded-[22px] border border-white/10 bg-white/[0.03] p-7 md:rounded-[28px] md:p-10">
            {state?.success ? (
              <div className="flex flex-1 flex-col justify-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check size={20} />
                </span>
                <p className="mt-5 text-xl font-medium">Teşekkürler, mesajınız ulaştı.</p>
                <p className="mt-2 text-[15px] text-white/55">{state.success}</p>
              </div>
            ) : (
              <form action={formAction} className="flex flex-1 flex-col gap-2">
                <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
                  Bir projeniz mi var? <span className="font-serif-display text-[#93b4f8]">Konuşalım.</span>
                </h2>
                <p className="mb-4 mt-3 text-[15px] text-white/50">Kısaca anlatın, genellikle 24 saat içinde dönüş yaparım.</p>

                <div className="grid gap-2 sm:grid-cols-2 sm:gap-6">
                  <label className="block">
                    <span className="sr-only">Ad soyad</span>
                    <input
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Ad soyad"
                      suppressHydrationWarning
                      className={fieldInput}
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">E-posta</span>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="E-posta"
                      suppressHydrationWarning
                      className={fieldInput}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="sr-only">Telefon</span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="Telefon (isteğe bağlı)"
                      suppressHydrationWarning
                      className={fieldInput}
                    />
                  </label>
                </div>
                <label className="flex flex-1 flex-col">
                  <span className="sr-only">Mesajınız</span>
                  <textarea
                    name="content"
                    rows={4}
                    required
                    suppressHydrationWarning
                    placeholder="Projenizden kısaca bahsedin…"
                    className={`${fieldInput} min-h-[96px] flex-1 resize-none`}
                  />
                </label>

                {state?.error && <p className="mt-2 text-sm text-rose-400">{state.error}</p>}
                <span className="h-6 shrink-0" aria-hidden="true" />

                <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent hover:text-white disabled:opacity-60 sm:w-fit"
                  >
                    {isPending ? 'Gönderiliyor…' : 'Gönder'}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <span className="inline-flex items-center gap-2 text-[13px] text-white/45">
                    ya da
                    <a href={`mailto:${EMAIL}`} className="text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline">
                      {EMAIL}
                    </a>
                    <button
                      type="button"
                      onClick={copyEmail}
                      aria-label="E-posta adresini kopyala"
                      className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/40 hover:text-white"
                    >
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

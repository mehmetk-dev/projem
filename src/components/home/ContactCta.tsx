'use client';

import { useActionState, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Copy, Mail } from 'lucide-react';
import { submitContactAction } from '@/app/actions/messages';

const EMAIL = 'mehmetkerem2109@gmail.com';

const TOPICS = ['Kurumsal web sitesi', 'E-ticaret', 'Web uygulaması', 'Mevcut siteyi yenileme', 'Diğer'];

const STEPS = [
  { title: 'Mesajınızı alırım', text: 'İhtiyacınızı okuyup 24 saat içinde dönüş yaparım.' },
  { title: 'Kısa bir görüşme', text: 'Hedefleri, kapsamı ve takvimi birlikte netleştiririz.' },
  { title: 'Teklif ve plan', text: 'Net bir fiyat ve adım adım yol haritası sunarım.' },
];

const fieldInput =
  'w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-[15px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-white';

export default function ContactCta() {
  const [state, formAction, isPending] = useActionState(submitContactAction, null);
  const [copied, setCopied] = useState(false);
  const [topic, setTopic] = useState('');

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
          <div className="animate-on-scroll relative flex flex-col overflow-hidden rounded-[22px] bg-gradient-to-br from-accent to-[#1e3a8a] p-7 md:rounded-[28px] md:p-10">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_65%)]"
              aria-hidden="true"
            />
            <p className="relative inline-flex items-center gap-2 text-[13px] text-white/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              Yeni projelere açığım
            </p>
            <h2 className="relative mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
              Bir projeniz mi var? <span className="font-serif-display text-white/80">Konuşalım.</span>
            </h2>
            <p className="relative mt-4 max-w-sm text-[15px] leading-relaxed text-white/75">
              Fikrinizi kısaca anlatın; size en uygun yol haritasıyla geri döneyim.
            </p>

            <p className="relative mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">Süreç nasıl işler?</p>
            <ol className="relative mt-4 mb-8 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 font-mono text-[12px]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium">{step.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-white/70">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="relative mt-auto flex items-center gap-3 border-t border-white/20 pt-6">
              <Mail size={17} className="shrink-0 text-white/70" aria-hidden="true" />
              <a href={`mailto:${EMAIL}`} className="min-w-0 flex-1 truncate text-[15px] transition-colors hover:text-white/80">
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label="E-posta adresini kopyala"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-white hover:text-white"
              >
                {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
              </button>
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
                <p className="text-xl font-medium tracking-[-0.01em]">Mesaj bırakın</p>
                <p className="mb-3 text-[13px] text-white/45">Formu doldurun, en kısa sürede size dönüş yapayım.</p>
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
                  <label className="block">
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
                  <label className="relative block">
                    <span className="sr-only">Konu</span>
                    <select
                      name="subject"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      className={`${fieldInput} cursor-pointer appearance-none pr-6 [&>option]:bg-ink [&>option]:text-white ${topic ? '' : 'text-white/35'}`}
                    >
                      <option value="">Konu seçin</option>
                      {TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-white/40"
                      aria-hidden="true"
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

                <button
                  type="submit"
                  disabled={isPending}
                  className="group mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent hover:text-white disabled:opacity-60 sm:w-fit"
                >
                  {isPending ? 'Gönderiliyor…' : 'Gönder'}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

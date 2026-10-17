'use client';

import { useActionState, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Copy, Mail } from 'lucide-react';
import { submitContactAction } from '@/app/actions/messages';

const EMAIL = 'mehmetkerem2109@gmail.com';

// Cümle içinde okunacak şekilde yazıldı: "… [bir kurumsal site] için birlikte çalışmak istiyoruz."
const TOPICS = ['bir kurumsal site', 'bir web uygulaması', 'tasarımdan koda bir iş', 'hız ve SEO iyileştirmesi', 'başka bir konu'];

const FACTS = [
  { label: 'Konum', value: 'İstanbul, Türkiye' },
  { label: 'Çalışma şekli', value: 'Uzaktan veya yerinde' },
  { label: 'İş birliği', value: 'Proje bazlı · Ajans desteği · Uzun soluklu' },
];

const inlineField =
  'inline-block h-[1.35em] border-0 border-b-2 border-white/25 bg-transparent p-0 align-baseline font-medium leading-[1.2] text-white placeholder:text-white/30 outline-none transition-colors focus:border-accent';

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

  // Cümledeki konuyu ve isteğe bağlı notu, sunucunun beklediği subject/content alanlarına işler
  const submit = (formData: FormData) => {
    const topic = String(formData.get('topic') || '');
    const note = String(formData.get('note') || '').trim();
    formData.set('subject', `Konu: ${topic}`);
    formData.set('content', `Konu: ${topic}\n\n${note || '(Not eklenmedi)'}`);
    formData.delete('topic');
    formData.delete('note');
    formAction(formData);
  };

  return (
    <section id="contact" className="scroll-mt-16 px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-5 pt-20 pb-10 text-white md:rounded-[40px] md:px-8 md:pt-28 md:pb-12">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.32),transparent_65%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:28px_28px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl">
          <p className="animate-on-scroll font-mono text-[13px] uppercase tracking-[0.14em] text-[#93b4f8]">İletişim</p>
          <h2 className="animate-on-scroll mt-5 text-[clamp(2.6rem,7.4vw,6.4rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
            Bir sonraki projeniz{' '}
            <span className="inline-grid h-[0.8em] w-[1.5em] translate-y-[0.06em] rotate-6 place-items-center rounded-full bg-gradient-to-br from-accent to-[#6f9cf7] align-baseline shadow-[0_12px_30px_-12px_rgba(37,99,235,0.8)] transition-transform duration-500 hover:-rotate-6">
              <Mail className="h-[0.4em] w-[0.4em]" strokeWidth={2.2} aria-hidden="true" />
            </span>
            <br />
            <span className="font-serif-display text-[#93b4f8]">birlikte</span> başlasın.
          </h2>

          <div className="mt-16 grid gap-14 border-t border-white/10 pt-12 lg:grid-cols-12 lg:gap-16">
            <div className="animate-on-scroll lg:col-span-7 lg:order-2">
              {state?.success ? (
                <div className="flex min-h-[320px] flex-col items-start justify-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <Check size={30} />
                  </span>
                  <h3 className="mt-8 text-4xl font-semibold tracking-[-0.03em]">
                    Teşekkürler, <span className="font-serif-display text-[#93b4f8]">mesajınız ulaştı.</span>
                  </h3>
                  <p className="mt-4 max-w-md text-lg leading-relaxed text-white/65">{state.success}</p>
                </div>
              ) : (
                <form action={submit}>
                  <p className="text-[clamp(1.3rem,2.1vw,1.8rem)] leading-[2] tracking-[-0.015em] text-white/55">
                    Merhaba Mehmet, ben{' '}
                    <label className="sr-only" htmlFor="contact-name">Adınız soyadınız</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="adınız soyadınız"
                      suppressHydrationWarning
                      className={`${inlineField} w-[11ch]`}
                    />
                    .{' '}
                    <span className="relative inline-block">
                      <label className="sr-only" htmlFor="contact-topic">Konu</label>
                      <select
                        id="contact-topic"
                        name="topic"
                        defaultValue={TOPICS[0]}
                        className={`${inlineField} cursor-pointer appearance-none pr-[1.1em] [&>option]:bg-ink [&>option]:text-white`}
                      >
                        {TOPICS.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-0 top-1/2 h-[0.7em] w-[0.7em] -translate-y-1/2 text-[#93b4f8]"
                        aria-hidden="true"
                      />
                    </span>{' '}
                    için birlikte çalışmak istiyoruz. Bana{' '}
                    <label className="sr-only" htmlFor="contact-email">E-posta adresiniz</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="e-posta adresiniz"
                      suppressHydrationWarning
                      className={`${inlineField} w-[13ch]`}
                    />{' '}
                    adresinden ulaşabilirsin.
                  </p>

                  <label className="mt-8 block">
                    <span className="text-[13px] text-white/45">Eklemek istediğiniz bir not var mı? (isteğe bağlı)</span>
                    <textarea
                      name="note"
                      rows={2}
                      suppressHydrationWarning
                      placeholder="Kısaca proje, takvim ya da referans siteler…"
                      className="mt-2 w-full resize-none border-0 border-b border-white/15 bg-transparent px-0 pb-3 text-lg text-white placeholder:text-white/25 outline-none transition-colors focus:border-accent"
                    />
                  </label>

                  {state?.error && <p className="mt-5 text-sm text-rose-400">{state.error}</p>}

                  <div className="mt-8 flex flex-col-reverse items-start justify-between gap-5 sm:flex-row sm:items-center">
                    <p className="text-[13px] text-white/40">Bilgileriniz yalnızca size dönüş için kullanılır.</p>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-[15px] font-semibold text-ink transition-colors hover:bg-accent hover:text-white disabled:opacity-60 sm:w-auto"
                    >
                      {isPending ? 'Gönderiliyor…' : 'Mesajı gönder'}
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:rotate-[-45deg] group-hover:bg-white group-hover:text-accent">
                        <ArrowRight size={18} />
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="animate-on-scroll flex flex-col lg:col-span-5 lg:order-1">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/45">Ya da doğrudan yazın</p>
              <a
                href={`mailto:${EMAIL}`}
                className="group mt-3 flex w-fit max-w-full items-center gap-2 text-[clamp(1.1rem,1.9vw,1.55rem)] font-medium tracking-[-0.02em]"
              >
                <span className="break-all bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                  {EMAIL}
                </span>
                <ArrowUpRight size={22} className="shrink-0 text-[#93b4f8] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 transition-colors hover:border-white/40 hover:text-white"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                {copied ? 'Kopyalandı' : 'Adresi kopyala'}
              </button>

              <dl className="mt-12 divide-y divide-white/10 border-y border-white/10 lg:mt-auto">
                {FACTS.map((fact) => (
                  <div key={fact.label} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="text-sm text-white/45">{fact.label}</dt>
                    <dd className="text-right text-[15px] text-white/85">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

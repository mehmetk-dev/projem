import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const MARQUEE = ['Kurumsal web siteleri', 'E-ticaret', 'Web uygulamaları', 'Tasarımdan koda', 'Hız & SEO', 'Bakım ve destek'];

interface CtaBandProps {
  title: string;
  /** Başlığın sonunda italik serif ve vurgulu gösterilen kısım */
  accent?: string;
  text: string;
}

// Alt sayfaların sonunda iletişime yönlendiren bant: büyük başlık, dönen rozet ve kayan hizmet şeridi
export default function CtaBand({ title, accent, text }: CtaBandProps) {
  return (
    <section className="px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative overflow-hidden rounded-[28px] bg-ink text-white md:rounded-[36px]">
        {/* Arka plan: ışıma, nokta ızgara ve yörünge çizgileri */}
        <div
          className="pointer-events-none absolute -right-32 -top-48 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.38),transparent_65%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:26px_26px]"
          aria-hidden="true"
        />
        <svg
          viewBox="0 0 600 600"
          className="pointer-events-none absolute -right-40 top-1/2 h-[640px] w-[640px] -translate-y-1/2 text-white/10 md:-right-24"
          fill="none"
          aria-hidden="true"
        >
          <ellipse cx="300" cy="300" rx="280" ry="120" stroke="currentColor" transform="rotate(-18 300 300)" />
          <ellipse cx="300" cy="300" rx="220" ry="210" stroke="currentColor" strokeDasharray="3 9" />
          <ellipse cx="300" cy="300" rx="150" ry="60" stroke="currentColor" transform="rotate(24 300 300)" />
          <circle cx="545" cy="215" r="5" fill="#93b4f8" stroke="none" />
          <circle cx="120" cy="420" r="3.5" fill="white" fillOpacity="0.5" stroke="none" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-12 md:px-8 md:pt-20 md:pb-16">
          <p className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Sıradaki adım
          </p>

          <div className="mt-6 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[clamp(2.2rem,5.6vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
                {title}
                {accent && (
                  <>
                    {' '}
                    <span className="font-serif-display text-[#93b4f8]">{accent}</span>
                  </>
                )}
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/60">{text}</p>
            </div>

            <Link
              href="/#contact"
              aria-label="İletişime geç — proje başlatalım"
              className="group relative grid h-36 w-36 shrink-0 place-items-center self-end md:h-40 md:w-40 md:self-auto"
            >
              <svg viewBox="0 0 160 160" className="home-spin absolute inset-0 h-full w-full text-white/70" aria-hidden="true">
                <defs>
                  <path id="cta-band-circle" d="M80,80 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
                </defs>
                <text className="fill-current font-mono text-[11.5px] uppercase tracking-[0.32em]">
                  <textPath href="#cta-band-circle">İletişime geç • Proje başlatalım • </textPath>
                </text>
              </svg>
              <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-ink shadow-[0_16px_36px_-14px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:scale-110 group-hover:bg-accent group-hover:text-white md:h-[5.5rem] md:w-[5.5rem]">
                <ArrowUpRight size={28} className="transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </Link>
          </div>
        </div>

        {/* Kayan hizmet şeridi */}
        <div className="relative overflow-hidden border-t border-white/10 py-5" aria-hidden="true">
          <div className="flex w-max animate-scroll">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {MARQUEE.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-8 pr-8 text-[clamp(1.1rem,2vw,1.5rem)] font-medium tracking-[-0.02em] text-white/35"
                  >
                    {item}
                    <svg viewBox="-9 -9 18 18" className="h-3.5 w-3.5 text-[#93b4f8]" fill="currentColor">
                      <path d="M0 -9 C1 -2 2 -1 9 0 C2 1 1 2 0 9 C-1 2 -2 1 -9 0 C-2 -1 -1 -2 0 -9 Z" />
                    </svg>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

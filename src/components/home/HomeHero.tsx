import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Code2, PenTool } from 'lucide-react';
import IstanbulClock from './IstanbulClock';
import AvailabilityDot from './AvailabilityDot';
import type { Availability } from '@/lib/availability';
import type { HomeSocialLink } from './types';

const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties;

const chipClass =
  'inline-grid h-[0.8em] w-[1.5em] translate-y-[0.06em] place-items-center rounded-full align-baseline transition-transform duration-500';

export default function HomeHero({ socialLinks, availability }: { socialLinks: HomeSocialLink[]; availability: Availability }) {
  return (
    <section id="about" className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="home-dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-48 left-1/2 h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(37,99,235,0.13),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div
          className="home-reveal flex flex-wrap items-center gap-4 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted"
          style={delay(0)}
        >
          <span>İstanbul — <IstanbulClock /></span>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-ink-soft backdrop-blur">
            <AvailabilityDot status={availability.status} />
            {availability.note}
          </span>
        </div>

        <h1 className="mt-10 text-[clamp(2.7rem,8.6vw,7.6rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink md:mt-14">
          <span className="home-reveal block" style={delay(0.08)}>
            Tasarımı{' '}
            <span
              className={`${chipClass} rotate-6 bg-gradient-to-br from-accent to-[#6f9cf7] text-white shadow-[0_12px_30px_-12px_rgba(37,99,235,0.7)] hover:-rotate-6`}
            >
              <PenTool className="h-[0.4em] w-[0.4em]" strokeWidth={2.2} aria-hidden="true" />
            </span>{' '}
            <span className="font-serif-display text-accent">koda,</span>
          </span>
          <span className="home-reveal block" style={delay(0.16)}>
            fikri{' '}
            <span
              className={`${chipClass} -rotate-6 bg-ink text-paper shadow-[0_12px_30px_-12px_rgba(12,10,9,0.6)] hover:rotate-6`}
            >
              <Code2 className="h-[0.42em] w-[0.42em]" strokeWidth={2.2} aria-hidden="true" />
            </span>{' '}
            <span className="font-serif-display">ürüne</span>
          </span>
          <span className="home-reveal block" style={delay(0.24)}>
            dönüştürüyorum.
          </span>
        </h1>

        <div
          className="home-reveal mt-14 flex flex-col gap-10 border-t border-line pt-10 md:mt-20 md:flex-row md:items-center md:justify-between"
          style={delay(0.34)}
        >
          <div className="max-w-xl">
            <p className="text-xl leading-relaxed text-ink-soft md:text-2xl md:leading-snug">
              <span className="text-ink">Ajanslar ve markalar için</span> kurumsal siteler ve özel web uygulamaları
              geliştiriyorum. Tasarım ekibinizin emeğini birebir yayına taşıyorum.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
              <Link
                href="#work"
                className="group inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-accent"
              >
                <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                Seçili işlere göz atın
              </Link>
              {socialLinks.slice(0, 3).map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-ink-muted transition-colors hover:text-ink"
                >
                  {link.platform}
                  <ArrowUpRight size={13} />
                </a>
              ))}
            </div>
          </div>

          <Link
            href="#contact"
            aria-label="Bir proje başlatalım — iletişim bölümüne git"
            className="group relative grid h-36 w-36 shrink-0 place-items-center self-end md:h-40 md:w-40 md:self-auto"
          >
            <svg viewBox="0 0 160 160" className="home-spin absolute inset-0 h-full w-full text-ink" aria-hidden="true">
              <defs>
                <path id="hero-cta-circle" d="M80,80 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
              </defs>
              <text className="fill-current font-mono text-[11.5px] uppercase tracking-[0.32em]">
                <textPath href="#hero-cta-circle">Proje başlatalım • Proje başlatalım • </textPath>
              </text>
            </svg>
            <span className="grid h-20 w-20 place-items-center rounded-full bg-ink text-paper shadow-[0_16px_36px_-14px_rgba(12,10,9,0.6)] transition-all duration-500 group-hover:scale-110 group-hover:bg-accent md:h-[5.5rem] md:w-[5.5rem]">
              <ArrowUpRight size={28} className="transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

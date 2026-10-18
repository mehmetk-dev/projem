import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Search } from 'lucide-react';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı | Mehmet Kerem',
  description: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
};

const SHORTCUTS = [
  { href: '/projects', label: 'Projeler' },
  { href: '/blog', label: 'Blog' },
  { href: '/hakkimda', label: 'Hakkımda' },
  { href: '/#contact', label: 'İletişim' },
];

export default async function NotFoundPage() {
  const socialLinks = await getSocialLinks().catch(() => []);

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[480px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Hata 404</p>
          <p
            className="home-reveal mt-4 select-none text-[clamp(7rem,26vw,15rem)] font-semibold leading-[0.8] tracking-[-0.07em] text-ink"
            aria-hidden="true"
          >
            4<span className="font-serif-display text-accent">0</span>4
          </p>
          <h1 className="home-reveal mt-8 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
            Bu sayfa <span className="font-serif-display text-accent">bulunamadı.</span>
          </h1>
          <p className="home-reveal mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Aradığınız sayfa kaldırılmış, taşınmış ya da hiç var olmamış olabilir. Aşağıdan aramayı deneyin ya da bir
            kısayolla devam edin.
          </p>

          <form
            action="/search"
            method="GET"
            role="search"
            className="home-reveal mx-auto mt-9 flex max-w-md items-center gap-2 rounded-full border border-line bg-surface p-1.5 pl-5 transition-colors focus-within:border-accent"
            style={{ '--d': '0.08s' } as React.CSSProperties}
          >
            <Search size={18} className="shrink-0 text-ink-muted" aria-hidden="true" />
            <label htmlFor="notfound-q" className="sr-only">
              Sitede ara
            </label>
            <input
              id="notfound-q"
              name="q"
              type="search"
              minLength={2}
              placeholder="Sitede ara..."
              className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink placeholder:text-ink-muted/70 outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent"
            >
              Ara
            </button>
          </form>

          <div className="home-reveal mt-8 flex flex-wrap justify-center gap-3" style={{ '--d': '0.12s' } as React.CSSProperties}>
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
            >
              Ana sayfaya dön
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            {SHORTCUTS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

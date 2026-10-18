import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNowPage } from '@/app/actions/settings';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';
import PostBody from '@/components/blog/PostBody';
import { formatPostDate } from '@/components/blog/post-utils';
import { ogImageUrl } from '@/lib/site';

export const revalidate = 3600;

const description = 'Bu aralar üzerinde çalıştığım işler, öğrendiklerim ve odaklandığım şeyler.';

export const metadata: Metadata = {
  title: 'Şimdi | Mehmet Kerem',
  description,
  alternates: { canonical: '/simdi' },
  openGraph: {
    title: 'Şimdi | Mehmet Kerem',
    description,
    type: 'website',
    locale: 'tr_TR',
    images: [ogImageUrl('Bu aralar neler yapıyorum?', description, 'Şimdi')],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Şimdi | Mehmet Kerem',
    description,
    images: [ogImageUrl('Bu aralar neler yapıyorum?', description, 'Şimdi')],
  },
};

// Panelde Ayarlar > "Şimdi" sayfası'ndan yazılan markdown; içerik boşsa sayfa yoktur
export default async function NowPage() {
  const [now, socialLinks] = await Promise.all([getNowPage(), getSocialLinks().catch(() => [])]);
  if (!now.content) notFound();

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 md:px-8">
          <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Şimdi</p>
          <h1 className="home-reveal mt-3 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink md:text-6xl">
            Bu aralar <span className="font-serif-display text-accent">neler yapıyorum?</span>
          </h1>
          <p className="home-reveal mt-4 text-[17px] leading-relaxed text-ink-soft md:mt-5 md:text-xl">{description}</p>
          {now.updatedAt && (
            <p className="home-reveal mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Son güncelleme: <time dateTime={now.updatedAt}>{formatPostDate(now.updatedAt)}</time>
            </p>
          )}

          <div className="home-reveal mt-12 md:mt-14" style={{ '--d': '0.08s' } as CSSProperties}>
            <PostBody content={now.content} />
          </div>

          <p className="mt-16 border-t border-line pt-6 text-[14px] text-ink-muted">
            Bu bir “now” sayfası; fikir{' '}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-accent"
            >
              Derek Sivers
            </a>
            &apos;tan. Arada bir güncellerim.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}

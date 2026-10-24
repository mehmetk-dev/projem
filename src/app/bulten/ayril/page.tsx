import type { Metadata } from 'next';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';
import UnsubscribeForm from './UnsubscribeForm';
import { ogCommon, ogImages } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Bültenden Ayrıl | Mehmet Kerem',
  description: 'E-posta bülteni aboneliğinizi sonlandırın.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Bültenden Ayrıl | Mehmet Kerem',
    description: 'E-posta bülteni aboneliğinizi sonlandırın.',
    type: 'website',
    url: '/bulten/ayril',
    ...ogCommon,
    images: ogImages('Bültenden Ayrıl', 'E-posta bülteni aboneliğinizi sonlandırın.', 'Bülten'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bültenden Ayrıl | Mehmet Kerem',
    description: 'E-posta bülteni aboneliğinizi sonlandırın.',
    images: ogImages('Bültenden Ayrıl', 'E-posta bülteni aboneliğinizi sonlandırın.', 'Bülten'),
  },
};

interface UnsubscribePageProps {
  searchParams: Promise<{ email?: string }>;
}

// E-postalardaki "ayrıl" bağlantısı ?email= ile gelirse alan önceden dolar
export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const [{ email }, socialLinks] = await Promise.all([searchParams, getSocialLinks().catch(() => [])]);

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-xl px-5 md:px-8">
          <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Bülten</p>
          <h1 className="home-reveal mt-3 text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink md:text-5xl">
            Bültenden <span className="font-serif-display text-accent">ayrılın.</span>
          </h1>
          <p className="home-reveal mt-4 text-[17px] leading-relaxed text-ink-soft">
            E-posta adresinizi yazın; listeden çıkarıldıktan sonra size bülten gönderilmez.
          </p>
          <div className="home-reveal mt-9 rounded-2xl border border-line bg-surface p-5 md:p-7" style={{ '--d': '0.08s' } as React.CSSProperties}>
            <UnsubscribeForm defaultEmail={email?.slice(0, 200) ?? ''} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

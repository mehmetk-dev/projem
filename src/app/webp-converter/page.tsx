import type { Metadata } from 'next';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';
import WebpConverterSection from '@/components/WebpConverterSection';

const title = 'WebP Dönüştürücü | Mehmet Kerem';
const description =
  'PNG ve JPG görsellerinizi anında modern WebP formatına çevirin. Tamamen tarayıcınızda çalışır, resimleriniz hiçbir sunucuya yüklenmez.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/webp-converter' },
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'tr_TR',
  },
};

export const revalidate = 3600;

export default async function WebpConverterPage() {
  const socialLinks = await getSocialLinks().catch(() => []);

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-5 md:px-8">
          <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Araçlar</p>
          <h1 className="home-reveal mt-3 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink md:text-6xl">
            WebP <span className="font-serif-display text-accent">dönüştürücü</span>
          </h1>
          <p className="home-reveal mt-5 max-w-xl text-[16px] leading-relaxed text-ink-soft">
            PNG ve JPG görsellerinizi anında modern WebP formatına çevirin. Tamamen tarayıcınızda çalışır, resimleriniz
            hiçbir sunucuya yüklenmez.
          </p>

          <div className="home-reveal mt-10">
            <WebpConverterSection />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

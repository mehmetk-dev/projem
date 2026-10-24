import type { Metadata } from 'next';
import { getPublishedProjects } from '@/app/actions/projects';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';
import ProjectsArchive from '@/components/home/ProjectsArchive';
import CtaBand from '@/components/home/CtaBand';
import { ogCommon, ogImages } from '@/lib/site';

export const revalidate = 3600;

const description =
  'Kurumsal web sitelerinden özel web uygulamalarına; tasarımdan yayına kadar uçtan uca geliştirdiğim projeler.';

export const metadata: Metadata = {
  title: 'Projeler | Mehmet Kerem',
  description,
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Projeler | Mehmet Kerem',
    description,
    type: 'website',
    url: '/projects',
    ...ogCommon,
    images: ogImages('Projeler', description),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projeler | Mehmet Kerem',
    description,
    images: ogImages('Projeler', description),
  },
};

export default async function ProjectsListPage() {
  const [projectList, socialLinks] = await Promise.all([
    getPublishedProjects().catch(() => []),
    getSocialLinks().catch(() => []),
  ]);

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Portfolyo</p>
            <h1 className="home-reveal mt-3 text-5xl font-semibold tracking-[-0.035em] text-ink md:text-6xl">
              Projeler
            </h1>
            <p className="home-reveal mt-5 text-lg leading-relaxed text-ink-soft md:text-xl">
              {description} Her birinin arkasındaki ihtiyacı, çözümü ve sonucu detay sayfalarında bulabilirsiniz.
            </p>
          </div>

          <div className="mt-14">
            <ProjectsArchive projects={projectList} />
          </div>
        </div>
      </section>

      <CtaBand
        title="Sıradaki proje"
        accent="sizinki olabilir."
        text="Benzer bir işe mi ihtiyacınız var? Kapsamı birlikte netleştirelim, size özel bir yol haritası çıkarayım."
      />
    </SiteShell>
  );
}

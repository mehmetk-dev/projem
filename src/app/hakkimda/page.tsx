import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getPublishedProjects } from '@/app/actions/projects';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';
import CtaBand from '@/components/home/CtaBand';
import IstanbulClock from '@/components/home/IstanbulClock';
import { projectCover, projectStack } from '@/components/home/project-utils';
import ProjectIndex from '@/components/home/ProjectIndex';
import Workbench, { type WorkbenchProject } from '@/components/about/Workbench';
import { ogImageUrl } from '@/lib/site';

export const revalidate = 3600;

const description =
  'İstanbul’da yaşayan full-stack web geliştirici. Ajanslar ve markalar için kurumsal web siteleri ve özel web uygulamaları geliştiriyorum.';

export const metadata: Metadata = {
  title: 'Hakkımda | Mehmet Kerem',
  description,
  alternates: { canonical: '/hakkimda' },
  openGraph: {
    title: 'Hakkımda | Mehmet Kerem',
    description,
    type: 'profile',
    locale: 'tr_TR',
    images: [ogImageUrl('Hakkımda', description)],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hakkımda | Mehmet Kerem',
    description,
    images: [ogImageUrl('Hakkımda', description)],
  },
};

export default async function AboutPage() {
  const [projects, socialLinks] = await Promise.all([
    getPublishedProjects().catch(() => []),
    getSocialLinks().catch(() => []),
  ]);

  // Rakamlar yayındaki projelerden hesaplanır; elle yazılmış iddia yok
  const technologies = Array.from(new Set(projects.flatMap((project) => projectStack(project))));
  const categories = Array.from(new Set(projects.map((project) => project.category)));

  // Her yetenek satırı, o türdeki gerçek bir projeyle örneklenir
  const exampleOf = (match: (project: (typeof projects)[number]) => boolean) => {
    const project = projects.find(match);
    return project ? { title: project.title, slug: project.slug, cover: projectCover(project) } : undefined;
  };
  const workbenchProjects = [
    { note: 'e-ticaret', example: exampleOf((project) => /ticaret/i.test(project.category)) },
    { note: 'web uygulaması', example: exampleOf((project) => /saas|uygulama/i.test(project.category)) },
    { note: 'tasarımdan koda', example: exampleOf((project) => /tasarım/i.test(project.role) && /ajans/i.test(project.category)) },
  ].flatMap(({ note, example }): WorkbenchProject[] => (example ? [{ ...example, note }] : []));
  const stats = [
    { value: projects.length, label: 'Yayındaki proje' },
    { value: categories.length, label: 'Farklı sektör ve proje türü' },
    { value: technologies.length, label: 'Projelerde kullanılan teknoloji' },
  ].filter((stat) => stat.value > 0);

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      {/* Giriş */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-24">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 md:px-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Hakkımda</p>
            <h1 className="home-reveal mt-3 text-[2.8rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink md:text-7xl">
              Merhaba, ben <span className="font-serif-display text-accent">Mehmet.</span>
            </h1>
            <div className="home-reveal mt-6 max-w-xl space-y-4 text-[17px] leading-relaxed text-ink-soft md:text-lg" style={{ '--d': '0.08s' } as React.CSSProperties}>
              <p>
                İstanbul’da yaşayan bir full-stack web geliştiriciyim. Ajanslar ve markalar için kurumsal web siteleri ve
                özel web uygulamaları geliştiriyorum.
              </p>
              <p>
                Tasarımdan yayına kadar işin her aşamasında yer alıyorum: ihtiyacı dinliyor, planlıyor, kodluyor ve
                yayından sonra da destek veriyorum. Hedefim; hızlı, erişilebilir ve bakımı kolay ürünler çıkarmak.
              </p>
            </div>
            <div
              className="home-reveal mt-9 flex flex-wrap items-center gap-x-8 gap-y-5"
              style={{ '--d': '0.14s' } as React.CSSProperties}
            >
              {/* Birincil: üzerine gelince yazı yukarı yuvarlanır, daire maviye döner */}
              <Link
                href="/projects"
                className="group inline-flex items-center gap-4 rounded-full bg-ink py-1.5 pl-6 pr-1.5 text-[15px] font-semibold text-paper shadow-[0_18px_40px_-18px_rgba(12,10,9,0.7)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-18px_rgba(37,99,235,0.6)] active:translate-y-0"
              >
                <span className="relative block h-[1.3em] overflow-hidden">
                  <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                    Projelerimi incele
                  </span>
                  <span
                    className="absolute inset-x-0 top-full block text-[#93b4f8] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full"
                    aria-hidden="true"
                  >
                    Projelerimi incele
                  </span>
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-paper text-ink transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                  <ArrowRight size={18} className="transition-transform duration-500 group-hover:-rotate-45" />
                </span>
              </Link>

              {/* İkincil: müsaitlik noktası ve çizilen alt çizgiyle sade metin bağlantısı */}
              <Link href="/#contact" className="group inline-flex items-center gap-3 text-[15px] font-semibold text-ink">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="relative">
                  İletişime geç
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-[0.25] rounded-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-hover:bg-accent" />
                </span>
                <ArrowRight
                  size={16}
                  className="-ml-1 transition-[transform,color] duration-500 group-hover:translate-x-1.5 group-hover:text-accent"
                />
              </Link>
            </div>
          </div>

          <div className="home-reveal lg:col-span-5" style={{ '--d': '0.1s' } as React.CSSProperties}>
            <div className="relative mx-auto max-w-[380px] lg:max-w-none">
              <div
                className="absolute -inset-3 rotate-3 rounded-[32px] bg-gradient-to-br from-accent-soft to-surface-2"
                aria-hidden="true"
              />
              {/* Arka planı şeffaf portre, tasarlanmış zeminin üstünde */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-gradient-to-b from-[#3b82f6] via-accent to-[#1e3a8a] shadow-[0_40px_80px_-40px_rgba(30,58,138,0.7)]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:20px_20px]"
                  aria-hidden="true"
                />
                <svg viewBox="0 0 400 500" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
                  <circle cx="200" cy="215" r="150" fill="white" fillOpacity="0.1" />
                  <circle cx="200" cy="215" r="185" stroke="white" strokeOpacity="0.22" />
                  <circle cx="200" cy="215" r="225" stroke="white" strokeOpacity="0.12" strokeDasharray="3 8" />
                </svg>
                <span
                  className="pointer-events-none absolute left-5 top-4 font-serif-display text-[5.5rem] leading-none text-white/15 md:text-[7rem]"
                  aria-hidden="true"
                >
                  MK
                </span>
                <Image
                  src="/images/mehmet-kerem.webp"
                  alt="Mehmet Kerem"
                  width={960}
                  height={1000}
                  priority
                  sizes="(max-width: 1024px) 380px, 460px"
                  className="absolute inset-x-0 bottom-0 h-[92%] w-full object-contain object-bottom"
                />
              </div>
              <span className="absolute -left-3 bottom-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface/95 px-4 py-2 text-[13px] font-medium text-ink shadow-[0_12px_30px_-12px_rgba(12,10,9,0.35)] backdrop-blur md:-left-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Yeni projelere açığım
              </span>
              <span className="absolute -right-2 top-6 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-mono text-[12px] text-paper shadow-[0_12px_30px_-12px_rgba(12,10,9,0.5)] md:-right-5">
                İstanbul · <IstanbulClock />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Rakamlar */}
      {stats.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 md:px-8">
          <dl className="grid grid-cols-3 divide-x divide-line border-y border-line">
            {stats.map((stat) => (
              <div key={stat.label} className="animate-on-scroll px-3 py-5 first:pl-0 sm:px-6 sm:py-8">
                <dt className="text-[12px] leading-snug text-ink-muted sm:text-[14px]">{stat.label}</dt>
                <dd className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl md:text-6xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Çalışma masası kolajı: yetenekler ve araçlar */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="animate-on-scroll flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Yetenekler & araçlar</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink md:text-5xl">
                Çalışma masamdan <span className="font-serif-display text-accent">bir kesit.</span>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink-muted">
              Tasarım, kod ve yayın aynı masada. Pencerelere tıklayın; her biri gerçek bir proje.
            </p>
          </div>
          <div className="animate-on-scroll mt-10 md:mt-14">
            <Workbench projects={workbenchProjects} technologies={technologies} />
          </div>
          <p className="sr-only">Kullandığım teknolojiler: {technologies.join(', ')}.</p>
        </div>
      </section>

      {/* Seçili işler */}
      {projects.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="animate-on-scroll flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Seçili işler</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink md:text-5xl">Neler yaptım?</h2>
              </div>
            </div>
            <ProjectIndex projects={projects} title={`${projects.length} proje`} className="mt-10 md:mt-12" />
          </div>
        </section>
      )}

      <CtaBand
        title="Birlikte çalışmaya"
        accent="ne dersiniz?"
        text="Fikrinizi kısaca anlatın; size en uygun yol haritasıyla geri döneyim."
      />
    </SiteShell>
  );
}

import { getPublishedProjects } from '@/app/actions/projects';
import { getSocialLinks } from '@/app/actions/social';
import { getPublishedTestimonials } from '@/app/actions/testimonials';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ViewTransition, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getProjectImages } from '@/lib/utils';
import SiteShell from '@/components/home/SiteShell';
import CtaBand from '@/components/home/CtaBand';
import ProjectShot from '@/components/home/ProjectShot';
import ImageWithFallback from '@/components/ImageWithFallback';
import { projectCover, projectCoverTransition, projectHost, projectResults, projectStack, projectTeaser } from '@/components/home/project-utils';
import { QuoteMark, TestimonialPerson } from '@/components/home/Testimonials';
import JsonLd from '@/components/JsonLd';
import { siteUrl, sitePerson, ogImages, ogCommon } from '@/lib/site';

export const revalidate = 3600;

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const list = await getPublishedProjects();
    return list.map((project) => ({
      slug: project.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  // getPublishedProjects React cache ile istek başına tek sorguya iner; sayfa da aynı sonucu kullanır
  const project = (await getPublishedProjects()).find((item) => item.slug === slug);

  if (!project) {
    return { title: 'Bulunamadı | Mehmet Kerem' };
  }

  const description = projectTeaser(project) || 'Mehmet Kerem tarafından geliştirilmiş bir proje.';
  const cover = projectCover(project);
  // SVG yer tutucu sosyal ağlarda görünmez; o durumda dinamik OG görseli üretilir
  const ogImage = cover.endsWith('.svg')
    ? ogImages(project.title, description, ['Proje', project.category].filter(Boolean).join(' · '))
    : [{ url: cover, alt: project.title }];

  return {
    title: `${project.title} | Projeler | Mehmet Kerem`,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} | Mehmet Kerem`,
      description,
      type: 'website',
      url: `/projects/${project.slug}`,
      ...ogCommon,
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | Mehmet Kerem`,
      description,
      images: ogImage,
    },
  };
}

interface StoryBlock {
  heading: string | null;
  paragraphs: string[];
}

/**
 * Açıklamayı bölümlere ayırır. Tek satırlık kısa ilk satır ("İhtiyaç", "Çözüm"…) bölüm başlığı sayılır;
 * başlıksız paragraflar bir önceki bölüme eklenir.
 */
function storyBlocks(description: string): StoryBlock[] {
  const blocks: StoryBlock[] = [];
  for (const chunk of description.split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean)) {
    const [first, ...rest] = chunk.split('\n');
    const isHeading = rest.length > 0 && first.length <= 32 && !/[.!?:]$/.test(first);
    if (isHeading) {
      blocks.push({ heading: first, paragraphs: [rest.join('\n')] });
    } else if (blocks.length > 0) {
      blocks[blocks.length - 1].paragraphs.push(chunk);
    } else {
      blocks.push({ heading: null, paragraphs: [chunk] });
    }
  }
  return blocks;
}

/**
 * Kapak dışındaki görselleri bölümlere dağıtır. Görsel her bölüme yetmiyorsa "Sonuç" koyu bant olarak
 * görselsiz kalır; diğer bölümlere de yetmiyorsa ilk bölüm (genelde "İhtiyaç") atlanır.
 */
function assignImages(blocks: StoryBlock[], images: string[]) {
  const byBlock = new Map<number, string>();
  const targets =
    images.length >= blocks.length
      ? blocks.map((_, i) => i)
      : blocks.flatMap((block, i) => (isResult(block.heading) ? [] : [i]));
  const slots = images.length < targets.length ? targets.slice(1) : targets;
  slots.forEach((index, i) => {
    if (i < images.length) byBlock.set(index, images[i]);
  });
  const leftover = images.slice(slots.length);
  return { byBlock, leftover };
}

// Sonuç sayısına göre geniş ekran sütunları (Tailwind sınıfları statik kalmalı)
const RESULT_COLUMNS: Record<number, string> = {
  1: '',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

const isResult = (heading: string | null) => !!heading && /^sonuç/i.test(heading);

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;

  const [allProjects, socialLinks, testimonials] = await Promise.all([
    getPublishedProjects(),
    getSocialLinks().catch(() => []),
    getPublishedTestimonials(),
  ]);
  const project = allProjects.find((item) => item.slug === slug);

  if (!project) {
    // "canantika" gibi tiresiz/farklı yazılmış adresleri doğru slug'a yönlendir
    const loose = (value: string) => decodeURIComponent(value).toLowerCase().replace(/[^a-z0-9]/g, '');
    const match = allProjects.find((item) => loose(item.slug) === loose(slug));
    if (match) permanentRedirect(`/projects/${match.slug}`);
    notFound();
  }

  const [cover, ...restImages] = getProjectImages(project.image);
  const stack = projectStack(project);
  const results = projectResults(project);
  const testimonial = testimonials.find((item) => item.projectId === project.id);
  const host = projectHost(project);
  const blocks = project.description ? storyBlocks(project.description) : [];
  const { byBlock, leftover } = assignImages(blocks, restImages);
  const currentIndex = allProjects.findIndex((item) => item.id === project.id);
  const nextProject =
    allProjects.length > 1 ? allProjects[(currentIndex + 1) % allProjects.length] : null;

  const facts = [
    project.client && { label: 'Müşteri', value: project.client },
    project.role && { label: 'Rolüm', value: project.role },
    project.year && { label: 'Yıl', value: String(project.year) },
    { label: 'Kategori', value: project.category },
  ].filter(Boolean) as { label: string; value: string }[];

  let imageSide = 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: projectTeaser(project) || undefined,
    url: `${siteUrl}/projects/${project.slug}`,
    image: cover ? new URL(cover, siteUrl).toString() : undefined,
    dateCreated: project.year ? String(project.year) : undefined,
    genre: project.category,
    keywords: stack.join(', ') || undefined,
    creator: sitePerson,
  };

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <JsonLd data={jsonLd} />
      <article className="pt-24 pb-20 md:pt-36 md:pb-32">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Tüm projeler
          </Link>

          <header className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-8">
              <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">
                Vaka çalışması
              </p>
              <h1 className="home-reveal mt-3 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.04em] text-ink md:text-7xl">
                {project.title}
              </h1>
              {project.summary && (
                <p className="home-reveal mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft md:mt-6 md:text-2xl md:leading-snug">
                  {project.summary}
                </p>
              )}
            </div>
            {project.link && (
              <div className="lg:col-span-4 lg:text-right">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent md:px-6 md:py-3.5 md:text-[15px]"
                >
                  Canlı siteyi ziyaret et
                  <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            )}
          </header>

          {cover && (
            <div className="home-reveal mt-8 md:mt-12" style={{ '--d': '0.15s' } as CSSProperties}>
              <ViewTransition name={projectCoverTransition(project.slug)} share="morph">
                <ProjectShot src={cover} alt={`${project.title} — kapak görseli`} host={host} priority />
              </ViewTransition>
            </div>
          )}

          <div className="mt-10 border-y border-line py-5 md:mt-12 md:py-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4 md:gap-6">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[13px] text-ink-muted">{fact.label}</dt>
                  <dd className="mt-1 text-[15px] font-medium text-ink md:text-base">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {stack.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-5 md:mt-6">
                <span className="w-full text-[13px] text-ink-muted sm:mr-2 sm:w-auto">Teknolojiler</span>
                {stack.map((tech) => (
                  <span key={tech} className="rounded-full bg-surface-2 px-3 py-1 text-[13px] text-ink-soft">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {results.length > 0 && (
            <section
              aria-label="Sonuçlar"
              className={`animate-on-scroll mt-10 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line md:mt-12 md:rounded-[28px] ${
                results.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              } ${RESULT_COLUMNS[results.length]}`}
            >
              {results.map((result, index) => (
                <div
                  key={`${result.value}-${index}`}
                  className={`bg-surface p-6 md:p-9 ${
                    results.length % 2 === 1 && index === results.length - 1 && results.length > 1 ? 'col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <p className="text-[2.6rem] font-semibold leading-none tracking-[-0.045em] text-ink md:text-6xl">
                    {result.value}
                  </p>
                  {result.label && <p className="mt-3 text-[14px] leading-snug text-ink-muted md:text-[15px]">{result.label}</p>}
                </div>
              ))}
            </section>
          )}

          {blocks.length === 0 ? (
            <p className="mx-auto mt-16 max-w-2xl text-center text-base leading-relaxed text-ink-muted md:mt-20 md:text-lg">
              Bu projenin detaylı anlatımı yakında eklenecek. Merak ettikleriniz için bana doğrudan ulaşabilirsiniz.
            </p>
          ) : (
            <div className="mt-16 flex flex-col gap-16 md:mt-32 md:gap-32">
              {blocks.map((block, index) => {
                const image = byBlock.get(index);
                const number = String(index + 1).padStart(2, '0');
                const label = (
                  <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">{number}</p>
                );
                const body = block.paragraphs.map((paragraph, i) => (
                  <p key={i} className="whitespace-pre-wrap text-base leading-relaxed text-ink-soft md:text-lg">
                    {paragraph}
                  </p>
                ));

                if (isResult(block.heading) && !image) {
                  return (
                    <section
                      key={index}
                      className="animate-on-scroll rounded-[24px] bg-ink px-6 py-10 text-white md:rounded-[32px] md:px-14 md:py-16"
                    >
                      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#93b4f8]">
                        {number} — {block.heading}
                      </p>
                      {block.paragraphs.map((paragraph, i) => (
                        <p
                          key={i}
                          className="mt-4 max-w-3xl whitespace-pre-wrap text-xl font-medium leading-snug tracking-[-0.02em] md:mt-5 md:text-4xl"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </section>
                  );
                }

                if (image) {
                  const reversed = imageSide++ % 2 === 1;
                  return (
                    <section key={index} className="animate-on-scroll grid items-center gap-6 md:gap-10 lg:grid-cols-12 lg:gap-14">
                      <div className={`lg:col-span-5 ${reversed ? 'lg:order-2' : ''}`}>
                        {label}
                        {block.heading && (
                          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink md:mt-3 md:text-4xl">
                            {block.heading}
                          </h2>
                        )}
                        <div className="mt-4 space-y-4 md:mt-5">{body}</div>
                      </div>
                      <div className={`lg:col-span-7 ${reversed ? 'lg:order-1' : ''}`}>
                        <ProjectShot src={image} alt={`${project.title} — ${block.heading ?? 'görsel'}`} host={host} />
                      </div>
                    </section>
                  );
                }

                return (
                  <section key={index} className="animate-on-scroll grid gap-4 md:gap-6 lg:grid-cols-12 lg:gap-14">
                    <div className="lg:col-span-4">
                      {label}
                      {block.heading && (
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink md:mt-3 md:text-4xl">
                          {block.heading}
                        </h2>
                      )}
                    </div>
                    <div className="space-y-4 lg:col-span-8 lg:pt-8">{body}</div>
                  </section>
                );
              })}
            </div>
          )}

          {leftover.length > 0 && (
            <section className="mt-16 md:mt-32">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">Galeri</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink md:mt-3 md:text-4xl">Diğer ekranlar</h2>
              <div className="mt-6 grid gap-5 md:mt-10 md:grid-cols-2 md:gap-8">
                {leftover.map((image, i) => (
                  <div key={image} className={leftover.length % 2 === 1 && i === 0 ? 'md:col-span-2' : undefined}>
                    <ProjectShot src={image} alt={`${project.title} — ek görsel ${i + 1}`} host={host} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {testimonial && (
            <figure className="animate-on-scroll mt-16 grid gap-6 border-t border-line pt-10 md:mt-32 md:pt-14 lg:grid-cols-12 lg:gap-14">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent lg:col-span-4">Müşterinin gözünden</p>
              <div className="lg:col-span-8">
                <QuoteMark className="text-accent" />
                <blockquote className="mt-2 text-2xl font-medium leading-snug tracking-[-0.02em] text-ink md:text-4xl">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-8">
                  <TestimonialPerson testimonial={testimonial} />
                </figcaption>
              </div>
            </figure>
          )}

          {nextProject && (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="group mt-16 flex items-center gap-4 rounded-3xl border border-line bg-surface p-3 transition-colors hover:border-ink/20 md:mt-32 md:gap-6 md:p-6"
            >
              <div className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2 md:w-64">
                <ImageWithFallback
                  src={projectCover(nextProject)}
                  alt={nextProject.title}
                  fill
                  sizes="(max-width: 768px) 112px, 256px"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  hideOnError
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-ink-muted md:text-sm">Sıradaki proje</p>
                <p className="mt-0.5 truncate text-lg font-semibold tracking-tight text-ink transition-colors group-hover:text-accent md:mt-1 md:text-3xl">
                  {nextProject.title}
                </p>
              </div>
              <span className="mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-white md:mr-0 md:h-12 md:w-12">
                <ArrowRight size={20} />
              </span>
            </Link>
          )}
        </div>
      </article>

      <CtaBand
        title="Benzer bir projeniz"
        accent="mi var?"
        text="İhtiyacınızı birkaç cümleyle anlatın, nasıl bir yol izleyebileceğimizi birlikte konuşalım."
      />
    </SiteShell>
  );
}

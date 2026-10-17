import { getPublishedProjects } from '@/app/actions/projects';
import { getSocialLinks } from '@/app/actions/social';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getProjectImages } from '@/lib/utils';
import SiteShell from '@/components/home/SiteShell';
import CtaBand from '@/components/home/CtaBand';
import ProjectShot from '@/components/home/ProjectShot';
import ImageWithFallback from '@/components/ImageWithFallback';
import { projectCover, projectHost, projectStack, projectTeaser } from '@/components/home/project-utils';

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
  const project = (await getPublishedProjects().catch(() => [])).find((item) => item.slug === slug);

  if (!project) {
    return { title: 'Bulunamadı | Mehmet Kerem' };
  }

  const description = projectTeaser(project) || 'Mehmet Kerem tarafından geliştirilmiş bir proje.';

  return {
    title: `${project.title} | Projeler | Mehmet Kerem`,
    description,
    openGraph: {
      title: `${project.title} | Mehmet Kerem`,
      description,
      type: 'article',
      locale: 'tr_TR',
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

/** Kapak dışındaki görselleri bölümlere dağıtır; görsel azsa ilk bölümü (genelde "İhtiyaç") atlar */
function assignImages(blocks: StoryBlock[], images: string[]) {
  const byBlock = new Map<number, string>();
  const offset = images.length < blocks.length ? 1 : 0;
  images.forEach((image, i) => {
    const index = i + offset;
    if (index < blocks.length) byBlock.set(index, image);
  });
  const leftover = images.slice(Math.max(0, blocks.length - offset));
  return { byBlock, leftover };
}

const isResult = (heading: string | null) => !!heading && /^sonuç/i.test(heading);

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;

  const [allProjects, socialLinks] = await Promise.all([
    getPublishedProjects().catch(() => []),
    getSocialLinks().catch(() => []),
  ]);
  const project = allProjects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  const [cover, ...restImages] = getProjectImages(project.image);
  const stack = projectStack(project);
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

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <article className="pt-28 pb-24 md:pt-36 md:pb-32">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Tüm projeler
          </Link>

          <header className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">
                Vaka çalışması
              </p>
              <h1 className="home-reveal mt-3 text-5xl font-semibold tracking-[-0.04em] text-ink md:text-7xl">
                {project.title}
              </h1>
              {project.summary && (
                <p className="home-reveal mt-6 max-w-2xl text-xl leading-relaxed text-ink-soft md:text-2xl md:leading-snug">
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
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-accent"
                >
                  Canlı siteyi ziyaret et
                  <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            )}
          </header>

          <div className="mt-12 border-y border-line py-6">
            <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[13px] text-ink-muted">{fact.label}</dt>
                  <dd className="mt-1 font-medium text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {stack.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-5">
                <span className="mr-2 text-[13px] text-ink-muted">Teknolojiler</span>
                {stack.map((tech) => (
                  <span key={tech} className="rounded-full bg-surface-2 px-3 py-1 text-[13px] text-ink-soft">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {cover && (
            <div className="home-reveal mt-12" style={{ '--d': '0.15s' } as CSSProperties}>
              <ProjectShot src={cover} alt={`${project.title} — kapak görseli`} host={host} priority />
            </div>
          )}

          {blocks.length === 0 ? (
            <p className="mx-auto mt-20 max-w-2xl text-center text-lg leading-relaxed text-ink-muted">
              Bu projenin detaylı anlatımı yakında eklenecek. Merak ettikleriniz için bana doğrudan ulaşabilirsiniz.
            </p>
          ) : (
            <div className="mt-24 flex flex-col gap-24 md:mt-32 md:gap-32">
              {blocks.map((block, index) => {
                const image = byBlock.get(index);
                const number = String(index + 1).padStart(2, '0');
                const label = (
                  <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">{number}</p>
                );
                const body = block.paragraphs.map((paragraph, i) => (
                  <p key={i} className="whitespace-pre-wrap text-lg leading-relaxed text-ink-soft">
                    {paragraph}
                  </p>
                ));

                if (isResult(block.heading) && !image) {
                  return (
                    <section
                      key={index}
                      className="animate-on-scroll rounded-[32px] bg-ink px-7 py-12 text-white md:px-14 md:py-16"
                    >
                      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#93b4f8]">
                        {number} — {block.heading}
                      </p>
                      {block.paragraphs.map((paragraph, i) => (
                        <p
                          key={i}
                          className="mt-5 max-w-3xl whitespace-pre-wrap text-2xl font-medium leading-snug tracking-[-0.02em] md:text-4xl"
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
                    <section key={index} className="animate-on-scroll grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
                      <div className={`lg:col-span-5 ${reversed ? 'lg:order-2' : ''}`}>
                        {label}
                        {block.heading && (
                          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
                            {block.heading}
                          </h2>
                        )}
                        <div className="mt-5 space-y-4">{body}</div>
                      </div>
                      <div className={`lg:col-span-7 ${reversed ? 'lg:order-1' : ''}`}>
                        <ProjectShot src={image} alt={`${project.title} — ${block.heading ?? 'görsel'}`} host={host} />
                      </div>
                    </section>
                  );
                }

                return (
                  <section key={index} className="animate-on-scroll grid gap-6 lg:grid-cols-12 lg:gap-14">
                    <div className="lg:col-span-4">
                      {label}
                      {block.heading && (
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
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
            <section className="mt-24 md:mt-32">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">Galeri</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">Diğer ekranlar</h2>
              <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
                {leftover.map((image, i) => (
                  <div key={image} className={leftover.length % 2 === 1 && i === 0 ? 'md:col-span-2' : undefined}>
                    <ProjectShot src={image} alt={`${project.title} — ek görsel ${i + 1}`} host={host} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {nextProject && (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="group mt-24 flex flex-col gap-6 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-ink/20 md:mt-32 md:flex-row md:items-center md:p-6"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2 md:w-64">
                <ImageWithFallback
                  src={projectCover(nextProject)}
                  alt={nextProject.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  hideOnError
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-muted">Sıradaki proje</p>
                <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-ink transition-colors group-hover:text-accent md:text-3xl">
                  {nextProject.title}
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line text-ink transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                <ArrowRight size={20} />
              </span>
            </Link>
          )}
        </div>
      </article>

      <CtaBand
        title="Benzer bir projeniz mi var?"
        text="İhtiyacınızı birkaç cümleyle anlatın, nasıl bir yol izleyebileceğimizi birlikte konuşalım."
      />
    </SiteShell>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import ImageWithFallback from '../ImageWithFallback';
import BrowserFrame from './BrowserFrame';
import { projectCover, projectHost, projectStack, projectTeaser, splitFeatured } from './project-utils';
import type { HomeProject } from './types';

const FEATURED_COUNT = 3;
const INDEX_LIMIT = 8;

// Vitrin kartlarının sırayla aldığı tonlar
const CARD_TONES = [
  { card: 'bg-[#e8efff]', text: 'text-ink', soft: 'text-ink-soft', muted: 'text-ink-muted', chip: 'bg-white/70 text-ink-soft', line: 'border-ink/10', dark: false },
  { card: 'bg-ink', text: 'text-white', soft: 'text-white/70', muted: 'text-white/45', chip: 'bg-white/10 text-white/80', line: 'border-white/15', dark: true },
  { card: 'bg-[#f2eee6]', text: 'text-ink', soft: 'text-ink-soft', muted: 'text-ink-muted', chip: 'bg-white/70 text-ink-soft', line: 'border-ink/10', dark: false },
];

export default function FeaturedWork({ projects }: { projects: HomeProject[] }) {
  const { featured, rest } = splitFeatured(projects, FEATURED_COUNT);

  return (
    <section id="work" className="scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="animate-on-scroll grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Portfolyo</p>
            <h2 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-ink md:text-7xl">
              Seçili <span className="font-serif-display">işler</span>
              <sup className="ml-2 align-super font-mono text-base font-normal tracking-normal text-ink-muted md:text-lg">
                ({String(projects.length).padStart(2, '0')})
              </sup>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-ink-soft">
              Fikir aşamasından yayına kadar uçtan uca üstlendiğim işlerden bir seçki. Her biri gerçek bir ihtiyaca,
              ölçülebilir bir çözümle cevap veriyor.
            </p>
            <Link
              href="/projects"
              className="group mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-ink transition-colors hover:text-accent"
            >
              Tüm projeleri gör
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-line bg-surface px-6 py-20 text-center text-ink-muted">
            Yeni projeler çok yakında burada.
          </div>
        ) : (
          <div className="mt-16 flex flex-col gap-6 md:gap-8">
            {featured.map((project, index) => (
              <FeaturedCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <ProjectIndex projects={rest.slice(0, INDEX_LIMIT)} startIndex={featured.length} />
        )}
      </div>
    </section>
  );
}

function FeaturedCard({ project, index }: { project: HomeProject; index: number }) {
  const tone = CARD_TONES[index % CARD_TONES.length];
  const detailHref = `/projects/${project.slug}`;
  const teaser = projectTeaser(project);
  const stack = projectStack(project).slice(0, 4);
  const meta = [project.category, project.year].filter(Boolean).join(' · ');

  return (
    <article
      className={`animate-on-scroll group relative overflow-hidden rounded-[32px] ${tone.card} ${tone.text}`}
    >
      <div className="grid lg:min-h-[520px] lg:grid-cols-12">
        <div className="flex flex-col p-7 md:p-12 lg:col-span-5">
          <div className={`flex items-center justify-between gap-4 font-mono text-[12px] uppercase tracking-[0.12em] ${tone.muted}`}>
            <span>{String(index + 1).padStart(2, '0')} — {meta}</span>
          </div>

          <h3 className="mt-8 text-4xl font-semibold tracking-[-0.035em] md:text-5xl">
            <Link href={detailHref} className="after:absolute after:inset-0 after:content-['']">
              {project.title}
            </Link>
          </h3>
          {project.client && <p className={`mt-2 text-[15px] ${tone.muted}`}>{project.client}</p>}
          {teaser && <p className={`mt-5 line-clamp-4 text-lg leading-relaxed ${tone.soft}`}>{teaser}</p>}

          {stack.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {stack.map((tech) => (
                <li key={tech} className={`rounded-full px-3 py-1 text-[13px] ${tone.chip}`}>
                  {tech}
                </li>
              ))}
            </ul>
          )}

          <div className={`mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6 lg:mt-auto ${tone.line}`}>
            <span className="inline-flex items-center gap-2 text-[15px] font-medium">
              <span
                className={`grid h-10 w-10 place-items-center rounded-full transition-all duration-300 group-hover:rotate-45 ${
                  tone.dark ? 'bg-white text-ink' : 'bg-ink text-paper'
                } group-hover:bg-accent group-hover:text-white`}
              >
                <ArrowUpRight size={18} />
              </span>
              Vaka çalışmasını incele
            </span>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative z-20 inline-flex items-center gap-1 text-[15px] underline-offset-4 hover:underline ${tone.soft}`}
              >
                Canlı site <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="pointer-events-none relative min-h-[260px] sm:min-h-[340px] lg:col-span-7 lg:min-h-0">
          <div className="absolute left-6 right-[-12%] top-4 transition-transform duration-700 ease-out [transform:rotate(-3deg)] group-hover:[transform:rotate(0deg)_translateY(-10px)] sm:left-10 md:top-10 lg:left-4 lg:top-16">
            <BrowserFrame
              src={projectCover(project)}
              alt={project.title}
              host={projectHost(project)}
              sizes="(max-width: 1024px) 100vw, 720px"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectIndex({ projects, startIndex }: { projects: HomeProject[]; startIndex: number }) {
  const [active, setActive] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  // İmleci yumuşak şekilde takip eden önizleme — React state'i yerine doğrudan transform
  const tick = () => {
    const el = previewRef.current;
    if (!el) return;
    current.current.x += (target.current.x - current.current.x) * 0.18;
    current.current.y += (target.current.y - current.current.y) * 0.18;
    el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
    const settled =
      Math.abs(target.current.x - current.current.x) < 0.5 && Math.abs(target.current.y - current.current.y) < 0.5;
    frame.current = settled ? null : requestAnimationFrame(tick);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    target.current = { x: event.clientX, y: event.clientY };
    if (frame.current === null) frame.current = requestAnimationFrame(tick);
  };

  const handlePointerEnter = (event: PointerEvent, index: number) => {
    if (event.pointerType !== 'mouse') return;
    if (active === null) {
      // ilk girişte önizlemeyi imlecin yerinden başlat
      current.current = { x: event.clientX, y: event.clientY };
      target.current = { x: event.clientX, y: event.clientY };
      tick();
    }
    setActive(index);
  };

  return (
    <div className="mt-28">
      <div className="animate-on-scroll flex items-baseline justify-between border-b border-line pb-4">
        <h3 className="text-lg font-semibold text-ink">Diğer projeler</h3>
        <Link href="/projects" className="text-sm text-ink-muted transition-colors hover:text-accent">
          Arşivin tamamı →
        </Link>
      </div>

      <ul onPointerMove={handlePointerMove} onPointerLeave={() => setActive(null)}>
        {projects.map((project, index) => (
          <li key={project.id} className="animate-on-scroll border-b border-line">
            <Link
              href={`/projects/${project.slug}`}
              onPointerEnter={(event) => handlePointerEnter(event, index)}
              className="group flex items-center gap-4 py-5 md:gap-8 md:py-7"
            >
              <span className="hidden w-8 font-mono text-[13px] text-ink-muted md:block">
                {String(startIndex + index + 1).padStart(2, '0')}
              </span>
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2 md:hidden">
                <ImageWithFallback
                  src={projectCover(project)}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover object-top"
                  hideOnError
                />
              </div>
              <span className="min-w-0 flex-1 truncate text-xl font-medium tracking-tight text-ink transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-accent md:text-3xl">
                {project.title}
              </span>
              <span className="hidden text-sm text-ink-muted sm:block">
                {[project.category, project.year].filter(Boolean).join(' · ')}
              </span>
              <ArrowUpRight
                size={20}
                className="shrink-0 text-ink-muted transition-all duration-300 group-hover:rotate-45 group-hover:text-accent"
              />
            </Link>
          </li>
        ))}
      </ul>

      <div
        ref={previewRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-40 hidden aspect-[16/10] w-[320px] overflow-hidden rounded-xl border border-line bg-surface-2 shadow-[0_24px_60px_-20px_rgba(12,10,9,0.4)] transition-[opacity,scale] duration-300 md:block ${
          active === null ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {projects.map((project, index) => (
          <ImageWithFallback
            key={project.id}
            src={projectCover(project)}
            alt=""
            fill
            sizes="320px"
            className={`object-cover object-top transition-opacity duration-300 ${active === index ? 'opacity-100' : 'opacity-0'}`}
            hideOnError
          />
        ))}
      </div>
    </div>
  );
}

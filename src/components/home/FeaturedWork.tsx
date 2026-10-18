'use client';

import { ViewTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import BrowserFrame from './BrowserFrame';
import ProjectIndex from './ProjectIndex';
import {
  projectCover,
  projectCoverTransition,
  projectHost,
  projectResults,
  projectStack,
  projectTeaser,
  splitFeatured,
} from './project-utils';
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
  const [topResult] = projectResults(project);

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

          {topResult && (
            <p className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{topResult.value}</span>
              {topResult.label && <span className={`text-[15px] leading-snug ${tone.muted}`}>{topResult.label}</span>}
            </p>
          )}

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
            <ViewTransition name={projectCoverTransition(project.slug)} share="morph">
              <BrowserFrame
                src={projectCover(project)}
                alt={project.title}
                host={projectHost(project)}
                sizes="(max-width: 1024px) 100vw, 720px"
              />
            </ViewTransition>
          </div>
        </div>
      </div>
    </article>
  );
}

'use client';

import Link from 'next/link';
import { useMemo, useState, ViewTransition, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import BrowserFrame from './BrowserFrame';
import { projectCover, projectCoverTransition, projectHost, projectStack, projectTeaser } from './project-utils';
import type { HomeProject } from './types';

const ALL = 'Tümü';

export default function ProjectsArchive({ projects }: { projects: HomeProject[] }) {
  const [filter, setFilter] = useState(ALL);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((project) => project.category)));
    return [ALL, ...unique];
  }, [projects]);

  const visible = filter === ALL ? projects : projects.filter((project) => project.category === filter);

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-24 text-center text-ink-muted">
        Yeni projeler çok yakında burada.
      </div>
    );
  }

  return (
    <>
      {categories.length > 2 && (
        <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Kategoriye göre filtrele">
          {categories.map((category) => {
            const count = category === ALL ? projects.length : projects.filter((p) => p.category === category).length;
            const selected = filter === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(category)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  selected
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line bg-surface text-ink-soft hover:border-ink/30 hover:text-ink'
                }`}
              >
                {category}
                <span className={`ml-1.5 ${selected ? 'text-paper/60' : 'text-ink-muted'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div key={filter} className="grid gap-x-8 gap-y-14 md:grid-cols-2">
        {visible.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </>
  );
}

function ProjectCard({ project, index }: { project: HomeProject; index: number }) {
  const teaser = projectTeaser(project);
  const stack = projectStack(project).slice(0, 4);

  return (
    <article className="home-reveal" style={{ '--d': `${Math.min(index, 6) * 0.06}s` } as CSSProperties}>
      <Link href={`/projects/${project.slug}`} className="group block">
        <ViewTransition name={projectCoverTransition(project.slug)} share="morph">
          <div className="rounded-[20px] bg-gradient-to-br from-surface-2 to-accent-soft p-3 transition-transform duration-500 ease-out group-hover:-translate-y-1">
            <BrowserFrame
              src={projectCover(project)}
              alt={project.title}
              host={projectHost(project)}
              sizes="(max-width: 768px) 100vw, 560px"
              priority={index < 2}
              imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </ViewTransition>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-muted">
              {[project.category, project.year].filter(Boolean).join(' · ')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink transition-colors group-hover:text-accent">
              {project.title}
            </h2>
          </div>
          <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-all duration-300 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
            <ArrowUpRight size={18} />
          </span>
        </div>

        {teaser && <p className="mt-3 line-clamp-2 leading-relaxed text-ink-soft">{teaser}</p>}

        {stack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {stack.map((tech) => (
              <li key={tech} className="rounded-md bg-surface-2 px-2.5 py-1 text-[13px] text-ink-soft">
                {tech}
              </li>
            ))}
          </ul>
        )}
      </Link>
    </article>
  );
}

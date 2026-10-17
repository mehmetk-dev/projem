'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ImageWithFallback from '../ImageWithFallback';
import { projectCover } from './project-utils';
import type { HomeProject } from './types';

interface ProjectIndexProps {
  projects: HomeProject[];
  startIndex?: number;
  title?: string;
  className?: string;
}

// İmleci takip eden görsel önizlemeli proje listesi (dokunmatik ekranda küçük kapak görseli gösterir)
export default function ProjectIndex({ projects, startIndex = 0, title = 'Diğer projeler', className = 'mt-28' }: ProjectIndexProps) {
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
    <div className={className}>
      <div className="animate-on-scroll flex items-baseline justify-between border-b border-line pb-4">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
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

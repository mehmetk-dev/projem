'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PostHeading } from './post-utils';

function useActiveHeading(headings: PostHeading[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    // Ekranın üst üçte birini geçen son başlık etkin sayılır
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };

    const observer = new IntersectionObserver(update, { rootMargin: '0px 0px -70% 0px' });
    elements.forEach((el) => observer.observe(el));
    update();
    return () => observer.disconnect();
  }, [headings]);

  return active;
}

function TocList({ headings, active }: { headings: PostHeading[]; active?: string | null }) {
  return (
    <ol className="space-y-1 border-l border-line">
      {headings.map((heading) => {
        const isActive = heading.id === active;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={isActive ? 'location' : undefined}
              className={`-ml-px block border-l py-1.5 text-[14px] leading-snug transition-colors ${
                heading.level === 3 ? 'pl-7' : 'pl-4'
              } ${isActive ? 'border-accent font-medium text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

const label = 'font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted';

// Geniş ekranda yan sütunda yapışkan liste
export function TableOfContents({ headings }: { headings: PostHeading[] }) {
  const active = useActiveHeading(headings);
  return (
    <nav aria-label="İçindekiler">
      <p className={label}>İçindekiler</p>
      <div className="mt-4">
        <TocList headings={headings} active={active} />
      </div>
    </nav>
  );
}

// Dar ekranda yazının başında açılır kapanır kart
export function TableOfContentsMobile({ headings }: { headings: PostHeading[] }) {
  return (
    <details className="group rounded-2xl border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className={label}>İçindekiler · {headings.length} başlık</span>
        <ChevronDown size={16} className="text-ink-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-5 pb-5">
        <TocList headings={headings} />
      </div>
    </details>
  );
}

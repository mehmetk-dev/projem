'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import {
  siDocker,
  siNextdotjs,
  siNodedotjs,
  siPhp,
  siPostgresql,
  siReact,
  siRedis,
  siSpringboot,
  siTypescript,
  siWordpress,
  type SimpleIcon,
} from 'simple-icons';

const ICONS: Record<string, SimpleIcon> = {
  'next.js': siNextdotjs,
  typescript: siTypescript,
  'spring boot': siSpringboot,
  postgresql: siPostgresql,
  docker: siDocker,
  'node.js': siNodedotjs,
  redis: siRedis,
  react: siReact,
  wordpress: siWordpress,
  php: siPhp,
};

export interface WorkbenchProject {
  title: string;
  slug: string;
  cover: string;
  note: string;
}

type Spot = [left: number, top: number];

// Çıkartmalar: masaüstü yeri, mobil yeri (yoksa mobilde gizli), eğim°, derinlik
const STICKER_SPOTS: { d: Spot; m?: Spot; rotate: number; depth: number }[] = [
  { d: [21, 6], m: [4, 3], rotate: -12, depth: 1.6 },
  { d: [53, 3], m: [70, 37], rotate: 8, depth: 1.2 },
  { d: [38, 4], rotate: -6, depth: 1.8 },
  { d: [58, 88], m: [58, 86], rotate: 10, depth: 1.4 },
  { d: [39, 91], rotate: -8, depth: 1.7 },
  { d: [1, 93], m: [3, 53], rotate: 6, depth: 1.3 },
  { d: [85, 57], m: [66, 94], rotate: 12, depth: 1.5 },
  { d: [33, 70], rotate: -14, depth: 2 },
  { d: [62, 52], rotate: 6, depth: 1.9 },
  { d: [10, 34], rotate: 12, depth: 1.4 },
  { d: [22, 94], rotate: -10, depth: 1.6 },
];

// Proje pencereleri: masaüstü [sol, üst, genişlik], mobil [sol, üst, genişlik], eğim°, derinlik
const CARD_SPOTS: { d: [number, number, number]; m: [number, number, number]; rotate: number; depth: number }[] = [
  { d: [26, 15, 46], m: [8, 13, 72], rotate: -3, depth: 0.6 },
  { d: [63, 8, 31], m: [40, 47, 56], rotate: 5, depth: 1 },
  { d: [4, 50, 29], m: [4, 66, 54], rotate: -7, depth: 0.9 },
];

/** Konumu mobil ve masaüstü için CSS değişkenleriyle verir */
const place = (d: [number, number, number?], m?: [number, number, number?]) =>
  ({
    '--ld': `${d[0]}%`,
    '--td': `${d[1]}%`,
    '--wd': d[2] ? `${d[2]}%` : 'auto',
    '--lm': `${(m ?? d)[0]}%`,
    '--tm': `${(m ?? d)[1]}%`,
    '--wm': (m ?? d)[2] ? `${(m ?? d)[2]}%` : 'auto',
  }) as CSSProperties;

const PLACED = 'left-[var(--lm)] top-[var(--tm)] w-[var(--wm)] md:left-[var(--ld)] md:top-[var(--td)] md:w-[var(--wd)]';

/** Fare hareketiyle derinliğine göre kayan katman */
function Layer({ depth, className = '', style, children }: { depth: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div
      className={`absolute transition-[translate] duration-300 ease-out ${className}`}
      style={{ ...style, translate: `calc(var(--mx, 0) * ${depth * 14}px) calc(var(--my, 0) * ${depth * 10}px)` }}
    >
      {children}
    </div>
  );
}

function Tape({ className }: { className: string }) {
  return <span className={`absolute z-10 h-[2.4cqw] w-[9cqw] bg-[#fef3c7]/80 shadow-sm ${className}`} aria-hidden="true" />;
}

function Cursor({ name, color, className }: { name: string; color: string; className: string }) {
  return (
    <span className={`pointer-events-none absolute z-30 flex items-start ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-[max(18px,2.2cqw)] w-[max(18px,2.2cqw)] drop-shadow" style={{ color }}>
        <path d="M3 2 L20 11 L12 13 L9 21 Z" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span
        className="ml-0.5 mt-[1.6cqw] rounded-full px-2.5 py-1 text-[max(11px,1.05cqw)] font-semibold text-white shadow"
        style={{ background: color }}
      >
        {name}
      </span>
    </span>
  );
}

// Hakkımda: çalışma masasından sürrealist bir kolaj. Bantlı proje pencereleri, teknoloji çıkartmaları,
// el yazısı notlar ve Figma tarzı ortak çalışma imleçleri; fare hareketinde katmanlar farklı derinlikte kayar
export default function Workbench({ projects, technologies }: { projects: WorkbenchProject[]; technologies: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const stickers = technologies.slice(0, STICKER_SPOTS.length);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', String(((event.clientX - rect.left) / rect.width - 0.5) * 2));
    ref.current.style.setProperty('--my', String(((event.clientY - rect.top) / rect.height - 0.5) * 2));
  };
  const onLeave = () => {
    ref.current?.style.setProperty('--mx', '0');
    ref.current?.style.setProperty('--my', '0');
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="workbench @container relative aspect-[2/3] overflow-hidden rounded-[28px] border border-ink/10 bg-[#f2eee6] md:aspect-[16/10] md:rounded-[36px]"
    >
      {/* Kareli defter zemini */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(12,10,9,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(12,10,9,0.06)_1px,transparent_1px)] [background-size:3.2cqw_3.2cqw]"
        aria-hidden="true"
      />
      {/* Arkadaki dev kontur yazı */}
      <Layer depth={0.3} className="inset-x-0 bottom-[-4cqw] text-center" style={{}}>
        <span
          className="select-none whitespace-nowrap font-serif-display text-[19cqw] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(37,99,235,0.35)]"
          aria-hidden="true"
        >
          kod & zanaat
        </span>
      </Layer>

      {/* Bantlı proje pencereleri */}
      {projects.slice(0, CARD_SPOTS.length).map((project, index) => {
        const { d, m, rotate, depth } = CARD_SPOTS[index];
        return (
          <Layer key={project.slug} depth={depth} className={PLACED} style={{ ...place(d, m), zIndex: index === 0 ? 5 : 4 }}>
            <Link
              href={`/projects/${project.slug}`}
              className="group block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
              style={{ rotate: `${rotate}deg` }}
            >
              <Tape className="-top-[1cqw] left-[12%] -rotate-6" />
              <Tape className="-top-[1cqw] right-[10%] rotate-[8deg]" />
              <span className="block overflow-hidden rounded-[1.2cqw] border border-ink/10 bg-white shadow-[0_30px_60px_-28px_rgba(12,10,9,0.55)]">
                <span className="flex items-center gap-[0.5cqw] border-b border-ink/10 px-[1.2cqw] py-[0.8cqw]">
                  <span className="h-[0.8cqw] w-[0.8cqw] rounded-full bg-[#ff5f57]" />
                  <span className="h-[0.8cqw] w-[0.8cqw] rounded-full bg-[#febc2e]" />
                  <span className="h-[0.8cqw] w-[0.8cqw] rounded-full bg-[#28c840]" />
                  <span className="ml-[1cqw] truncate font-mono text-[max(9px,0.95cqw)] text-ink-muted">{project.title}</span>
                </span>
                <span className="relative block aspect-[16/10] bg-surface-2">
                  <Image src={project.cover} alt={project.title} fill sizes="(max-width: 768px) 60vw, 520px" className="object-cover object-top" />
                </span>
              </span>
              <span className={`mt-[1cqw] block whitespace-nowrap font-serif-display ${index === 1 ? 'text-right' : ''} text-[max(14px,1.9cqw)] text-ink transition-colors group-hover:text-accent`}>
                {project.note} ↗
              </span>
            </Link>
          </Layer>
        );
      })}

      {/* Teknoloji çıkartmaları */}
      {stickers.map((tech, index) => {
        const { d, m, rotate, depth } = STICKER_SPOTS[index];
        const icon = ICONS[tech.toLowerCase()];
        return (
          <Layer key={tech} depth={depth} className={`${PLACED} ${m ? '' : 'hidden md:block'}`} style={{ ...place(d, m), zIndex: 6 }}>
            <span
              className="inline-flex items-center gap-[0.6cqw] whitespace-nowrap rounded-full border-[0.35cqw] border-white bg-white px-[1.3cqw] py-[0.7cqw] text-[max(11px,1.3cqw)] font-semibold text-ink shadow-[0_10px_24px_-12px_rgba(12,10,9,0.55)] transition-transform duration-300 hover:scale-110"
              style={{ rotate: `${rotate}deg`, color: icon && icon.hex !== '000000' ? `#${icon.hex}` : undefined }}
            >
              {icon && (
                <svg viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em] fill-current" aria-hidden="true">
                  <path d={icon.path} />
                </svg>
              )}
              <span className="text-ink">{tech}</span>
            </span>
          </Layer>
        );
      })}

      {/* El yazısı notlar ve çizilmiş oklar */}
      <Layer depth={1.1} className={PLACED} style={{ ...place([4, 12], [44, 2]), zIndex: 7 }}>
        <p className="w-[48cqw] -rotate-3 font-serif-display text-[max(15px,2.1cqw)] leading-[1.1] text-ink md:w-[19cqw]">
          tasarımdan koda, <span className="text-accent">piksel piksel.</span>
        </p>
        <svg viewBox="0 0 120 60" className="ml-[8cqw] mt-[0.5cqw] hidden w-[11cqw] text-ink md:block" fill="none" aria-hidden="true">
          <path d="M4 6 C40 4 78 18 110 46" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M96 46 L111 47 L106 33" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Layer>
      <Layer depth={1.3} className="hidden md:block" style={{ left: '72%', top: '70%', zIndex: 7 }}>
        <svg viewBox="0 0 120 60" className="mb-[0.5cqw] w-[9cqw] -scale-x-100 text-ink" fill="none" aria-hidden="true">
          <path d="M4 50 C34 46 70 30 108 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M94 6 L109 7 L103 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="w-[22cqw] rotate-2 font-serif-display text-[max(15px,2cqw)] leading-[1.1] text-ink">
          arayüz → API → veri → yayın. <span className="text-accent">uçtan uca.</span>
        </p>
      </Layer>
      <Layer depth={1.5} className="hidden md:block" style={{ left: '54%', top: '69%', zIndex: 7 }}>
        <p className="-rotate-6 rounded-[0.6cqw] bg-[#fde047] px-[1.2cqw] py-[0.8cqw] font-serif-display text-[1.6cqw] text-ink shadow-[0_10px_20px_-12px_rgba(12,10,9,0.5)]">
          hız takıntısı ⚡
        </p>
      </Layer>

      {/* Ortak çalışma imleçleri */}
      <Cursor name="Mehmet" color="#2563eb" className="workbench-cursor-a left-[52%] top-[32%] md:left-[60%] md:top-[56%]" />
      <Cursor name="Siz" color="#db2777" className="workbench-cursor-b left-[22%] top-[58%] md:left-[30%] md:top-[44%]" />
    </div>
  );
}

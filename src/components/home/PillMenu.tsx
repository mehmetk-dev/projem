'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import BrandMark from './BrandMark';

const ITEMS = [
  // tilt: açılırken başladığı ve üzerine gelince hafifçe eğildiği açı; durağan hâlde hepsi düz durur
  { label: 'projeler', href: '/projects', tilt: 3, hoverBg: 'linear-gradient(to right, #059669, #0d9488)' },
  { label: 'hizmetler', href: '/#services', tilt: -3, hoverBg: 'linear-gradient(to right, #2563eb, #1e40af)' },
  { label: 'süreç', href: '/#process', tilt: 3, hoverBg: 'linear-gradient(to right, #d97706, #ea580c)' },
  { label: 'blog', href: '/blog', tilt: -3, hoverBg: 'linear-gradient(to right, #9333ea, #db2777)' },
  { label: 'iletişim', href: '/#contact', tilt: 3, hoverBg: 'linear-gradient(to right, #e11d48, #dc2626)' },
];

const EASE_IN = 'back.out(1.5)';
const DURATION = 0.5;
const STAGGER = 0.08;

// Masaüstü menüsü: logo + toggle; açılınca balon butonlar ortada tek satırda belirir
export default function PillMenu() {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const bubbleRefs = useRef<HTMLLIElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  const toggle = () => {
    if (!open) setRendered(true);
    setOpen((value) => !value);
  };

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useGSAP(
    () => {
      const bubbles = bubbleRefs.current.filter(Boolean);
      const labels = labelRefs.current.filter(Boolean);
      if (!bubbles.length) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.killTweensOf([...bubbles, ...labels]);

      if (open) {
        if (reduceMotion) {
          gsap.set(bubbles, { scale: 1, rotation: 0 });
          gsap.set(labels, { y: 0, autoAlpha: 1 });
          return;
        }
        bubbles.forEach((bubble, i) =>
          gsap.set(bubble, { scale: 0, rotation: ITEMS[i].tilt * 4, transformOrigin: '50% 50%' })
        );
        gsap.set(labels, { y: 12, autoAlpha: 0 });
        bubbles.forEach((bubble, i) => {
          const tl = gsap.timeline({ delay: i * STAGGER });
          tl.to(bubble, { scale: 1, rotation: 0, duration: DURATION, ease: EASE_IN });
          tl.to(labels[i], { y: 0, autoAlpha: 1, duration: DURATION, ease: 'power3.out' }, `-=${DURATION * 0.9}`);
        });
      } else if (rendered) {
        if (reduceMotion) {
          setRendered(false);
          return;
        }
        gsap.to(labels, { y: 12, autoAlpha: 0, duration: 0.15, ease: 'power3.in' });
        gsap.to(bubbles, {
          scale: 0,
          rotation: 0,
          duration: 0.15,
          ease: 'power3.in',
          onComplete: () => setRendered(false),
        });
      }
    },
    { dependencies: [open, rendered], scope: navRef }
  );

  return (
    <nav
      ref={navRef}
      aria-label="Ana menü"
      className="pointer-events-none fixed inset-x-0 top-5 z-50 mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-8"
    >
      <div className="pointer-events-auto justify-self-start rounded-full border border-line bg-surface/85 py-2 pl-3 pr-5 shadow-[0_8px_24px_-14px_rgba(12,10,9,0.3)] backdrop-blur-md">
        <BrandMark />
      </div>

      <ul id="pill-menu-items" className="flex flex-nowrap items-center gap-2">
        {rendered &&
          ITEMS.map((item, idx) => (
            <li
              key={item.href}
              className="pointer-events-auto"
              ref={(el) => {
                if (el) bubbleRefs.current[idx] = el;
              }}
            >
              <Link
                href={item.href}
                onClick={close}
                tabIndex={open ? 0 : -1}
                className="inline-flex h-12 items-center whitespace-nowrap rounded-full border border-line bg-surface px-6 text-[16px] font-semibold text-ink shadow-[0_4px_14px_rgba(12,10,9,0.08)] transition-[scale,rotate,background,color,border-color,box-shadow] duration-300 hover:scale-[1.08] hover:rotate-[var(--tilt)] hover:border-transparent hover:text-white hover:shadow-[0_12px_28px_rgba(12,10,9,0.22)] hover:[background:var(--hover-bg)] active:scale-95"
                style={{ '--hover-bg': item.hoverBg, '--tilt': `${item.tilt}deg` } as CSSProperties}
              >
                <span
                  className="inline-block"
                  ref={(el) => {
                    if (el) labelRefs.current[idx] = el;
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
      </ul>

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={open}
        aria-controls="pill-menu-items"
        className={`pointer-events-auto grid h-12 w-12 place-items-center justify-self-end rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${
          open
            ? 'border-line bg-surface text-ink shadow-[0_8px_24px_-12px_rgba(12,10,9,0.25)]'
            : 'border-ink bg-ink text-paper shadow-[0_10px_28px_-10px_rgba(12,10,9,0.5)] hover:bg-accent hover:border-accent'
        }`}
      >
        <span className="relative block h-3 w-5">
          <span
            className={`absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
              open ? 'translate-y-[5px] rotate-45' : ''
            }`}
          />
          <span
            className={`absolute bottom-0 left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
              open ? '-translate-y-[5px] -rotate-45' : ''
            }`}
          />
        </span>
      </button>
    </nav>
  );
}

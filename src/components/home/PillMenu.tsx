'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
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

type Gsap = typeof import('gsap').gsap;

// gsap yalnızca menü için gerekli; ilk yüklemeyi şişirmemesi için ayrı chunk olarak sonradan yüklenir
let gsapInstance: Gsap | null = null;
const loadGsap = () =>
  gsapInstance ? Promise.resolve(gsapInstance) : import('gsap').then((mod) => (gsapInstance = mod.gsap));

// Logo + toggle; açılınca balon butonlar masaüstünde ortada tek satırda, mobilde alt alta belirir
export default function PillMenu() {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
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

  // Sayfa açıldıktan sonra boşta kalınca gsap'i önceden indir; ilk tıklamada beklenmesin
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => void loadGsap());
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    const run = (gsap: Gsap) => {
      if (cancelled) return;
      const bubbles = bubbleRefs.current.filter(Boolean);
      const labels = labelRefs.current.filter(Boolean);
      const backdrop = backdropRef.current;
      if (!bubbles.length) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.killTweensOf([...bubbles, ...labels, backdrop]);

      if (open) {
        if (reduceMotion) {
          gsap.set(bubbles, { scale: 1, rotation: 0 });
          gsap.set(labels, { y: 0, autoAlpha: 1 });
          gsap.set(backdrop, { autoAlpha: 1 });
          return;
        }
        gsap.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
        bubbles.forEach((bubble, i) =>
          gsap.set(bubble, { scale: 0, rotation: (ITEMS[i]?.tilt ?? -3) * 4, transformOrigin: '50% 50%' })
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
        gsap.to(backdrop, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
        gsap.to(labels, { y: 12, autoAlpha: 0, duration: 0.15, ease: 'power3.in' });
        gsap.to(bubbles, {
          scale: 0,
          rotation: 0,
          duration: 0.15,
          ease: 'power3.in',
          onComplete: () => setRendered(false),
        });
      }
    };
    if (gsapInstance) run(gsapInstance);
    else void loadGsap().then(run);
    return () => {
      cancelled = true;
    };
  }, [open, rendered]);

  return (
    <nav
      ref={navRef}
      aria-label="Ana menü"
      className="pointer-events-none fixed inset-x-0 top-3 z-50 mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8 lg:top-5 lg:grid lg:grid-cols-[1fr_auto_1fr]"
    >
      {rendered && (
        <div
          ref={backdropRef}
          onClick={close}
          className="pointer-events-auto fixed inset-0 bg-paper/80 backdrop-blur-md lg:hidden"
          aria-hidden="true"
        />
      )}

      <div className="pointer-events-auto relative justify-self-start rounded-full border border-line bg-surface/85 py-2 pl-3 pr-5 shadow-[0_8px_24px_-14px_rgba(12,10,9,0.3)] backdrop-blur-md">
        <BrandMark />
      </div>

      <ul
        id="pill-menu-items"
        className="fixed inset-x-4 top-24 flex flex-col gap-3 md:inset-x-8 lg:static lg:flex-row lg:flex-nowrap lg:items-center lg:gap-2"
      >
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
                className="group flex h-16 w-full items-center justify-between whitespace-nowrap rounded-full border border-line bg-surface px-7 text-2xl font-semibold text-ink shadow-[0_4px_14px_rgba(12,10,9,0.08)] transition-[scale,rotate,background,color,border-color,box-shadow] duration-300 hover:scale-[1.04] hover:rotate-[var(--tilt)] hover:border-transparent hover:text-white hover:shadow-[0_12px_28px_rgba(12,10,9,0.22)] hover:[background:var(--hover-bg)] active:scale-95 lg:inline-flex lg:h-12 lg:w-auto lg:px-6 lg:text-[16px] lg:hover:scale-[1.08]"
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
                <span
                  className="h-3 w-3 rounded-full transition-opacity group-hover:opacity-0 lg:hidden"
                  style={{ background: item.hoverBg }}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        {rendered && (
          <li
            className="pointer-events-auto mt-2 lg:hidden"
            ref={(el) => {
              if (el) bubbleRefs.current[ITEMS.length] = el;
            }}
          >
            <Link
              href="/#contact"
              onClick={close}
              tabIndex={open ? 0 : -1}
              className="flex h-16 w-full items-center justify-center gap-2 rounded-full bg-ink text-lg font-medium text-paper shadow-[0_10px_28px_-10px_rgba(12,10,9,0.5)] transition-colors active:bg-accent"
            >
              <span
                className="inline-flex items-center gap-2"
                ref={(el) => {
                  if (el) labelRefs.current[ITEMS.length] = el;
                }}
              >
                Proje başlatalım
                <ArrowUpRight size={18} />
              </span>
            </Link>
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={open}
        aria-controls="pill-menu-items"
        className={`pointer-events-auto relative grid h-12 w-12 place-items-center justify-self-end rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${
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

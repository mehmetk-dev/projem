'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import SpotifyNowPlaying from './SpotifyNowPlaying';

type MenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: {
    bgGradient?: string;
    textColor?: string;
  };
};

export type BubbleMenuProps = {
  logo: ReactNode | string;
  user?: { email: string } | null;
  logoutAction?: () => Promise<void>;
  onMenuClick?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  items?: MenuItem[];
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
};

const DEFAULT_ITEMS: MenuItem[] = [
  {
    label: 'projeler',
    href: '/projects',
    ariaLabel: 'Projeler',
    rotation: 6,
    hoverStyles: { bgGradient: 'linear-gradient(to right, #059669, #0d9488)', textColor: '#ffffff' }
  },
  {
    label: 'yazılarım',
    href: '/blog',
    ariaLabel: 'Yazılarım',
    rotation: -4,
    hoverStyles: { bgGradient: 'linear-gradient(to right, #9333ea, #db2777)', textColor: '#ffffff' }
  },
  {
    label: 'ara',
    href: '/search',
    ariaLabel: 'Ara',
    rotation: 4,
    hoverStyles: { bgGradient: 'linear-gradient(to right, #d97706, #ea580c)', textColor: '#ffffff' }
  },
  {
    label: 'iletişim',
    href: '#contact',
    ariaLabel: 'İletişim',
    rotation: -6,
    hoverStyles: { bgGradient: 'linear-gradient(to right, #e11d48, #dc2626)', textColor: '#ffffff' }
  }
];

export default function BubbleMenu({
  logo,
  user = null,
  logoutAction,
  onMenuClick,
  className,
  style,
  menuAriaLabel = 'Menüyü Aç/Kapat',
  menuBg = 'rgba(10, 10, 10, 0.85)',
  menuContentColor = '#ffffff',
  useFixedPosition = true,
  items,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12
}: BubbleMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const overlayRef = useRef<HTMLElement>(null);
  const bubblesRef = useRef<HTMLAnchorElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  const baseItems = items?.length ? items : DEFAULT_ITEMS;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const updated = [...baseItems];
    if (user) {
      updated.push({
        label: 'dashboard',
        href: '/dashboard',
        ariaLabel: 'Dashboard',
        rotation: 4,
        hoverStyles: { bgGradient: 'linear-gradient(to right, #4b5563, #374151)', textColor: '#ffffff' }
      });
      updated.push({
        label: 'çıkış yap',
        href: '#logout',
        ariaLabel: 'Çıkış Yap',
        rotation: -4,
        hoverStyles: { bgGradient: 'linear-gradient(to right, #e11d48, #be123c)', textColor: '#ffffff' }
      });
    } else {
      updated.push({
        label: 'giriş yap',
        href: '/login',
        ariaLabel: 'Giriş Yap',
        rotation: 4,
        hoverStyles: { bgGradient: 'linear-gradient(to right, #2563eb, #1e40af)', textColor: '#ffffff' }
      });
    }
    setMenuItems(updated);
  }, [user, items, baseItems]);

  const containerClassName = [
    'bubble-menu',
    useFixedPosition ? 'fixed left-1/2 -translate-x-1/2 w-full max-w-[1140px]' : 'absolute left-0 right-0',
    'top-6',
    'flex items-center justify-between',
    'gap-x-4 px-6 md:px-10 lg:px-12',
    'pointer-events-none',
    'z-[1001]',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  const handleItemClick = async (e: React.MouseEvent, href: string) => {
    if (href === '#logout') {
      e.preventDefault();
      setIsMenuOpen(false);
      setShowOverlay(false);
      if (logoutAction) {
        await logoutAction();
      } else {
        const { logoutAction: serverLogout } = await import('@/app/actions/auth');
        await serverLogout();
      }
      window.location.href = '/';
    } else {
      setIsMenuOpen(false);
      setShowOverlay(false);
    }
  };

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const bubbles = bubblesRef.current.filter(Boolean);
      const labels = labelRefs.current.filter(Boolean);
      if (!overlay || !bubbles.length) return;

      if (isMenuOpen) {
        gsap.killTweensOf([...bubbles, ...labels]);
        
        gsap.set(bubbles, { scale: 0, rotation: 0, transformOrigin: '50% 50%' });
        gsap.set(labels, { y: 15, autoAlpha: 0 });

        bubbles.forEach((bubble, i) => {
          const item = menuItems[i];
          const rot = item?.rotation ?? 0;
          const delay = i * staggerDelay + gsap.utils.random(-0.02, 0.02);
          const tl = gsap.timeline({ delay });
          tl.to(bubble, {
            scale: 1,
            rotation: rot,
            duration: animationDuration,
            ease: animationEase
          });
          if (labels[i]) {
            tl.to(
              labels[i],
              {
                y: 0,
                autoAlpha: 1,
                duration: animationDuration,
                ease: 'power3.out'
              },
              '-=' + animationDuration * 0.9
            );
          }
        });
      } else if (showOverlay) {
        gsap.killTweensOf([...bubbles, ...labels]);
        
        gsap.to(labels, {
          y: 15,
          autoAlpha: 0,
          duration: 0.15,
          ease: 'power3.in'
        });
        
        gsap.to(bubbles, {
          scale: 0,
          rotation: 0,
          duration: 0.15,
          ease: 'power3.in',
          onComplete: () => {
            setShowOverlay(false);
          }
        });
      }
    },
    {
      dependencies: [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay, menuItems],
      scope: overlayRef
    }
  );

  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean);
        const isDesktop = window.innerWidth >= 900;
        bubbles.forEach((bubble, i) => {
          const item = menuItems[i];
          if (bubble && item) {
            const rotation = isDesktop ? (item.rotation ?? 0) : 0;
            gsap.set(bubble, { rotation });
          }
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen, menuItems]);

  return (
    <>
      <style>{`
        .bubble-menu .menu-line {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
          transform-origin: center;
        }
        .bubble-menu .pill-link {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, color 0.3s ease;
        }
        .bubble-menu .pill-link:hover {
          transform: rotate(var(--item-rot)) scale(1.08) !important;
          background: var(--hover-bg-grad) !important;
          border-color: transparent !important;
          color: var(--hover-color) !important;
          box-shadow: 0 12px 28px rgba(0,0,0,0.25);
        }
        .bubble-menu .pill-link:active {
          transform: rotate(var(--item-rot)) scale(0.95) !important;
        }
      `}</style>

      <nav ref={overlayRef} className={containerClassName} style={style} aria-label="Ana Navigasyon">
        <Link
          href="/"
          className={[
            'logo-bubble pointer-events-auto order-1',
            'flex items-center justify-center gap-3 px-8 md:px-10 h-12 md:h-14',
            'rounded-full',
            'backdrop-blur-xl border transition-all duration-300',
            isMenuOpen 
              ? 'hidden md:inline-flex bg-white border-white text-black shadow-[0_8px_32px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95' 
              : 'inline-flex border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/20 hover:scale-105 active:scale-95'
          ].join(' ')}
          aria-label="Logo"
          style={{
            background: isMenuOpen ? '#ffffff' : menuBg,
            borderRadius: '9999px'
          }}
        >
          <span className={[
            'w-2 h-2 rounded-full animate-pulse transition-colors duration-300 shrink-0',
            isMenuOpen 
              ? 'bg-black shadow-[0_0_12px_rgba(0,0,0,0.4)]' 
              : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
          ].join(' ')} />
          {typeof logo === 'string' ? (
            <span className="text-lg font-black tracking-tighter uppercase">{logo}</span>
          ) : (
            logo
          )}
        </Link>

        {showOverlay && (
          <div
            className={[
              'order-3 md:order-2 flex justify-center items-center pointer-events-auto',
              // Mobile: dropdown panel below nav
              'absolute top-full left-6 right-6 mt-4 p-6',
              'bg-neutral-950/95 border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-2xl',
              'flex-col gap-3',
              // Desktop: static in flow, centered via flex parent
              'md:static md:translate-y-0 md:w-auto md:mx-0',
              'md:mt-0 md:p-0 md:bg-transparent md:border-0 md:rounded-none md:shadow-none md:backdrop-blur-none',
              'md:flex-row md:flex-wrap gap-x-2 gap-y-3',
              'z-[1002]'
            ].join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                role="menuitem"
                href={item.href}
                onClick={(e) => handleItemClick(e, item.href)}
                aria-label={item.ariaLabel || item.label}
                className={[
                  'pill-link',
                  'rounded-[999px]',
                  'no-underline',
                  'border border-neutral-200 text-neutral-900 bg-white',
                  'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
                  'flex items-center justify-center',
                  'relative',
                  'box-border',
                  'whitespace-nowrap overflow-hidden'
                ].join(' ')}
                style={
                  {
                    ['--item-rot']: `${item.rotation ?? 0}deg`,
                    ['--hover-bg-grad']: item.hoverStyles?.bgGradient || 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                    ['--hover-color']: item.hoverStyles?.textColor || '#ffffff',
                    minHeight: 'var(--pill-min-h, 54px)',
                    padding: '0 clamp(1.2rem, 2vw, 2.5rem)',
                    fontSize: 'clamp(0.95rem, 1.6vw, 1.35rem)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    willChange: 'transform'
                  } as CSSProperties
                }
                ref={el => {
                  if (el) bubblesRef.current[idx] = el as unknown as HTMLAnchorElement;
                }}
              >
                <span
                  className="pill-label inline-block font-sans lowercase text-inherit"
                  style={{
                    willChange: 'transform, opacity',
                  }}
                  ref={el => {
                    if (el) labelRefs.current[idx] = el;
                  }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pointer-events-auto order-2 md:order-3 ml-auto md:ml-0 shrink-0">
          {/* Spotify Widget next to toggle button - Commented out for now
          {isDesktop && <SpotifyNowPlaying />}
          */}

          <button
            type="button"
            className={[
              'toggle-bubble menu-btn',
              isMenuOpen ? 'open' : '',
              'inline-flex flex-col items-center justify-center',
              'rounded-full border transition-all duration-300',
              'w-12 h-12 md:w-14 md:h-14',
              'cursor-pointer p-0',
              isMenuOpen 
                ? 'bg-white border-white text-black shadow-[0_8px_32px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95' 
                : 'border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/20 hover:scale-105 active:scale-95'
            ].join(' ')}
            onClick={handleToggle}
            aria-label={menuAriaLabel}
            aria-pressed={isMenuOpen}
            style={{ background: isMenuOpen ? '#ffffff' : menuBg }}
          >
            <span
              className="menu-line block mx-auto rounded-[2px]"
              style={{
                width: 20,
                height: 2,
                background: isMenuOpen ? '#111111' : menuContentColor,
                transform: isMenuOpen ? 'translateY(4px) rotate(45deg)' : 'none'
              }}
            />
            <span
              className="menu-line short block mx-auto rounded-[2px]"
              style={{
                marginTop: '6px',
                width: 20,
                height: 2,
                background: isMenuOpen ? '#111111' : menuContentColor,
                transform: isMenuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none'
              }}
            />
          </button>
        </div>
      </nav>
    </>
  );
}

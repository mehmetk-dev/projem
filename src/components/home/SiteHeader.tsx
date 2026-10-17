'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MenuIcon } from '../Icons';
import PillMenu from './PillMenu';
import BrandMark from './BrandMark';

const NAV_ITEMS = [
  { href: '/projects', label: 'Projeler' },
  { href: '/#services', label: 'Hizmetler' },
  { href: '/#process', label: 'Süreç' },
  { href: '/blog', label: 'Blog' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const solid = scrolled || menuOpen;
  const isActive = (href: string) => !href.includes('#') && pathname.startsWith(href);

  return (
    <>
      <div className="hidden lg:block">
        <PillMenu />
      </div>
    <header
      className={`fixed inset-x-0 top-0 z-50 lg:hidden transition-[background-color,border-color] duration-300 border-b ${
        solid ? 'bg-paper/85 backdrop-blur-md border-line' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 md:px-8">
        <BrandMark />

        <nav className="hidden items-center gap-8 md:flex lg:hidden" aria-label="Ana menü">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`text-sm transition-colors hover:text-ink ${isActive(item.href) ? 'text-ink font-medium' : 'text-ink-soft'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/#contact"
          className="group hidden items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent md:inline-flex lg:hidden"
        >
          Proje başlatalım
          <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        <button
          type="button"
          className="-mr-2 p-2 text-ink md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={menuOpen}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-line bg-paper px-5 pb-6 pt-2 md:hidden" aria-label="Mobil menü">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="block border-b border-line py-4 text-lg text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={closeMenu}
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-base font-medium text-paper"
          >
            Proje başlatalım
            <ArrowUpRight size={16} />
          </Link>
        </nav>
      )}
    </header>
    </>
  );
}

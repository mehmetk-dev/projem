'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavLink } from './NavLink';
import { MenuIcon } from './Icons';
import SpotifyNowPlaying from './SpotifyNowPlaying';

interface HeaderProps {
  user: { email: string } | null;
  logoutAction: () => Promise<void>;
}

const NAV_ITEMS = [
  { href: '/projects', label: 'Projeler' },
  { href: '/blog', label: 'Yazılarım' },
  { href: '/search', label: 'Ara' },
  { href: '#contact', label: 'İletişim' },
  { href: '/webp-converter', label: 'WebP Dönüştürücü' },
];

export default function Header({ user, logoutAction }: HeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    router.push('/');
    router.refresh();
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-0 w-full backdrop-blur-2xl bg-black/40 border-b border-white/5 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="logo text-2xl font-black tracking-tighter flex items-center gap-3 uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          M. Kerem
        </Link>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-10">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {/* {isDesktop && <SpotifyNowPlaying />} */}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-[13px] font-medium uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-[13px] font-medium uppercase tracking-widest text-white/50 hover:text-white transition-colors px-6 py-3 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <div className="flex items-center gap-6 text-[13px] font-medium uppercase tracking-widest">
              <Link href="/login" className="text-neutral-400 hover:text-white transition-colors">
                Giriş
              </Link>
              <Link
                href="/register"
                className="bg-white text-black px-7 py-3.5 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          <MenuIcon open={mobileMenuOpen} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-black/95 backdrop-blur-3xl border-b border-white/10 p-8 flex flex-col gap-8 animate-in slide-in-from-top-4">
          {/* Commented out Spotify now playing widget
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 uppercase tracking-widest font-bold">Şu an Dinliyor</span>
            <SpotifyNowPlaying />
          </div>
          <hr className="border-white/5" />
          */}
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} onClick={closeMenu} mobile>
              {item.label}
            </NavLink>
          ))}
          <hr className="border-white/10" />
          {user ? (
            <>
              <Link href="/dashboard" onClick={closeMenu} className="text-2xl font-light tracking-tight text-white">
                Dashboard
              </Link>
              <button
                onClick={() => { handleLogout(); closeMenu(); }}
                className="text-left text-2xl font-light tracking-tight text-white/50"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-6 pt-4">
              <Link href="/login" onClick={closeMenu} className="text-xl font-light tracking-tight text-neutral-400">
                Giriş Yap
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                className="text-xl font-medium tracking-tight bg-white text-black py-4 rounded-2xl text-center"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

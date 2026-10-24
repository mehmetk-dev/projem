import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import HomeFooter from './HomeFooter';
import ScrollAnimations from '../ScrollAnimations';
import HashScroll from './HashScroll';
import PageViewTracker from './PageViewTracker';
import CommandPalette from './CommandPalette';
import { homeFontVariables } from './fonts';
import type { HomeSocialLink } from './types';
import '@/app/portfolio.css';

// Açık temalı public sayfaların ortak iskeleti (ana sayfa, projeler)
export default function SiteShell({ socialLinks, children }: { socialLinks: HomeSocialLink[]; children: ReactNode }) {
  return (
    <div
      id="top"
      className={`home-theme ${homeFontVariables} min-h-screen antialiased selection:bg-accent selection:text-white overflow-x-clip`}
    >
      {/* Klavye kullanıcıları için ilk odaklanan öğe; yalnızca odaklanınca görünür */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-paper focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
      >
        İçeriğe atla
      </a>
      <ScrollAnimations />
      <HashScroll />
      <PageViewTracker />
      <SiteHeader />
      <CommandPalette />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <HomeFooter socialLinks={socialLinks} />
    </div>
  );
}

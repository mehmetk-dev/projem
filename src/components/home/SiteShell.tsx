import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import HomeFooter from './HomeFooter';
import ScrollAnimations from '../ScrollAnimations';
import HashScroll from './HashScroll';
import PageViewTracker from './PageViewTracker';
import { homeFontVariables } from './fonts';
import type { HomeSocialLink } from './types';
import '@/app/portfolio.css';

// Açık temalı public sayfaların ortak iskeleti (ana sayfa, projeler)
export default function SiteShell({ socialLinks, children }: { socialLinks: HomeSocialLink[]; children: ReactNode }) {
  return (
    <div
      className={`home-theme ${homeFontVariables} min-h-screen antialiased selection:bg-accent selection:text-white overflow-x-clip`}
    >
      <ScrollAnimations />
      <HashScroll />
      <PageViewTracker />
      <SiteHeader />
      <main>{children}</main>
      <HomeFooter socialLinks={socialLinks} />
    </div>
  );
}

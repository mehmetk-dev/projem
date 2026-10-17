import type { ReactNode } from 'react';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import SiteHeader from './SiteHeader';
import HomeFooter from './HomeFooter';
import ScrollAnimations from '../ScrollAnimations';
import HashScroll from './HashScroll';
import type { HomeSocialLink } from './types';
import '@/app/portfolio.css';

const geist = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono', display: 'swap' });
const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-instrument',
  display: 'swap',
});

// Açık temalı public sayfaların ortak iskeleti (ana sayfa, projeler)
export default function SiteShell({ socialLinks, children }: { socialLinks: HomeSocialLink[]; children: ReactNode }) {
  return (
    <div
      className={`home-theme ${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} min-h-screen antialiased selection:bg-accent selection:text-white overflow-x-clip`}
    >
      <ScrollAnimations />
      <HashScroll />
      <SiteHeader />
      <main>{children}</main>
      <HomeFooter socialLinks={socialLinks} />
    </div>
  );
}

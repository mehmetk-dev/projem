'use client';

import dynamic from 'next/dynamic';
import BubbleMenu from './BubbleMenu';
import HeroSection from './HeroSection';
import MarqueeBanner from './MarqueeBanner';
import Footer from './Footer';
import ScrollAnimations from './ScrollAnimations';

// Lazy-load below-the-fold sections to reduce initial JS parse/eval
const FeaturesSection = dynamic(() => import('./FeaturesSection'), { ssr: false });
const WorkSection = dynamic(() => import('./WorkSection'));
const BlogSection = dynamic(() => import('./BlogSection'));
const ContactSection = dynamic(() => import('./ContactSection'), { ssr: false });

interface PortfolioClientProps {
  user: { email: string } | null;
  logoutAction: () => Promise<void>;
  projects: { id: number; title: string; description: string; image: string; link: string | null; category: string }[];
  blogs: { id: number; title: string; slug: string; excerpt: string | null; content: string; category: string; publishedAt: string | null }[];
}

export default function PortfolioClient({ user, logoutAction, projects, blogs }: PortfolioClientProps) {
  const displayName = user ? user.email.split('@')[0] : 'Mehmet Kerem';

  return (
    <div className="bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden">
      <ScrollAnimations />
      <BubbleMenu logo="M. Kerem" user={user} logoutAction={logoutAction} />
      <main>
        <HeroSection displayName={displayName} />
        <MarqueeBanner />
        <FeaturesSection />
        <WorkSection projects={projects} />
        <BlogSection blogs={blogs} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

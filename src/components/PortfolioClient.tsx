'use client';

import { useEffect } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import MarqueeBanner from './MarqueeBanner';
import WorkSection from './WorkSection';
import BlogSection from './BlogSection';
import NewsletterSection from './NewsletterSection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import FeaturesSection from './FeaturesSection';

interface PortfolioClientProps {
  user: { email: string } | null;
  logoutAction: () => Promise<void>;
  projects: { id: number; title: string; description: string; image: string; link: string | null; category: string }[];
  blogs: { id: number; title: string; slug: string; excerpt: string | null; content: string; category: string; publishedAt: string | null }[];
}

export default function PortfolioClient({ user, logoutAction, projects, blogs }: PortfolioClientProps) {
  const displayName = user ? user.email.split('@')[0] : 'Mehmet Kerem';

  useEffect(() => {
    document.documentElement.classList.add('js-animations');

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden">
      <Header user={user} logoutAction={logoutAction} />
      <main>
        <HeroSection displayName={displayName} />
        <MarqueeBanner />
        <FeaturesSection />
        <WorkSection projects={projects} />
        <BlogSection blogs={blogs} />
        <NewsletterSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

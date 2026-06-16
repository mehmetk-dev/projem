import Header from './Header';
import HeroSection from './HeroSection';
import MarqueeBanner from './MarqueeBanner';
import WorkSection from './WorkSection';
import BlogSection from './BlogSection';
import NewsletterSection from './NewsletterSection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import FeaturesSection from './FeaturesSection';
import ScrollAnimations from './ScrollAnimations';

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

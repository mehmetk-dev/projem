import SiteShell from './home/SiteShell';
import HomeHero from './home/HomeHero';
import TechStrip from './home/TechStrip';
import FeaturedWork from './home/FeaturedWork';
import ServicesSection from './home/ServicesSection';
import ProcessSection from './home/ProcessSection';
import LatestPosts from './home/LatestPosts';
import ContactCta from './home/ContactCta';
import type { HomeBlog, HomeProject, HomeSocialLink } from './home/types';

interface PortfolioClientProps {
  projects: HomeProject[];
  blogs: HomeBlog[];
  socialLinks: HomeSocialLink[];
}

export default function PortfolioClient({ projects, blogs, socialLinks }: PortfolioClientProps) {
  return (
    <SiteShell socialLinks={socialLinks}>
      <HomeHero socialLinks={socialLinks} />
      <TechStrip />
      <FeaturedWork projects={projects} />
      <ServicesSection />
      <ProcessSection />
      <LatestPosts blogs={blogs} />
      <ContactCta />
    </SiteShell>
  );
}

import SiteShell from './home/SiteShell';
import HomeHero from './home/HomeHero';
import TechStrip from './home/TechStrip';
import FeaturedWork from './home/FeaturedWork';
import ServicesSection from './home/ServicesSection';
import ProcessSection from './home/ProcessSection';
import LatestPosts from './home/LatestPosts';
import Testimonials from './home/Testimonials';
import ContactCta from './home/ContactCta';
import type { Availability } from '@/lib/availability';
import type { HomeBlog, HomeProject, HomeSocialLink, HomeTestimonial } from './home/types';

interface PortfolioClientProps {
  projects: HomeProject[];
  blogs: HomeBlog[];
  testimonials: HomeTestimonial[];
  availability: Availability;
  socialLinks: HomeSocialLink[];
}

export default function PortfolioClient({ projects, blogs, testimonials, availability, socialLinks }: PortfolioClientProps) {
  return (
    <SiteShell socialLinks={socialLinks}>
      <HomeHero socialLinks={socialLinks} availability={availability} />
      <TechStrip />
      <FeaturedWork projects={projects} />
      <Testimonials testimonials={testimonials} />
      <ServicesSection />
      <ProcessSection />
      <LatestPosts blogs={blogs} />
      <ContactCta availability={availability} />
    </SiteShell>
  );
}

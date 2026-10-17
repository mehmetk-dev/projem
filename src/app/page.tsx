import { getPublishedProjects } from '@/app/actions/projects';
import { getPublishedBlogs } from '@/app/actions/blogs';
import { getSocialLinks } from '@/app/actions/social';
import PortfolioClient from '@/components/PortfolioClient';

export const revalidate = 3600;

export default async function HomePage() {
  const [projects, blogs, socialLinks] = await Promise.all([
    getPublishedProjects().catch(() => []),
    getPublishedBlogs({ limit: 3 }).catch(() => []),
    getSocialLinks().catch(() => []),
  ]);

  return (
    <PortfolioClient
      projects={projects}
      blogs={blogs}
      socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}
    />
  );
}

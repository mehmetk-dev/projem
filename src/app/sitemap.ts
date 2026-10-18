import { MetadataRoute } from 'next';
import { getPublishedBlogs } from '@/app/actions/blogs';
import { getPublishedProjects } from '@/app/actions/projects';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/hakkimda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/guestbook`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/webp-converter`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/gizlilik`, lastModified: new Date('2026-10-18'), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [blogs, projects] = await Promise.all([
    getPublishedBlogs().catch(() => []),
    getPublishedProjects().catch(() => []),
  ]);

  const blogPages: MetadataRoute.Sitemap = blogs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt || post.createdAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(project.createdAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...projectPages];
}

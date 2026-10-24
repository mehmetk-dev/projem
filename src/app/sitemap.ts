import { MetadataRoute } from 'next';
import { getPublishedBlogs } from '@/app/actions/blogs';
import { getPublishedProjects } from '@/app/actions/projects';
import { getNowPage } from '@/app/actions/settings';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl;

  const [blogs, projects, nowPage] = await Promise.all([
    getPublishedBlogs().catch(() => []),
    getPublishedProjects().catch(() => []),
    getNowPage(),
  ]);

  // Liste sayfaları için en yeni içeriğin tarihi; içerik yoksa lastModified verilmez
  const latestDate = (dates: Array<string | Date | null | undefined>) => {
    const times = dates.filter(Boolean).map((d) => new Date(d as string | Date).getTime()).filter((t) => !Number.isNaN(t));
    return times.length ? new Date(Math.max(...times)) : undefined;
  };
  const blogLastModified = latestDate(blogs.map((post) => post.updatedAt || post.publishedAt || post.createdAt));
  const projectsLastModified = latestDate(projects.map((project) => project.updatedAt || project.createdAt));

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/hakkimda`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: projectsLastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: blogLastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/guestbook`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/webp-converter`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/gizlilik`, lastModified: new Date('2026-10-18'), changeFrequency: 'yearly', priority: 0.2 },
  ];

  if (nowPage.content) {
    staticPages.push({
      url: `${baseUrl}/simdi`,
      lastModified: nowPage.updatedAt ? new Date(nowPage.updatedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

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

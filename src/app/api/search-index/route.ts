import { getPublishedProjects } from '@/app/actions/projects';
import { getPublishedBlogs } from '@/app/actions/blogs';
import { getNowPage } from '@/app/actions/settings';

// Komut paleti (⌘K) için hafif içerik listesi; saatte bir yeniden üretilir
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const [projects, posts, nowPage] = await Promise.all([
    getPublishedProjects().catch(() => []),
    getPublishedBlogs({ limit: 100 }).catch(() => []),
    getNowPage(),
  ]);

  return Response.json({
    hasNowPage: Boolean(nowPage.content),
    projects: projects.map(({ title, slug, category }) => ({ title, slug, category })),
    posts: posts.map(({ title, slug, category }) => ({ title, slug, category })),
  });
}

import Link from 'next/link';
import { searchContent } from '@/app/actions/search';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import BubbleMenu from '@/components/BubbleMenu';

export const metadata: Metadata = {
  title: 'Ara | Mehmet Kerem',
  description: 'Blog yazıları ve projelerde ara.',
};

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [params, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const query = params.q || '';
  const result = query.trim().length >= 2 ? await searchContent(query) : { blogs: [], projects: [] };
  const total = result.blogs.length + result.projects.length;

  async function handleLogout() {
    'use server';
    await logout();
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <BubbleMenu logo="M. Kerem" user={user ? { email: user.email } : null} logoutAction={handleLogout} />

      <main className="container mx-auto px-6 lg:px-12 pt-20 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Arama</h1>
          <form action="/search" method="GET" className="mb-12">
            <div className="relative">
              <input
                name="q"
                type="text"
                defaultValue={query}
                placeholder="Blog yazısı veya proje ara..."
                className="w-full bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-300 dark:border-white/10 rounded-2xl px-6 py-4 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 dark:focus:border-white/30 transition-colors text-lg"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 transition-transform"
              >
                Ara
              </button>
            </div>
          </form>

          {query.trim().length > 0 && (
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8">
              <span className="text-neutral-900 dark:text-white font-medium">&quot;{query}&quot;</span> için {total} sonuç bulundu.
            </p>
          )}

          {result.blogs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mb-6">Blog Yazıları</h2>
              <div className="flex flex-col gap-4">
                {result.blogs.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 hover:bg-neutral-200 dark:hover:bg-neutral-900/80 transition-all"
                  >
                    <span className="text-[10px] font-medium tracking-[0.2em] text-neutral-500 dark:text-neutral-400 uppercase border border-neutral-300 dark:border-white/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mt-4 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 line-clamp-2">
                      {post.excerpt || post.content.slice(0, 200).replace(/[#*`]/g, '') + '...'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {result.projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mb-6">Projeler</h2>
              <div className="flex flex-col gap-4">
                {result.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 hover:bg-neutral-200 dark:hover:bg-neutral-900/80 transition-all"
                  >
                    <span className="text-[10px] font-medium tracking-[0.2em] text-neutral-500 dark:text-neutral-400 uppercase border border-neutral-300 dark:border-white/10 px-3 py-1 rounded-full">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mt-4 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 line-clamp-2">
                      {project.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query.trim().length >= 2 && total === 0 && (
            <div className="text-center py-24">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Arama kriterlerinize uygun sonuç bulunamadı.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-neutral-200 dark:border-white/10 py-10">
        <div className="container mx-auto px-6 text-center text-[11px] font-mono tracking-[0.1em] text-neutral-500 dark:text-neutral-400 uppercase">
          © 2026 Mehmet Kerem. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}

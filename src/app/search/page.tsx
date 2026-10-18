import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Search } from 'lucide-react';
import { searchContent } from '@/app/actions/search';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';
import { postExcerpt } from '@/components/blog/post-utils';
import { projectTeaser } from '@/components/home/project-utils';

export const metadata: Metadata = {
  title: 'Ara | Mehmet Kerem',
  description: 'Blog yazıları ve projelerde ara.',
  // Sonuç sayfaları arama motorlarında listelenmez
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

interface ResultItem {
  key: string;
  href: string;
  category: string;
  title: string;
  text: string;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [params, socialLinks] = await Promise.all([searchParams, getSocialLinks().catch(() => [])]);
  const query = (params.q || '').trim();
  const result = query.length >= 2 ? await searchContent(query) : { blogs: [], projects: [] };
  const total = result.blogs.length + result.projects.length;

  const groups: { title: string; items: ResultItem[] }[] = [
    {
      title: 'Blog yazıları',
      items: result.blogs.map((post) => ({
        key: `blog-${post.id}`,
        href: `/blog/${post.slug}`,
        category: post.category,
        title: post.title,
        text: postExcerpt(post, 200),
      })),
    },
    {
      title: 'Projeler',
      items: result.projects.map((project) => ({
        key: `project-${project.id}`,
        href: `/projects/${project.slug}`,
        category: project.category,
        title: project.title,
        text: projectTeaser(project),
      })),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 md:px-8">
          <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Arama</p>
          <h1 className="home-reveal mt-3 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink md:text-6xl">
            Ne <span className="font-serif-display text-accent">arıyorsunuz?</span>
          </h1>

          <form action="/search" method="GET" role="search" className="home-reveal mt-8 md:mt-10">
            <label htmlFor="search-q" className="sr-only">
              Blog yazısı veya proje ara
            </label>
            <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-1.5 pl-5 shadow-[0_12px_32px_-24px_rgba(12,10,9,0.35)] transition-colors focus-within:border-accent">
              <Search size={18} className="shrink-0 text-ink-muted" aria-hidden="true" />
              <input
                id="search-q"
                name="q"
                type="search"
                defaultValue={query}
                minLength={2}
                autoFocus={!query}
                placeholder="Blog yazısı veya proje ara..."
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] text-ink placeholder:text-ink-muted/70 outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
              >
                Ara
              </button>
            </div>
          </form>

          {query.length > 0 && query.length < 2 && (
            <p className="mt-6 text-sm text-ink-muted">Aramak için en az 2 karakter yazın.</p>
          )}

          {query.length >= 2 && (
            <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
              <span className="font-medium text-ink">&quot;{query}&quot;</span> için {total} sonuç bulundu.
            </p>
          )}

          {groups.map((group) => (
            <div key={group.title} className="mt-12">
              <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">
                {group.title} · {group.items.length}
              </h2>
              <ul className="mt-5 space-y-4">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-ink/15 hover:shadow-[0_18px_40px_-24px_rgba(12,10,9,0.3)] md:p-6"
                    >
                      <span className="w-fit rounded-md bg-accent-soft px-2 py-0.5 text-[13px] font-medium text-accent">
                        {item.category}
                      </span>
                      <span className="mt-3 text-xl font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
                        {item.title}
                      </span>
                      {item.text && (
                        <span className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink-soft">{item.text}</span>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                        İncele
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {query.length >= 2 && total === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
              <p className="text-ink-soft">Aramanıza uygun sonuç bulunamadı.</p>
              <p className="mt-2 text-sm text-ink-muted">
                Farklı bir kelime deneyin ya da{' '}
                <Link href="/projects" className="underline underline-offset-2 hover:text-ink">
                  projelere
                </Link>{' '}
                ve{' '}
                <Link href="/blog" className="underline underline-offset-2 hover:text-ink">
                  yazılara
                </Link>{' '}
                göz atın.
              </p>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

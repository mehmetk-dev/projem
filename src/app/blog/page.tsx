import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, PenLine } from 'lucide-react';
import { getPublishedBlogs } from '@/app/actions/blogs';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';
import CtaBand from '@/components/home/CtaBand';
import BlogIndex from '@/components/blog/BlogIndex';
import { postExcerpt, readingMinutes } from '@/components/blog/post-utils';
import { ogImageUrl } from '@/lib/site';

export const revalidate = 3600;

const description = 'Geliştirirken öğrendiklerim, denediğim teknikler ve proje notlarım.';

export const metadata: Metadata = {
  title: 'Blog | Mehmet Kerem',
  description,
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Mehmet Kerem',
    description,
    type: 'website',
    locale: 'tr_TR',
    images: [ogImageUrl('Blog', description)],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Mehmet Kerem',
    description,
    images: [ogImageUrl('Blog', description)],
  },
};

export default async function BlogListPage() {
  const [posts, socialLinks] = await Promise.all([
    getPublishedBlogs().catch(() => []),
    getSocialLinks().catch(() => []),
  ]);

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Blog</p>
            <h1 className="home-reveal mt-3 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink md:text-6xl">
              Notlar ve <span className="font-serif-display text-accent">yazılar</span>
            </h1>
            <p className="home-reveal mt-4 text-[17px] leading-relaxed text-ink-soft md:mt-5 md:text-xl">{description}</p>
          </div>

          {posts.length === 0 ? (
            <div className="home-reveal mt-12 flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface px-6 py-16 text-center md:mt-14 md:py-24">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent">
                <PenLine size={24} />
              </span>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-ink">İlk yazılar hazırlanıyor</h2>
              <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
                Yakında burada geliştirme notları, proje hikâyeleri ve pratik ipuçları olacak. O zamana kadar projelere göz atabilirsiniz.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
                >
                  Projeleri incele
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex items-center rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30"
                >
                  İletişime geç
                </Link>
              </div>
            </div>
          ) : (
            <BlogIndex
              posts={posts.map((post) => ({
                id: post.id,
                slug: post.slug,
                title: post.title,
                category: post.category,
                tags: post.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
                coverImage: post.coverImage,
                publishedAt: post.publishedAt,
                excerpt: postExcerpt(post, 240),
                minutes: readingMinutes(post.content),
              }))}
            />
          )}
        </div>
      </section>

      <CtaBand
        title="Fikrinizi birlikte"
        accent="hayata geçirelim."
        text="Yazılarda anlattığım yaklaşımı sizin projenize de uygulayalım. Kapsamı birlikte netleştirelim."
      />
    </SiteShell>
  );
}

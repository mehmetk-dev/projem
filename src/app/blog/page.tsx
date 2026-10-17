import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight, PenLine } from 'lucide-react';
import { getPublishedBlogs } from '@/app/actions/blogs';
import { getSocialLinks } from '@/app/actions/social';
import SiteShell from '@/components/home/SiteShell';
import CtaBand from '@/components/home/CtaBand';
import ImageWithFallback from '@/components/ImageWithFallback';
import { formatPostDate, postExcerpt, readingMinutes } from '@/components/blog/post-utils';

export const revalidate = 3600;

const description = 'Geliştirirken öğrendiklerim, denediğim teknikler ve proje notlarım.';

export const metadata: Metadata = {
  title: 'Blog | Mehmet Kerem',
  description,
  openGraph: {
    title: 'Blog | Mehmet Kerem',
    description,
    type: 'website',
    locale: 'tr_TR',
  },
};

type Post = Awaited<ReturnType<typeof getPublishedBlogs>>[number];

export default async function BlogListPage() {
  const [posts, socialLinks] = await Promise.all([
    getPublishedBlogs().catch(() => []),
    getSocialLinks().catch(() => []),
  ]);
  const [featured, ...rest] = posts;

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

          {!featured ? (
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
            <>
              <FeaturedPost post={featured} />
              {rest.length > 0 && (
                <div className="mt-6 grid gap-5 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              )}
            </>
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

function PostMeta({ post }: { post: Post }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
      <span className="rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent">{post.category}</span>
      {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
      <span aria-hidden="true">·</span>
      <span>{readingMinutes(post.content)} dk okuma</span>
    </div>
  );
}

function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="home-reveal group mt-12 grid overflow-hidden rounded-3xl border border-line bg-surface transition-[border-color,box-shadow] duration-300 hover:border-ink/15 hover:shadow-[0_24px_60px_-32px_rgba(12,10,9,0.35)] md:mt-14 md:grid-cols-2"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-surface-2 to-accent-soft md:aspect-auto md:min-h-[320px]">
        {post.coverImage ? (
          <ImageWithFallback
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            hideOnError
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-serif-display text-7xl text-accent/40">
            {post.title.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex flex-col p-6 md:p-10">
        <PostMeta post={post} />
        <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.03em] text-ink transition-colors group-hover:text-accent md:text-4xl">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-4 leading-relaxed text-ink-soft">{postExcerpt(post, 240)}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium text-ink">
          Yazıyı oku
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="home-reveal group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_18px_40px_-24px_rgba(12,10,9,0.3)]"
      style={{ '--d': `${Math.min(index, 6) * 0.06}s` } as React.CSSProperties}
    >
      {post.coverImage && (
        <div className="relative aspect-[16/9] bg-surface-2">
          <ImageWithFallback
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover"
            hideOnError
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <PostMeta post={post} />
        <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 leading-relaxed text-ink-soft">{postExcerpt(post)}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
          Devamını oku
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

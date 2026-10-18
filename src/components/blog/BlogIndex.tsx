'use client';

import { Suspense, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import { formatPostDate } from './post-utils';

export interface BlogIndexPost {
  id: number;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  publishedAt: string | null;
  excerpt: string;
  minutes: number;
}

interface Filter {
  category?: string;
  tag?: string;
}

// Blog listesi; ?kategori= ve ?etiket= parametreleriyle istemcide süzülür
export default function BlogIndex({ posts }: { posts: BlogIndexPost[] }) {
  return (
    <Suspense fallback={<BlogList posts={posts} filter={{}} />}>
      <BlogListWithParams posts={posts} />
    </Suspense>
  );
}

function BlogListWithParams({ posts }: { posts: BlogIndexPost[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filter = { category: params.get('kategori') ?? undefined, tag: params.get('etiket') ?? undefined };

  const setFilter = (next: Filter) => {
    const query = new URLSearchParams();
    if (next.category) query.set('kategori', next.category);
    if (next.tag) query.set('etiket', next.tag);
    const search = query.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  return <BlogList posts={posts} filter={filter} onFilter={setFilter} />;
}

function BlogList({ posts, filter, onFilter }: { posts: BlogIndexPost[]; filter: Filter; onFilter?: (f: Filter) => void }) {
  const categories = [...new Set(posts.map((post) => post.category))].map((name) => ({
    name,
    count: posts.filter((post) => post.category === name).length,
  }));
  const isFiltered = Boolean(filter.category || filter.tag);
  const visible = posts.filter(
    (post) =>
      (!filter.category || post.category === filter.category) &&
      (!filter.tag || post.tags.some((tag) => tag.toLocaleLowerCase('tr-TR') === filter.tag?.toLocaleLowerCase('tr-TR')))
  );
  const [featured, ...rest] = visible;

  const chip = (active: boolean) =>
    `inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[14px] transition-colors ${
      active ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-ink-soft hover:border-ink/25 hover:text-ink'
    }`;

  return (
    <>
      {(categories.length > 1 || filter.tag) && (
        <div className="home-reveal mt-10 flex flex-wrap items-center gap-2 md:mt-12" role="group" aria-label="Yazıları süz">
          <button type="button" onClick={() => onFilter?.({})} aria-pressed={!isFiltered} className={chip(!isFiltered)}>
            Tümü <span className="font-mono text-[12px] opacity-60">{posts.length}</span>
          </button>
          {categories.map((category) => {
            const active = filter.category === category.name;
            return (
              <button
                key={category.name}
                type="button"
                aria-pressed={active}
                onClick={() => onFilter?.({ ...filter, category: active ? undefined : category.name })}
                className={chip(active)}
              >
                {category.name} <span className="font-mono text-[12px] opacity-60">{category.count}</span>
              </button>
            );
          })}
          {filter.tag && (
            <button
              type="button"
              onClick={() => onFilter?.({ ...filter, tag: undefined })}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent-soft px-4 text-[14px] font-medium text-accent transition-colors hover:bg-accent hover:text-white"
              aria-label={`#${filter.tag} etiketini kaldır`}
            >
              #{filter.tag}
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="text-lg text-ink">Bu filtreye uyan yazı yok.</p>
          <button
            type="button"
            onClick={() => onFilter?.({})}
            className="mt-4 text-[15px] font-medium text-accent underline-offset-4 hover:underline"
          >
            Tüm yazıları göster
          </button>
        </div>
      ) : isFiltered ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
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
    </>
  );
}

function PostMeta({ post }: { post: BlogIndexPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
      <span className="rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent">{post.category}</span>
      {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
      <span aria-hidden="true">·</span>
      <span>{post.minutes} dk okuma</span>
    </div>
  );
}

function FeaturedPost({ post }: { post: BlogIndexPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="home-reveal group mt-8 grid overflow-hidden rounded-3xl border border-line bg-surface transition-[border-color,box-shadow] duration-300 hover:border-ink/15 hover:shadow-[0_24px_60px_-32px_rgba(12,10,9,0.35)] md:grid-cols-2"
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
        <p className="mt-4 line-clamp-4 leading-relaxed text-ink-soft">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium text-ink">
          Yazıyı oku
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post, index }: { post: BlogIndexPost; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="home-reveal group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_18px_40px_-24px_rgba(12,10,9,0.3)]"
      style={{ '--d': `${Math.min(index, 6) * 0.06}s` } as CSSProperties}
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
        <p className="mt-3 line-clamp-3 flex-1 leading-relaxed text-ink-soft">{post.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
          Devamını oku
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

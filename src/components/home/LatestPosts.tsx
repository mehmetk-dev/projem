import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { HomeBlog } from './types';

function excerptOf(post: HomeBlog) {
  if (post.excerpt) return post.excerpt;
  return post.content.slice(0, 140).replace(/[#*`>_\[\]]/g, '').trim() + '…';
}

export default function LatestPosts({ blogs }: { blogs: HomeBlog[] }) {
  if (blogs.length === 0) return null;

  return (
    <section id="blog" className="scroll-mt-16 border-t border-line bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="animate-on-scroll flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Blog</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink md:text-5xl">Notlar ve yazılar</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Geliştirirken öğrendiklerimi, denediğim teknikleri ve proje notlarımı paylaşıyorum.
            </p>
          </div>
          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-ink transition-colors hover:text-accent"
          >
            Tüm yazılar
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {blogs.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="animate-on-scroll group flex flex-col rounded-2xl border border-line bg-paper p-7 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_18px_40px_-24px_rgba(12,10,9,0.3)]"
            >
              <div className="flex items-center gap-3 text-[13px] text-ink-muted">
                <span className="rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent">{post.category}</span>
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                )}
              </div>
              <h3 className="mt-5 text-xl font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
                {post.title}
              </h3>
              <p className="mt-3 line-clamp-3 flex-1 leading-relaxed text-ink-soft">{excerptOf(post)}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                Devamını oku
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

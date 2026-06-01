'use client';

import Link from 'next/link';
import { ArrowIcon } from './Icons';

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  publishedAt: string | null;
}

interface BlogSectionProps {
  blogs: BlogItem[];
}

export default function BlogSection({ blogs }: BlogSectionProps) {
  const displayBlogs = blogs.length > 0 ? blogs : [];

  return (
    <section id="blog" className="py-32 lg:py-48 bg-neutral-950/50 border-y border-white/5 relative">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 animate-on-scroll">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-700">
            Son
            <br />
            Yazılar
          </h2>
          <Link href="/blog" className="mt-8 md:mt-0 pb-2 border-b border-white/20 text-sm font-medium tracking-widest uppercase hover:border-white transition-colors">
            Tümünü İncele
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          {displayBlogs.length === 0 ? (
            <div className="text-center py-12 text-neutral-600 text-sm">
              Henüz yayınlanmış bir yazı yok.
            </div>
          ) : (
            displayBlogs.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: BlogItem }) {
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group cursor-pointer p-8 md:p-12 rounded-[2rem] bg-neutral-900/30 border border-white/5 hover:bg-neutral-900/80 transition-all duration-500 animate-on-scroll">
        <div className="flex flex-col md:flex-row md:items-center gap-8 justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
                {post.category}
              </span>
              <span className="text-[12px] font-mono text-neutral-600">{dateStr}</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4 group-hover:text-neutral-300 transition-colors">
              {post.title}
            </h3>
            <p className="text-neutral-500 font-light text-lg md:text-xl max-w-2xl">
              {post.excerpt || post.content.slice(0, 160).replace(/[#*`]/g, '') + '...'}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shrink-0">
            <ArrowIcon />
          </div>
        </div>
      </article>
    </Link>
  );
}

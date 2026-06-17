import { getBlogBySlug, getPublishedBlogs } from '@/app/actions/blogs';
import { getApprovedComments } from '@/app/actions/comments';
import CommentsSection from '@/components/blog/CommentsSection';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BubbleMenu from '@/components/BubbleMenu';

export const revalidate = 3600;

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const list = await getPublishedBlogs();
    return list.map((post) => ({
      slug: post.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: 'Bulunamadı | Mehmet Kerem',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ogTitle = post.metaTitle || post.title;
  const ogDesc = post.metaDescription || post.excerpt || post.content.slice(0, 160);
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(ogTitle)}&description=${encodeURIComponent(ogDesc)}`;

  return {
    title: ogTitle,
    description: ogDesc,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      locale: 'tr_TR',
      images: [ogImageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDesc,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const approvedComments = await getApprovedComments(post.id);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <BubbleMenu logo="M. Kerem" />

      <main className="container mx-auto px-6 lg:px-12 pt-20 pb-16">
        <article className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
              {post.category}
            </span>
            <span className="text-[12px] font-mono text-neutral-600">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </span>
          </div>

          {post.coverImage && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-white/5 relative h-64 md:h-80">
              <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" priority />
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">{post.title}</h1>

          {post.excerpt && (
            <p className="text-xl text-neutral-400 font-light leading-relaxed mb-10 border-l-2 border-white/20 pl-6 italic">
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-invert prose-lg max-w-none text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {post.tags && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-white/10">
              {post.tags.split(',').map((tag) => (
                <span key={tag} className="text-[11px] text-neutral-500 bg-white/5 px-3 py-1.5 rounded-full">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          <div className="mt-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Tüm Yazılara Dön
            </Link>
          </div>

          <CommentsSection blogId={post.id} comments={approvedComments} />
        </article>
      </main>

      <footer className="border-t border-neutral-200 dark:border-white/10 py-10">
        <div className="container mx-auto px-6 text-center text-[11px] font-mono tracking-[0.1em] text-neutral-600 uppercase">
          © 2026 Mehmet Kerem. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}

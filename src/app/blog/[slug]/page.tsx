import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getBlogBySlug, getPublishedBlogs } from '@/app/actions/blogs';
import { getApprovedComments } from '@/app/actions/comments';
import { getSocialLinks } from '@/app/actions/social';
import CommentsSection from '@/components/blog/CommentsSection';
import SiteShell from '@/components/home/SiteShell';
import CtaBand from '@/components/home/CtaBand';
import ImageWithFallback from '@/components/ImageWithFallback';
import { contentBlocks, formatPostDate, postExcerpt, readingMinutes } from '@/components/blog/post-utils';
import JsonLd from '@/components/JsonLd';
import { siteUrl, sitePerson, ogImageUrl as buildOgImageUrl } from '@/lib/site';

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

  const ogTitle = post.metaTitle || post.title;
  const ogDesc = post.metaDescription || post.excerpt || post.content.slice(0, 160);
  const ogImageUrl = buildOgImageUrl(ogTitle, ogDesc, `Blog · ${post.category}`);

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

  const [approvedComments, allPosts, socialLinks] = await Promise.all([
    getApprovedComments(post.id),
    getPublishedBlogs().catch(() => []),
    getSocialLinks().catch(() => []),
  ]);
  const morePosts = allPosts.filter((item) => item.id !== post.id).slice(0, 2);
  const tags = post.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: postExcerpt(post),
    url: `${siteUrl}/blog/${post.slug}`,
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    image: post.coverImage ? new URL(post.coverImage, siteUrl).toString() : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    articleSection: post.category,
    keywords: tags.join(', ') || undefined,
    inLanguage: 'tr-TR',
    author: sitePerson,
  };

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <JsonLd data={jsonLd} />
      <article className="pt-24 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Tüm yazılar
          </Link>

          <div className="home-reveal mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted md:mt-8">
            <span className="rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent">{post.category}</span>
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(post.content)} dk okuma</span>
          </div>

          <h1 className="home-reveal mt-4 text-[2.2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ink md:text-6xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="home-reveal mt-5 text-lg leading-relaxed text-ink-soft md:text-xl">{post.excerpt}</p>
          )}
        </div>

        {post.coverImage && (
          <div className="home-reveal mx-auto mt-10 max-w-5xl px-5 md:mt-14 md:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-surface-2 md:rounded-3xl">
              <ImageWithFallback
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover"
                hideOnError
              />
            </div>
          </div>
        )}

        <div className="mx-auto mt-10 max-w-3xl px-5 md:mt-14 md:px-8">
          <div className="space-y-6 text-[17px] leading-[1.8] text-ink-soft md:text-lg">
            {contentBlocks(post.content).map((block, index) => {
              switch (block.type) {
                case 'heading':
                  return block.level === 2 ? (
                    <h2 key={index} className="!mt-12 text-2xl font-semibold tracking-[-0.02em] text-ink md:text-3xl">
                      {block.text}
                    </h2>
                  ) : (
                    <h3 key={index} className="!mt-10 text-xl font-semibold tracking-[-0.01em] text-ink">
                      {block.text}
                    </h3>
                  );
                case 'quote':
                  return (
                    <blockquote
                      key={index}
                      className="whitespace-pre-wrap border-l-2 border-accent pl-5 font-serif-display text-xl text-ink md:text-2xl"
                    >
                      {block.text}
                    </blockquote>
                  );
                case 'code':
                  return (
                    <pre
                      key={index}
                      className="overflow-x-auto rounded-2xl bg-ink p-5 font-mono text-[14px] leading-relaxed text-white/90"
                    >
                      <code>{block.text}</code>
                    </pre>
                  );
                case 'list':
                  return (
                    <ul key={index} className="list-disc space-y-2 pl-6 marker:text-accent">
                      {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  );
                default:
                  return (
                    <p key={index} className="whitespace-pre-wrap">
                      {block.text}
                    </p>
                  );
              }
            })}
          </div>

          {tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-line pt-8">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-surface-2 px-3 py-1 text-[13px] text-ink-soft">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <CommentsSection blogId={post.id} comments={approvedComments} />

          {morePosts.length > 0 && (
            <section className="mt-16 border-t border-line pt-10">
              <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">Diğer yazılar</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {morePosts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-ink/20"
                  >
                    <span className="text-[13px] text-ink-muted">{item.category}</span>
                    <span className="mt-2 font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
                      {item.title}
                    </span>
                    <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{postExcerpt(item, 110)}</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ink">
                      Oku
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <CtaBand
        title="Bir projeniz"
        accent="mi var?"
        text="Benzer bir ihtiyacınız varsa kısaca anlatın, birlikte en uygun çözümü bulalım."
      />
    </SiteShell>
  );
}

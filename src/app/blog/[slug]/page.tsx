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
import { formatPostDate, postExcerpt, postHeadings, readingMinutes } from '@/components/blog/post-utils';
import PostBody from '@/components/blog/PostBody';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ShareLinks from '@/components/blog/ShareLinks';
import { TableOfContents, TableOfContentsMobile } from '@/components/blog/TableOfContents';
import JsonLd from '@/components/JsonLd';
import { normalizeMediaUrl } from '@/lib/media-url';
import { siteUrl, sitePerson, ogImages, ogCommon } from '@/lib/site';

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
  // Kapak varsa o kullanılır (boyutu bilinmez); SVG sosyal ağlarda görünmez, o zaman dinamik kart üretilir
  const cover = normalizeMediaUrl(post.coverImage);
  const images =
    cover && !cover.toLowerCase().split('?')[0].endsWith('.svg')
      ? [{ url: cover, alt: ogTitle }]
      : ogImages(ogTitle, ogDesc, `Blog · ${post.category}`);
  const tags = post.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    title: `${ogTitle} | Mehmet Kerem`,
    description: ogDesc,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      type: 'article',
      url: `/blog/${post.slug}`,
      ...ogCommon,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || post.publishedAt || undefined,
      authors: ['Mehmet Kerem'],
      tags: tags.length > 0 ? tags : undefined,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDesc,
      images,
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
    getApprovedComments(post.id).catch(() => []),
    getPublishedBlogs().catch(() => []),
    getSocialLinks().catch(() => []),
  ]);
  const morePosts = allPosts.filter((item) => item.id !== post.id).slice(0, 2);
  const headings = postHeadings(post.content);
  // Kısa yazılarda içindekiler gereksiz kalabalık yapar
  const showToc = headings.length >= 3;
  const bodyRow = post.coverImage ? 'xl:row-start-3' : 'xl:row-start-2';
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
    publisher: sitePerson,
  };

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <JsonLd data={jsonLd} />
      <ReadingProgress targetId="post-body" />
      <article className="pt-24 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-[68rem] px-5 md:px-8 xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-x-16">
          <header className="mx-auto max-w-3xl xl:mx-0">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
              Tüm yazılar
            </Link>

            <div className="home-reveal mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted md:mt-8">
              <Link
                href={`/blog?kategori=${encodeURIComponent(post.category)}`}
                className="rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent transition-colors hover:bg-accent hover:text-white"
              >
                {post.category}
              </Link>
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
          </header>

          {post.coverImage && (
            <div className="home-reveal mt-10 md:mt-14 xl:col-span-2">
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

          <div className={`mx-auto mt-10 max-w-3xl md:mt-14 xl:col-start-1 xl:mx-0 ${bodyRow}`}>
            {showToc && (
              <div className="mb-10 xl:hidden">
                <TableOfContentsMobile headings={headings} />
              </div>
            )}

            <div id="post-body">
              <PostBody content={post.content} />
            </div>

            <div className="mt-12 flex flex-col gap-5 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
              {tags.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={`/blog?etiket=${encodeURIComponent(tag)}`}
                        className="inline-block rounded-full bg-surface-2 px-3 py-1 text-[13px] text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                      >
                        #{tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <span />
              )}
              <ShareLinks url={`${siteUrl}/blog/${post.slug}`} title={post.title} />
            </div>

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

          {showToc && (
            <aside className={`hidden xl:col-start-2 xl:block ${bodyRow}`}>
              <div className="sticky top-28 mt-14">
                <TableOfContents headings={headings} />
              </div>
            </aside>
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

import { getPublishedBlogs } from '@/app/actions/blogs';
import { NextResponse } from 'next/server';
import { logServerError } from '@/lib/server/error-response';

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const blogPosts = await getPublishedBlogs({ limit: 50 });

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Mehmet Kerem | Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Tasarım, yazılım ve ürün düşünce yapısı hakkındaki yazılar.</description>
    <language>tr</language>
    <generator>Next.js RSS Feed</generator>
    <ttl>60</ttl>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/favicon.ico</url>
      <title>Mehmet Kerem | Blog</title>
      <link>${siteUrl}/blog</link>
    </image>
    ${blogPosts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${escapeXml(post.title)}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date(post.createdAt).toUTCString()}</pubDate>
      <category><![CDATA[${escapeXml(post.category)}]]></category>
      ${post.tags ? post.tags.split(',').map((tag) => `<category><![CDATA[${escapeXml(tag.trim())}]]></category>`).join('') : ''}
      <description><![CDATA[${escapeXml(post.excerpt || post.content.slice(0, 300))}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      ${post.coverImage ? `<enclosure url="${post.coverImage}" type="image/jpeg" />` : ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

    return new NextResponse(rss.trim(), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    logServerError('RSS feed error', error);
    return new NextResponse('RSS feed generation failed', { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

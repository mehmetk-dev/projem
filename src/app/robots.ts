import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // OG görselleri ve yüklenen medya, sosyal ağ önizlemeleri için taranabilir kalmalı
        allow: ['/', '/api/og', '/api/media/'],
        disallow: ['/dashboard/', '/api/', '/login', '/register', '/forgot-password', '/reset-password', '/search'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

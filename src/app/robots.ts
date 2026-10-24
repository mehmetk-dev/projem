import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // OG görselleri ve yüklenen medya, sosyal ağ önizlemeleri için taranabilir kalmalı
        allow: ['/', '/api/og', '/api/media/'],
        // /search, /login vb. sayfalar noindex meta taşır; Google'ın meta'yı görebilmesi için taranabilir bırakıldı
        disallow: ['/dashboard/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

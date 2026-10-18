// Sitenin mutlak adresi; metadata, sitemap, robots, RSS ve OG görselleri bunu kullanır.
// Canlıda NEXT_PUBLIC_SITE_URL tanımlanmalı (eski adı NEXT_PUBLIC_BASE_URL da okunur).
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://mehmetkerem.com' : 'http://localhost:3000')
).replace(/\/$/, '');

// JSON-LD'de site sahibini temsil eden kişi kaydı
export const sitePerson = {
  '@type': 'Person',
  name: 'Mehmet Kerem',
  url: siteUrl,
  jobTitle: 'Full-Stack Web Geliştirici',
  address: { '@type': 'PostalAddress', addressLocality: 'İstanbul', addressCountry: 'TR' },
} as const;

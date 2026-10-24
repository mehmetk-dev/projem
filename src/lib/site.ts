// Sitenin mutlak adresi; metadata, sitemap, robots, RSS ve OG görselleri bunu kullanır.
// Canlıda NEXT_PUBLIC_SITE_URL tanımlanmalı (eski adı NEXT_PUBLIC_BASE_URL da okunur).
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://mehmetkerem.com' : 'http://localhost:3000')
).replace(/\/$/, '');

// Dinamik OG görseli için göreli yol; metadataBase mutlak adrese çevirir.
// label sağ üstteki küçük etikettir (ör. "Blog · Frontend").
export function ogImageUrl(title: string, description?: string, label?: string) {
  const params = new URLSearchParams({ title });
  if (description) params.set('description', description);
  if (label) params.set('label', label);
  return `/api/og?${params}`;
}

// OG/Twitter görselleri; boyut ve alt metin sosyal ağlarda önizlemenin doğru çıkmasını sağlar
export function ogImages(title: string, description?: string, label?: string) {
  return [{ url: ogImageUrl(title, description, label), width: 1200, height: 630, alt: title }];
}

// Her openGraph bloğuna yayılır; Next openGraph'ı sığ birleştirdiği için kökten miras kalmaz
export const ogCommon = { siteName: 'Mehmet Kerem', locale: 'tr_TR' } as const;

// JSON-LD'de site sahibini temsil eden kişi kaydı
export const sitePerson = {
  '@type': 'Person',
  name: 'Mehmet Kerem',
  url: siteUrl,
  jobTitle: 'Full-Stack Web Geliştirici',
  address: { '@type': 'PostalAddress', addressLocality: 'İstanbul', addressCountry: 'TR' },
} as const;

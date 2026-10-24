import { getPublishedProjects } from '@/app/actions/projects';
import { getPublishedBlogs } from '@/app/actions/blogs';
import { getSocialLinks } from '@/app/actions/social';
import { getPublishedTestimonials } from '@/app/actions/testimonials';
import { getAvailability } from '@/app/actions/settings';
import PortfolioClient from '@/components/PortfolioClient';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';
import { siteUrl, sitePerson } from '@/lib/site';

export const revalidate = 3600;

// Başlık, açıklama ve OG kökten miras alınır; yalnızca canonical eklenir
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [projects, blogs, socialLinks, testimonials, availability] = await Promise.all([
    getPublishedProjects(),
    getPublishedBlogs({ limit: 3 }).catch(() => []),
    getSocialLinks().catch(() => []),
    getPublishedTestimonials(),
    getAvailability(),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { ...sitePerson, '@id': `${siteUrl}/#person`, ...(socialLinks.length > 0 && { sameAs: socialLinks.map((link) => link.url) }) },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Mehmet Kerem',
        inLanguage: 'tr-TR',
        publisher: { '@id': `${siteUrl}/#person` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PortfolioClient
        projects={projects}
        blogs={blogs}
        testimonials={testimonials}
        availability={availability}
        socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}
      />
    </>
  );
}

import { getPublishedProjects } from '@/app/actions/projects';
import { getPublishedBlogs } from '@/app/actions/blogs';
import { getSocialLinks } from '@/app/actions/social';
import PortfolioClient from '@/components/PortfolioClient';
import JsonLd from '@/components/JsonLd';
import { siteUrl, sitePerson } from '@/lib/site';

export const revalidate = 3600;

export default async function HomePage() {
  const [projects, blogs, socialLinks] = await Promise.all([
    getPublishedProjects().catch(() => []),
    getPublishedBlogs({ limit: 3 }).catch(() => []),
    getSocialLinks().catch(() => []),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { ...sitePerson, '@id': `${siteUrl}/#person`, sameAs: socialLinks.map((link) => link.url) },
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
        socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}
      />
    </>
  );
}

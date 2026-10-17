import Link from 'next/link';
import type { HomeSocialLink } from './types';

const FOOTER_NAV = [
  { href: '/projects', label: 'Projeler' },
  { href: '/#services', label: 'Hizmetler' },
  { href: '/blog', label: 'Blog' },
  { href: '/#contact', label: 'İletişim' },
];

export default function HomeFooter({ socialLinks }: { socialLinks: HomeSocialLink[] }) {
  return (
    <footer className="py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 text-sm text-ink-muted md:flex-row md:items-center md:justify-between md:px-8">
        <div>© {new Date().getFullYear()} Mehmet Kerem · Full-Stack Web Geliştirici</div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Alt menü">
          {FOOTER_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
          {socialLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              {link.platform}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

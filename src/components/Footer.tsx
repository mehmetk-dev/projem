import Link from 'next/link';

const FOOTER_NAV = [
  { href: '#about', label: 'Hakkımda' },
  { href: '#work', label: 'Projeler' },
  { href: '#blog', label: 'Yazılarım' },
  { href: '#contact', label: 'İletişim' },
];

const SOCIAL_LINKS = [
  { href: '#', label: 'X (Twitter)' },
  { href: '#', label: 'LinkedIn' },
  { href: '#', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
          <Link href="/" className="logo text-4xl font-black tracking-tighter uppercase">
            MEHMET
            <br />
            <span className="text-neutral-600">KEREM.</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-8 md:gap-12 text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400">
            {FOOTER_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-white transition-colors scroll-smooth"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5 text-[11px] font-mono tracking-[0.1em] text-neutral-600 uppercase">
          <div>© 2026 Mehmet Kerem. Tüm hakları saklıdır.</div>
          <div className="flex gap-6">
            {SOCIAL_LINKS.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

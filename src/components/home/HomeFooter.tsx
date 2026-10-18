import Link from 'next/link';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import BrandMark from './BrandMark';
import NewsletterForm from './NewsletterForm';
import NowPlaying from './NowPlaying';
import AvailabilityDot from './AvailabilityDot';
import { getAvailability, getNowPage } from '@/app/actions/settings';
import type { HomeSocialLink } from './types';

const EMAIL = 'mehmetkerem2109@gmail.com';

const FOOTER_NAV = [
  { href: '/projects', label: 'Projeler' },
  { href: '/#services', label: 'Hizmetler' },
  { href: '/#process', label: 'Süreç' },
  { href: '/hakkimda', label: 'Hakkımda' },
  { href: '/blog', label: 'Blog' },
  { href: '/#contact', label: 'İletişim' },
];

const FOOTER_EXTRA = [
  { href: '/guestbook', label: 'Ziyaretçi defteri' },
  { href: '/search', label: 'Sitede ara' },
  { href: '/webp-converter', label: 'WebP dönüştürücü' },
  { href: '/feed.xml', label: 'RSS' },
];

const columnTitle = 'font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted';
const columnLink = 'text-[15px] text-ink-soft transition-colors hover:text-ink';

export default async function HomeFooter({ socialLinks }: { socialLinks: HomeSocialLink[] }) {
  const [availability, nowPage] = await Promise.all([getAvailability(), getNowPage()]);
  const extraLinks = nowPage.content ? [{ href: '/simdi', label: 'Şu an ne yapıyorum' }, ...FOOTER_EXTRA] : FOOTER_EXTRA;
  return (
    <footer className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="pt-20 md:pt-24">
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 pt-14 pb-14 lg:flex lg:justify-between lg:gap-10">
          <div className="col-span-2 lg:max-w-xs">
            <BrandMark />
            <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-ink-soft">
              Markalar ve girişimler için hızlı, erişilebilir ve özenle tasarlanmış web deneyimleri.
            </p>
            <Link
              href="/#contact"
              className="group mt-7 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
            >
              Proje başlatalım
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <NowPlaying />
          </div>

          <nav aria-label="Alt menü">
            <h2 className={columnTitle}>Menü</h2>
            <ul className="mt-5 space-y-3">
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={columnLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Diğer sayfalar">
            <h2 className={columnTitle}>Keşfet</h2>
            <ul className="mt-5 space-y-3">
              {extraLinks.map((item) => (
                <li key={item.href}>
                  {/* RSS bir route handler; istemci tarafı gezinme yerine doğrudan açılır */}
                  {item.href.endsWith('.xml') ? (
                    <a href={item.href} className={columnLink}>
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className={columnLink}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {socialLinks.length > 0 && (
            <div>
              <h2 className={columnTitle}>Sosyal</h2>
              <ul className="mt-5 space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group inline-flex items-center gap-1 ${columnLink}`}
                    >
                      {link.platform}
                      <ArrowUpRight
                        size={13}
                        className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="col-span-2 sm:col-span-1">
            <h2 className={columnTitle}>İletişim</h2>
            <ul className="mt-5 space-y-3 text-[15px] text-ink-soft">
              <li>
                <a href={`mailto:${EMAIL}`} className="break-all transition-colors hover:text-accent">
                  {EMAIL}
                </a>
              </li>
              <li>İstanbul, Türkiye</li>
              <li className="inline-flex items-center gap-2">
                <AvailabilityDot status={availability.status} />
                {availability.note}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 md:px-8" aria-hidden="true">
        <p className="select-none whitespace-nowrap text-center text-[clamp(3.5rem,15vw,13rem)] font-semibold leading-[0.8] tracking-[-0.06em] text-ink">
          Mehmet <span className="font-serif-display text-accent">Kerem</span>
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mt-10 flex flex-col gap-4 border-t border-line py-6 text-[13px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Mehmet Kerem. Tüm hakları saklıdır.
            <span className="mx-2" aria-hidden="true">·</span>
            <Link href="/gizlilik" className="transition-colors hover:text-ink">
              Gizlilik Politikası
            </Link>
          </p>
          <a
            href="#top"
            className="group inline-flex w-fit items-center gap-2.5 transition-colors hover:text-ink"
          >
            Başa dön
            <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
              <ArrowUp size={15} className="transition-transform group-hover:-translate-y-0.5" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

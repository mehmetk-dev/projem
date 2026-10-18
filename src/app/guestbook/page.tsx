import type { Metadata } from 'next';
import { getApprovedGuestbookEntries } from '@/app/actions/guestbook';
import { getSocialLinks } from '@/app/actions/social';
import GuestbookForm from '@/components/guestbook/GuestbookForm';
import SiteShell from '@/components/home/SiteShell';
import { ogImageUrl } from '@/lib/site';

export const revalidate = 3600;

const description = 'Düşüncelerinizi, geri bildirimlerinizi ya da sadece bir merhabanızı bırakın.';

export const metadata: Metadata = {
  title: 'Ziyaretçi Defteri | Mehmet Kerem',
  description,
  alternates: { canonical: '/guestbook' },
  openGraph: {
    title: 'Ziyaretçi Defteri | Mehmet Kerem',
    description,
    type: 'website',
    locale: 'tr_TR',
    images: [ogImageUrl('Ziyaretçi Defteri', description)],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ziyaretçi Defteri | Mehmet Kerem',
    description,
    images: [ogImageUrl('Ziyaretçi Defteri', description)],
  },
};

export default async function GuestbookPage() {
  const [entries, socialLinks] = await Promise.all([
    getApprovedGuestbookEntries().catch(() => []),
    getSocialLinks().catch(() => []),
  ]);

  return (
    <SiteShell socialLinks={socialLinks.map(({ platform, url }) => ({ platform, url }))}>
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 md:px-8">
          <p className="home-reveal font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Ziyaretçi defteri</p>
          <h1 className="home-reveal mt-3 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] text-ink md:text-6xl">
            Bir not <span className="font-serif-display text-accent">bırakın.</span>
          </h1>
          <p className="home-reveal mt-4 text-[17px] leading-relaxed text-ink-soft md:mt-5 md:text-xl">{description}</p>

          <div className="home-reveal mt-10 md:mt-12" style={{ '--d': '0.08s' } as React.CSSProperties}>
            <GuestbookForm />
          </div>

          <div className="mt-14">
            <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">{entries.length} mesaj</h2>
            {entries.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-line py-12 text-center">
                <p className="text-sm text-ink-muted">Henüz onaylanmış bir mesaj yok. İlk mesajı siz bırakın!</p>
              </div>
            ) : (
              <ul className="mt-5 space-y-4">
                {entries.map((entry) => (
                  <li key={entry.id} className="animate-on-scroll rounded-2xl border border-line bg-surface p-5 md:p-6">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-semibold text-ink">{entry.name}</span>
                      </div>
                      <time dateTime={entry.createdAt} className="shrink-0 text-[12px] text-ink-muted">
                        {new Date(entry.createdAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">{entry.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

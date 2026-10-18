import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { HomeTestimonial } from './types';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('tr-TR'))
    .join('');
}

export function TestimonialPerson({ testimonial, dark = false }: { testimonial: HomeTestimonial; dark?: boolean }) {
  const detail = [testimonial.role, testimonial.company].filter(Boolean).join(' · ');
  return (
    <div className="flex items-center gap-3">
      {testimonial.avatar ? (
        // Avatarlar farklı alan adlarından gelebilir; next/image yapılandırması gerektirmesin
        // eslint-disable-next-line @next/next/no-img-element
        <img src={testimonial.avatar} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[14px] font-semibold ${
            dark ? 'bg-white/10 text-white' : 'bg-accent-soft text-accent'
          }`}
          aria-hidden="true"
        >
          {initials(testimonial.name)}
        </span>
      )}
      <div className="min-w-0">
        <p className={`font-semibold leading-tight ${dark ? 'text-white' : 'text-ink'}`}>{testimonial.name}</p>
        {detail && <p className={`mt-0.5 text-[14px] ${dark ? 'text-white/55' : 'text-ink-muted'}`}>{detail}</p>}
      </div>
    </div>
  );
}

export function QuoteMark({ className = '' }: { className?: string }) {
  return (
    <span className={`block font-serif-display text-[4.5rem] leading-[0.6] ${className}`} aria-hidden="true">
      “
    </span>
  );
}

function TestimonialCard({ testimonial, dark }: { testimonial: HomeTestimonial; dark: boolean }) {
  return (
    <figure
      className={`animate-on-scroll flex h-full flex-col rounded-[28px] p-7 md:p-9 ${
        dark ? 'bg-ink text-white' : 'border border-line bg-surface text-ink'
      }`}
    >
      <QuoteMark className={dark ? 'text-[#93b4f8]' : 'text-accent'} />
      <blockquote className={`mt-1 flex-1 text-lg leading-relaxed md:text-xl ${dark ? 'text-white/90' : 'text-ink'}`}>
        {testimonial.quote}
      </blockquote>
      <figcaption className={`mt-8 flex flex-wrap items-end justify-between gap-4 border-t pt-6 ${dark ? 'border-white/15' : 'border-line'}`}>
        <TestimonialPerson testimonial={testimonial} dark={dark} />
        {testimonial.projectSlug && (
          <Link
            href={`/projects/${testimonial.projectSlug}`}
            className={`group inline-flex items-center gap-1 text-[14px] font-medium transition-colors ${
              dark ? 'text-white/70 hover:text-white' : 'text-ink-soft hover:text-accent'
            }`}
          >
            {testimonial.projectTitle}
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </figcaption>
    </figure>
  );
}

// Ana sayfadaki referanslar; panelde yayında yorum yoksa bölüm hiç çizilmez
export default function Testimonials({ testimonials }: { testimonials: HomeTestimonial[] }) {
  if (testimonials.length === 0) return null;
  const [first, ...rest] = testimonials;

  return (
    <section id="references" className="scroll-mt-16 pb-24 md:pb-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="animate-on-scroll grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Referanslar</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink md:text-5xl">
              Birlikte çalıştıklarım <span className="font-serif-display text-accent">ne diyor?</span>
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-ink-soft lg:col-span-5">
            Proje bittiğinde geriye kalan en değerli şey, yeniden birlikte çalışmak isteyen insanlar.
          </p>
        </div>

        {rest.length === 0 ? (
          // Tek yorum: geniş, büyük puntolu alıntı
          <figure className="animate-on-scroll mt-14 rounded-[32px] bg-ink p-8 text-white md:p-14">
            <QuoteMark className="text-[#93b4f8]" />
            <blockquote className="mt-3 max-w-4xl text-2xl font-medium leading-snug tracking-[-0.02em] md:text-4xl">
              {first.quote}
            </blockquote>
            <figcaption className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-6">
              <TestimonialPerson testimonial={first} dark />
              {first.projectSlug && (
                <Link
                  href={`/projects/${first.projectSlug}`}
                  className="group inline-flex items-center gap-1 text-[15px] font-medium text-white/70 transition-colors hover:text-white"
                >
                  {first.projectTitle} vaka çalışması
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
            </figcaption>
          </figure>
        ) : (
          <div className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} dark={index % 3 === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

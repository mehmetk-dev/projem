import Link from 'next/link';

// Marka işareti: kesişen iki daire (tasarım ∩ kod) + yazı logosu
export default function BrandMark({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label="Mehmet Kerem — ana sayfa" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 30 28" className="h-7 w-[30px] shrink-0 overflow-visible" aria-hidden="true">
        <circle
          cx="10"
          cy="14"
          r="9"
          className="fill-ink transition-transform duration-500 ease-out group-hover:-translate-x-[2px]"
        />
        <circle
          cx="20"
          cy="14"
          r="9"
          className="fill-accent transition-transform duration-500 ease-out group-hover:translate-x-[2px]"
        />
        <path
          d="M15 6.52A9 9 0 0 1 15 21.48A9 9 0 0 1 15 6.52Z"
          className="fill-paper transition-opacity duration-300 group-hover:opacity-0"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Mehmet <span className="font-serif-display text-[19px] text-accent">Kerem</span>
        </span>
        <span className="mt-1 text-[11px] tracking-[0.02em] text-ink-muted">Full-Stack Web Geliştirici</span>
      </span>
    </Link>
  );
}

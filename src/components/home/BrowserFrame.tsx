import ImageWithFallback from '../ImageWithFallback';

interface BrowserFrameProps {
  src: string;
  alt: string;
  host: string;
  sizes: string;
  priority?: boolean;
  imageClassName?: string;
}

export default function BrowserFrame({ src, alt, host, sizes, priority, imageClassName = '' }: BrowserFrameProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_60px_-28px_rgba(12,10,9,0.35)]">
      <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate rounded-md bg-surface-2 px-3 py-0.5 font-mono text-[11px] text-ink-muted">
          {host}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        <ImageWithFallback
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover object-top ${imageClassName}`}
          hideOnError
        />
      </div>
    </div>
  );
}

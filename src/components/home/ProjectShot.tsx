'use client';

import { useEffect, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface ProjectShotProps {
  src: string;
  alt: string;
  host: string;
  priority?: boolean;
}

// Tarayıcı çerçeveli, oranı korunan ve tıklayınca büyüyen proje görseli
export default function ProjectShot({ src, alt, host, priority }: ProjectShotProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${alt} — büyüt`}
        className="group block w-full cursor-zoom-in rounded-[24px] bg-gradient-to-br from-surface-2 to-accent-soft p-3 text-left transition-transform duration-500 ease-out hover:-translate-y-1 md:p-5"
      >
        <span className="block overflow-hidden rounded-xl border border-line bg-surface shadow-[0_30px_70px_-30px_rgba(12,10,9,0.35)]">
          <span className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 truncate rounded-md bg-surface-2 px-3 py-0.5 font-mono text-[11px] text-ink-muted">
              {host}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 size={13} /> Büyüt
            </span>
          </span>
          {/* Ekran görüntülerinin oranı farklı olduğu için kırpmadan, doğal boyutta gösteriliyor */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            className="block h-auto w-full bg-surface-2"
          />
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm md:p-10"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Kapat"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-lg transition-transform hover:scale-105 md:right-8 md:top-8"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full w-auto max-w-full rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

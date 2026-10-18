'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { RotateCcw, TriangleAlert } from 'lucide-react';
import BrandMark from '@/components/home/BrandMark';
import { homeFontVariables } from '@/components/home/fonts';
import '@/app/portfolio.css';

export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();
  const [initialPathname] = useState(pathname);

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    // If the pathname has changed, attempt to recover by retrying the render.
    // This allows client-side navigation (like back/forward buttons or header links)
    // to work and automatically clear the error state.
    if (pathname !== initialPathname) {
      unstable_retry();
    }
  }, [pathname, initialPathname, unstable_retry]);

  return (
    <div className={`home-theme ${homeFontVariables} flex min-h-screen flex-col antialiased`}>
      <header className="mx-auto w-full max-w-6xl px-5 pt-6 md:px-8">
        <BrandMark />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <TriangleAlert size={24} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-ink">
          Bir şeyler <span className="font-serif-display text-accent">ters gitti.</span>
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Sayfa yüklenirken beklenmeyen bir hata oluştu. Tekrar denemek çoğu zaman sorunu çözer.
        </p>
        {error.digest && <p className="mt-3 font-mono text-[12px] text-ink-muted">Hata kodu: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Tekrar dene
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-flex items-center rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30"
          >
            Ana sayfa
          </a>
        </div>
      </main>
    </div>
  );
}

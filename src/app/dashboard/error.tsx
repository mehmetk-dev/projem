'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function DashboardError({
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
    if (pathname !== initialPathname) {
      unstable_retry();
    }
  }, [pathname, initialPathname, unstable_retry]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold">Bir şeyler ters gitti</h2>
          <p className="text-neutral-400 text-sm mt-2">
            {error.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => unstable_retry()}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors"
          >
            Tekrar Dene
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
          >
            Dashboard&apos;a Dön
          </a>
        </div>
      </div>
    </div>
  );
}
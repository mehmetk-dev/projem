'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ui } from '@/components/dashboard/ui';

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
    <div className="flex items-center justify-center p-4 py-16">
      <div className={`${ui.card} w-full max-w-md space-y-6 p-8 text-center`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600 dark:text-rose-400" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">Bir şeyler ters gitti</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => unstable_retry()} className={ui.btnPrimary}>
            Tekrar Dene
          </button>
          <Link href="/dashboard" className={ui.btnSecondary}>
            Dashboard&apos;a Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

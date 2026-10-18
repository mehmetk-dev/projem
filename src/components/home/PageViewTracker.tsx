'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// SiteShell her sayfada yeniden mount edildiği için modül düzeyinde tutulur: sekmedeki ilk görüntüleme mi?
let isFirstView = true;

// Her sayfa geçişinde tek bir görüntüleme gönderir; çerez veya kimlik kullanılmaz
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;

    // Dış yönlendiren yalnızca siteye girilen ilk sayfada anlamlıdır
    const payload = JSON.stringify({ path: pathname, referrer: isFirstView ? document.referrer : '' });
    isFirstView = false;

    const blob = new Blob([payload], { type: 'application/json' });
    if (!navigator.sendBeacon?.('/api/track', blob)) {
      void fetch('/api/track', { method: 'POST', body: payload, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}

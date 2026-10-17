'use client';

import { useEffect } from 'react';

export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Geliştirmede chunk adları sabit olduğu için SW eski kodu sunar; kayıtlı olanı da kaldır
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  }, []);

  return null;
}

'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <SonnerToaster
      position="bottom-right"
      duration={4000}
      closeButton
      gap={8}
      toastOptions={{
        style: {
          background: isDark ? '#171717' : '#ffffff',
          color: isDark ? '#ffffff' : '#171717',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        },
      }}
      richColors
      theme={isDark ? 'dark' : 'light'}
    />
  );
}

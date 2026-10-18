'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export default function ThemeToggle({ className = '', size = 18 }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  // Yer tutucu, tema okunana kadar düzenin kaymasını önler
  if (!mounted) return <span className={`block h-9 w-9 shrink-0 ${className}`} aria-hidden="true" />;

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      suppressHydrationWarning
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink ${className}`}
    >
      <span className={`block transition-transform duration-500 ${isDark ? 'rotate-0' : 'rotate-180'}`} suppressHydrationWarning>
        {isDark ? <Sun size={size} /> : <Moon size={size} />}
      </span>
    </button>
  );
}

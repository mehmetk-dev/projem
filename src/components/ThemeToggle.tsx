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
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      suppressHydrationWarning
      className={`p-2 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all ${className}`}
    >
      <span className={`block transition-transform duration-500 ${isDark ? 'rotate-0' : 'rotate-180'}`} suppressHydrationWarning>
        {isDark ? <Sun size={size} /> : <Moon size={size} />}
      </span>
    </button>
  );
}

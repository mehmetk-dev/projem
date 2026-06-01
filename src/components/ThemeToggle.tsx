'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export default function ThemeToggle({ className = '', size = 18 }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-full border border-white/10 bg-white/5 ${className}`}
        style={{ width: size + 16, height: size + 16 }}
        aria-label="Tema değiştir"
      />
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      className={`p-2 rounded-full border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all ${className}`}
    >
      <span className={`block transition-transform duration-500 ${isDark ? 'rotate-0' : 'rotate-180'}`}>
        {isDark ? <Sun size={size} /> : <Moon size={size} />}
      </span>
    </button>
  );
}

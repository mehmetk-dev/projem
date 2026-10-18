import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import BrandMark from '@/components/home/BrandMark';
import { homeFontVariables } from '@/components/home/fonts';
import '@/app/portfolio.css';

interface AuthLayoutProps {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  title: string;
  subtitle: string;
}

// Giriş, kayıt ve şifre sayfalarının ortak iskeleti; public sitenin açık temasını kullanır
export default function AuthLayout({
  children,
  backHref = '/',
  backLabel = 'Ana sayfaya dön',
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div
      className={`home-theme ${homeFontVariables} relative flex min-h-screen flex-col overflow-hidden antialiased selection:bg-accent selection:text-white`}
    >
      <div className="home-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[480px]" aria-hidden="true" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 md:px-8">
        <BrandMark />
        <Link
          href={backHref}
          className="group inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
          {backLabel}
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 py-14">
        <div className="home-reveal w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-[0_24px_60px_-36px_rgba(12,10,9,0.35)] md:p-9">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-ink">{title}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

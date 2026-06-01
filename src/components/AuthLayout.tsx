import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  backHref = '/',
  backLabel = 'Ana sayfaya dön',
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-6 selection:bg-white selection:text-black font-sans">
      <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
        <div className="space-y-2">
          <Link
            href={backHref}
            className="inline-block mb-8 text-neutral-500 hover:text-white transition-colors text-sm"
          >
            &larr; {backLabel}
          </Link>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white">{title}</h1>
          <p className="text-neutral-500">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

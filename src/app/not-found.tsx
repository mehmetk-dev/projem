import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı | Mehmet Kerem',
  description: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neutral-200/40 dark:bg-neutral-800/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neutral-200/40 dark:bg-neutral-800/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center">
        {/* Glitch effect on 404 */}
        <div className="relative mb-8 group">
          <h1
            className="text-[8rem] md:text-[12rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-neutral-800 to-neutral-900 dark:from-white dark:to-neutral-500 select-none"
          >
            404
          </h1>
          <div
            className="absolute inset-0 text-[8rem] md:text-[12rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-neutral-800 to-neutral-900 dark:from-white dark:to-neutral-500 opacity-0 group-hover:opacity-30 translate-x-[2px] translate-y-[2px] select-none pointer-events-none transition-opacity duration-75"
            aria-hidden="true"
          >
            404
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Sayfa Bulunamadı
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Aradığınız sayfa mevcut değil veya başka bir adres taşınmış olabilir. Ana sayfaya dönüp keşfe devam edebilirsiniz.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="bg-neutral-900 text-white dark:bg-white dark:text-black px-8 py-3.5 rounded-full font-medium hover:scale-105 transition-transform duration-300"
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/blog"
            className="px-8 py-3.5 rounded-full font-medium border border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          >
            Blog&apos;a Git
          </Link>
        </div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          color: 'var(--foreground)',
        }}
      />
    </div>
  );
}

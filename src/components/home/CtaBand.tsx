import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Alt sayfaların sonunda iletişime yönlendiren kısa bant
export default function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <section className="px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-5 py-16 text-white md:rounded-[36px] md:px-8 md:py-20">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.35),transparent_65%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{title}</h2>
            <p className="mt-3 text-lg leading-relaxed text-white/65">{text}</p>
          </div>
          <Link
            href="/#contact"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-accent hover:text-white"
          >
            İletişime geç
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

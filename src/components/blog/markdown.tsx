import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import type { Components } from 'react-markdown';
import CodeBlock from './CodeBlock';

// Yazı gövdesinin ortak tipografisi; satır içi kod, kod bloğu dışındaki <code> öğeleridir
export const postBodyClass =
  'space-y-6 text-[17px] leading-[1.8] text-ink-soft md:text-lg ' +
  '[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:border [&_:not(pre)>code]:border-line [&_:not(pre)>code]:bg-surface-2 ' +
  '[&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.86em] [&_:not(pre)>code]:text-ink';

function HeadingAnchor({ id, children }: { id?: string; children: ReactNode }) {
  if (!id) return children;
  return (
    <>
      {children}
      <a
        href={`#${id}`}
        aria-label="Bu başlığın bağlantısı"
        className="ml-2 font-normal text-accent opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        #
      </a>
    </>
  );
}

const headingBase = 'group scroll-mt-28 font-semibold text-ink';

export const markdownComponents: Components = {
  // İçerikte # kullanılırsa sayfa başlığıyla çakışmasın diye h2 olarak çizilir
  h1: ({ id, children }) => (
    <h2 id={id} className={`${headingBase} !mt-14 text-2xl tracking-[-0.02em] md:text-3xl`}>
      <HeadingAnchor id={id}>{children}</HeadingAnchor>
    </h2>
  ),
  h2: ({ id, children }) => (
    <h2 id={id} className={`${headingBase} !mt-14 text-2xl tracking-[-0.02em] md:text-3xl`}>
      <HeadingAnchor id={id}>{children}</HeadingAnchor>
    </h2>
  ),
  h3: ({ id, children }) => (
    <h3 id={id} className={`${headingBase} !mt-10 text-xl tracking-[-0.01em]`}>
      <HeadingAnchor id={id}>{children}</HeadingAnchor>
    </h3>
  ),
  h4: ({ id, children }) => (
    <h4 id={id} className={`${headingBase} !mt-8 text-lg`}>
      {children}
    </h4>
  ),
  a: ({ href = '', children }) => {
    const className =
      'font-medium text-ink underline decoration-accent/40 decoration-2 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent';
    if (href.startsWith('/') || href.startsWith('#')) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  },
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc space-y-2 pl-6 marker:text-accent">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 pl-6 marker:font-mono marker:text-[0.9em] marker:text-ink-muted">{children}</ol>
  ),
  li: ({ children, className }) => <li className={`pl-1 ${className ?? ''}`}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent pl-5 font-serif-display text-xl text-ink md:text-2xl [&>p]:leading-snug">
      {children}
    </blockquote>
  ),
  hr: () => (
    <div className="!my-12 flex justify-center gap-3 text-ink-muted" aria-hidden="true">
      <span>•</span>
      <span>•</span>
      <span>•</span>
    </div>
  ),
  img: ({ src, alt }) =>
    typeof src === 'string' ? (
      <span className="block">
        {/* Boyutları bilinmeyen yazı içi görseller için düz img kullanılır */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ''} loading="lazy" className="w-full rounded-2xl border border-line bg-surface-2" />
        {alt && <span className="mt-3 block text-center text-sm text-ink-muted">{alt}</span>}
      </span>
    ) : null,
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full border-collapse text-left text-[15px]">{children}</table>
    </div>
  ),
  th: ({ children, style }) => (
    <th style={style} className="border-b border-line bg-surface-2 px-4 py-3 font-semibold text-ink">
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="border-b border-line px-4 py-3 align-top [tr:last-child_&]:border-b-0">
      {children}
    </td>
  ),
  pre: (props) => {
    // hast düğümü istemci bileşenine taşınmasın
    const rest: Partial<typeof props> = { ...props };
    delete rest.node;
    return <CodeBlock {...(rest as ComponentProps<typeof CodeBlock>)} />;
  },
};

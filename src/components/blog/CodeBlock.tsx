'use client';

import { useRef, useState, type ComponentProps } from 'react';
import { Check, Copy } from 'lucide-react';

type CodeBlockProps = ComponentProps<'pre'> & { 'data-language'?: string };

// Yazılardaki kod bloğu: dil etiketi ve kopyala butonu. Renklendirme sunucuda shiki ile yapılır.
export default function CodeBlock({ children, className = '', style, ...props }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = props['data-language'];
  const showLanguage = language && !['text', 'plaintext', 'txt'].includes(language);

  const copy = async () => {
    const text = preRef.current?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ''));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Pano izni yoksa sessizce geç
    }
  };

  return (
    <figure className="group/code relative overflow-hidden rounded-2xl bg-ink">
      <figcaption className="flex h-10 items-center justify-between border-b border-white/10 pl-5 pr-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
        <span>{showLanguage ? language : 'kod'}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Kopyalandı' : 'Kodu kopyala'}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 normal-case tracking-normal text-white/55 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span className="text-[12px]">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
        </button>
      </figcaption>
      <pre
        ref={preRef}
        {...props}
        // Tema arka planı yerine figure'ın koyu mürekkep rengi görünür
        style={{ ...style, backgroundColor: 'transparent' }}
        className={`${className} overflow-x-auto p-5 font-mono text-[14px] leading-relaxed text-white/90`}
      >
        {children}
      </pre>
    </figure>
  );
}

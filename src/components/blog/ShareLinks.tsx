'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';

const buttonClass =
  'inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink';

// Yazının sonunda paylaşım bağlantıları; url mutlak adres olmalı
export default function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Pano izni yoksa sessizce geç
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const links = [
    { label: 'X', href: `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodedUrl}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">Paylaş</span>
      <button type="button" onClick={copy} className={buttonClass}>
        {copied ? <Check size={14} className="text-emerald-600" /> : <Link2 size={14} />}
        {copied ? 'Kopyalandı' : 'Bağlantıyı kopyala'}
      </button>
      {links.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          {link.label}
        </a>
      ))}
    </div>
  );
}

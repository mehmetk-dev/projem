'use client';

import { useEffect } from 'react';

// Sabit menünün kapladığı yükseklik + biraz nefes payı
const HEADER_OFFSET = 96;

const scrollToHash = (hash: string) => {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id || id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }
  const target = document.getElementById(id);
  if (!target) return false;
  // Bölümün üst iç boşluğu atlanır; içerik sabit menünün hemen altına gelir
  const paddingTop = parseFloat(getComputedStyle(target).paddingTop) || 0;
  const top = target.getBoundingClientRect().top + window.scrollY + paddingTop - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  return true;
};

const stripHash = () => {
  if (!window.location.hash) return;
  // Next.js router state'i korunarak yalnızca adresten #… kısmı silinir
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
};

// Sayfa içi çapa linkleri (#contact, /#services, #top) adres çubuğuna # eklemeden yumuşak kaydırır
export default function HashScroll() {
  useEffect(() => {
    // /#contact ile gelindiyse kaydır; Next.js router kendi URL senkronizasyonunu bu effect'ten sonra yaptığı için temizlik ertelenir
    let timer: number | undefined;
    if (window.location.hash) {
      scrollToHash(window.location.hash);
      timer = window.setTimeout(stripHash, 50);
    }

    // Capture aşamasında çalışır; preventDefault edilen tıklamayı Next Link yok sayar, diğer onClick'ler (menü kapatma) çalışmaya devam eder
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href*="#"]');
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank') return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;

      if (scrollToHash(url.hash)) {
        event.preventDefault();
        stripHash();
      }
    };

    // Aynı sayfada adres çubuğundan #… yazılırsa
    const onHashChange = () => {
      if (scrollToHash(window.location.hash)) stripHash();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  return null;
}

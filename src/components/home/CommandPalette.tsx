'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AtSign, BookOpen, CornerDownLeft, FileText, FolderOpen, Rss, Search, Send } from 'lucide-react';

const EMAIL = 'mehmetkerem2109@gmail.com';
export const OPEN_PALETTE_EVENT = 'command-palette:open';

interface Item {
  id: string;
  group: 'Eylemler' | 'Sayfalar' | 'Projeler' | 'Yazılar' | 'Tüm site';
  title: string;
  meta?: string;
  keywords?: string;
  icon: ReactNode;
  href?: string;
  external?: boolean;
  run?: () => void;
}

interface IndexEntry {
  title: string;
  slug: string;
  category: string;
}

const PAGES: Omit<Item, 'group' | 'icon'>[] = [
  { id: 'home', title: 'Ana sayfa', href: '/', keywords: 'home giriş' },
  { id: 'projects', title: 'Projeler', href: '/projects', keywords: 'portfolyo işler vaka' },
  { id: 'blog', title: 'Blog', href: '/blog', keywords: 'yazılar notlar' },
  { id: 'about', title: 'Hakkımda', href: '/hakkimda', keywords: 'about özgeçmiş' },
  { id: 'services', title: 'Hizmetler', href: '/#services', keywords: 'kurumsal site web uygulaması' },
  { id: 'process', title: 'Çalışma süreci', href: '/#process', keywords: 'süreç adımlar' },
  { id: 'guestbook', title: 'Ziyaretçi defteri', href: '/guestbook', keywords: 'mesaj' },
  { id: 'webp', title: 'WebP dönüştürücü', href: '/webp-converter', keywords: 'görsel araç resim' },
  { id: 'privacy', title: 'Gizlilik politikası', href: '/gizlilik', keywords: 'kvkk' },
];

const subscribeNoop = () => () => {};
const getModKey = () => (/mac|iphone|ipad/i.test(navigator.userAgent) ? '⌘' : 'Ctrl');

/** Kısayol etiketi; sunucuda "Ctrl", tarayıcıda platforma göre "⌘" olabilir */
export function useModKey() {
  return useSyncExternalStore(subscribeNoop, getModKey, () => 'Ctrl');
}

// Türkçe karakterleri ve büyük/küçük harfi yok sayan karşılaştırma
function normalize(text: string) {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}


export default function CommandPalette() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<{ projects: IndexEntry[]; posts: IndexEntry[]; hasNowPage?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const modKey = useModKey();

  const show = useCallback(() => {
    setQuery('');
    setActive(0);
    setCopied(false);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // ⌘K / Ctrl+K her yerde; "/" yalnızca bir alana yazılmıyorken
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => {
          if (!value) {
            setQuery('');
            setActive(0);
            setCopied(false);
          }
          return !value;
        });
      } else if (event.key === '/' && !typing && !open) {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, show);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, show);
    };
  }, [open, show]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // İçerik listesi ilk açılışta bir kez çekilir
  useEffect(() => {
    if (!open || index) return;
    fetch('/api/search-index')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIndex(data ?? { projects: [], posts: [] }))
      .catch(() => setIndex({ projects: [], posts: [] }));
  }, [open, index]);

  const items = useMemo<Item[]>(() => {
    const q = normalize(query.trim());
    const actions: Item[] = [
      { id: 'contact', group: 'Eylemler', title: 'Proje başlatalım', meta: 'İletişim formu', href: '/#contact', keywords: 'iletişim teklif', icon: <Send size={16} /> },
      {
        id: 'email',
        group: 'Eylemler',
        title: copied ? 'E-posta kopyalandı' : 'E-posta adresini kopyala',
        meta: EMAIL,
        keywords: 'mail iletişim',
        icon: <AtSign size={16} />,
        run: () => {
          void navigator.clipboard?.writeText(EMAIL).then(() => setCopied(true));
        },
      },
      { id: 'rss', group: 'Eylemler', title: 'RSS akışı', href: '/feed.xml', external: true, keywords: 'feed abone', icon: <Rss size={16} /> },
    ];
    const all: Item[] = [
      ...actions,
      ...PAGES.map((page) => ({ ...page, group: 'Sayfalar' as const, icon: <FileText size={16} /> })),
      ...(index?.hasNowPage
        ? [{ id: 'now', group: 'Sayfalar' as const, title: 'Şu an ne yapıyorum', href: '/simdi', keywords: 'now şimdi', icon: <FileText size={16} /> }]
        : []),
      ...(index?.projects ?? []).map((project) => ({
        id: `project-${project.slug}`,
        group: 'Projeler' as const,
        title: project.title,
        meta: project.category,
        href: `/projects/${project.slug}`,
        icon: <FolderOpen size={16} />,
      })),
      ...(index?.posts ?? []).map((post) => ({
        id: `post-${post.slug}`,
        group: 'Yazılar' as const,
        title: post.title,
        meta: post.category,
        href: `/blog/${post.slug}`,
        icon: <BookOpen size={16} />,
      })),
    ];

    // Arama boşken uzun listeler kısaltılır: her gruptan en fazla 6 öğe
    const matches = q
      ? all.filter((item) => normalize(`${item.title} ${item.meta ?? ''} ${item.keywords ?? ''}`).includes(q))
      : all.filter((item, i) => all.findIndex((other) => other.group === item.group) > i - 6);
    if (q) {
      matches.push({
        id: 'search',
        group: 'Tüm site',
        title: `“${query.trim()}” için sitede ara`,
        href: `/search?q=${encodeURIComponent(query.trim())}`,
        icon: <Search size={16} />,
      });
    }
    // Gruplar sabit sırada kalsın; klavye sırası görünen sırayla aynı olmalı
    // Arama yapılırken içerik eşleşmeleri öne, "sitede ara" en sona
    const order: Item['group'][] = q
      ? ['Projeler', 'Yazılar', 'Sayfalar', 'Eylemler', 'Tüm site']
      : ['Eylemler', 'Sayfalar', 'Projeler', 'Yazılar'];
    return order.flatMap((group) => matches.filter((item) => item.group === group));
  }, [query, index, copied]);

  const select = (item: Item | undefined) => {
    if (!item) return;
    if (item.run) {
      item.run();
      return;
    }
    if (!item.href) return;
    close();
    if (item.external) window.location.href = item.href;
    else router.push(item.href);
  };

  const onInputKey = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = (active + step + items.length) % Math.max(items.length, 1);
      setActive(next);
      listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      select(items[active]);
    }
  };

  const activeItem = items[active];

  // Arka plan (::backdrop) bilerek bulanıklaştırılmaz: tüm sayfaya uygulanan backdrop-filter bazı GPU'larda
  // (Linux'ta Chromium/Brave) açılışta bir süre siyah ekran gösteriyordu
  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={(event) => {
        // Arka plana tıklayınca kapanır
        if (event.target === dialogRef.current) close();
      }}
      aria-label="Komut paleti"
      className="mx-auto mt-[10vh] w-[min(640px,calc(100%-32px))] max-w-none overflow-hidden rounded-3xl border border-line bg-surface p-0 text-ink shadow-[0_40px_100px_-30px_rgba(12,10,9,0.45)] backdrop:bg-[rgba(12,10,9,0.32)] open:animate-[home-pop_0.22s_cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="flex items-center gap-3 border-b border-line px-5">
        <Search size={18} className="shrink-0 text-ink-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKey}
          placeholder="Sayfa, proje veya yazı ara…"
          role="combobox"
          aria-label="Ara"
          aria-expanded={items.length > 0}
          aria-controls="command-palette-list"
          aria-activedescendant={activeItem ? `cmd-${activeItem.id}` : undefined}
          aria-autocomplete="list"
          className="h-16 min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-muted"
        />
        <kbd className="hidden rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-ink-muted sm:inline">esc</kbd>
      </div>

      <ul ref={listRef} id="command-palette-list" role="listbox" className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
        {items.length === 0 && <li className="px-4 py-10 text-center text-sm text-ink-muted">Sonuç yok.</li>}
        {items.map((item, i) => {
          const firstOfGroup = i === 0 || items[i - 1].group !== item.group;
          const isActive = i === active;
          return (
            <li key={item.id} role="presentation">
              {firstOfGroup && (
                <p className="px-3 pb-1.5 pt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted" aria-hidden="true">
                  {item.group}
                </p>
              )}
              <div
                id={`cmd-${item.id}`}
                role="option"
                aria-selected={isActive}
                data-index={i}
                onMouseMove={() => setActive(i)}
                onClick={() => select(item)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  isActive ? 'bg-surface-2 text-ink' : 'text-ink-soft'
                }`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors ${
                    isActive ? 'border-accent/20 bg-accent-soft text-accent' : 'border-line bg-paper text-ink-muted'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{item.title}</span>
                {item.meta && <span className="hidden shrink-0 truncate text-[13px] text-ink-muted sm:block sm:max-w-[40%]">{item.meta}</span>}
                <ArrowRight size={15} className={`shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden items-center gap-4 border-t border-line bg-paper px-5 py-3 font-mono text-[11px] text-ink-muted sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-line bg-surface px-1">↑</kbd>
          <kbd className="rounded border border-line bg-surface px-1">↓</kbd>
          gezin
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="inline-grid rounded border border-line bg-surface px-1 py-0.5">
            <CornerDownLeft size={11} />
          </kbd>
          aç
        </span>
        <span className="ml-auto">
          {modKey} K ile her yerden açılır
        </span>
      </div>
    </dialog>
  );
}

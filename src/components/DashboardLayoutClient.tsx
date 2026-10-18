'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import BrandMark from './home/BrandMark';
import { homeFontVariables } from './home/fonts';
import * as T from './dashboard/types';
import { getVisibleTabIds } from '@/lib/dashboard/preferences';
import '@/app/portfolio.css';
import '@/app/dashboard/dashboard.css';

interface Props {
  children: React.ReactNode;
  userEmail: string;
  isAdmin: boolean;
  unread: number;
  preferences: T.UserPreferences;
  logoutAction: () => Promise<void>;
}

import type { TabId } from './dashboard/types';

const TABS: { id: TabId; label: string; icon: string; adminOnly?: boolean }[] = [
  { id: 'overview', label: 'Genel Bakış', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { id: 'notes', label: 'Notlar', icon: 'M17 3a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h10zm-4 11H9v2h4v-2zm4-4H9v2h8V10zm0-4H9v2h8V6z' },
  { id: 'blogs', label: 'Blog', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-4 9h8v-2H9v2zm0-4h8v-2H9v2z', adminOnly: true },
  { id: 'projects', label: 'Projeler', icon: 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 14H4V8h16v10z', adminOnly: true },
  { id: 'messages', label: 'Mesajlar', icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' },
  { id: 'todos', label: 'Görevler', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.4-1.4L12 14.2l7.6-7.6L21 8l-9 9z' },
  { id: 'payments', label: 'Ödemeler', icon: 'M3 6h18v12H3V6zm2 2v8h14V8H5zm2 6h4v-2H7v2zm8-4a2 2 0 100 4 2 2 0 000-4z' },
  { id: 'bookmarks', label: 'Linkler', icon: 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.2L7 18V5h10v13z' },
  { id: 'snippets', label: 'Kodlar', icon: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z' },
  { id: 'analytics', label: 'İstatistik', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
  { id: 'calendar', label: 'Ajanda', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z' },
  { id: 'timer', label: 'Zamanlayıcı', icon: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 007.03-12.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z' },
  { id: 'chat', label: 'Chat', icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z', adminOnly: true },
  { id: 'spotify', label: 'Spotify', icon: 'M12 3v10.55A4 4 0 1014 17V7h4V3h-6z', adminOnly: true },
  { id: 'settings', label: 'Ayarlar', icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.56-.42-1.17-.76-1.83-1.01l-.36-2.54a.484.484 0 00-.48-.41h-3.84a.484.484 0 00-.48.41l-.36 2.54c-.66.25-1.27.59-1.83 1.01l-2.39-.96a.488.488 0 00-.59.22L3.16 8.87c-.1.18-.06.39.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.56.42 1.17.76 1.83 1.01l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.48-.41l.36-2.54c.66-.25 1.27-.58 1.83-1.01l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' },
  { id: 'guestbook', label: 'Ziyaretçi Defteri', icon: 'M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.2L7 18V5h10v13z' },
  { id: 'comments', label: 'Yorumlar', icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z' },
  { id: 'audit', label: 'Audit Log', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z', adminOnly: true },
  { id: 'users', label: 'Kullanıcılar', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z', adminOnly: true },
  { id: 'social', label: 'Sosyal Linkler', icon: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z', adminOnly: true },
  { id: 'subscribers', label: 'Aboneler', icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', adminOnly: true },
  { id: 'journal', label: 'Günlük', icon: 'M19 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12V3zm-2 16H7V5h10v14zM9 7h6v2H9V7zm0 4h6v2H9v-2zm0 4h4v2H9v-2z' },
  { id: 'files', label: 'Dosyalar', icon: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z', adminOnly: true },
];

const CONFIGURABLE_TABS: TabId[] = [
  'overview',
  'notes',
  'projects',
  'messages',
  'todos',
  'payments',
  'bookmarks',
  'snippets',
  'analytics',
  'calendar',
  'timer',
  'guestbook',
  'comments',
  'journal',
];

const RAW_TAB_GROUPS: { key?: string; title: string; ids: TabId[]; adminGroup?: boolean }[] = [
  { key: 'management', title: 'Yönetim', ids: ['blogs', 'chat', 'spotify', 'audit', 'users', 'social', 'subscribers', 'files', 'settings'], adminGroup: true },
  { title: 'Ana Panel', ids: ['overview', 'analytics', 'calendar', 'timer'] },
  { title: 'İçerik', ids: ['notes', 'projects', 'messages', 'todos', 'payments', 'bookmarks', 'snippets'] },
  { title: 'Topluluk', ids: ['guestbook', 'comments'] },
  { title: 'Kişisel', ids: ['journal'] },
];

const TAB_GROUPS: { key: string; title: string; ids: TabId[]; adminGroup?: boolean }[] = RAW_TAB_GROUPS.map((group, index) => ({
  ...group,
  key: group.key ?? `group-${index}`,
}));

export default function DashboardLayoutClient({ children, userEmail, isAdmin, unread, preferences, logoutAction }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  
  const tab = useMemo<TabId>(() => {
    const parts = pathname.split('/');
    const last = parts[parts.length - 1];
    if (last && TABS.some((t) => t.id === last)) {
      return last as TabId;
    }
    return 'overview';
  }, [pathname]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const handleTabChange = useCallback((newTab: TabId) => {
    setMenuOpen(false);
    const url = newTab === 'overview' ? '/dashboard' : `/dashboard/${newTab}`;
    router.push(url);
  }, [router]);

  const visibleTabIds = getVisibleTabIds(TABS.map((item) => item.id), preferences.hiddenTabs, CONFIGURABLE_TABS);
  
  const visibleGroups = TAB_GROUPS
    .map((group) => ({
      ...group,
      tabs: group.ids
        .map((id) => TABS.find((item) => item.id === id))
        .filter((item): item is (typeof TABS)[number] => Boolean(item))
        .filter((item) => visibleTabIds.includes(item.id))
        .filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((group) => group.tabs.length > 0);

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((current) => ({ ...current, [groupKey]: !current[groupKey] }));
  };

  const handleLogout = async () => { 
    await logoutAction(); 
    router.push('/'); 
  };

  const activeTab = TABS.find((item) => item.id === tab);
  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' });

  return (
    <div
      className={`home-theme dash-theme ${homeFontVariables} min-h-screen bg-paper text-ink antialiased selection:bg-accent selection:text-white lg:flex`}
    >
      {/* Mobil üst bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="-ml-2 grid h-9 w-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={menuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d={menuOpen ? 'M18 6L6 18M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
          <span className="text-sm font-semibold tracking-tight">{activeTab?.label ?? 'Panel'}</span>
        </div>
        <ThemeToggle size={16} />
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="hidden items-center justify-between px-5 pt-6 pb-5 lg:flex">
          <BrandMark />
        </div>

        <nav className="dashboard-sidebar-scroll mt-14 min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-4 lg:mt-0" aria-label="Panel menüsü">
          {visibleGroups.map((group) => {
            const isActiveGroup = group.tabs.some((item) => item.id === tab);
            const isCollapsed = collapsedGroups[group.key] && !isActiveGroup;

            return (
              <div key={group.title} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={!isCollapsed}
                  className={`flex w-full items-center justify-between px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors ${isActiveGroup ? 'text-ink-soft' : 'text-ink-muted hover:text-ink-soft'}`}
                >
                  <span>{group.title}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                    className={`transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isCollapsed ? 'pointer-events-none grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}
                  aria-hidden={isCollapsed}
                >
                  <div className="space-y-0.5 overflow-hidden">
                    {group.tabs.map((t) => {
                      const isActive = tab === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { handleTabChange(t.id); }}
                          aria-current={isActive ? 'page' : undefined}
                          className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium transition-colors ${isActive ? 'bg-surface-2 text-ink' : 'text-ink-muted hover:bg-surface-2/60 hover:text-ink'}`}
                        >
                          {isActive && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent" aria-hidden="true" />}
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={isActive ? 'text-accent' : ''}>
                            <path d={t.icon} />
                          </svg>
                          <span className="flex-1 text-left">{t.label}</span>
                          {t.id === 'messages' && unread > 0 && (
                            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {unread}
                            </span>
                          )}
                          {t.adminOnly && (
                            <span className="rounded border border-line px-1 font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                              admin
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-line p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent" aria-hidden="true">
              {userEmail.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">{userEmail}</p>
              <p className="text-[11px] text-ink-muted">{isAdmin ? 'Yönetici' : 'Kullanıcı'}</p>
            </div>
            <ThemeToggle size={15} />
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-line py-2 text-[12px] font-medium text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
            >
              Siteye git
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line py-2 text-[12px] font-medium text-ink-soft transition-colors hover:border-rose-500/40 hover:text-rose-600"
            >
              <LogOut size={13} aria-hidden="true" />
              Çıkış
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && <div className="fixed inset-0 z-20 bg-ink/30 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <div className="min-w-0 flex-1">
        {/* Masaüstü üst bar: konum ve tarih */}
        <header className="sticky top-0 z-10 hidden h-16 items-center justify-between border-b border-line bg-paper/80 px-8 backdrop-blur-xl lg:flex">
          <p className="flex items-center gap-2 text-[13px] text-ink-muted">
            <span>Panel</span>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-ink">{activeTab?.label ?? 'Genel Bakış'}</span>
          </p>
          <p className="font-mono text-[12px] capitalize text-ink-muted" suppressHydrationWarning>{today}</p>
        </header>

        <main className="p-5 pt-20 lg:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

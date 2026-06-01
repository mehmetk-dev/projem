'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import ThemeToggle from './ThemeToggle';
import * as T from './dashboard/types';
import OverviewModule from './dashboard/OverviewModule';
import NotesModule from './dashboard/NotesModule';
import BlogsModule from './dashboard/BlogsModule';
import ProjectsModule from './dashboard/ProjectsModule';
import MessagesModule from './dashboard/MessagesModule';
import TodosModule from './dashboard/TodosModule';
import PaymentsModule from './dashboard/PaymentsModule';
import BookmarksModule from './dashboard/BookmarksModule';
import SnippetsModule from './dashboard/SnippetsModule';
import AnalyticsModule from './dashboard/AnalyticsModule';
import TimerModule from './dashboard/TimerModule';
import ChatModule from './dashboard/ChatModule';
import SettingsModule from './dashboard/SettingsModule';
import GuestbookModule from './dashboard/GuestbookModule';
import CommentsModule from './dashboard/CommentsModule';
import AuditModule from './dashboard/AuditModule';
import UsersModule from './dashboard/UsersModule';
import SocialLinksModule from './dashboard/SocialLinksModule';
import SubscribersModule from './dashboard/SubscribersModule';
import CalendarModule from './dashboard/CalendarModule';
import SpotifyModule from './dashboard/SpotifyModule';
import { getVisibleTabIds } from '@/lib/dashboard/preferences';

interface Props {
  notes: T.Note[];
  blogs: T.Blog[];
  projects: T.Project[];
  messages: T.Message[];
  todos: T.Todo[];
  payments: T.Payment[];
  bookmarks: T.Bookmark[];
  snippets: T.Snippet[];
  analytics: T.AnalyticsData;
  conversations: T.ChatConversation[];
  chatSettings: T.ChatSettings | null;
  guestbookEntries: T.GuestbookEntry[];
  comments: T.Comment[];
  auditLogs: T.AuditLog[];
  settings: T.SiteSetting[];
  preferences: T.UserPreferences;
  users: T.UserListItem[];
  socialLinks: T.SocialLink[];
  subscribers: T.Subscriber[];
  weather: T.WeatherData | null;
  githubEvents: T.GitHubEvent[] | null;
  spotifyData: T.SpotifyData | null;
  userEmail: string;
  isAdmin: boolean;
  logoutAction: () => Promise<void>;
}

import type { TabId } from './dashboard/types';
export type { TabId };

const TABS: { id: TabId; label: string; icon: string; adminOnly?: boolean }[] = [
  { id: 'overview', label: 'Genel Bakış', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { id: 'notes', label: 'Notlar', icon: 'M17 3a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h10zm-4 11H9v2h4v-2zm4-4H9v2h8V10zm0-4H9v2h8V6z' },
  { id: 'blogs', label: 'Blog', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-4 9h8v-2H9v2zm0-4h8v-2H9v2z', adminOnly: true },
  { id: 'projects', label: 'Projeler', icon: 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 14H4V8h16v10z' },
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
];

const RAW_TAB_GROUPS: { key?: string; title: string; ids: TabId[]; adminGroup?: boolean }[] = [
  { key: 'management', title: 'Yönetim', ids: ['blogs', 'chat', 'spotify', 'audit', 'users', 'social', 'subscribers', 'settings'], adminGroup: true },
  { title: 'Ana Panel', ids: ['overview', 'analytics', 'calendar', 'timer'] },
  { title: 'İçerik', ids: ['notes', 'projects', 'messages', 'todos', 'payments', 'bookmarks', 'snippets'] },
  { title: 'Topluluk', ids: ['guestbook', 'comments'] },
];

const TAB_GROUPS: { key: string; title: string; ids: TabId[]; adminGroup?: boolean }[] = RAW_TAB_GROUPS.map((group, index) => ({
  ...group,
  key: group.key ?? `group-${index}`,
}));

export default function DashboardClient(props: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const toastFn = useCallback((msg: string, ok: boolean) => {
    if (ok) toast.success(msg);
    else toast.error(msg);
  }, []);

  const unread = props.messages.filter((m) => !m.read).length;
  const visibleTabIds = getVisibleTabIds(TABS.map((item) => item.id), props.preferences.hiddenTabs, CONFIGURABLE_TABS);
  const visibleGroups = TAB_GROUPS
    .map((group) => ({
      ...group,
      tabs: group.ids
        .map((id) => TABS.find((item) => item.id === id))
        .filter((item): item is (typeof TABS)[number] => Boolean(item))
        .filter((item) => visibleTabIds.includes(item.id))
        .filter((item) => !item.adminOnly || props.isAdmin),
    }))
    .filter((group) => group.tabs.length > 0);

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((current) => ({ ...current, [groupKey]: !current[groupKey] }));
  };

  const handleLogout = async () => { await props.logoutAction(); router.push('/'); };

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : '';

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-white selection:text-black lg:flex">
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 flex items-center justify-between px-4 bg-neutral-950/90 backdrop-blur-xl border-b border-white/5 z-40">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 -ml-2 text-neutral-400 hover:text-white" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={menuOpen ? 'M18 6L6 18M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
          </button>
          <span className="text-sm font-bold tracking-tight">Dashboard</span>
        </div>
        <span className="text-xs text-neutral-500 truncate max-w-[120px]">{props.userEmail}</span>
      </div>

      <aside className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-30 w-60 lg:h-screen bg-neutral-950 border-r border-white/5 p-5 flex flex-col transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="text-sm font-bold tracking-tight uppercase">Dashboard</span>
        </div>

        <nav className="dashboard-sidebar-scroll flex-1 min-h-0 overflow-y-auto pr-1 mt-14 lg:mt-0 space-y-5">
          {visibleGroups.map((group) => {
            const isActiveGroup = group.tabs.some((item) => item.id === tab);
            const isCollapsed = collapsedGroups[group.key] && !isActiveGroup;

            return (
            <div key={group.title} className="space-y-1.5">
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className={`w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${isActiveGroup ? 'text-neutral-400' : 'text-neutral-700 hover:text-neutral-500'}`}
              >
                <span>{group.title}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isCollapsed ? 'grid-rows-[0fr] opacity-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100'}`}
                aria-hidden={isCollapsed}
              >
                <div className="overflow-hidden space-y-1.5">
              {group.tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={t.icon} /></svg>
                    <span className="flex-1 text-left">{t.label}</span>
                    {t.id === 'messages' && unread > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
                    {t.adminOnly && <span className="text-[9px] text-amber-400 border border-amber-500/20 px-1.5 rounded">admin</span>}
                  </button>
                ))}
                </div>
              </div>
            </div>
            );
          })}
        </nav>

        <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between px-3">
            <p className="text-[11px] text-neutral-600">{props.userEmail}</p>
            <ThemeToggle size={16} />
          </div>
          <div className="flex gap-2 px-3">
            <Link href="/" className="flex-1 text-center text-[11px] text-neutral-400 hover:text-white transition-colors py-2 rounded-md border border-white/10 hover:border-white/20">Portfolyo</Link>
            <button onClick={handleLogout} className="flex-1 text-[11px] text-neutral-400 hover:text-white transition-colors py-2 rounded-md border border-white/10 hover:border-white/20">Çıkış</button>
          </div>
        </div>
      </aside>

      {menuOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-20" onClick={() => setMenuOpen(false)} />}

      <main className="flex-1 min-w-0 p-5 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-5xl mx-auto">
          {tab === 'overview' && <OverviewModule notes={props.notes} messages={props.messages} todos={props.todos} analytics={props.analytics} projects={props.projects} isAdmin={props.isAdmin} blogs={props.blogs} onTab={setTab} visibleTabIds={visibleTabIds} weather={props.weather} githubEvents={props.githubEvents} spotifyData={props.spotifyData} />}
          {tab === 'notes' && <NotesModule notes={props.notes} fmt={fmt} toastFn={toastFn} />}
          {tab === 'blogs' && props.isAdmin && <BlogsModule blogs={props.blogs} toastFn={toastFn} />}
          {tab === 'projects' && <ProjectsModule projects={props.projects} toastFn={toastFn} />}
          {tab === 'messages' && <MessagesModule messages={props.messages} toastFn={toastFn} />}
          {tab === 'todos' && <TodosModule todos={props.todos} fmt={fmt} toastFn={toastFn} />}
          {tab === 'payments' && <PaymentsModule payments={props.payments} toastFn={toastFn} />}
          {tab === 'bookmarks' && <BookmarksModule bookmarks={props.bookmarks} toastFn={toastFn} />}
          {tab === 'snippets' && <SnippetsModule snippets={props.snippets} toastFn={toastFn} />}
          {tab === 'analytics' && <AnalyticsModule analytics={props.analytics} />}
          {tab === 'calendar' && <CalendarModule todos={props.todos} />}
          {tab === 'timer' && <TimerModule />}
          {tab === 'chat' && props.isAdmin && <ChatModule conversations={props.conversations} chatSettings={props.chatSettings} toastFn={toastFn} />}
          {tab === 'spotify' && props.isAdmin && <SpotifyModule spotifyData={props.spotifyData} settings={props.settings} toastFn={toastFn} />}
          {tab === 'settings' && <SettingsModule userEmail={props.userEmail} settings={props.settings} preferences={props.preferences} tabs={TABS} configurableTabs={CONFIGURABLE_TABS} toastFn={toastFn} />}
          {tab === 'guestbook' && <GuestbookModule entries={props.guestbookEntries} toastFn={toastFn} />}
          {tab === 'comments' && <CommentsModule comments={props.comments} toastFn={toastFn} />}
          {tab === 'audit' && props.isAdmin && <AuditModule logs={props.auditLogs} toastFn={toastFn} />}
          {tab === 'users' && props.isAdmin && <UsersModule users={props.users} toastFn={toastFn} />}
          {tab === 'social' && props.isAdmin && <SocialLinksModule links={props.socialLinks} toastFn={toastFn} />}
          {tab === 'subscribers' && props.isAdmin && <SubscribersModule subscribers={props.subscribers} toastFn={toastFn} />}
        </div>
      </main>
    </div>
  );
}

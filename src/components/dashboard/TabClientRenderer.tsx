'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import * as T from './types';
import NotesModule from './NotesModule';
import BlogsModule from './BlogsModule';
import ProjectsModule from './ProjectsModule';
import MessagesModule from './MessagesModule';
import TodosModule from './TodosModule';
import PaymentsModule from './PaymentsModule';
import BookmarksModule from './BookmarksModule';
import SnippetsModule from './SnippetsModule';
import AnalyticsModule from './AnalyticsModule';
import CalendarModule from './CalendarModule';
import TimerModule from './TimerModule';
import ChatModule from './ChatModule';
import SpotifyModule from './SpotifyModule';
import SettingsModule from './SettingsModule';
import GuestbookModule from './GuestbookModule';
import CommentsModule from './CommentsModule';
import AuditModule from './AuditModule';
import UsersModule from './UsersModule';
import SocialLinksModule from './SocialLinksModule';
import SubscribersModule from './SubscribersModule';
import JournalModule from './JournalModule';
import FilesModule from './FilesModule';

import type { TabId } from './types';

// Tab configuration
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

interface Props {
  tab: TabId;
  data: any;
  userEmail: string;
}

export default function TabClientRenderer({ tab, data, userEmail }: Props) {
  const toastFn = useCallback((msg: string, ok: boolean) => {
    if (ok) toast.success(msg);
    else toast.error(msg);
  }, []);

  const fmt = useCallback((d: string | null) => 
    d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : '', 
  []);

  switch (tab) {
    case 'notes':
      return <NotesModule notes={data.notes} fmt={fmt} toastFn={toastFn} />;
    case 'blogs':
      return <BlogsModule blogs={data.blogs} toastFn={toastFn} />;
    case 'projects':
      return <ProjectsModule projects={data.projects} toastFn={toastFn} />;
    case 'messages':
      return <MessagesModule messages={data.messages} toastFn={toastFn} />;
    case 'todos':
      return <TodosModule todos={data.todos} fmt={fmt} toastFn={toastFn} />;
    case 'payments':
      return <PaymentsModule payments={data.payments} toastFn={toastFn} />;
    case 'bookmarks':
      return <BookmarksModule bookmarks={data.bookmarks} toastFn={toastFn} />;
    case 'snippets':
      return <SnippetsModule snippets={data.snippets} toastFn={toastFn} />;
    case 'analytics':
      return <AnalyticsModule analytics={data.analytics} />;
    case 'calendar':
      return <CalendarModule todos={data.todos} />;
    case 'timer':
      return <TimerModule preferences={data.preferences} />;
    case 'chat':
      return <ChatModule conversations={data.conversations} chatSettings={data.chatSettings} toastFn={toastFn} />;
    case 'spotify':
      return <SpotifyModule spotifyData={data.spotifyData} recentTracks={data.recentTracks} settings={data.settings} toastFn={toastFn} />;
    case 'settings':
      return <SettingsModule userEmail={userEmail} settings={data.settings} preferences={data.preferences} tabs={TABS} configurableTabs={CONFIGURABLE_TABS} toastFn={toastFn} />;
    case 'guestbook':
      return <GuestbookModule entries={data.entries} toastFn={toastFn} />;
    case 'comments':
      return <CommentsModule comments={data.comments} toastFn={toastFn} />;
    case 'audit':
      return <AuditModule logs={data.logs} toastFn={toastFn} />;
    case 'users':
      return <UsersModule users={data.users} toastFn={toastFn} />;
    case 'social':
      return <SocialLinksModule links={data.links} toastFn={toastFn} />;
    case 'subscribers':
      return <SubscribersModule subscribers={data.subscribers} toastFn={toastFn} />;
    case 'journal':
      return <JournalModule entries={data.entries} toastFn={toastFn} />;
    case 'files':
      return <FilesModule toastFn={toastFn} />;
    default:
      return <div className="text-neutral-500">Seçilen sekme bulunamadı.</div>;
  }
}

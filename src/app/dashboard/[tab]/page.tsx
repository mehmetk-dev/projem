import { getSession, getCurrentUser } from '@/lib/auth';
import { getNotes } from '@/app/actions/notes';
import { getMyBlogs } from '@/app/actions/blogs';
import { getMyProjects } from '@/app/actions/projects';
import { getDirectMessageDashboardData, getMessages } from '@/app/actions/messages';
import { getMyTodos } from '@/app/actions/todos';
import { getMyPayments } from '@/app/actions/payments';
import { getMyBookmarks } from '@/app/actions/bookmarks';
import { getMySnippets } from '@/app/actions/snippets';
import { getAnalytics } from '@/app/actions/analytics';
import { getConversations, getChatSettings } from '@/app/actions/chat';
import { getAllGuestbookEntries } from '@/app/actions/guestbook';
import { getAllComments } from '@/app/actions/comments';
import { getAuditLogs } from '@/app/actions/audit';
import { getSettings } from '@/app/actions/settings';
import { getMyPreferences } from '@/app/actions/preferences';
import { getAllUsers } from '@/app/actions/users';
import { getAllSocialLinks, getSubscribers } from '@/app/actions/social';
import { getSpotifyNowPlaying, getSpotifyRecentTracks } from '@/app/actions/spotify';
import { getJournalEntries } from '@/app/actions/journal';
import { redirect, notFound } from 'next/navigation';
import { Suspense } from 'react';
import TabClientRenderer from '@/components/dashboard/TabClientRenderer';
import { TabId } from '@/components/dashboard/types';
import { logServerError } from '@/lib/server/error-response';

export const dynamic = 'force-dynamic';

const VALID_TABS: TabId[] = [
  'notes', 'blogs', 'projects', 'messages', 'todos', 'payments', 
  'bookmarks', 'snippets', 'analytics', 'calendar', 'timer', 
  'chat', 'spotify', 'settings', 'guestbook', 'comments', 
  'audit', 'users', 'social', 'subscribers', 'journal', 'files'
];

const ADMIN_ONLY_TABS = ['blogs', 'projects', 'chat', 'spotify', 'audit', 'users', 'social', 'subscribers', 'files'];

const TAB_LABELS: Record<TabId, string> = {
  overview: 'Genel Bakış',
  notes: 'Notlar',
  blogs: 'Blog',
  projects: 'Projeler',
  messages: 'Mesajlar',
  todos: 'Görevler',
  payments: 'Ödemeler',
  bookmarks: 'Linkler',
  snippets: 'Kodlar',
  analytics: 'İstatistik',
  calendar: 'Ajanda',
  timer: 'Zamanlayıcı',
  chat: 'Chat',
  spotify: 'Spotify',
  settings: 'Ayarlar',
  guestbook: 'Ziyaretçi Defteri',
  comments: 'Yorumlar',
  audit: 'Audit Log',
  users: 'Kullanıcılar',
  social: 'Sosyal Linkler',
  subscribers: 'Aboneler',
  journal: 'Günlük',
  files: 'Dosyalar',
};

interface PageProps {
  params: Promise<{ tab: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function DashboardContentSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-4 w-32 animate-pulse rounded-lg bg-white/[0.04]" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl border border-white/5 bg-neutral-900/30" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-white/5 bg-neutral-900/30" />
    </div>
  );
}

export default async function DashboardTabPage({ params, searchParams }: PageProps) {
  const { tab } = await params;
  const query = await searchParams;
  const openCreateProject = tab === 'projects' && query.new === '1';

  if (!VALID_TABS.includes(tab as TabId)) {
    notFound();
  }

  const session = await getSession();
  if (!session?.userId) {
    redirect('/login');
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const isAdmin = user.role === 'admin';

  if (ADMIN_ONLY_TABS.includes(tab) && !isAdmin) {
    redirect('/dashboard');
  }

  return (
    <Suspense fallback={<DashboardContentSkeleton />}>
      <DashboardTabContent
        tab={tab as TabId}
        isAdmin={isAdmin}
        userEmail={user.email}
        openCreateProject={openCreateProject}
      />
    </Suspense>
  );
}

async function DashboardTabContent({
  tab,
  isAdmin,
  userEmail,
  openCreateProject,
}: {
  tab: TabId;
  isAdmin: boolean;
  userEmail: string;
  openCreateProject: boolean;
}) {
  const data: Record<string, unknown> = {};

  try {
    // Query ONLY the database table required for the current active tab
    switch (tab) {
      case 'notes':
        data.notes = await getNotes();
        break;
      case 'blogs':
        data.blogs = await getMyBlogs();
        break;
      case 'projects':
        data.projects = await getMyProjects();
        break;
      case 'messages':
        [data.directMessageData, data.messages] = await Promise.all([
          getDirectMessageDashboardData(),
          isAdmin ? getMessages() : Promise.resolve([]),
        ]);
        break;
      case 'todos':
      case 'calendar':
        data.todos = await getMyTodos();
        break;
      case 'payments':
        data.payments = await getMyPayments();
        break;
      case 'bookmarks':
        data.bookmarks = await getMyBookmarks();
        break;
      case 'snippets':
        data.snippets = await getMySnippets();
        break;
      case 'analytics':
        data.analytics = await getAnalytics();
        break;
      case 'timer':
        data.preferences = await getMyPreferences();
        break;
      case 'chat':
        [data.conversations, data.chatSettings] = await Promise.all([
          getConversations(),
          getChatSettings(),
        ]);
        break;
      case 'spotify':
        [data.spotifyData, data.recentTracks, data.settings] = await Promise.all([
          getSpotifyNowPlaying().catch(() => null),
          getSpotifyRecentTracks(),
          getSettings(),
        ]);
        break;
      case 'settings':
        [data.settings, data.preferences] = await Promise.all([
          getSettings(),
          getMyPreferences(),
        ]);
        break;
      case 'guestbook':
        data.entries = await getAllGuestbookEntries();
        break;
      case 'comments':
        data.comments = await getAllComments();
        break;
      case 'audit':
        data.logs = await getAuditLogs();
        break;
      case 'users':
        data.users = await getAllUsers();
        break;
      case 'social':
        data.links = await getAllSocialLinks();
        break;
      case 'subscribers':
        data.subscribers = await getSubscribers();
        break;
      case 'journal':
        data.entries = await getJournalEntries();
        break;
      case 'files':
        // Files uses R2 API on-demand, no pre-fetched data needed
        break;
      default:
        notFound();
    }
  } catch (error) {
    logServerError('Dashboard tab load error', error, { tab });
    data.loadError = `${TAB_LABELS[tab]} yüklenemedi. Lütfen tekrar deneyin.`;
  }

  return (
    <TabClientRenderer tab={tab} data={data} userEmail={userEmail} openCreateProject={openCreateProject} />
  );
}

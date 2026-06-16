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

export const dynamic = 'force-dynamic';

const VALID_TABS: TabId[] = [
  'notes', 'blogs', 'projects', 'messages', 'todos', 'payments', 
  'bookmarks', 'snippets', 'analytics', 'calendar', 'timer', 
  'chat', 'spotify', 'settings', 'guestbook', 'comments', 
  'audit', 'users', 'social', 'subscribers', 'journal', 'files'
];

const ADMIN_ONLY_TABS = ['blogs', 'projects', 'chat', 'spotify', 'audit', 'users', 'social', 'subscribers', 'files'];

interface PageProps {
  params: Promise<{ tab: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

  const data: Record<string, unknown> = {};

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
      data.directMessageData = await getDirectMessageDashboardData();
      data.messages = isAdmin ? await getMessages() : [];
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
      data.conversations = await getConversations();
      data.chatSettings = await getChatSettings();
      break;
    case 'spotify':
      data.spotifyData = await getSpotifyNowPlaying().catch(() => null);
      data.recentTracks = await getSpotifyRecentTracks();
      data.settings = await getSettings();
      break;
    case 'settings':
      data.settings = await getSettings();
      data.preferences = await getMyPreferences();
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

  return (
    <Suspense>
      <TabClientRenderer tab={tab as TabId} data={data} userEmail={user.email} openCreateProject={openCreateProject} />
    </Suspense>
  );
}

import { getSession, logout, getCurrentUser } from '@/lib/auth';
import { getNotes } from '@/app/actions/notes';
import { getMyBlogs } from '@/app/actions/blogs';
import { getMyProjects } from '@/app/actions/projects';
import { getMessages } from '@/app/actions/messages';
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
import { getAllSocialLinks } from '@/app/actions/social';
import { getSubscribers } from '@/app/actions/social';
import { getWeatherData } from '@/app/actions/weather';
import { getGitHubActivity } from '@/app/actions/github';
import { getSpotifyNowPlaying } from '@/app/actions/spotify';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/DashboardClient';

function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 1200): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

export const metadata = {
  title: 'Dashboard | Mehmet Kerem',
  description: 'Kişisel yönetim paneli',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect('/login');
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const isAdmin = user.role === 'admin';

  const [notes, projects, messages, todos, payments, bookmarks, snippets, analytics, blogs, conversations, chatSettings, guestbookEntries, comments, auditLogs, settings, preferences, users, socialLinks, subscribers, weather, githubEvents, spotifyData] = await Promise.all([
    getNotes(),
    getMyProjects(),
    getMessages(),
    getMyTodos(),
    getMyPayments(),
    getMyBookmarks(),
    getMySnippets(),
    getAnalytics(),
    isAdmin ? getMyBlogs().catch(() => []) : Promise.resolve([]),
    isAdmin ? getConversations().catch(() => []) : Promise.resolve([]),
    isAdmin ? getChatSettings().catch(() => null) : Promise.resolve(null),
    getAllGuestbookEntries().catch(() => []),
    getAllComments().catch(() => []),
    isAdmin ? getAuditLogs().catch(() => []) : Promise.resolve([]),
    getSettings().catch(() => []),
    getMyPreferences().catch(() => ({ hiddenTabs: [] })),
    isAdmin ? getAllUsers().catch(() => []) : Promise.resolve([]),
    isAdmin ? getAllSocialLinks().catch(() => []) : Promise.resolve([]),
    isAdmin ? getSubscribers().catch(() => []) : Promise.resolve([]),
    withTimeout(getWeatherData().catch(() => null), null),
    withTimeout(getGitHubActivity().catch(() => null), null),
    withTimeout(getSpotifyNowPlaying().catch(() => null), null),
  ]);

  async function handleLogout() {
    'use server';
    await logout();
    redirect('/');
  }

  return (
    <DashboardClient
      notes={notes}
      blogs={blogs}
      projects={projects}
      messages={messages}
      todos={todos}
      payments={payments}
      bookmarks={bookmarks}
      snippets={snippets}
      analytics={analytics}
      conversations={conversations}
      chatSettings={chatSettings}
      guestbookEntries={guestbookEntries}
      comments={comments}
      auditLogs={auditLogs}
      settings={settings}
      preferences={preferences}
      users={users}
      socialLinks={socialLinks}
      subscribers={subscribers}
      weather={weather}
      githubEvents={githubEvents}
      spotifyData={spotifyData}
      userEmail={user.email}
      isAdmin={isAdmin}
      logoutAction={handleLogout}
    />
  );
}

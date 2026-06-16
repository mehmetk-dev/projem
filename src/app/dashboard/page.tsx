import { getSession, getCurrentUser } from '@/lib/auth';
import { getNotes } from '@/app/actions/notes';
import { getMyBlogs } from '@/app/actions/blogs';
import { getMyProjects } from '@/app/actions/projects';
import { getMessages } from '@/app/actions/messages';
import { getMyTodos } from '@/app/actions/todos';
import { getAnalytics } from '@/app/actions/analytics';
import { getMyPreferences } from '@/app/actions/preferences';
import { getWeatherData } from '@/app/actions/weather';
import { getGitHubActivity } from '@/app/actions/github';
import { getSpotifyNowPlaying } from '@/app/actions/spotify';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import OverviewWrapper from '@/components/dashboard/OverviewWrapper';

function safeCatch<T>(label: string, fallback: T): (err: unknown) => T {
  return (err: unknown) => {
    console.error(`[Dashboard Overview] ${label} yüklenemedi:`, err);
    return fallback;
  };
}

function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 1200): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard | Mehmet Kerem',
  description: 'Kişisel yönetim paneli genel bakış',
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

  // Fetch ONLY the required data for the Overview tab
  const [notes, projects, messages, todos, analytics, blogs, preferences, weather, githubEvents, spotifyData] = await Promise.all([
    getNotes().catch(safeCatch('notes', [])),
    getMyProjects().catch(safeCatch('projects', [])),
    isAdmin ? getMessages().catch(safeCatch('messages', [])) : Promise.resolve([]),
    getMyTodos().catch(safeCatch('todos', [])),
    getAnalytics().catch(safeCatch('analytics', { total: 0, today: 0, week: 0, topPages: [], chartData: [] })),
    isAdmin ? getMyBlogs().catch(safeCatch('blogs', [])) : Promise.resolve([]),
    getMyPreferences().catch(safeCatch('preferences', { hiddenTabs: [], pomodoroWork: 25, pomodoroBreak: 5 })),
    withTimeout(getWeatherData().catch(safeCatch('weather', null)), null),
    withTimeout(getGitHubActivity().catch(safeCatch('github', null)), null),
    withTimeout(getSpotifyNowPlaying().catch(safeCatch('spotify', null)), null),
  ]);

  return (
    <Suspense>
      <OverviewWrapper
        notes={notes}
        messages={messages}
        todos={todos}
        analytics={analytics}
        projects={projects}
        isAdmin={isAdmin}
        blogs={blogs}
        weather={weather}
        githubEvents={githubEvents}
        spotifyData={spotifyData}
        hiddenTabs={preferences.hiddenTabs}
      />
    </Suspense>
  );
}

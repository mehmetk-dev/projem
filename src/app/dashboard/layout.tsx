import { getSession, getCurrentUser, logout } from '@/lib/auth';
import { getMessages } from '@/app/actions/messages';
import { getMyPreferences } from '@/app/actions/preferences';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from '@/components/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.userId) {
    redirect('/login');
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const isAdmin = user.role === 'admin';

  const [messages, preferences] = await Promise.all([
    getMessages().catch(() => []),
    getMyPreferences().catch(() => ({ hiddenTabs: [] as string[], pomodoroWork: 25, pomodoroBreak: 5 })),
  ]);

  const unread = messages.filter((m) => !m.read).length;

  async function handleLogout() {
    'use server';
    await logout();
    redirect('/');
  }

  return (
    <DashboardLayoutClient
      userEmail={user.email}
      isAdmin={isAdmin}
      unread={unread}
      preferences={{
        hiddenTabs: preferences.hiddenTabs,
        pomodoroWork: preferences.pomodoroWork,
        pomodoroBreak: preferences.pomodoroBreak,
      }}
      logoutAction={handleLogout}
    >
      {children}
    </DashboardLayoutClient>
  );
}
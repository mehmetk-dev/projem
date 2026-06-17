import { getSession, getCurrentUser, logout } from '@/lib/auth';
import { getUnreadMessageCount } from '@/app/actions/messages';
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

  const [unread, preferences] = await Promise.all([
    isAdmin ? getUnreadMessageCount().catch(() => 0) : Promise.resolve(0),
    getMyPreferences().catch(() => ({ hiddenTabs: [] as string[], pomodoroWork: 25, pomodoroBreak: 5 })),
  ]);

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

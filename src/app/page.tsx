import { getSession, logout } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getPublishedProjects } from '@/app/actions/projects';
import { getPublishedBlogs } from '@/app/actions/blogs';
import PortfolioClient from '@/components/PortfolioClient';
import './portfolio.css';

export const revalidate = 3600;

export default async function HomePage() {
  const [session, projects, blogs] = await Promise.all([
    getSession(),
    getPublishedProjects().catch(() => []),
    getPublishedBlogs({ limit: 3 }).catch(() => []),
  ]);

  let user = null;
  if (session?.userId) {
    user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  }

  async function handleLogout() {
    'use server';
    await logout();
    redirect('/');
  }

  return (
    <PortfolioClient
      user={user ? { email: user.email } : null}
      logoutAction={handleLogout}
      projects={projects}
      blogs={blogs}
    />
  );
}

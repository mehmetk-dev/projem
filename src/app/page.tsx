import { getSession, logout } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getPublishedProjects } from '@/app/actions/projects';
import { getPublishedBlogs } from '@/app/actions/blogs';
import PortfolioClient from '@/components/PortfolioClient';
import './portfolio.css';

export default async function HomePage() {
  const session = await getSession();

  let user = null;
  if (session?.userId) {
    user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  }

  let projects: Awaited<ReturnType<typeof getPublishedProjects>> = [];
  let blogs: Awaited<ReturnType<typeof getPublishedBlogs>> = [];
  try {
    projects = await getPublishedProjects();
  } catch { /* table may not exist yet */ }
  try {
    blogs = await getPublishedBlogs({ limit: 3 });
  } catch { /* table may not exist yet */ }

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

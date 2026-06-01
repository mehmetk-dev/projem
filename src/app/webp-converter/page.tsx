import { getSession, logout } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WebpConverterSection from '@/components/WebpConverterSection';
import '@/app/portfolio.css';

export const metadata = {
  title: "WebP Dönüştürücü | Mehmet Kerem",
  description: "PNG ve JPG görsellerinizi anında modern WebP formatına çevirin. Tamamen tarayıcınızda çalışır, resimleriniz hiçbir sunucuya yüklenmez.",
};

export default async function WebpConverterPage() {
  const session = await getSession();

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
    <div className="bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden min-h-screen flex flex-col justify-between">
      <Header user={user ? { email: user.email } : null} logoutAction={handleLogout} />
      <main className="pt-24 pb-12 flex-grow flex items-center justify-center">
        <WebpConverterSection />
      </main>
      <Footer />
    </div>
  );
}

import Link from 'next/link';
import { getApprovedGuestbookEntries } from '@/app/actions/guestbook';
import GuestbookForm from '@/components/guestbook/GuestbookForm';
import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import BubbleMenu from '@/components/BubbleMenu';

export const metadata: Metadata = {
  title: 'Ziyaretçi Defteri | Mehmet Kerem',
  description: 'Düşüncelerinizi paylaşın ve topluluğa katılın.',
};

export const dynamic = 'force-dynamic';

export default async function GuestbookPage() {
  const [entries, user] = await Promise.all([
    getApprovedGuestbookEntries(),
    getCurrentUser(),
  ]);

  async function handleLogout() {
    'use server';
    await logout();
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <BubbleMenu logo="M. Kerem" user={user ? { email: user.email } : null} logoutAction={handleLogout} />

      <main className="container mx-auto px-6 lg:px-12 pt-20 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={24} className="text-neutral-500 dark:text-neutral-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Ziyaretçi Defteri</h1>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-12">
            Düşüncelerinizi, geri bildirimlerinizi veya sadece merhaba demek için bir mesaj bırakın.
          </p>

          <GuestbookForm />

          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              {entries.length} Mesaj
            </h2>
            {entries.length === 0 ? (
              <div className="text-center py-12 border border-neutral-200 dark:border-white/5 rounded-2xl">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Henüz onaylanmış bir mesaj yok. İlk mesajı siz bırakın!</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-neutral-900 dark:text-white">{entry.name}</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {new Date(entry.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">{entry.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200 dark:border-white/10 py-10">
        <div className="container mx-auto px-6 text-center text-[11px] font-mono tracking-[0.1em] text-neutral-500 dark:text-neutral-600 uppercase">
          © 2026 Mehmet Kerem. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}

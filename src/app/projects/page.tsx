import { getPublishedProjects } from '@/app/actions/projects';
import { getCurrentUser, logout } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import BubbleMenu from '@/components/BubbleMenu';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projeler | Mehmet Kerem',
  description: 'Geliştirdiğim açık kaynaklı projeler, tasarımlar ve ürünler.',
  openGraph: {
    title: 'Projeler | Mehmet Kerem',
    description: 'Geliştirdiğim açık kaynaklı projeler, tasarımlar ve ürünler.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default async function ProjectsListPage() {
  const [projectList, user] = await Promise.all([
    getPublishedProjects(),
    getCurrentUser(),
  ]);
  const canManageProjects = user?.role === 'admin';

  async function handleLogout() {
    'use server';
    await logout();
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <BubbleMenu logo="M. Kerem" user={user ? { email: user.email } : null} logoutAction={handleLogout} />

      <main className="container mx-auto px-6 lg:px-12 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Projeler</h1>
              <p className="text-neutral-500 text-lg">
                Teknoloji ve tasarımı bir araya getirdiğim çalışmalarım.
              </p>
            </div>
            {canManageProjects && (
              <Link
                href="/dashboard/projects?new=1"
                className="inline-flex w-fit items-center justify-center rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-neutral-200"
              >
                Proje Ekle
              </Link>
            )}
          </div>

          {projectList.length === 0 ? (
            <div className="text-center py-24 border border-white/5 rounded-[2rem]">
              <p className="text-neutral-600 text-sm">Henüz eklenmiş proje yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projectList.map((project) => (
                <article
                  key={project.id}
                  className="group relative rounded-[2rem] overflow-hidden bg-neutral-900/30 border border-white/5 hover:border-white/20 transition-all duration-500"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-600 text-xs">
                        Görsel Yok
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-400 uppercase mb-3 block">
                      {project.category}
                    </span>
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                      {project.title}
                    </h2>
                    <p className="text-neutral-500 font-light leading-relaxed mb-6 text-sm">
                      {project.description}
                    </p>
                    <div className="flex gap-4">
                      {project.link ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs uppercase tracking-wider bg-white text-black px-6 py-2.5 rounded-full font-medium hover:bg-neutral-200 transition-colors"
                        >
                          Projeyi İncele
                        </a>
                      ) : (
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-xs uppercase tracking-wider bg-white text-black px-6 py-2.5 rounded-full font-medium hover:bg-neutral-200 transition-colors"
                        >
                          Detaylar
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="container mx-auto px-6 text-center text-[11px] font-mono tracking-[0.1em] text-neutral-600 uppercase">
          © 2026 Mehmet Kerem. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}

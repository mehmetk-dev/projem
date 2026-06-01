import { getProjectById } from '@/app/actions/projects';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const projectId = Number(id);
  
  if (isNaN(projectId)) {
    return { title: 'Bulunamadı | Mehmet Kerem' };
  }

  const project = await getProjectById(projectId);

  if (!project) {
    return { title: 'Bulunamadı | Mehmet Kerem' };
  }

  return {
    title: `${project.title} | Projeler`,
    description: project.description || 'Mehmet Kerem tarafından geliştirilmiş bir proje.',
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const projectId = Number(id);

  if (isNaN(projectId)) {
    notFound();
  }

  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="fixed top-0 w-full backdrop-blur-2xl bg-black/60 border-b border-white/5 z-40">
        <div className="container mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold tracking-tight uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            MK.
          </Link>
          <nav className="flex items-center gap-6 text-xs uppercase tracking-widest text-neutral-400">
            <Link href="/projects" className="hover:text-white transition-colors">Projeler</Link>
            <Link href="/" className="hover:text-white transition-colors">Portfolyo</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 pt-28 pb-16">
        <article className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
              {project.category}
            </span>
          </div>

          {project.image && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-white/5 relative h-64 md:h-96">
              <Image src={project.image} alt={project.title} fill className="object-cover" />
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">{project.title}</h1>

          <div className="prose prose-invert prose-lg max-w-none text-neutral-300 leading-relaxed whitespace-pre-wrap mb-12">
            {project.description}
          </div>

          <div className="flex gap-4 pt-8 border-t border-white/10">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black px-8 py-3.5 rounded-full font-medium hover:scale-105 transition-transform duration-300 inline-block text-sm"
              >
                Canlı Demoyu Görüntüle
              </a>
            )}
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors px-6 py-3.5 rounded-full border border-white/10 hover:border-white/30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Tüm Projelere Dön
            </Link>
          </div>
        </article>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="container mx-auto px-6 text-center text-[11px] font-mono tracking-[0.1em] text-neutral-600 uppercase">
          © 2026 Mehmet Kerem. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}

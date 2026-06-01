'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string | null;
  category: string;
}

interface WorkSectionProps {
  projects: Project[];
}

export default function WorkSection({ projects }: WorkSectionProps) {
  const router = useRouter();

  return (
    <section id="work" className="py-20 md:py-32 lg:py-48 relative">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 animate-on-scroll">
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-700 leading-none">
            Seçkin
            <br />
            Çalışmalar
          </h2>
          <Link
            href="/projects"
            className="mt-6 md:mt-0 pb-2 border-b border-white/20 text-sm font-medium tracking-widest uppercase hover:border-white transition-colors"
          >
            Tümünü İncele
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-24 text-neutral-600 text-sm">
            Henüz proje eklenmemiş.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {projects.slice(0, 6).map((project, index) => (
              <article
                key={project.id}
                className={`group relative rounded-[2rem] overflow-hidden bg-neutral-950 border border-white/5 hover:border-white/20 transition-all duration-700 animate-on-scroll cursor-pointer ${
                  index === 1 ? 'lg:translate-y-16' : index === 2 ? 'md:translate-x-1/2 lg:translate-x-0 lg:translate-y-32' : ''
                }`}
                onClick={() => project.link ? window.open(project.link, '_blank') : router.push(`/projects/${project.id}`)}
              >
                <div className="aspect-[4/5] overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10" />
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-400 uppercase mb-4 block">
                    {project.category}
                  </span>
                  <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">{project.title}</h3>
                  <p className="text-neutral-400 font-light leading-relaxed opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    {project.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { getPublishedBlogs } from '@/app/actions/blogs';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog | Mehmet Kerem',
  description: 'Tasarım, yazılım ve ürün düşünce yapısı hakkındaki son içgörüler.',
  openGraph: {
    title: 'Blog | Mehmet Kerem',
    description: 'Tasarım, yazılım ve ürün düşünce yapısı hakkındaki son içgörüler.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default async function BlogListPage() {
  const blogList = await getPublishedBlogs();

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="fixed top-0 w-full backdrop-blur-2xl bg-black/60 border-b border-white/5 z-40">
        <div className="container mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold tracking-tight uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            MK.
          </Link>
          <nav className="flex items-center gap-6 text-xs uppercase tracking-widest text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">Portfolyo</Link>
            <Link href="/login" className="hover:text-white transition-colors">Giriş</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 pt-20 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog</h1>
          <p className="text-neutral-500 text-lg mb-12">
            Tasarım, yazılım ve ürün düşünce yapısı hakkındaki yazılar.
          </p>

          {blogList.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-neutral-600 text-sm">Henüz yayınlanmış bir yazı yok.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {blogList.map((post) => (
                <article
                  key={post.id}
                  className="group p-8 md:p-10 rounded-[2rem] bg-neutral-900/30 border border-white/5 hover:bg-neutral-900/80 transition-all duration-500 overflow-hidden"
                >
                  {post.coverImage && (
                    <div className="mb-6 -mx-8 -mt-8 md:-mx-10 md:-mt-10 relative h-56">
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                    </div>
                  )}
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
                        {post.category}
                      </span>
                      <span className="text-[12px] font-mono text-neutral-600">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-4 group-hover:text-neutral-300 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-neutral-500 font-light text-lg leading-relaxed">
                      {post.excerpt || post.content.slice(0, 200).replace(/[#*`]/g, '') + '...'}
                    </p>
                  </Link>
                  {post.tags && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {post.tags.split(',').map((tag) => (
                        <span key={tag} className="text-[11px] text-neutral-600 bg-white/5 px-3 py-1 rounded-full">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
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

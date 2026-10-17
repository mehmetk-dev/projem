import '@/app/portfolio.css';

// Proje detayına tıklanınca anında görünen iskelet
export default function ProjectDetailLoading() {
  return (
    <div className="home-theme min-h-screen">
      <main className="mx-auto max-w-6xl px-5 pt-28 pb-16 md:px-8 md:pt-36">
        <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
        <div className="mt-10 h-4 w-32 animate-pulse rounded bg-surface-2" />
        <div className="mt-4 h-14 w-2/3 max-w-lg animate-pulse rounded-lg bg-surface-2" />
        <div className="mt-5 h-5 w-full max-w-xl animate-pulse rounded bg-surface-2" />
        <div className="mt-12 grid grid-cols-2 gap-6 border-y border-line py-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-16 animate-pulse rounded bg-surface-2" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
        <div className="mt-12 aspect-[16/10] w-full animate-pulse rounded-[24px] bg-surface-2" />
      </main>
    </div>
  );
}

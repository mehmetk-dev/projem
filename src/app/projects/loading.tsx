import '@/app/portfolio.css';

export default function ProjectsLoading() {
  return (
    <div className="home-theme min-h-screen">
      <div className="h-16 border-b border-line" />
      <main className="mx-auto max-w-6xl px-5 pt-16 pb-16 md:px-8 md:pt-24">
        <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
        <div className="mt-4 h-14 w-64 animate-pulse rounded-lg bg-surface-2" />
        <div className="mt-5 h-5 w-full max-w-xl animate-pulse rounded bg-surface-2" />
        <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[16/11] animate-pulse rounded-[20px] bg-surface-2" />
              <div className="mt-6 h-3 w-24 animate-pulse rounded bg-surface-2" />
              <div className="mt-3 h-7 w-2/3 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

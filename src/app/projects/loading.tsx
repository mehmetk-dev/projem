export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="h-20" />
      <main className="container mx-auto px-6 lg:px-12 pt-28 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="h-12 w-48 bg-neutral-900 rounded-lg animate-pulse mb-4" />
          <div className="h-5 w-96 bg-neutral-900 rounded animate-pulse mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[2rem] overflow-hidden bg-neutral-900/30 border border-white/5">
                <div className="aspect-[16/10] bg-neutral-900 animate-pulse" />
                <div className="p-8 space-y-3">
                  <div className="h-3 w-16 bg-neutral-800 rounded animate-pulse" />
                  <div className="h-7 w-3/4 bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-full bg-neutral-900 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

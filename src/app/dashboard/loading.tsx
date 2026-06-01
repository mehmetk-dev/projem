function PulseBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
}

function SidebarSkeleton() {
  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-60 shrink-0 flex-col border-r border-white/5 bg-neutral-950 p-5">
      <div className="mb-8 flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-white/80 shadow-[0_0_16px_rgba(255,255,255,0.45)]" />
        <PulseBlock className="h-3 w-24" />
      </div>

      <div className="flex-1 space-y-5">
        {[0, 1, 2, 3].map((group) => (
          <div key={group} className="space-y-2">
            <PulseBlock className="h-3 w-20 bg-white/[0.035]" />
            <div className="space-y-1.5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex h-9 items-center gap-3 rounded-lg bg-white/[0.025] px-3">
                  <PulseBlock className="h-4 w-4 rounded bg-white/[0.05]" />
                  <PulseBlock className="h-3 flex-1 bg-white/[0.04]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 pt-4">
        <PulseBlock className="h-3 w-32 bg-white/[0.035]" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <PulseBlock className="h-8 bg-white/[0.035]" />
          <PulseBlock className="h-8 bg-white/[0.035]" />
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-white selection:text-black lg:flex">
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 bg-neutral-950/90 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <PulseBlock className="h-5 w-5 bg-white/[0.05]" />
          <PulseBlock className="h-3 w-24" />
        </div>
        <PulseBlock className="h-3 w-28 bg-white/[0.04]" />
      </div>

      <SidebarSkeleton />

      <main className="flex-1 min-w-0 p-5 pt-20 lg:p-8 lg:pt-8">
        <div className="mx-auto max-w-5xl space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <PulseBlock className="h-8 w-44" />
              <PulseBlock className="mt-3 h-4 w-32 bg-white/[0.04]" />
            </div>
            <div className="hidden gap-2 sm:flex">
              <PulseBlock className="h-9 w-24 bg-white/[0.04]" />
              <PulseBlock className="h-9 w-9 bg-white/[0.04]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="rounded-xl border border-white/5 bg-neutral-900/40 p-4">
                <PulseBlock className="h-7 w-16" />
                <PulseBlock className="mt-3 h-3 w-24 bg-white/[0.04]" />
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <PulseBlock className="h-5 w-28" />
                  <PulseBlock className="h-8 w-8 rounded-full bg-white/[0.04]" />
                </div>
                <PulseBlock className="mt-6 h-10 w-24 bg-white/[0.05]" />
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <PulseBlock className="h-8 bg-white/[0.035]" />
                  <PulseBlock className="h-8 bg-white/[0.035]" />
                  <PulseBlock className="h-8 bg-white/[0.035]" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-white/5 bg-neutral-900/30 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <PulseBlock className="h-4 w-28" />
                  <PulseBlock className="h-3 w-10 bg-white/[0.04]" />
                </div>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((row) => (
                    <div key={row} className="rounded-lg bg-white/[0.035] p-3">
                      <PulseBlock className="h-4 w-3/4" />
                      <PulseBlock className="mt-2 h-3 w-1/2 bg-white/[0.035]" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

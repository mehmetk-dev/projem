function PulseBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-2 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="flex items-start justify-between gap-4">
        <div>
          <PulseBlock className="h-8 w-44" />
          <PulseBlock className="mt-3 h-4 w-32" />
        </div>
        <div className="hidden gap-2 sm:flex">
          <PulseBlock className="h-9 w-24 rounded-full" />
          <PulseBlock className="h-9 w-9 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-2xl border border-line bg-surface p-4">
            <PulseBlock className="h-7 w-16" />
            <PulseBlock className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <PulseBlock className="h-5 w-28" />
              <PulseBlock className="h-8 w-8 rounded-full" />
            </div>
            <PulseBlock className="mt-6 h-10 w-24" />
            <div className="mt-5 grid grid-cols-3 gap-3">
              <PulseBlock className="h-8" />
              <PulseBlock className="h-8" />
              <PulseBlock className="h-8" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <PulseBlock className="h-4 w-28" />
              <PulseBlock className="h-3 w-10" />
            </div>
            <div className="space-y-2">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="rounded-xl bg-paper p-3">
                  <PulseBlock className="h-4 w-3/4" />
                  <PulseBlock className="mt-2 h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

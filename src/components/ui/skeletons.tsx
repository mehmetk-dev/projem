export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-surface border border-line animate-pulse"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-24 h-5 rounded-full bg-surface-2" />
            <div className="w-16 h-4 rounded-full bg-surface-2" />
          </div>
          <div className="w-3/4 h-6 rounded bg-surface-2 mb-3" />
          <div className="w-full h-4 rounded bg-surface-2 mb-2" />
          <div className="w-2/3 h-4 rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-surface border border-line animate-pulse"
        >
          <div className="w-20 h-4 rounded bg-surface-2 mb-3" />
          <div className="w-12 h-8 rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-4 pb-3 border-b border-line">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 h-5 rounded bg-surface-2" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-line">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex-1 h-4 rounded bg-surface-2" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="w-full h-10 rounded-xl bg-surface-2" />
      <div className="w-full h-10 rounded-xl bg-surface-2" />
      <div className="w-full h-32 rounded-xl bg-surface-2" />
      <div className="w-32 h-10 rounded-full bg-surface-2" />
    </div>
  );
}

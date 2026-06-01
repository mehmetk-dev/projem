import { CardSkeleton } from '@/components/ui/skeletons';

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-20 pb-16">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <div className="h-12 w-32 rounded bg-neutral-200 dark:bg-white/10 animate-pulse mb-4" />
        <div className="h-6 w-64 rounded bg-neutral-100 dark:bg-white/5 animate-pulse mb-12" />
        <CardSkeleton count={3} />
      </div>
    </div>
  );
}

'use client';

import { GitCommit, GitBranch, Star, MessageSquare } from 'lucide-react';

interface GitHubEvent {
  type: string;
  repo: string;
  message: string;
  createdAt: string;
}

interface Props {
  events: GitHubEvent[] | null;
}

const EventIcon = ({ type }: { type: string }) => {
  if (type === 'Push') return <GitCommit size={14} className="text-emerald-500 dark:text-emerald-400" />;
  if (type === 'Create') return <GitBranch size={14} className="text-sky-500 dark:text-sky-400" />;
  if (type === 'Watch') return <Star size={14} className="text-amber-500 dark:text-amber-400" />;
  return <MessageSquare size={14} className="text-neutral-500 dark:text-neutral-400" />;
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'şimdi';
  if (minutes < 60) return `${minutes}dk`;
  if (hours < 24) return `${hours}s`;
  if (days < 30) return `${days}g`;
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

export default function GitHubWidget({ events }: Props) {
  if (!events) {
    return (
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02] text-center">
        <GitCommit size={32} className="text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">GitHub verisi yok.</p>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Ayarlar&apos;dan GitHub kullanıcı adı ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">GitHub Aktivite</h3>
      {events.map((event, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02]">
          <EventIcon type={event.type} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-900 dark:text-white truncate">{event.repo}</p>
            {event.message && <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">{event.message}</p>}
          </div>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
            {relativeTime(event.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}

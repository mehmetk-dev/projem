'use client';

import { useState, useTransition } from 'react';
import { approveCommentAction, deleteCommentAction } from '@/app/actions/comments';
import { MessageCircle } from 'lucide-react';

interface Comment {
  id: number;
  blogId: number;
  parentId: number | null;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

interface Props {
  comments: Comment[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function CommentsModule({ comments, toastFn }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<number | null>(null);

  const filtered = comments.filter((c) => {
    if (filter === 'pending') return !c.approved;
    if (filter === 'approved') return c.approved;
    return true;
  });

  const handleApprove = (id: number) => {
    setActionId(id);
    const fd = new FormData();
    fd.append('id', String(id));
    startTransition(async () => {
      const res = await approveCommentAction(fd);
      toastFn(res.success || res.error || 'İşlem tamamlandı.', !!res.success);
      setActionId(null);
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    setActionId(id);
    const fd = new FormData();
    fd.append('id', String(id));
    startTransition(async () => {
      const res = await deleteCommentAction(fd);
      toastFn(res.success || res.error || 'İşlem tamamlandı.', !!res.success);
      setActionId(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-2xl font-bold tracking-tight">Yorumlar</h2>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filter === f
                  ? 'bg-neutral-200 dark:bg-white/10 border-neutral-400 dark:border-white/20 text-neutral-900 dark:text-white'
                  : 'border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : 'Onaylı'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Bu kategoride yorum bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((comment) => (
            <div
              key={comment.id}
              className={`p-5 rounded-xl border ${
                comment.approved ? 'border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02]' : 'border-amber-500/20 bg-amber-500/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-neutral-300 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-white">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-white">{comment.name}</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{comment.email}</span>
                  {!comment.approved && (
                    <span className="text-[9px] text-amber-400 border border-amber-500/20 px-1.5 rounded">
                      onay bekliyor
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{comment.content}</p>
              <div className="flex gap-2">
                {!comment.approved && (
                  <button
                    onClick={() => handleApprove(comment.id)}
                    disabled={isPending && actionId === comment.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    {isPending && actionId === comment.id ? '...' : 'Onayla'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={isPending && actionId === comment.id}
                  className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                >
                  {isPending && actionId === comment.id ? '...' : 'Sil'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

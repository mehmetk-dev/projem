'use client';

import { useActionState } from 'react';
import { submitCommentAction } from '@/app/actions/comments';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface Comment {
  id: number;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

interface Props {
  blogId: number;
  comments: Comment[];
}

export default function CommentsSection({ blogId, comments }: Props) {
  const [state, formAction, isPending] = useActionState(submitCommentAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      const form = document.getElementById('comment-form') as HTMLFormElement;
      form?.reset();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="mt-16 pt-12 border-t border-neutral-200 dark:border-white/10">
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle size={20} className="text-neutral-500 dark:text-neutral-400" />
        <h2 className="text-xl font-bold tracking-tight">Yorumlar ({comments.length})</h2>
      </div>

      <form
        id="comment-form"
        action={formAction}
        className="mb-12 p-6 md:p-8 rounded-2xl bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 space-y-5"
      >
        <input type="hidden" name="blogId" value={blogId} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="comment-name" className="block text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
              İsim
            </label>
            <input
              id="comment-name"
              name="name"
              type="text"
              required
              maxLength={100}
              className="w-full bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 transition-colors"
              placeholder="Adınız"
            />
          </div>
          <div>
            <label htmlFor="comment-email" className="block text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
              E-posta
            </label>
            <input
              id="comment-email"
              name="email"
              type="email"
              required
              maxLength={200}
              className="w-full bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 transition-colors"
              placeholder="ornek@mail.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="comment-content" className="block text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
            Yorum
          </label>
          <textarea
            id="comment-content"
            name="content"
            required
            maxLength={3000}
            rows={4}
            className="w-full bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white/30 transition-colors resize-none"
            placeholder="Düşüncelerinizi paylaşın..."
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-neutral-900 text-white dark:bg-white dark:text-black px-8 py-3.5 rounded-full font-medium hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isPending ? 'Gönderiliyor...' : 'Yorum Gönder'}
        </button>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          Yorumunuz onaylandıktan sonra yayınlanacaktır.
        </p>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 border border-neutral-200 dark:border-white/5 rounded-2xl">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Henüz yorum yok. İlk yorumu siz yapın!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-white">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-white">{comment.name}</span>
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {new Date(comment.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

'use client';

import { useActionState } from 'react';
import Link from 'next/link';
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
    <div className="mt-16 border-t border-line pt-10">
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle size={20} className="text-accent" />
        <h2 className="text-xl font-semibold tracking-tight text-ink">Yorumlar ({comments.length})</h2>
      </div>

      <form
        id="comment-form"
        action={formAction}
        className="mb-10 space-y-5 rounded-2xl border border-line bg-surface p-5 md:p-7"
      >
        <input type="hidden" name="blogId" value={blogId} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="comment-name" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              İsim
            </label>
            <input
              id="comment-name"
              name="name"
              type="text"
              required
              maxLength={100}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-accent"
              placeholder="Adınız"
            />
          </div>
          <div>
            <label htmlFor="comment-email" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              E-posta
            </label>
            <input
              id="comment-email"
              name="email"
              type="email"
              required
              maxLength={200}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-accent"
              placeholder="ornek@mail.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="comment-content" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            Yorum
          </label>
          <textarea
            id="comment-content"
            name="content"
            required
            maxLength={3000}
            rows={4}
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/70 outline-none transition-colors focus:border-accent resize-none"
            placeholder="Düşüncelerinizi paylaşın..."
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-50"
        >
          {isPending ? 'Gönderiliyor...' : 'Yorum Gönder'}
        </button>
        <p className="text-[12px] leading-relaxed text-ink-muted">
          Yorumunuz onaylandıktan sonra adınızla birlikte yayınlanır; e-posta adresiniz gösterilmez. Ayrıntılar için{' '}
          <Link href="/gizlilik" className="underline underline-offset-2 transition-colors hover:text-ink">
            Gizlilik Politikası
          </Link>
          .
        </p>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-8 text-center">
            <p className="text-sm text-ink-muted">Henüz yorum yok. İlk yorumu siz yapın!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-ink">{comment.name}</span>
                </div>
                <span className="text-[12px] text-ink-muted">
                  {new Date(comment.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

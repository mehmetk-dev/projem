'use client';

import { useState, useTransition } from 'react';
import { updateUserRoleAction, deleteUserAction } from '@/app/actions/users';
import { PageHeader } from './ui';

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

interface Props {
  users: User[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function UsersModule({ users, toastFn }: Props) {
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<number | null>(null);

  const handleRoleChange = (userId: number, role: string) => {
    setActionId(userId);
    const fd = new FormData();
    fd.append('userId', String(userId));
    fd.append('role', role);
    startTransition(async () => {
      const res = await updateUserRoleAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
      setActionId(null);
    });
  };

  const handleDelete = (userId: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    setActionId(userId);
    const fd = new FormData();
    fd.append('userId', String(userId));
    startTransition(async () => {
      const res = await deleteUserAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
      setActionId(null);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Kullanıcılar" description={`${users.length} kayıt`} />

      {users.length === 0 ? (
        <p className="text-ink-muted text-sm">Kullanıcı bulunmuyor.</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="p-4 rounded-2xl border border-line bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{user.email}</p>
                <p className="text-[11px] text-ink-muted">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={isPending && actionId === user.id}
                  className="bg-paper border border-line rounded-xl px-3 py-1.5 text-xs text-ink outline-none focus:border-accent" aria-label={`${user.email} rolü`}
                >
                  <option value="user" className="bg-surface">user</option>
                  <option value="admin" className="bg-surface">admin</option>
                </select>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={isPending && actionId === user.id}
                  className="text-xs text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 px-3 py-1.5 rounded-full border border-rose-500/20 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

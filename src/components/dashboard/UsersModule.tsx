'use client';

import { useState, useTransition } from 'react';
import { updateUserRoleAction, deleteUserAction } from '@/app/actions/users';
import { Users } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-2xl font-bold tracking-tight">Kullanıcılar</h2>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{users.length} kayıt</span>
      </div>

      {users.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Kullanıcı bulunmuyor.</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="p-4 rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.email}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={isPending && actionId === user.id}
                  className="bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white"
                >
                  <option value="user" className="bg-neutral-100 dark:bg-neutral-900">user</option>
                  <option value="admin" className="bg-neutral-100 dark:bg-neutral-900">admin</option>
                </select>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={isPending && actionId === user.id}
                  className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
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

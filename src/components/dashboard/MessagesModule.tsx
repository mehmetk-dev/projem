'use client';

import { useState } from 'react';
import * as T from './types';
import { Empty, Btn } from './ui';
import { markMessageReadAction, deleteMessageAction } from '@/app/actions/messages';

interface Props {
  messages: T.Message[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function MessagesModule({ messages: initial, toastFn }: Props) {
  const [messages, setMessages] = useState(initial);
  const [selected, setSelected] = useState<T.Message | null>(null);

  const read = async (id: number) => {
    const fd = new FormData(); fd.append('messageId', String(id));
    const res = await markMessageReadAction(fd);
    if (res.error) toastFn(res.error, false);
    else { toastFn(res.success || 'Okundu', true); setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m)); }
  };

  const del = async (id: number) => { if (!confirm('Silinsin mi?')) return; setMessages((prev) => prev.filter((m) => m.id !== id)); const fd = new FormData(); fd.append('messageId', String(id)); const res = await deleteMessageAction(fd); if (res.error) { toastFn(res.error, false); setMessages(initial); } };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold tracking-tight">İletişim Mesajları</h1><p className="text-sm text-neutral-500 mt-0.5">{messages.filter((m) => !m.read).length} okunmamış</p></div>
      {messages.length === 0 ? <Empty /> : (
        <div className="space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={`rounded-xl border transition-all ${m.read ? 'bg-neutral-900/20 border-white/5' : 'bg-neutral-900/50 border-white/10'}`}>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  {!m.read && <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />}
                  <p className="font-medium text-sm">{m.name}</p>
                  <span className="text-[10px] text-neutral-500">{m.email}</span>
                  <span className="text-[10px] text-neutral-600 ml-auto">{new Date(m.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <p className="text-sm text-neutral-400 line-clamp-2">{m.content}</p>
                <div className="flex gap-2 mt-3">
                  {!m.read && <Btn onClick={() => read(m.id)}>Okundu</Btn>}
                  <Btn variant="ghost" onClick={() => setSelected(selected?.id === m.id ? null : m)}>{selected?.id === m.id ? 'Kapat' : 'Detay'}</Btn>
                  <Btn variant="danger" onClick={() => del(m.id)}>Sil</Btn>
                </div>
              </div>
              {selected?.id === m.id && (
                <div className="px-4 pb-4">
                  <div className="p-4 rounded-lg bg-black/30 text-sm text-neutral-300 whitespace-pre-wrap animate-in fade-in">{m.content}</div>
                  {m.subject && <p className="mt-2 text-xs text-neutral-500">Konu: {m.subject}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

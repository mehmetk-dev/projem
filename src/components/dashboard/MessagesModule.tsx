'use client';

import { useMemo, useState, useTransition } from 'react';
import * as T from './types';
import { Empty, Btn } from './ui';
import {
  deleteMessageAction,
  markDirectThreadReadAction,
  markMessageReadAction,
  sendDirectMessageAction,
} from '@/app/actions/messages';

interface Props {
  messages: T.Message[];
  directMessageData: T.DirectMessageDashboardData;
  toastFn: (msg: string, ok: boolean) => void;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function MessagesModule({ messages: initial, directMessageData, toastFn }: Props) {
  const [contactMessages, setContactMessages] = useState(initial);
  const [directMessages, setDirectMessages] = useState(directMessageData.directMessages);
  const [selected, setSelected] = useState<T.Message | null>(null);
  const [selectedUserId, setSelectedUserId] = useState(() => directMessageData.contacts[0]?.id ?? null);
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const selectedContact = directMessageData.contacts.find((contact) => contact.id === selectedUserId) ?? null;
  const thread = useMemo(() => {
    if (!selectedUserId) return [];
    return directMessages.filter((message) => message.userId === selectedUserId);
  }, [directMessages, selectedUserId]);

  const unreadContactCount = contactMessages.filter((message) => !message.read).length;
  const unreadThreadCount = (contactId: number) => directMessages.filter((message) => (
    message.userId === contactId &&
    message.senderId !== directMessageData.currentUserId &&
    !message.readAt
  )).length;

  const read = async (id: number) => {
    const fd = new FormData();
    fd.append('messageId', String(id));
    const res = await markMessageReadAction(fd);
    if (res.error) {
      toastFn(res.error, false);
      return;
    }
    toastFn(res.success || 'Okundu', true);
    setContactMessages((prev) => prev.map((message) => (message.id === id ? { ...message, read: true } : message)));
  };

  const del = async (id: number) => {
    if (!confirm('Silinsin mi?')) return;
    const previous = contactMessages;
    setContactMessages((prev) => prev.filter((message) => message.id !== id));
    const fd = new FormData();
    fd.append('messageId', String(id));
    const res = await deleteMessageAction(fd);
    if (res.error) {
      toastFn(res.error, false);
      setContactMessages(previous);
    }
  };

  const markThreadRead = (contactId: number) => {
    const fd = new FormData();
    fd.append('userId', String(contactId));
    startTransition(async () => {
      const res = await markDirectThreadReadAction(fd);
      if (res.error) {
        toastFn(res.error, false);
        return;
      }
      setDirectMessages((prev) => prev.map((message) => (
        message.userId === contactId && message.senderId !== directMessageData.currentUserId
          ? { ...message, readAt: message.readAt || new Date().toISOString() }
          : message
      )));
    });
  };

  const selectThread = (contactId: number) => {
    setSelectedUserId(contactId);
    markThreadRead(contactId);
  };

  const send = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserId || !content.trim()) return;

    const formData = new FormData();
    formData.append('userId', String(selectedUserId));
    formData.append('content', content);
    const optimistic: T.DirectMessage = {
      id: -Date.now(),
      userId: selectedUserId,
      senderId: directMessageData.currentUserId,
      content: content.trim(),
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    setContent('');
    setDirectMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      const res = await sendDirectMessageAction(formData);
      if (res.error) {
        toastFn(res.error, false);
        setDirectMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
        setContent(optimistic.content);
        return;
      }
      toastFn(res.success || 'Mesaj gönderildi.', true);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mesajlar</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {directMessageData.isAdmin ? 'Kullanıcılarla bire bir konuşmalar' : 'Yöneticiyle bire bir konuşma'}
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
          <p className="px-2 pb-3 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            {directMessageData.isAdmin ? 'Kullanıcılar' : 'Konuşma'}
          </p>
          {directMessageData.contacts.length === 0 ? (
            <p className="px-2 py-6 text-sm text-neutral-500">
              {directMessageData.isAdmin ? 'Henüz kullanıcı yok.' : 'Henüz yönetici hesabı yok.'}
            </p>
          ) : (
            <div className="space-y-1">
              {directMessageData.contacts.map((contact) => {
                const unread = unreadThreadCount(contact.id);
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => selectThread(contact.id)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${
                      selectedUserId === contact.id
                        ? 'bg-white text-black'
                        : 'bg-black/20 text-neutral-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{contact.email}</span>
                      {unread > 0 ? (
                        <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-[10px] opacity-60">{contact.role}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex min-h-[520px] flex-col rounded-2xl border border-white/10 bg-neutral-900/30">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold">{selectedContact?.email || 'Konuşma seç'}</p>
            <p className="text-xs text-neutral-500">
              {directMessageData.isAdmin ? 'Bu kullanıcı sadece seninle konuşabilir.' : 'Mesajlar sadece yöneticiye gider.'}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {selectedContact ? (
              thread.length ? (
                thread.map((message) => {
                  const mine = message.senderId === directMessageData.currentUserId;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${mine ? 'rounded-br-md bg-white text-black' : 'rounded-bl-md border border-white/10 bg-black/30 text-neutral-200'}`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`mt-1 text-[10px] ${mine ? 'text-black/50' : 'text-neutral-500'}`}>{formatTime(message.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-500">Henüz mesaj yok.</div>
              )
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">Bir konuşma seç.</div>
            )}
          </div>

          <form onSubmit={send} className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                disabled={!selectedContact || isPending}
                rows={2}
                placeholder={selectedContact ? 'Mesaj yaz...' : 'Önce konuşma seç'}
                className="min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!selectedContact || !content.trim() || isPending}
                className="rounded-xl bg-white px-4 text-sm font-bold text-black hover:bg-neutral-200 disabled:opacity-50"
              >
                Gönder
              </button>
            </div>
          </form>
        </div>
      </section>

      {directMessageData.isAdmin && (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">İletişim Formu Mesajları</h2>
            <p className="text-sm text-neutral-500">{unreadContactCount} okunmamış</p>
          </div>
          {contactMessages.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {contactMessages.map((message) => (
                <div key={message.id} className={`rounded-xl border transition-all ${message.read ? 'bg-neutral-900/20 border-white/5' : 'bg-neutral-900/50 border-white/10'}`}>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {!message.read && <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />}
                      <p className="font-medium text-sm">{message.name}</p>
                      <span className="text-[10px] text-neutral-500">{message.email}</span>
                      <span className="text-[10px] text-neutral-600 ml-auto">{new Date(message.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <p className="text-sm text-neutral-400 line-clamp-2">{message.content}</p>
                    <div className="flex gap-2 mt-3">
                      {!message.read && <Btn onClick={() => read(message.id)}>Okundu</Btn>}
                      <Btn variant="ghost" onClick={() => setSelected(selected?.id === message.id ? null : message)}>{selected?.id === message.id ? 'Kapat' : 'Detay'}</Btn>
                      <Btn variant="danger" onClick={() => del(message.id)}>Sil</Btn>
                    </div>
                  </div>
                  {selected?.id === message.id && (
                    <div className="px-4 pb-4">
                      <div className="p-4 rounded-lg bg-black/30 text-sm text-neutral-300 whitespace-pre-wrap animate-in fade-in">{message.content}</div>
                      {message.subject && <p className="mt-2 text-xs text-neutral-500">Konu: {message.subject}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

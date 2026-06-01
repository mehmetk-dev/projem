'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import * as T from './types';
import { Card } from './ui';
import { createConversationAction, deleteConversationAction, createMessageAction, getMessages, getAllUserContext, updateChatSettingsAction } from '@/app/actions/chat';

interface Props {
  conversations: T.ChatConversation[];
  chatSettings: T.ChatSettings | null;
  toastFn: (msg: string, ok: boolean) => void;
}

export default function ChatModule({ conversations: initialConversations, chatSettings, toastFn }: Props) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<number | null>(initialConversations[0]?.id ?? null);
  const [messages, setMessages] = useState<T.ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(chatSettings?.defaultModel || 'openai/gpt-4o-mini');
  const [assistantSettings, setAssistantSettings] = useState({
    systemPrompt: chatSettings?.systemPrompt || '',
    defaultModel: chatSettings?.defaultModel || 'openai/gpt-4o-mini',
    temperature: chatSettings?.temperature || '0.7',
    apiKey: chatSettings?.apiKey || '',
  });
  const [settingsPending, startSettingsTransition] = useTransition();
  const [contextStr, setContextStr] = useState('');
  const [contextReady, setContextReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load context once
  useEffect(() => {
    getAllUserContext().then((ctx) => {
      const lines: string[] = ['Kullanıcının veritabanındaki verileri:'];
      if (ctx.notes.length) { lines.push('Notlar:'); ctx.notes.forEach((n) => lines.push(`- ${n.title}: ${n.content.slice(0, 200)}`)); }
      if (ctx.blogs.length) { lines.push('Bloglar:'); ctx.blogs.forEach((b) => lines.push(`- ${b.title} (${b.category})`)); }
      if (ctx.todos.length) { lines.push('Görevler:'); ctx.todos.forEach((t) => lines.push(`- ${t.title} [${t.completed ? 'tamamlandı' : 'bekliyor'}]`)); }
      if (ctx.bookmarks.length) { lines.push('Linkler:'); ctx.bookmarks.forEach((b) => lines.push(`- ${b.title}: ${b.url}`)); }
      if (ctx.snippets.length) { lines.push('Kodlar:'); ctx.snippets.forEach((s) => lines.push(`- ${s.title} (${s.language})`)); }
      if (ctx.projects.length) { lines.push('Projeler:'); ctx.projects.forEach((p) => lines.push(`- ${p.title}: ${p.description.slice(0, 120)}`)); }
      setContextStr(lines.join('\n'));
      setContextReady(true);
    }).catch(() => setContextReady(true));
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedId) return;
    getMessages(selectedId).then(setMessages).catch(() => setMessages([]));
  }, [selectedId]);

  // Scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const systemPrompt = `${assistantSettings.systemPrompt || 'Sen Mehmet Kerem\'in kisisel asistanisin.'}\n\n${contextStr}`;

  const saveAssistantSettings = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('systemPrompt', assistantSettings.systemPrompt);
    formData.append('defaultModel', assistantSettings.defaultModel);
    formData.append('temperature', assistantSettings.temperature);
    formData.append('apiKey', assistantSettings.apiKey);

    startSettingsTransition(async () => {
      const result = await updateChatSettingsAction(null, formData);
      if (result.error) {
        toastFn(result.error, false);
        return;
      }
      if (result.data && 'defaultModel' in result.data) {
        setAssistantSettings({
          systemPrompt: result.data.systemPrompt,
          defaultModel: result.data.defaultModel,
          temperature: result.data.temperature,
          apiKey: result.data.apiKey || '',
        });
        setModel(result.data.defaultModel);
      }
      toastFn(result.success || 'Ayarlar kaydedildi.', true);
    });
  };

  const startNew = async () => {
    const res = await createConversationAction(model);
    if (res.error || !res.data) { toastFn(res.error || 'Hata', false); return; }
    const conversation = res.data as T.ChatConversation;
    setConversations((prev) => [conversation, ...prev]);
    setSelectedId(conversation.id);
    setMessages([]);
  };

  const delConv = async (id: number) => {
    if (!confirm('Sohbet silinsin mi?')) return;
    const fd = new FormData();
    fd.append('conversationId', String(id));
    const res = await deleteConversationAction(fd);
    if (res.error) { toastFn(res.error, false); return; }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) { setSelectedId(null); setMessages([]); }
    toastFn('Sohbet silindi.', true);
  };

  const send = async () => {
    if (!input.trim() || !selectedId || loading || !contextReady) return;
    const userText = input.trim();
    setInput('');
    setLoading(true);

    // Save user message
    const fdUser = new FormData();
    fdUser.append('conversationId', String(selectedId));
    fdUser.append('role', 'user');
    fdUser.append('content', userText);
    const userRes = await createMessageAction(fdUser);
    const userMessage = userRes.data as T.ChatMessage | undefined;
    if (userMessage) setMessages((prev) => [...prev, userMessage]);

    // Build messages for API
    const apiMessages = messages
      .filter((m) => m.role !== 'system')
      .concat(userMessage ? [{ id: 0, conversationId: selectedId, role: 'user', content: userText, createdAt: new Date().toISOString() }] : [])
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model,
          systemPrompt,
          temperature: assistantSettings.temperature,
          apiKey: assistantSettings.apiKey,
        }),
      });

      if (!res.ok || !res.body) {
        const txt = await res.text();
        toastFn(JSON.parse(txt)?.error || 'API hatası', false);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      setMessages((prev) => [...prev, { id: 0, conversationId: selectedId, role: 'assistant', content: '', createdAt: new Date().toISOString() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              assistantText += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                  return [...prev.slice(0, -1), { ...last, content: assistantText }];
                }
                return prev;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }

      // Save assistant message
      const fdAssistant = new FormData();
      fdAssistant.append('conversationId', String(selectedId));
      fdAssistant.append('role', 'assistant');
      fdAssistant.append('content', assistantText);
      const assistantRes = await createMessageAction(fdAssistant);
      const assistantMessage = assistantRes.data as T.ChatMessage | undefined;
      if (assistantMessage) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.id === 0) {
            return [...prev.slice(0, -1), assistantMessage];
          }
          return [...prev, assistantMessage];
        });
      }
    } catch (err) {
      console.error(err);
      toastFn('Bir hata oluştu.', false);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold tracking-tight">Chat</h1><p className="text-sm text-neutral-500 mt-0.5">Kişisel asistan</p></div>
      </div>

      <Card>
        <h2 className="font-bold text-sm mb-4">Chat Asistan Ayarlari</h2>
        <form onSubmit={saveAssistantSettings} className="space-y-4">
          <div>
            <label className="text-[11px] text-neutral-500 uppercase tracking-wider block mb-1">Sistem Promptu</label>
            <textarea
              value={assistantSettings.systemPrompt}
              onChange={(event) => setAssistantSettings((current) => ({ ...current, systemPrompt: event.target.value }))}
              rows={4}
              className="w-full bg-transparent border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-neutral-500 uppercase tracking-wider block mb-1">Varsayilan Model</label>
              <input
                value={assistantSettings.defaultModel}
                onChange={(event) => {
                  setAssistantSettings((current) => ({ ...current, defaultModel: event.target.value }));
                  setModel(event.target.value);
                }}
                className="w-full bg-transparent border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-500 uppercase tracking-wider block mb-1">Sicaklik: {assistantSettings.temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={assistantSettings.temperature}
                onChange={(event) => setAssistantSettings((current) => ({ ...current, temperature: event.target.value }))}
                className="w-full accent-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-500 uppercase tracking-wider block mb-1">OpenRouter API Key</label>
              <input
                type="password"
                value={assistantSettings.apiKey}
                onChange={(event) => setAssistantSettings((current) => ({ ...current, apiKey: event.target.value }))}
                className="w-full bg-transparent border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20"
                placeholder="sk-..."
              />
            </div>
          </div>
          <button type="submit" disabled={settingsPending} className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 disabled:opacity-50">
            {settingsPending ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </Card>

      <div className="flex gap-4 h-[calc(100vh-430px)] min-h-[420px]">
        {/* Sidebar */}
        <div className="w-56 shrink-0 flex flex-col gap-2">
          <button onClick={startNew} className="w-full bg-white text-black text-xs font-bold py-2 rounded-full hover:bg-neutral-200">+ Yeni Sohbet</button>
          <div className="dashboard-sidebar-scroll flex-1 overflow-y-auto space-y-1 pr-1">
            {conversations.map((c) => (
              <div key={c.id} onClick={() => { setSelectedId(c.id); setModel(c.model); }} className={`group cursor-pointer px-3 py-2 rounded-lg text-xs border transition-all flex justify-between items-center ${selectedId === c.id ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-neutral-500 hover:text-white hover:bg-white/5'}`}>
                <span className="truncate flex-1">{c.title}</span>
                <button onClick={(e) => { e.stopPropagation(); delConv(c.id); }} className="ml-2 text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100" title="Sil">×</button>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-white/5">
            <label className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 block">Model</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-xs" placeholder="openai/gpt-4o-mini" />
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-neutral-900/40 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!selectedId && (
              <div className="h-full flex flex-col items-center justify-center text-neutral-600 text-sm">
                <p>Yeni bir sohbet başlatın veya mevcut bir sohbeti seçin.</p>
                <p className="text-xs mt-2">Model: {model}</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-white text-black rounded-br-md' : 'bg-white/5 text-neutral-200 border border-white/5 rounded-bl-md'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start"><div className="bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm text-neutral-400">Düşünüyor…</div></div>
            )}
            <div ref={bottomRef} />
          </div>

          {selectedId && (
            <div className="p-3 border-t border-white/5 flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Bir şeyler yazın…"
                rows={1}
                className="flex-1 bg-neutral-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 resize-none max-h-32"
              />
              <button onClick={send} disabled={loading || !input.trim() || !contextReady} className="bg-white text-black px-5 py-2 rounded-xl text-sm font-bold hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed">
                Gönder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

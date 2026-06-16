'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import * as T from './types';
import { Card } from './ui';
import { createConversationAction, deleteConversationAction, renameConversationAction, createMessageAction, getMessages, getAllUserContext, updateChatSettingsAction } from '@/app/actions/chat';
import { Volume2, VolumeX, Mic, Copy } from 'lucide-react';

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  }
}

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
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameText, setRenameText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
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

  // TTS & STT States
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Cleanup voice output on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
    }).catch((err) => { console.error('[Chat] context yüklenemedi:', err); setContextReady(true); });
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedId) return;
    getMessages(selectedId).then(setMessages).catch((err) => { console.error('[Chat] mesajlar yüklenemedi:', err); setMessages([]); });
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

  const startRename = (conv: T.ChatConversation) => {
    setRenamingId(conv.id);
    setRenameText(conv.title);
  };

  const submitRename = async () => {
    if (!renamingId || !renameText.trim()) { setRenamingId(null); return; }
    const fd = new FormData();
    fd.append('conversationId', String(renamingId));
    fd.append('title', renameText.trim());
    const res = await renameConversationAction(fd);
    if (res.error) { toastFn(res.error, false); } else {
      setConversations((prev) => prev.map((c) => c.id === renamingId ? { ...c, title: renameText.trim() } : c));
    }
    setRenamingId(null);
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

    // Auto-rename first message
    const currentConv = conversations.find((c) => c.id === selectedId);
    if (currentConv && currentConv.title === 'Yeni Sohbet' && messages.length === 0) {
      const autoTitle = userText.slice(0, 50);
      const fdRename = new FormData();
      fdRename.append('conversationId', String(selectedId));
      fdRename.append('title', autoTitle);
      renameConversationAction(fdRename).then((res) => {
        if (res.success) setConversations((prev) => prev.map((c) => c.id === selectedId ? { ...c, title: autoTitle } : c));
      });
    }

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

  const speakText = (text: string, msgId: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakingMsgId === msgId) {
        setSpeakingMsgId(null);
        return;
      }
    }

    const cleanedText = text
      .replace(/```[\s\S]*?```/g, '') // remove code blocks entirely from reading
      .replace(/[*`#_]/g, '')        // clean formatting chars
      .trim();

    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find((v) => v.lang.startsWith('tr'));
    if (trVoice) utterance.voice = trVoice;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toastFn('Tarayıcınız ses tanımayı desteklemiyor. Lütfen Chrome veya Edge kullanın.', false);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'tr-TR';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      const result = e.results[0]?.[0]?.transcript || '';
      if (result) {
        setInput((prev) => (prev ? prev + ' ' + result : result));
      }
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      toastFn('Mesaj kopyalandı!', true);
    }).catch(() => {
      toastFn('Kopyalanamadı.', false);
    });
  };

  function formatChatMessageContent(content: string) {
    if (!content) return '';
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match?.[1] || '';
        const code = match?.[2] || part.slice(3, -3);
        return (
          <div key={index} className="my-2 border border-white/10 bg-black/60 rounded-xl overflow-hidden font-mono text-[11px] leading-normal w-full max-w-full text-left">
            <div className="bg-neutral-900 px-3 py-1.5 text-[10px] text-neutral-400 font-bold border-b border-white/5 flex justify-between items-center select-none">
              <span>{language.toUpperCase() || 'KOD'}</span>
              <button 
                type="button"
                onClick={() => copyToClipboard(code)} 
                className="text-[9px] text-neutral-400 hover:text-white border border-white/15 px-1.5 py-0.5 rounded bg-white/5 transition-colors"
              >
                Kopyala
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-neutral-200">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      
      const inlineParts = part.split(/(`[^`\n]+`)/g);
      return (
        <span key={index} className="whitespace-pre-wrap">
          {inlineParts.map((subPart, subIndex) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code key={subIndex} className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-[11px] text-rose-300">
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  }

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold tracking-tight">Chat</h1><p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Kişisel asistan</p></div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${showSettings ? 'bg-neutral-200 dark:bg-white/10 border-neutral-400 dark:border-white/20 text-neutral-900 dark:text-white' : 'border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
        >
          {showSettings ? 'Ayarları Gizle' : 'Ayarlar'}
        </button>
      </div>

      <div className={`flex gap-4 ${showSettings ? 'h-[calc(100vh-480px)]' : 'h-[calc(100vh-220px)]'} min-h-[420px]`}>
        {/* Sidebar */}
        <div className="w-56 shrink-0 flex flex-col gap-2">
          <button onClick={startNew} className="w-full bg-white text-black text-xs font-bold py-2 rounded-full hover:bg-neutral-200">+ Yeni Sohbet</button>
          <div className="dashboard-sidebar-scroll flex-1 overflow-y-auto space-y-1 pr-1">
            {conversations.map((c) => (
              <div key={c.id} className={`group rounded-lg transition-all ${selectedId === c.id ? 'bg-neutral-200 dark:bg-white/10' : 'hover:bg-neutral-100 dark:hover:bg-white/5'}`}>
                {renamingId === c.id ? (
                  <input
                    value={renameText}
                    onChange={(e) => setRenameText(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                    autoFocus
                    className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-white/20 rounded-lg px-2 py-1.5 text-xs text-neutral-900 dark:text-white outline-none"
                  />
                ) : (
                  <div
                    onClick={() => { setSelectedId(c.id); setModel(c.model); }}
                    onDoubleClick={() => startRename(c)}
                    className="cursor-pointer px-3 py-2 flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium truncate flex-1 ${selectedId === c.id ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {c.title}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); delConv(c.id); }}
                        className="ml-1 text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 shrink-0"
                        title="Sil"
                      >×</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 truncate">
                        {c.model.split('/').pop()}
                      </span>
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-600">
                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                )}
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!selectedId && (
              <div className="h-full flex flex-col items-center justify-center text-neutral-600 text-sm">
                <p>Yeni bir sohbet başlatın veya mevcut bir sohbeti seçin.</p>
                <p className="text-xs mt-2">Model: {model}</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-white text-black rounded-br-md font-sans' : 'bg-white/5 text-neutral-200 border border-white/5 rounded-bl-md'}`}>
                  {m.role === 'user' ? m.content : formatChatMessageContent(m.content)}
                </div>
                {m.role === 'assistant' && m.id !== 0 && (
                  <div className="flex gap-2.5 mt-1 px-1 opacity-60 hover:opacity-100 transition-opacity select-none">
                    <button 
                      onClick={() => copyToClipboard(m.content)} 
                      title="Kopyala" 
                      className="text-[9px] text-neutral-400 hover:text-white flex items-center gap-1 border border-white/5 px-1.5 py-0.5 rounded bg-black/20"
                    >
                      <Copy size={9} /> Kopyala
                    </button>
                    <button 
                      onClick={() => speakText(m.content, m.id)} 
                      title="Seslendir" 
                      className="text-[9px] text-neutral-400 hover:text-white flex items-center gap-1 border border-white/5 px-1.5 py-0.5 rounded bg-black/20"
                    >
                      {speakingMsgId === m.id ? (
                        <>
                          <VolumeX size={9} className="text-rose-400" /> Durdur
                        </>
                      ) : (
                        <>
                          <Volume2 size={9} /> Oku
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {selectedId && (
            <div className="p-3 border-t border-white/5 flex gap-2 items-center">
              <button
                type="button"
                onClick={startListening}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                    : 'border-white/10 bg-neutral-900/60 text-neutral-400 hover:text-white'
                }`}
                title={isListening ? 'Dinlemeyi Durdur' : 'Konuşarak Yaz'}
              >
                <Mic size={16} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Bir şeyler yazın…"
                rows={1}
                className="flex-1 bg-neutral-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 resize-none max-h-32"
              />
              <button onClick={send} disabled={loading || !input.trim() || !contextReady} className="bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed h-fit">
                Gönder
              </button>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <Card>
          <h2 className="font-bold text-sm mb-4">Chat Asistan Ayarlari</h2>
          <form onSubmit={saveAssistantSettings} className="space-y-4">
            <div>
              <label className="text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">Sistem Promptu</label>
              <textarea
                value={assistantSettings.systemPrompt}
                onChange={(event) => setAssistantSettings((current) => ({ ...current, systemPrompt: event.target.value }))}
                rows={4}
                className="w-full bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 dark:focus:border-white/20 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">Varsayilan Model</label>
                <input
                  value={assistantSettings.defaultModel}
                  onChange={(event) => {
                    setAssistantSettings((current) => ({ ...current, defaultModel: event.target.value }));
                    setModel(event.target.value);
                  }}
                  className="w-full bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 dark:focus:border-white/20"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">Sicaklik: {assistantSettings.temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={assistantSettings.temperature}
                  onChange={(event) => setAssistantSettings((current) => ({ ...current, temperature: event.target.value }))}
                  className="w-full accent-neutral-900 dark:accent-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">OpenRouter API Key</label>
                <input
                  type="password"
                  value={assistantSettings.apiKey}
                  onChange={(event) => setAssistantSettings((current) => ({ ...current, apiKey: event.target.value }))}
                  className="w-full bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 dark:focus:border-white/20"
                  placeholder="sk-..."
                />
              </div>
            </div>
            <button type="submit" disabled={settingsPending} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-50">
              {settingsPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}

'use client';

import * as T from './types';
import { Panel, Empty } from './ui';
import WeatherWidget from './WeatherWidget';
import GitHubWidget from './GitHubWidget';
import SpotifyWidget from './SpotifyWidget';

interface Props {
  notes: T.Note[];
  messages: T.Message[];
  todos: T.Todo[];
  analytics: T.AnalyticsData;
  projects: T.Project[];
  isAdmin: boolean;
  blogs: T.Blog[];
  onTab: (t: T.TabId) => void;
  visibleTabIds: T.TabId[];
  weather: T.WeatherData | null;
  githubEvents: T.GitHubEvent[] | null;
  spotifyData: T.SpotifyData | null;
}

export default function OverviewModule({
  notes,
  messages,
  todos,
  analytics,
  projects,
  isAdmin,
  blogs,
  onTab,
  visibleTabIds,
  weather,
  githubEvents,
  spotifyData,
}: Props) {
  const isVisible = (tabId: T.TabId) => visibleTabIds.includes(tabId);
  const recentNotes = [...notes]
    .sort((a, b) => +new Date(b.updatedAt || b.createdAt) - +new Date(a.updatedAt || a.createdAt))
    .slice(0, 3);
  const pending = todos.filter((t) => !t.completed);
  const dueSoonLimit = new Date();
  dueSoonLimit.setDate(dueSoonLimit.getDate() + 3);
  const dueSoon = pending.filter((t) => t.dueDate && new Date(t.dueDate) < dueSoonLimit);
  const stats = [
    { l: 'Görüntüleme', v: analytics.total, t: 'analytics' as T.TabId },
    { l: 'Notlar', v: notes.length, t: 'notes' as T.TabId },
    { l: 'Yeni Mesaj', v: messages.filter((m) => !m.read).length, t: 'messages' as T.TabId },
    { l: 'Bekleyen Görev', v: pending.length, t: 'todos' as T.TabId },
  ].filter((s) => isVisible(s.t));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Genel Bakış</h1>
        <p className="text-sm text-neutral-500 mt-1">Kontrol merkezi</p>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <button
              key={s.l}
              onClick={() => onTab(s.t)}
              className="group text-left p-4 rounded-xl bg-neutral-900/40 border border-white/5 hover:border-white/15 transition-all hover:-translate-y-0.5"
            >
              <p className="text-2xl font-bold mb-1 group-hover:text-white transition-colors">{s.v}</p>
              <p className="text-[11px] text-neutral-500 uppercase tracking-wider">{s.l}</p>
            </button>
          ))}
        </div>
      )}

      {isVisible('todos') && dueSoon.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/15 text-amber-200/80 text-sm flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {dueSoon.length} görev yakında bitiyor
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <WeatherWidget weather={weather} />
        <GitHubWidget events={githubEvents} />
        <SpotifyWidget data={spotifyData} onConfigure={() => onTab('spotify')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {isVisible('notes') && (
          <Panel title="Son Notlar" onAll={() => onTab('notes')}>
            {recentNotes.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-2">
                {recentNotes.map((n) => {
                  const c = T.COLOR_MAP[n.color] || T.COLOR_MAP.neutral;
                  return (
                    <button
                      key={n.id}
                      onClick={() => onTab('notes')}
                      className={`w-full text-left p-3 rounded-lg border transition-all hover:-translate-y-0.5 ${c.bg} ${c.border}`}
                    >
                      <p className="font-medium text-sm line-clamp-1">{n.title}</p>
                      <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">{n.content || 'İçerik yok'}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </Panel>
        )}

        {isVisible('todos') && (
          <Panel title="Yaklaşan Görevler" onAll={() => onTab('todos')}>
            {pending.length === 0 ? (
              <p className="text-sm text-neutral-600">Tüm görevler tamamlanmış!</p>
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        t.priority === 'high'
                          ? 'bg-rose-500'
                          : t.priority === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-1">{t.title}</p>
                      {t.dueDate && (
                        <p className="text-[10px] text-neutral-500">
                          {new Date(t.dueDate).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}

        {isAdmin ? (
          <Panel title="Son Blog Yazıları" onAll={() => onTab('blogs')}>
            {blogs.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-2">
                {blogs.slice(0, 3).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onTab('blogs')}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${b.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <p className="font-medium text-sm line-clamp-1">{b.title}</p>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {b.category} - {b.published ? 'Yayında' : 'Taslak'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        ) : isVisible('projects') ? (
          <Panel title="Projeler" onAll={() => onTab('projects')}>
            {projects.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onTab('projects')}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                    <p className="text-[10px] text-neutral-500 mt-1">{p.category}</p>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

'use client';

import * as T from './types';
import { Panel, Empty, PageHeader, ui } from './ui';
import { DashboardWidgetsRow } from './DashboardWidgetsRow';

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
      <PageHeader title="Genel Bakış" description="Kontrol merkezi" />

      {stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <button
              key={s.l}
              onClick={() => onTab(s.t)}
              className={`${ui.card} p-4 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-ink/15`}
            >
              <p className="mb-1 text-3xl font-semibold tracking-[-0.03em] text-ink">{s.v}</p>
              <p className={ui.sectionTitle}>{s.l}</p>
            </button>
          ))}
        </div>
      )}

      {isVisible('todos') && dueSoon.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-sm flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {dueSoon.length} görev yakında bitiyor
        </div>
      )}

      <DashboardWidgetsRow onTab={onTab} />

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
                      <p className="font-medium text-sm text-ink line-clamp-1">{n.title}</p>
                      <p className="text-[11px] text-ink-muted mt-1 line-clamp-1">{n.content || 'İçerik yok'}</p>
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
              <p className="text-sm text-ink-muted">Tüm görevler tamamlanmış!</p>
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
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
                      <p className="text-sm text-ink line-clamp-1">{t.title}</p>
                      {t.dueDate && (
                        <p className="text-[10px] text-ink-muted">
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
                    className="w-full text-left p-3 rounded-xl bg-surface-2 hover:bg-surface-2/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${b.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <p className="font-medium text-sm text-ink line-clamp-1">{b.title}</p>
                    </div>
                    <p className="text-[10px] text-ink-muted mt-1">
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
                    className="w-full text-left p-3 rounded-xl bg-surface-2 hover:bg-surface-2/60 transition-colors"
                  >
                    <p className="font-medium text-sm text-ink line-clamp-1">{p.title}</p>
                    <p className="text-[10px] text-ink-muted mt-1">{p.category}</p>
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

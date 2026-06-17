'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import OverviewModule from './OverviewModule';
import * as T from './types';
import { getVisibleTabIds } from '@/lib/dashboard/preferences';

interface Props {
  notes: T.Note[];
  messages: T.Message[];
  todos: T.Todo[];
  analytics: T.AnalyticsData;
  projects: T.Project[];
  isAdmin: boolean;
  blogs: T.Blog[];
  hiddenTabs: string[];
}

const ALL_TABS: T.TabId[] = [
  'overview', 'notes', 'blogs', 'projects', 'messages', 'todos', 'payments', 'bookmarks', 'snippets', 'analytics', 'calendar', 'timer', 'chat', 'spotify', 'settings', 'guestbook', 'comments', 'audit', 'users', 'social', 'subscribers', 'journal', 'files'
];

const CONFIGURABLE_TABS: T.TabId[] = [
  'overview', 'notes', 'projects', 'messages', 'todos', 'payments', 'bookmarks', 'snippets', 'analytics', 'calendar', 'timer', 'guestbook', 'comments', 'journal'
];

export default function OverviewWrapper(props: Props) {
  const router = useRouter();

  const handleTab = useCallback((t: T.TabId) => {
    const url = t === 'overview' ? '/dashboard' : `/dashboard/${t}`;
    router.push(url);
  }, [router]);

  const visibleTabIds = useMemo(() => {
    return getVisibleTabIds(ALL_TABS, props.hiddenTabs, CONFIGURABLE_TABS);
  }, [props.hiddenTabs]);

  return (
    <OverviewModule
      notes={props.notes}
      messages={props.messages}
      todos={props.todos}
      analytics={props.analytics}
      projects={props.projects}
      isAdmin={props.isAdmin}
      blogs={props.blogs}
      onTab={handleTab}
      visibleTabIds={visibleTabIds}
    />
  );
}

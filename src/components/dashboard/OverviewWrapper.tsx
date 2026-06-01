'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import OverviewModule from './OverviewModule';
import { TabId } from './types';
import { getVisibleTabIds } from '@/lib/dashboard/preferences';

interface Props {
  notes: any[];
  messages: any[];
  todos: any[];
  analytics: any;
  projects: any[];
  isAdmin: boolean;
  blogs: any[];
  weather: any;
  githubEvents: any;
  spotifyData: any;
  hiddenTabs: string[];
}

const ALL_TABS: TabId[] = [
  'overview', 'notes', 'blogs', 'projects', 'messages', 'todos', 'payments', 'bookmarks', 'snippets', 'analytics', 'calendar', 'timer', 'chat', 'spotify', 'settings', 'guestbook', 'comments', 'audit', 'users', 'social', 'subscribers', 'journal', 'files'
];

const CONFIGURABLE_TABS: TabId[] = [
  'overview', 'notes', 'projects', 'messages', 'todos', 'payments', 'bookmarks', 'snippets', 'analytics', 'calendar', 'timer', 'guestbook', 'comments', 'journal'
];

export default function OverviewWrapper(props: Props) {
  const router = useRouter();

  const handleTab = useCallback((t: TabId) => {
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
      weather={props.weather}
      githubEvents={props.githubEvents}
      spotifyData={props.spotifyData}
      onTab={handleTab}
      visibleTabIds={visibleTabIds}
    />
  );
}

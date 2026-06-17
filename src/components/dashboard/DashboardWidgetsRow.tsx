'use client';

import { useState, useEffect, Suspense } from 'react';
import WeatherWidget from './WeatherWidget';
import GitHubWidget from './GitHubWidget';
import SpotifyWidget from './SpotifyWidget';
import type { WeatherData, GitHubEvent, SpotifyData, TabId } from './types';

function WidgetSkeleton() {
  return <div className="rounded-2xl border border-white/5 bg-white/[0.02] h-40 animate-pulse" />;
}

function WeatherLoader() {
  const [data, setData] = useState<WeatherData | null>(null);
  useEffect(() => {
    import('@/app/actions/weather').then(({ getWeatherData }) => {
      getWeatherData().then(setData).catch(() => setData(null));
    });
  }, []);
  return <WeatherWidget weather={data} />;
}

function GitHubLoader() {
  const [data, setData] = useState<GitHubEvent[] | null>(null);
  useEffect(() => {
    import('@/app/actions/github').then(({ getGitHubActivity }) => {
      getGitHubActivity().then(setData).catch(() => setData(null));
    });
  }, []);
  return <GitHubWidget events={data} />;
}

function SpotifyLoader({ onConfigure }: { onConfigure?: () => void }) {
  const [data, setData] = useState<SpotifyData | null>(null);
  useEffect(() => {
    import('@/app/actions/spotify').then(({ getSpotifyNowPlaying }) => {
      getSpotifyNowPlaying().then(setData).catch(() => setData(null));
    });
  }, []);
  return <SpotifyWidget data={data} onConfigure={onConfigure} />;
}

export function DashboardWidgetsRow({ onTab }: { onTab: (t: TabId) => void }) {
  return (
    <div className="grid lg:grid-cols-3 gap-4 mb-6">
      <Suspense fallback={<WidgetSkeleton />}>
        <WeatherLoader />
      </Suspense>
      <Suspense fallback={<WidgetSkeleton />}>
        <GitHubLoader />
      </Suspense>
      <Suspense fallback={<WidgetSkeleton />}>
        <SpotifyLoader onConfigure={() => onTab('spotify')} />
      </Suspense>
    </div>
  );
}

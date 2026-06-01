'use client';

import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, CloudSnow, CloudLightning } from 'lucide-react';

interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  wind: number;
}

interface Props {
  weather: WeatherData | null;
}

function getWeatherIcon(icon: string) {
  const code = icon.replace(/[dn]/, '');
  if (code === '01') return <Sun size={24} className="text-amber-500 dark:text-amber-400" />;
  if (code === '02' || code === '03' || code === '04') return <Cloud size={24} className="text-neutral-500 dark:text-neutral-400" />;
  if (code === '09' || code === '10') return <CloudRain size={24} className="text-sky-500 dark:text-sky-400" />;
  if (code === '11') return <CloudLightning size={24} className="text-amber-500 dark:text-amber-400" />;
  if (code === '13') return <CloudSnow size={24} className="text-sky-500 dark:text-sky-400" />;
  return <Cloud size={24} className="text-neutral-500 dark:text-neutral-400" />;
}

export default function WeatherWidget({ weather }: Props) {
  if (!weather) {
    return (
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02] text-center">
        <Cloud size={32} className="text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Hava durumu verisi yok.</p>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Ayarlar&apos;dan API anahtarı ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.icon)}
          <span className="text-sm font-medium text-neutral-900 dark:text-white">{weather.city}</span>
        </div>
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 capitalize">{weather.description}</span>
      </div>
      
      <div className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">{weather.temp}°C</div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <Thermometer size={14} className="text-neutral-500 dark:text-neutral-400" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{weather.feelsLike}°</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets size={14} className="text-neutral-500 dark:text-neutral-400" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">%{weather.humidity}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind size={14} className="text-neutral-500 dark:text-neutral-400" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{weather.wind} m/s</span>
        </div>
      </div>
    </div>
  );
}

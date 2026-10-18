'use client';

import { ui } from './ui';
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
  if (code === '01') return <Sun size={24} className="text-amber-600 dark:text-amber-400" />;
  if (code === '02' || code === '03' || code === '04') return <Cloud size={24} className="text-ink-muted" />;
  if (code === '09' || code === '10') return <CloudRain size={24} className="text-sky-600 dark:text-sky-400" />;
  if (code === '11') return <CloudLightning size={24} className="text-amber-600 dark:text-amber-400" />;
  if (code === '13') return <CloudSnow size={24} className="text-sky-600 dark:text-sky-400" />;
  return <Cloud size={24} className="text-ink-muted" />;
}

export default function WeatherWidget({ weather }: Props) {
  if (!weather) {
    return (
      <div className={`${ui.card} p-5 text-center`}>
        <Cloud size={32} className="text-ink-muted mx-auto mb-2" />
        <p className="text-sm text-ink-muted">Hava durumu verisi yok.</p>
        <p className="text-[11px] text-ink-muted mt-1">Ayarlar&apos;dan API anahtarı ekleyin.</p>
      </div>
    );
  }

  return (
    <div className={`${ui.card} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.icon)}
          <span className="text-sm font-medium text-ink">{weather.city}</span>
        </div>
        <span className="text-[11px] text-ink-muted capitalize">{weather.description}</span>
      </div>
      
      <div className="text-4xl font-bold text-ink mb-4">{weather.temp}°C</div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <Thermometer size={14} className="text-ink-muted" />
          <span className="text-xs text-ink-muted">{weather.feelsLike}°</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets size={14} className="text-ink-muted" />
          <span className="text-xs text-ink-muted">%{weather.humidity}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind size={14} className="text-ink-muted" />
          <span className="text-xs text-ink-muted">{weather.wind} m/s</span>
        </div>
      </div>
    </div>
  );
}

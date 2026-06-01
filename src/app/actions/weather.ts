'use server';

import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  wind: number;
}

export async function getWeatherData(): Promise<WeatherData | null> {
  try {
    const apiKeySetting = await db.select().from(siteSettings).where(eq(siteSettings.key, 'weatherApiKey')).get();
    const citySetting = await db.select().from(siteSettings).where(eq(siteSettings.key, 'weatherCity')).get();
    
    const apiKey = apiKeySetting?.value || process.env.OPENWEATHER_API_KEY;
    const city = citySetting?.value || 'Istanbul';
    
    if (!apiKey) return null;

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=tr`,
      { next: { revalidate: 600 } }
    );
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return {
      city: data.name,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind: Math.round(data.wind.speed),
    };
  } catch (error) {
    console.error('Weather Error:', error);
    return null;
  }
}

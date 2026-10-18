import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';

const geist = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono', display: 'swap' });
const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-instrument',
  display: 'swap',
});

// .home-theme bu değişkenleri kullanır; temayı kullanan her sarmalayıcıya eklenmeli
export const homeFontVariables = `${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`;

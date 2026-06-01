'use client';

import { useState, useEffect, useRef } from 'react';

type Mode = 'pomodoro' | 'timer' | 'stopwatch';
type WindowWithWebkitAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export default function TimerModule() {
  const [mode, setMode] = useState<Mode>('pomodoro');

  // Pomodoro
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoBreak, setPomoBreak] = useState(false);
  const [pomoCycle, setPomoCycle] = useState(0);

  // Countdown
  const [cdInput, setCdInput] = useState(5);
  const [cdTime, setCdTime] = useState(5 * 60);
  const [cdActive, setCdActive] = useState(false);

  // Stopwatch
  const [swTime, setSwTime] = useState(0);
  const [swActive, setSwActive] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = null; };

  const playBeep = () => {
    try {
      const audioWindow = window as WindowWithWebkitAudio;
      const AudioCtx = audioWindow.AudioContext || audioWindow.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (pomoActive) {
      intervalRef.current = setInterval(() => {
        setPomoTime((t) => {
          if (t <= 1) {
            playBeep();
            // switch phase
            setPomoBreak((b) => !b);
            if (pomoBreak) setPomoCycle((c) => c + 1);
            return pomoBreak ? 25 * 60 : 5 * 60;
          }
          return t - 1;
        });
      }, 1000);
    } else { clear(); }
    return () => clear();
  }, [pomoActive, pomoBreak]);

  useEffect(() => {
    if (cdActive) {
      intervalRef.current = setInterval(() => {
        setCdTime((t) => {
          if (t <= 1) { playBeep(); setCdActive(false); return 0; }
          return t - 1;
        });
      }, 1000);
    } else { clear(); }
    return () => clear();
  }, [cdActive]);

  useEffect(() => {
    if (swActive) {
      intervalRef.current = setInterval(() => setSwTime((t) => t + 1), 1000);
    } else { clear(); }
    return () => clear();
  }, [swActive]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const resetPomo = () => { setPomoActive(false); setPomoBreak(false); setPomoTime(25 * 60); setPomoCycle(0); };
  const resetCd = () => { setCdActive(false); setCdTime(cdInput * 60); };
  const resetSw = () => { setSwActive(false); setSwTime(0); };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold tracking-tight">Zamanlayıcı</h1><p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Pomodoro, geri sayım ve kronometre</p></div>
      </div>

      <div className="flex gap-2">
        {(['pomodoro', 'timer', 'stopwatch'] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
            mode === m
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white'
              : 'bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/30'
          }`}>
            {m === 'pomodoro' ? 'Pomodoro' : m === 'timer' ? 'Geri Sayım' : 'Kronometre'}
          </button>
        ))}
      </div>

      {mode === 'pomodoro' && (
        <div className="bg-neutral-100 dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{pomoBreak ? 'Mola' : 'Çalışma'}</div>
          <div className="text-6xl font-mono font-bold tracking-tighter text-neutral-900 dark:text-white">{fmt(pomoTime)}</div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setPomoActive((a) => !a)} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-neutral-700 dark:hover:bg-neutral-200">{pomoActive ? 'Duraklat' : 'Başlat'}</button>
            <button onClick={resetPomo} className="px-6 py-2 rounded-full text-sm font-bold border border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/30">Sıfırla</button>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Tur: {pomoCycle}</div>
        </div>
      )}

      {mode === 'timer' && (
        <div className="bg-neutral-100 dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-4">
          {!cdActive && cdTime === cdInput * 60 && (
            <div className="flex justify-center items-center gap-2">
              <input type="number" min={1} max={180} value={cdInput} onChange={(e) => { const v = Math.max(1, Math.min(180, Number(e.target.value))); setCdInput(v); setCdTime(v * 60); }} className="w-20 bg-neutral-200 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-lg py-2 text-center text-sm text-neutral-900 dark:text-white" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">dakika</span>
            </div>
          )}
          <div className="text-6xl font-mono font-bold tracking-tighter text-neutral-900 dark:text-white">{fmt(cdTime)}</div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setCdActive((a) => !a)} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-neutral-700 dark:hover:bg-neutral-200">{cdActive ? 'Duraklat' : 'Başlat'}</button>
            <button onClick={resetCd} className="px-6 py-2 rounded-full text-sm font-bold border border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/30">Sıfırla</button>
          </div>
        </div>
      )}

      {mode === 'stopwatch' && (
        <div className="bg-neutral-100 dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-4">
          <div className="text-6xl font-mono font-bold tracking-tighter text-neutral-900 dark:text-white">{fmt(swTime)}</div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setSwActive((a) => !a)} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-neutral-700 dark:hover:bg-neutral-200">{swActive ? 'Duraklat' : 'Başlat'}</button>
            <button onClick={resetSw} className="px-6 py-2 rounded-full text-sm font-bold border border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/30">Sıfırla</button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { savePomodoroSettingsAction } from '@/app/actions/preferences';
import type { UserPreferences } from './types';
import { PageHeader, ui } from './ui';

type Mode = 'pomodoro' | 'timer' | 'stopwatch';
type WindowWithWebkitAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export default function TimerModule({ preferences }: { preferences: UserPreferences }) {
  const [mode, setMode] = useState<Mode>('pomodoro');

  // Pomodoro
  const [workMinutes, setWorkMinutes] = useState(preferences.pomodoroWork ?? 25);
  const [breakMinutes, setBreakMinutes] = useState(preferences.pomodoroBreak ?? 5);
  const [pomoTime, setPomoTime] = useState((preferences.pomodoroWork ?? 25) * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoBreak, setPomoBreak] = useState(false);
  const [pomoCycle, setPomoCycle] = useState(0);
  const [pomoSettingsOpen, setPomoSettingsOpen] = useState(false);
  const [savingPomoSettings, setSavingPomoSettings] = useState(false);

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
            setPomoBreak((b) => !b);
            if (pomoBreak) setPomoCycle((c) => c + 1);
            return pomoBreak ? workMinutes * 60 : breakMinutes * 60;
          }
          return t - 1;
        });
      }, 1000);
    } else { clear(); }
    return () => clear();
  }, [pomoActive, pomoBreak, workMinutes, breakMinutes]);

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

  const resetPomo = () => { setPomoActive(false); setPomoBreak(false); setPomoTime(workMinutes * 60); setPomoCycle(0); };

  const applyPomoSettings = async () => {
    setSavingPomoSettings(true);
    const fd = new FormData();
    fd.append('pomodoroWork', String(workMinutes));
    fd.append('pomodoroBreak', String(breakMinutes));
    const res = await savePomodoroSettingsAction(fd);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Pomodoro ayarları kaydedildi.');
    }
    setPomoActive(false);
    setPomoBreak(false);
    setPomoTime(workMinutes * 60);
    setPomoCycle(0);
    setPomoSettingsOpen(false);
    setSavingPomoSettings(false);
  };
  const resetCd = () => { setCdActive(false); setCdTime(cdInput * 60); };
  const resetSw = () => { setSwActive(false); setSwTime(0); };

  return (
    <div className="space-y-5">
      <PageHeader title="Zamanlayıcı" description="Pomodoro, geri sayım ve kronometre" />

      <div className="flex gap-2">
        {(['pomodoro', 'timer', 'stopwatch'] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
            mode === m
              ? 'bg-ink text-paper border-ink'
              : 'bg-transparent text-ink-muted border-line hover:border-ink/30'
          }`}>
            {m === 'pomodoro' ? 'Pomodoro' : m === 'timer' ? 'Geri Sayım' : 'Kronometre'}
          </button>
        ))}
      </div>

      {mode === 'pomodoro' && (
        <div className={`${ui.card} p-8 text-center space-y-4`}>
          {!pomoActive && (
            <button onClick={() => setPomoSettingsOpen((o) => !o)} className="text-xs text-ink-muted hover:text-ink underline underline-offset-2">
              {pomoSettingsOpen ? 'Ayarları Gizle' : 'Süre Ayarları'}
            </button>
          )}
          {pomoSettingsOpen && !pomoActive && (
            <div className="flex justify-center items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <label className="text-ink-muted">Çalışma:</label>
                <input type="number" min={1} max={120} value={workMinutes} disabled={savingPomoSettings} onChange={(e) => { const v = Math.max(1, Math.min(120, Number(e.target.value))); setWorkMinutes(v); if (!pomoBreak) setPomoTime(v * 60); }} className="w-14 rounded-lg border border-line bg-paper py-1.5 text-center text-sm text-ink outline-none focus:border-accent disabled:opacity-50" />
                <span className="text-ink-muted text-xs">dk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-ink-muted">Mola:</label>
                <input type="number" min={1} max={60} value={breakMinutes} disabled={savingPomoSettings} onChange={(e) => { const v = Math.max(1, Math.min(60, Number(e.target.value))); setBreakMinutes(v); if (pomoBreak) setPomoTime(v * 60); }} className="w-14 rounded-lg border border-line bg-paper py-1.5 text-center text-sm text-ink outline-none focus:border-accent disabled:opacity-50" />
                <span className="text-ink-muted text-xs">dk</span>
              </div>
              <button onClick={applyPomoSettings} disabled={savingPomoSettings} className={`${ui.btnPrimary} !px-3 !py-1.5 !text-xs`}>
                {savingPomoSettings ? 'Kaydediliyor...' : 'Uygula'}
              </button>
            </div>
          )}
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">{pomoBreak ? 'Mola' : 'Çalışma'}</div>
          <div className="text-6xl font-mono font-bold tracking-tighter text-ink">{fmt(pomoTime)}</div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setPomoActive((a) => !a)} className={ui.btnPrimary}>{pomoActive ? 'Duraklat' : 'Başlat'}</button>
            <button onClick={resetPomo} className={ui.btnSecondary}>Sıfırla</button>
          </div>
          <div className="text-xs text-ink-muted">Tur: {pomoCycle}</div>
        </div>
      )}

      {mode === 'timer' && (
        <div className={`${ui.card} p-8 text-center space-y-4`}>
          {!cdActive && cdTime === cdInput * 60 && (
            <div className="flex justify-center items-center gap-2">
              <input type="number" min={1} max={180} value={cdInput} onChange={(e) => { const v = Math.max(1, Math.min(180, Number(e.target.value))); setCdInput(v); setCdTime(v * 60); }} className="w-20 rounded-lg border border-line bg-paper py-2 text-center text-sm text-ink outline-none focus:border-accent" />
              <span className="text-sm text-ink-muted">dakika</span>
            </div>
          )}
          <div className="text-6xl font-mono font-bold tracking-tighter text-ink">{fmt(cdTime)}</div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setCdActive((a) => !a)} className={ui.btnPrimary}>{cdActive ? 'Duraklat' : 'Başlat'}</button>
            <button onClick={resetCd} className={ui.btnSecondary}>Sıfırla</button>
          </div>
        </div>
      )}

      {mode === 'stopwatch' && (
        <div className={`${ui.card} p-8 text-center space-y-4`}>
          <div className="text-6xl font-mono font-bold tracking-tighter text-ink">{fmt(swTime)}</div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setSwActive((a) => !a)} className={ui.btnPrimary}>{swActive ? 'Duraklat' : 'Başlat'}</button>
            <button onClick={resetSw} className={ui.btnSecondary}>Sıfırla</button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card } from './ui';
import * as T from './types';
import { saveSettingAction, deleteSettingAction } from '@/app/actions/settings';
import { saveHiddenTabsAction } from '@/app/actions/preferences';
import { exportUserData, importUserData } from '@/app/actions/export';
import { useTransition } from 'react';
import type { TabId } from './types';

interface Props {
  userEmail: string;
  settings: T.SiteSetting[];
  preferences: T.UserPreferences;
  tabs: { id: TabId; label: string; adminOnly?: boolean }[];
  configurableTabs: TabId[];
  toastFn: (msg: string, ok: boolean) => void;
}

export default function SettingsModule({ userEmail, settings, preferences, tabs, configurableTabs, toastFn }: Props) {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1><p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Hesap ve tercihler</p></div>

      <div className="max-w-2xl space-y-4">
        <Card>
          <h2 className="font-bold text-sm mb-4">Hesap Bilgileri</h2>
          <div className="space-y-3">
            <div><label className="text-[11px] text-neutral-500 uppercase tracking-wider">E-Posta</label><p className="text-sm mt-1">{userEmail}</p></div>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-sm mb-4">Veri Yedekleme</h2>
          <div className="flex flex-col gap-3">
            <ExportImportCard toastFn={toastFn} />
          </div>
        </Card>

        <MenuModulesCard tabs={tabs} configurableTabs={configurableTabs} hiddenTabs={preferences.hiddenTabs} toastFn={toastFn} />

        <Card>
          <h2 className="font-bold text-sm mb-3 text-rose-400">Tehlikeli Bölge</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Hesabınızı kalıcı olarak sileceksiniz. Bu işlem geri alınamaz.</p>
          <button onClick={() => alert('Hesap silme özelliği yakında eklenecek.')} className="text-sm text-rose-400 hover:text-rose-300 px-4 py-2 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition-colors">Hesabı Sil</button>
        </Card>

        <SiteSettingsCard settings={settings} toastFn={toastFn} />
      </div>
    </div>
  );
}

function MenuModulesCard({ tabs, configurableTabs, hiddenTabs, toastFn }: { tabs: { id: TabId; label: string; adminOnly?: boolean }[]; configurableTabs: TabId[]; hiddenTabs: string[]; toastFn: (msg: string, ok: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const [hidden, setHidden] = useState(() => new Set(hiddenTabs));
  const configurable = new Set(configurableTabs);
  const moduleTabs = tabs.filter((tab) => configurable.has(tab.id) && !tab.adminOnly);

  const toggle = (tabId: TabId) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(tabId)) next.delete(tabId);
      else next.add(tabId);
      return next;
    });
  };

  const handleSave = () => {
    const fd = new FormData();
    [...hidden].forEach((tabId) => fd.append('hiddenTabs', tabId));
    startTransition(async () => {
      const res = await saveHiddenTabsAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
    });
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-sm">Menü Modülleri</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Kapattığınız modüller sadece menüden gizlenir; veriler silinmez.</p>
        </div>
        <button onClick={handleSave} disabled={isPending} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-50">
          {isPending ? '...' : 'Kaydet'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {moduleTabs.map((tab) => {
          const enabled = !hidden.has(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => toggle(tab.id)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                enabled
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-neutral-900 dark:text-white'
                  : 'border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <span className="text-sm font-medium">{tab.label}</span>
              <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${enabled ? 'bg-emerald-500/80' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function ExportImportCard({ toastFn }: { toastFn: (msg: string, ok: boolean) => void }) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastFn('Veriler dışa aktarıldı.', true);
    });
  };

  const handleImport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await importUserData(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
      (e.target as HTMLFormElement).reset();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={isPending}
          className="flex-1 bg-neutral-200 dark:bg-white/5 border border-neutral-300 dark:border-white/10 hover:border-neutral-500 dark:hover:border-white/20 text-neutral-900 dark:text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? 'İşleniyor...' : 'JSON Olarak İndir'}
        </button>
      </div>
      <form onSubmit={handleImport} className="flex gap-2">
        <input
          name="file"
          type="file"
          accept=".json"
          required
          className="flex-1 text-sm text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neutral-200 dark:file:bg-white/10 file:text-neutral-900 dark:file:text-white hover:file:bg-neutral-300 dark:hover:file:bg-white/20"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-50"
        >
          {isPending ? '...' : 'Yükle'}
        </button>
      </form>
    </div>
  );
}

function SiteSettingsCard({ settings, toastFn }: { settings: T.SiteSetting[]; toastFn: (msg: string, ok: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    const fd = new FormData();
    fd.append('key', newKey);
    fd.append('value', newValue);
    startTransition(async () => {
      const res = await saveSettingAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
      if (res.success) { setNewKey(''); setNewValue(''); }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bu ayarı silmek istediğinize emin misiniz?')) return;
    const fd = new FormData();
    fd.append('id', String(id));
    startTransition(async () => {
      const res = await deleteSettingAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
    });
  };

  return (
    <Card>
      <h2 className="font-bold text-sm mb-4">Site Ayarları</h2>
      <form onSubmit={handleSave} className="flex gap-2 mb-6">
        <input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Anahtar (örn: siteTitle)"
          className="flex-1 bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 dark:focus:border-white/20"
        />
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Değer"
          className="flex-[2] bg-neutral-100 dark:bg-transparent border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 dark:focus:border-white/20"
        />
        <button type="submit" disabled={isPending} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-50">
          {isPending ? '...' : 'Ekle'}
        </button>
      </form>

      <div className="space-y-2">
        {settings.length === 0 && <p className="text-sm text-neutral-500 dark:text-neutral-400">Henüz bir ayar yok.</p>}
        {settings.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02]">
            <div>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">{s.key}</span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.value}</p>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              disabled={isPending}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded border border-rose-500/20 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

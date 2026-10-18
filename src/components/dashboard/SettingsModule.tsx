'use client';

import { useState } from 'react';
import { Card, PageHeader, ui } from './ui';
import * as T from './types';
import { saveSettingAction, deleteSettingAction, saveNowPageAction } from '@/app/actions/settings';
import { saveHiddenTabsAction } from '@/app/actions/preferences';
import { exportUserData, importUserData } from '@/app/actions/export';
import { useTransition } from 'react';
import type { TabId } from './types';
import { AVAILABILITY_KEYS, AVAILABILITY_OPTIONS, parseAvailability, type AvailabilityStatus } from '@/lib/availability';

interface Props {
  userEmail: string;
  settings: T.SiteSetting[];
  preferences: T.UserPreferences;
  tabs: { id: TabId; label: string; adminOnly?: boolean }[];
  configurableTabs: TabId[];
  isAdmin: boolean;
  toastFn: (msg: string, ok: boolean) => void;
}

export default function SettingsModule({ userEmail, settings, preferences, tabs, configurableTabs, isAdmin, toastFn }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="Ayarlar" description="Hesap ve tercihler" />

      <div className="max-w-2xl space-y-4">
        {isAdmin && <AvailabilityCard settings={settings} toastFn={toastFn} />}
        {isAdmin && <NowPageCard settings={settings} toastFn={toastFn} />}

        <Card>
          <h2 className="font-bold text-sm mb-4">Hesap Bilgileri</h2>
          <div className="space-y-3">
            <div><label className="text-[11px] text-ink-muted uppercase tracking-wider">E-Posta</label><p className="text-sm mt-1">{userEmail}</p></div>
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
          <h2 className="font-bold text-sm mb-3 text-rose-600 dark:text-rose-400">Tehlikeli Bölge</h2>
          <p className="text-sm text-ink-muted mb-4">Hesabınızı kalıcı olarak sileceksiniz. Bu işlem geri alınamaz.</p>
          <button onClick={() => alert('Hesap silme özelliği yakında eklenecek.')} className="text-sm text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 px-4 py-2 rounded-full border border-rose-500/20 hover:bg-rose-500/10 transition-colors">Hesabı Sil</button>
        </Card>

        {/* Yukarıdaki kartların yönettiği anahtarlar genel listede tekrar görünmesin */}
        <SiteSettingsCard settings={settings.filter((setting) => !MANAGED_KEYS.has(setting.key))} toastFn={toastFn} />
      </div>
    </div>
  );
}

const MANAGED_KEYS = new Set<string>([...Object.values(AVAILABILITY_KEYS), 'nowPage', 'nowPageUpdatedAt']);

function NowPageCard({ settings, toastFn }: { settings: T.SiteSetting[]; toastFn: (msg: string, ok: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(settings.find((setting) => setting.key === 'nowPage')?.value ?? '');
  const updatedAt = settings.find((setting) => setting.key === 'nowPageUpdatedAt')?.value;

  const handleSave = () => {
    const fd = new FormData();
    fd.append('content', content);
    startTransition(async () => {
      const res = await saveNowPageAction(fd);
      toastFn(res.success || res.error || 'Tamamlandı.', !!res.success);
    });
  };

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">“Şimdi” sayfası</h2>
          <p className="mt-1 text-xs text-ink-muted">
            /simdi adresinde, bu aralar neyle uğraştığınızı anlatan kısa bir markdown sayfa. Boş bırakırsanız sayfa yayınlanmaz.
            {updatedAt && ` Son güncelleme: ${new Date(updatedAt).toLocaleDateString('tr-TR')}.`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {content.trim() && (
            <a href="/simdi" target="_blank" rel="noopener noreferrer" className={ui.btnSecondary}>
              Görüntüle
            </a>
          )}
          <button onClick={handleSave} disabled={isPending} className={ui.btnPrimary}>
            {isPending ? '...' : 'Kaydet'}
          </button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        maxLength={10000}
        placeholder={'## Üzerinde çalıştıklarım\n- …\n\n## Öğrendiklerim\n- …\n\n## Okuduklarım / dinlediklerim\n- …'}
        className={`${ui.input} resize-y font-mono text-[13px]`}
      />
    </Card>
  );
}

function AvailabilityCard({ settings, toastFn }: { settings: T.SiteSetting[]; toastFn: (msg: string, ok: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const saved = settings.find((setting) => setting.key === AVAILABILITY_KEYS.note)?.value ?? '';
  const initial = parseAvailability(settings.find((setting) => setting.key === AVAILABILITY_KEYS.status)?.value, saved);
  const [status, setStatus] = useState<AvailabilityStatus>(initial.status);
  const [note, setNote] = useState(saved);
  const [booking, setBooking] = useState(settings.find((setting) => setting.key === AVAILABILITY_KEYS.booking)?.value ?? '');

  const handleSave = () => {
    startTransition(async () => {
      const results = await Promise.all(
        [
          [AVAILABILITY_KEYS.status, status],
          [AVAILABILITY_KEYS.note, note.trim()],
          [AVAILABILITY_KEYS.booking, booking.trim()],
        ].map(([key, value]) => {
          const fd = new FormData();
          fd.append('key', key);
          fd.append('value', value);
          return saveSettingAction(fd);
        })
      );
      const failed = results.find((res) => res.error);
      toastFn(failed?.error || 'Müsaitlik durumu güncellendi.', !failed);
    });
  };

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">Müsaitlik</h2>
          <p className="mt-1 text-xs text-ink-muted">Ana sayfada, iletişim bölümünde ve footer&apos;da görünen durum rozeti ve görüşme linki.</p>
        </div>
        <button onClick={handleSave} disabled={isPending} className={ui.btnPrimary}>
          {isPending ? '...' : 'Kaydet'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Müsaitlik durumu">
        {(Object.keys(AVAILABILITY_OPTIONS) as AvailabilityStatus[]).map((key) => {
          const option = AVAILABILITY_OPTIONS[key];
          const active = status === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setStatus(key)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'border-ink bg-surface-2 text-ink' : 'border-line text-ink-muted hover:text-ink'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${option.dot}`} aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={60}
        placeholder={AVAILABILITY_OPTIONS[status].defaultNote}
        aria-label="Rozet metni"
        className={`${ui.input} mt-3`}
      />
      <p className="mt-1.5 text-[11px] text-ink-muted">Boş bırakırsanız seçili durumun varsayılan metni kullanılır. Ör. “Aralık için 1 yer kaldı”.</p>
      <input
        value={booking}
        onChange={(e) => setBooking(e.target.value)}
        type="url"
        placeholder="https://cal.com/kullanici/15dk"
        aria-label="Görüşme planlama linki"
        className={`${ui.input} mt-3`}
      />
      <p className="mt-1.5 text-[11px] text-ink-muted">Doluysa iletişim bölümünde “15 dakikalık görüşme planlayın” bağlantısı çıkar. https:// ile başlamalı.</p>
    </Card>
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
          <p className="text-xs text-ink-muted mt-1">Kapattığınız modüller sadece menüden gizlenir; veriler silinmez.</p>
        </div>
        <button onClick={handleSave} disabled={isPending} className={ui.btnPrimary}>
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
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-ink'
                  : 'border-line bg-surface-2/60 text-ink-muted'
              }`}
            >
              <span className="text-sm font-medium">{tab.label}</span>
              <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${enabled ? 'bg-emerald-500/80' : 'bg-ink/20'}`}>
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
          className="flex-1 bg-surface-2 border border-line hover:border-ink/30 text-ink px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
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
          className="flex-1 text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-surface-2 file:text-ink hover:file:bg-ink/10"
        />
        <button
          type="submit"
          disabled={isPending}
          className={ui.btnPrimary}
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
          aria-label="Anahtar" className={`${ui.input} !w-auto flex-1`}
        />
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Değer"
          aria-label="Değer" className={`${ui.input} !w-auto flex-[2]`}
        />
        <button type="submit" disabled={isPending} className={ui.btnPrimary}>
          {isPending ? '...' : 'Ekle'}
        </button>
      </form>

      <div className="space-y-2">
        {settings.length === 0 && <p className="text-sm text-ink-muted">Henüz bir ayar yok.</p>}
        {settings.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface">
            <div>
              <span className="text-sm font-medium text-ink">{s.key}</span>
              <p className="text-xs text-ink-muted">{s.value}</p>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              disabled={isPending}
              className="text-xs text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 px-2 py-1 rounded-full border border-rose-500/20 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

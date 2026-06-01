'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FolderOpen, Trash2, Upload, X, Eye } from 'lucide-react';
import { deleteFileAction, getFileManagerData, uploadFileAction, type FileManagerData } from '@/app/actions/files';

interface Props {
  toastFn: (msg: string, ok: boolean) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function isImage(fileName: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(fileName);
}

export default function FilesModule({ toastFn }: Props) {
  const [data, setData] = useState<FileManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState('blog');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (folder: string) => {
    setLoading(true);
    setActiveFolder(folder);
    try {
      const result = await getFileManagerData(folder);
      setData(result);
    } catch {
      toastFn('Dosyalar yüklenirken hata oluştu.', false);
    } finally {
      setLoading(false);
    }
  }, [toastFn]);

  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      void load('blog');
    }
  }, [load]);

  const handleDelete = async (key: string, fileName: string) => {
    if (!confirm(`"${fileName}" silinsin mi?`)) return;
    setBusy(true);
    const formData = new FormData();
    formData.append('key', key);
    formData.append('folder', activeFolder);
    const result = await deleteFileAction(formData);
    setBusy(false);
    toastFn(result.success || result.error || 'İşlem tamamlandı.', !!result.success);
    if (result.success) load(activeFolder);
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);

    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
      toastFn('Lütfen bir dosya seçin.', false);
      return;
    }

    setBusy(true);
    const result = await uploadFileAction(null, formData);
    setBusy(false);
    toastFn(result.success || result.error || 'İşlem tamamlandı.', !!result.success);
    if (result.success) {
      formEl.reset();
      if (fileRef.current) fileRef.current.value = '';
      load(activeFolder);
    }
  };

  const [uploadExpanded, setUploadExpanded] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dosya Yöneticisi</h1>
          <p className="text-sm text-neutral-500 mt-0.5">R2 depolama alanındaki tüm görseller ve dosyalar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
        <aside className="space-y-2">
          <h2 className="text-xs uppercase tracking-[0.18em] text-neutral-500 px-1">Klasörler</h2>
          {data?.folders.length ? (
            <div className="space-y-1">
              {data.folders.map((f) => (
                <button
                  key={f.name}
                  onClick={() => load(f.name)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    activeFolder === f.name
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen size={14} />
                    {f.label}
                  </span>
                  <span className="text-xs text-neutral-500">{f.fileCount}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 px-1">Klasör bulunamadı.</p>
          )}

          <div className="pt-3">
            <button
              onClick={() => setUploadExpanded(!uploadExpanded)}
              className="w-full flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm text-neutral-400 hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <Upload size={14} />
                Dosya Yükle
              </span>
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform ${uploadExpanded ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          {uploadExpanded && (
            <form onSubmit={handleUpload} className="rounded-2xl border border-white/10 bg-neutral-900/40 p-4 space-y-3">
              <h2 className="text-sm font-bold">
                {data?.folderLabel || activeFolder} klasörüne dosya yükle
              </h2>
              <input type="hidden" name="folder" value={activeFolder} />
              <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-center text-xs text-neutral-500 hover:border-white/20">
                <Upload size={18} />
                <span>Resim veya dosya seç (max 5MB)</span>
                <input ref={fileRef} name="file" type="file" accept="image/*" className="sr-only" />
              </label>
              <div className="flex justify-end">
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-1.5 text-sm font-bold text-black hover:bg-neutral-200 disabled:opacity-50">
                  <Upload size={14} />
                  {busy ? 'Yükleniyor...' : 'Yükle'}
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">{data?.folderLabel || activeFolder} — {data?.files.length || 0} dosya</h2>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
              Yükleniyor...
            </div>
          ) : data?.files.length ? (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {data.files.map((file) => (
                <div
                  key={file.key}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-neutral-900/30 transition hover:border-white/20"
                >
                  {isImage(file.fileName) ? (
                    <button
                      onClick={() => setPreview({ url: file.url, name: file.fileName })}
                      className="relative h-32 w-full block"
                    >
                      <Image
                        src={file.url}
                        alt={file.fileName}
                        fill
                        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
                        className="object-cover"
                      />
                    </button>
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-white/[0.02]">
                      <Eye size={24} className="text-neutral-600" />
                    </div>
                  )}

                  <div className="p-2 space-y-1">
                    <p className="text-xs text-neutral-300 truncate" title={file.fileName}>
                      {file.fileName}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-neutral-500">{formatSize(file.size)}</span>
                      <span className="text-[10px] text-neutral-600">{formatDate(file.lastModified)}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(file.key, file.fileName)}
                      disabled={busy}
                      className="mt-1 w-full flex items-center justify-center gap-1 rounded-lg border border-rose-500/20 py-1 text-[10px] text-rose-400 hover:text-rose-300 disabled:opacity-50"
                    >
                      <Trash2 size={10} />
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-neutral-500">
              Bu klasörde henüz dosya yok.
            </div>
          )}
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white"
            >
              <X size={24} />
            </button>
            <Image
              src={preview.url}
              alt={preview.name}
              width={1200}
              height={900}
              className="rounded-xl object-contain max-h-[85vh] w-full"
            />
            <p className="mt-2 text-center text-sm text-neutral-400">{preview.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

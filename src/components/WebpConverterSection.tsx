'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, Image as ImageIcon, Download, Trash2, Sliders, ArrowRight } from 'lucide-react';

interface ImageFile {
  id: string;
  file: File;
  originalName: string;
  originalSize: number;
  webpBlob: Blob | null;
  webpUrl: string | null;
  webpSize: number | null;
  status: 'idle' | 'converting' | 'success' | 'error';
  errorMsg?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function WebpConverterSection() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState<number>(0.8);
  const [isDragOver, setIsDragOver] = useState(false);
  const [convertingAll, setConvertingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: ImageFile[] = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        originalName: file.name,
        originalSize: file.size,
        webpBlob: null,
        webpUrl: null,
        webpSize: null,
        status: 'idle',
      }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const selectFiles = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item?.webpUrl) {
        URL.revokeObjectURL(item.webpUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach((img) => {
      if (img.webpUrl) URL.revokeObjectURL(img.webpUrl);
    });
    setImages([]);
  };

  const convertSingle = async (img: ImageFile, currentQuality: number): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve({
              ...img,
              status: 'error',
              errorMsg: 'Canvas çizim hatası.',
            });
            return;
          }

          ctx.drawImage(image, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve({
                  ...img,
                  status: 'success',
                  webpBlob: blob,
                  webpUrl: url,
                  webpSize: blob.size,
                });
              } else {
                resolve({
                  ...img,
                  status: 'error',
                  errorMsg: 'WebP dönüştürme başarısız oldu.',
                });
              }
            },
            'image/webp',
            currentQuality
          );
        };
        image.onerror = () => {
          resolve({
            ...img,
            status: 'error',
            errorMsg: 'Resim yüklenemedi.',
          });
        };
        image.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve({
          ...img,
          status: 'error',
          errorMsg: 'Dosya okunamadı.',
        });
      };
      reader.readAsDataURL(img.file);
    });
  };

  const convertAll = async () => {
    if (images.length === 0 || convertingAll) return;
    setConvertingAll(true);

    // Update statuses to converting
    setImages((prev) =>
      prev.map((img) => (img.status !== 'success' ? { ...img, status: 'converting' } : img))
    );

    const updatedImages = [...images];

    for (let i = 0; i < updatedImages.length; i++) {
      const img = updatedImages[i];
      if (img.status !== 'success') {
        const result = await convertSingle(img, quality);
        updatedImages[i] = result;
        // Update state in real-time
        setImages((prev) =>
          prev.map((item) => (item.id === img.id ? result : item))
        );
      }
    }

    setConvertingAll(false);
  };

  const downloadSingle = (img: ImageFile) => {
    if (!img.webpUrl) return;
    const link = document.createElement('a');
    link.href = img.webpUrl;
    link.download = img.originalName.replace(/\.[^/.]+$/, '') + '.webp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    images.forEach((img) => {
      if (img.status === 'success') {
        downloadSingle(img);
      }
    });
  };

  const convertedCount = images.filter((img) => img.status === 'success').length;

  return (
    <div className="space-y-6 rounded-2xl border border-line bg-surface p-6 sm:p-8">
      {/* Drag & Drop Area */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Görsel seç veya buraya sürükleyip bırak"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={selectFiles}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectFiles();
          }
        }}
        className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors outline-none focus-visible:border-accent ${
          isDragOver ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-ink/30'
        }`}
      >
        <label htmlFor="webp-file-input" className="sr-only">
          Dönüştürülecek görselleri seçin (PNG, JPG)
        </label>
        <input
          id="webp-file-input"
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          onClick={(e) => e.stopPropagation()}
          accept="image/png, image/jpeg, image/jpg"
          multiple
          tabIndex={-1}
          className="hidden"
        />
        <div className="mb-3 rounded-xl border border-line bg-surface-2 p-3 text-ink-muted">
          <Upload size={22} className={isDragOver ? 'text-accent' : ''} aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-ink">Görselleri sürükleyip bırakın</p>
        <p className="mt-1 text-xs text-ink-muted">veya dosyalarınızdan seçmek için tıklayın (PNG, JPG)</p>
      </div>

      {/* Quality Settings */}
      {images.length > 0 && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-surface-2 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">
            <Sliders size={14} aria-hidden="true" />
            <label htmlFor="webp-quality">Sıkıştırma Kalitesi</label>
          </div>
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <input
              id="webp-quality"
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              disabled={convertingAll}
              className="w-full accent-[var(--accent)] sm:w-48"
            />
            <span className="shrink-0 text-sm font-semibold text-ink">%{Math.round(quality * 100)}</span>
          </div>
        </div>
      )}

      {/* List of files */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">
              Resimler ({images.length})
            </span>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
            >
              Temizle
            </button>
          </div>

          <div className="dashboard-sidebar-scroll max-h-[300px] space-y-2 overflow-y-auto pr-1">
            {images.map((img) => {
              const hasSavings = img.status === 'success' && img.webpSize;
              const savings = hasSavings
                ? Math.round(((img.originalSize - img.webpSize!) / img.originalSize) * 100)
                : 0;

              return (
                <div
                  key={img.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-paper p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-muted">
                      <ImageIcon size={18} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink" title={img.originalName}>
                        {img.originalName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">{formatSize(img.originalSize)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    {img.status === 'idle' && (
                      <span className="text-[11px] uppercase text-ink-muted">Dönüştürülmeye Hazır</span>
                    )}
                    {img.status === 'converting' && (
                      <span className="animate-pulse text-[11px] uppercase text-ink-soft">Çevriliyor...</span>
                    )}
                    {img.status === 'error' && (
                      <span className="text-[11px] uppercase text-rose-600" title={img.errorMsg}>Hata</span>
                    )}
                    {img.status === 'success' && img.webpSize && (
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-[11px] text-ink-muted line-through">
                              {formatSize(img.originalSize)}
                            </span>
                            <ArrowRight size={10} className="text-ink-muted" aria-hidden="true" />
                            <span className="text-xs font-semibold text-emerald-600">
                              {formatSize(img.webpSize)}
                            </span>
                          </div>
                          {savings > 0 && (
                            <p className="mt-0.5 text-[10px] text-emerald-600">%{savings} Alan Tasarrufu</p>
                          )}
                        </div>
                        <button
                          onClick={() => downloadSingle(img)}
                          className="rounded-lg border border-line bg-surface p-1.5 text-ink transition-colors hover:border-ink/30"
                          title="WebP İndir"
                          aria-label={`${img.originalName} dosyasını WebP olarak indir`}
                        >
                          <Download size={12} aria-hidden="true" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => removeImage(img.id)}
                      disabled={convertingAll}
                      className="p-1.5 text-ink-muted transition-colors hover:text-rose-600 disabled:opacity-50"
                      title="Kaldır"
                      aria-label={`${img.originalName} dosyasını listeden kaldır`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {images.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row">
          <button
            onClick={convertAll}
            disabled={convertingAll || images.every((img) => img.status === 'success')}
            className="flex-1 rounded-full bg-ink py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-50 disabled:hover:bg-ink"
          >
            {convertingAll ? 'Dönüştürülüyor...' : 'WebP Yap'}
          </button>

          {convertedCount > 0 && (
            <button
              onClick={downloadAll}
              className="flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30"
            >
              <Download size={14} aria-hidden="true" />
              <span>Tümünü İndir ({convertedCount})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

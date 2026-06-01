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
    <section className="py-20 border-t border-white/5 bg-neutral-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-white/[0.01] rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-[120px]" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">WebP Dönüştürücü</h2>
          <p className="mt-3 text-neutral-400 text-sm max-w-lg mx-auto">
            PNG ve JPG görsellerinizi anında modern WebP formatına çevirin. Tamamen tarayıcınızda çalışır, resimleriniz hiçbir sunucuya yüklenmez.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-neutral-900/30 backdrop-blur-md p-6 sm:p-8 space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={selectFiles}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] ${
              isDragOver
                ? 'border-white bg-white/5 scale-[0.99]'
                : 'border-white/10 bg-black/10 hover:border-white/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept="image/png, image/jpeg, image/jpg"
              multiple
              className="hidden"
            />
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 mb-3 text-neutral-400">
              <Upload size={22} className={isDragOver ? 'text-white' : ''} />
            </div>
            <p className="text-sm font-semibold text-white">Görselleri sürükleyip bırakın</p>
            <p className="text-xs text-neutral-500 mt-1">veya dosyalarınızdan seçmek için tıklayın (PNG, JPG)</p>
          </div>

          {/* Quality Settings */}
          {images.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wider font-bold">
                <Sliders size={14} />
                <span>Sıkıştırma Kalitesi</span>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  disabled={convertingAll}
                  className="w-full sm:w-48 accent-white"
                />
                <span className="text-sm font-bold text-white shrink-0">%{Math.round(quality * 100)}</span>
              </div>
            </div>
          )}

          {/* List of files */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Resimler ({images.length})
                </span>
                <button
                  onClick={clearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  Temizle
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 dashboard-sidebar-scroll">
                {images.map((img) => {
                  const hasSavings = img.status === 'success' && img.webpSize;
                  const savings = hasSavings
                    ? Math.round(((img.originalSize - img.webpSize!) / img.originalSize) * 100)
                    : 0;

                  return (
                    <div
                      key={img.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-white/5 bg-black/20"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-neutral-400">
                          <ImageIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate" title={img.originalName}>
                            {img.originalName}
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{formatSize(img.originalSize)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        {img.status === 'idle' && (
                          <span className="text-[10px] text-neutral-500 uppercase">Dönüştürülmeye Hazır</span>
                        )}
                        {img.status === 'converting' && (
                          <span className="text-[10px] text-neutral-400 animate-pulse uppercase">Çevriliyor...</span>
                        )}
                        {img.status === 'error' && (
                          <span className="text-[10px] text-rose-400 uppercase" title={img.errorMsg}>Hata</span>
                        )}
                        {img.status === 'success' && img.webpSize && (
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-[10px] text-neutral-500 line-through">
                                  {formatSize(img.originalSize)}
                                </span>
                                <ArrowRight size={10} className="text-neutral-600" />
                                <span className="text-xs font-bold text-emerald-400">
                                  {formatSize(img.webpSize)}
                                </span>
                              </div>
                              {savings > 0 && (
                                <p className="text-[9px] text-emerald-500/80 mt-0.5">%{savings} Alan Tasarrufu</p>
                              )}
                            </div>
                            <button
                              onClick={() => downloadSingle(img)}
                              className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 text-white transition-colors bg-white/5"
                              title="WebP İndir"
                            >
                              <Download size={12} />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => removeImage(img.id)}
                          disabled={convertingAll}
                          className="text-neutral-500 hover:text-rose-400 p-1.5 transition-colors"
                        >
                          <Trash2 size={13} />
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
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
              <button
                onClick={convertAll}
                disabled={convertingAll || images.every((img) => img.status === 'success')}
                className="flex-1 rounded-xl bg-white text-black py-2.5 text-sm font-bold hover:bg-neutral-200 disabled:opacity-50 transition-colors"
              >
                {convertingAll ? 'Dönüştürülüyor...' : 'WebP Yap'}
              </button>

              {convertedCount > 0 && (
                <button
                  onClick={downloadAll}
                  className="rounded-xl border border-white/15 hover:border-white/25 text-white py-2.5 px-6 text-sm font-bold bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>Tümünü İndir ({convertedCount})</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

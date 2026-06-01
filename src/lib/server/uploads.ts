import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { uploadImageBufferToR2 } from './r2-storage';
import { createStorageFileName } from './storage-paths';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function getExt(file: File): string | null {
  const byMime = MIME_TO_EXT[file.type];
  if (byMime) return byMime;
  const fromName = path.extname(file.name || '').toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fromName)) {
    return fromName === '.jpeg' ? '.jpg' : fromName;
  }
  return null;
}

export async function saveUploadedImage(file: File, folder: string): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('Dosya bulunamadı.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Dosya boyutu en fazla 5MB olabilir.');
  }

  const ext = getExt(file);
  if (!ext) {
    throw new Error('Sadece JPG, PNG, WEBP veya GIF yükleyebilirsiniz.');
  }

  const fileName = createStorageFileName(ext, randomUUID);
  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadImageBufferToR2({
    buffer,
    folder,
    fileName,
    contentType: file.type || 'application/octet-stream',
  });
}

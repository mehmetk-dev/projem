import { randomUUID } from 'node:crypto';
import { uploadImageBufferToR2 } from './r2-storage';
import { createStorageFileName } from './storage-paths';

const MAX_REMOTE_IMAGE_SIZE = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function extensionFromContentType(contentType: string | null): string | null {
  if (!contentType) return null;
  return MIME_TO_EXT[contentType.split(';')[0]?.trim().toLowerCase() || ''] || null;
}

export async function saveRemoteImage(url: string, folder: string, nameHint = 'image'): Promise<string | null> {
  if (!url || !/^https?:\/\//i.test(url)) return null;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;

    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_REMOTE_IMAGE_SIZE) return null;

    const ext = extensionFromContentType(response.headers.get('content-type'));
    if (!ext) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_REMOTE_IMAGE_SIZE) return null;

    const safeHint = nameHint.replace(/[^a-z0-9-]/gi, '').slice(0, 48) || 'image';
    const fileName = `${Date.now()}-${safeHint}-${randomUUID()}${ext}`;

    return uploadImageBufferToR2({
      buffer,
      folder,
      fileName: fileName || createStorageFileName(ext, randomUUID),
      contentType: response.headers.get('content-type')?.split(';')[0]?.trim() || 'application/octet-stream',
    });
  } catch (error) {
    console.error('Remote Image Save Error:', error);
    return null;
  }
}

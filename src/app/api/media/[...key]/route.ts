import { getR2Object } from '@/lib/server/r2-storage';
import { toStorageObjectKey } from '@/lib/server/storage-paths';

const LEGACY_FOLDER_MAP: Record<string, string> = {
  journal: 'gunluk',
  blog: 'blog',
  notes: 'notlar',
  projects: 'projeler',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const fullKey = key || [];
  let folder = fullKey[0];
  const fileParts = fullKey.slice(1);

  if (!folder || fileParts.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  folder = LEGACY_FOLDER_MAP[folder] || folder;

  try {
    const objectKey = toStorageObjectKey(folder, fileParts.join('/'));
    const object = await getR2Object(objectKey);
    const bytes = object.Body ? await object.Body.transformToByteArray() : null;

    if (!bytes) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(Buffer.from(bytes), {
      headers: {
        'Content-Type': object.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    const isNotFound = error instanceof Error && 'code' in error && (error as { code?: string }).code === 'ENOENT';
    if (isNotFound) {
      return new Response('Not found', { status: 404 });
    }
    console.error('Media serve error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

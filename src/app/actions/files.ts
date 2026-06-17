'use server';

import { requireAdmin } from '@/lib/auth';
import { listR2Objects, deleteR2Object, uploadImageBufferToR2 } from '@/lib/server/r2-storage';
import { normalizeStorageFolder } from '@/lib/server/storage-paths';
import { userSafeMessage } from '@/lib/server/app-error';
import { revalidatePath } from 'next/cache';

export interface R2FileInfo {
  key: string;
  size: number;
  lastModified: string;
  url: string;
  fileName: string;
}

export interface R2FolderInfo {
  name: string;
  label: string;
  fileCount: number;
}

const FOLDER_LABELS: Record<string, string> = {
  blog: 'Blog',
  not: 'Notlar',
  proje: 'Projeler',
  gunluk: 'Günlük',
  spotify: 'Spotify',
};

const FOLDER_ORDER = ['blog', 'not', 'proje', 'gunluk', 'spotify'];

export interface FileManagerData {
  folders: R2FolderInfo[];
  folderLabel: string;
  files: R2FileInfo[];
}

export async function getFileManagerData(folder?: string): Promise<FileManagerData> {
  await requireAdmin();

  const safeFolder = folder ? normalizeStorageFolder(folder) : 'blog';
  const prefix = `${safeFolder}/`;

  const objects = await listR2Objects(prefix);

  const files: R2FileInfo[] = objects.map((obj) => {
    const fileName = obj.key.slice(prefix.length);
    return {
      key: obj.key,
      size: obj.size,
      lastModified: obj.lastModified,
      url: `/api/media/${obj.key}`,
      fileName,
    };
  });

  files.sort((a, b) => b.lastModified.localeCompare(a.lastModified));

  const folders = await getFolderList();

  return {
    folders,
    folderLabel: FOLDER_LABELS[safeFolder] || safeFolder,
    files,
  };
}

async function getFolderList(): Promise<R2FolderInfo[]> {
  const allObjects = await listR2Objects('');
  const counts: Record<string, number> = {};

  for (const obj of allObjects) {
    const folderName = obj.key.split('/')[0];
    if (folderName && FOLDER_LABELS[folderName]) {
      counts[folderName] = (counts[folderName] || 0) + 1;
    }
  }

  return FOLDER_ORDER
    .map((name) => ({
      name,
      label: FOLDER_LABELS[name] || name,
      fileCount: counts[name] || 0,
    }));
}

export async function deleteFileAction(formData: FormData): Promise<{ error?: string; success?: string }> {
  await requireAdmin();

  const key = formData.get('key') as string;

  if (!key) return { error: 'Dosya anahtarı gerekli.' };

  try {
    await deleteR2Object(key);
    revalidatePath('/dashboard');
    return { success: 'Dosya silindi.' };
  } catch {
    return { error: 'Dosya silinirken hata oluştu.' };
  }
}

export async function uploadFileAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  await requireAdmin();

  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string;

  if (!file || file.size === 0) return { error: 'Dosya seçilmedi.' };
  if (!folder) return { error: 'Klasör seçilmedi.' };

  const safeFolder = normalizeStorageFolder(folder);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120) || 'file';
    const fileName = `${Date.now()}-${safeName}`;

    await uploadImageBufferToR2({
      buffer,
      folder: safeFolder,
      fileName,
      contentType: file.type || 'application/octet-stream',
    });

    revalidatePath('/dashboard');
    return { success: 'Dosya yüklendi.' };
  } catch (error) {
    return { error: userSafeMessage(error, 'Dosya yüklenirken hata oluştu.') };
  }
}

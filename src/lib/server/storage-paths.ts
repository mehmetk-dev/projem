import path from 'node:path';

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/g, '');
}

function trimBoundarySlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function encodeObjectPath(value: string): string {
  return value.split('/').map(encodeURIComponent).join('/');
}

export function normalizeStorageFolder(folder: string): string {
  const parts = folder
    .split(/[\\/]+/)
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part && part !== '.' && part !== '..')
    .map((part) => part.replace(/[^a-z0-9-]/g, '-'))
    .map((part) => part.replace(/-+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean);

  return parts.join('/') || 'uploads';
}

export function createStorageFileName(
  ext: string,
  uuidFactory: () => string,
  nowFactory: () => number = Date.now,
): string {
  return `${nowFactory()}-${uuidFactory()}${ext}`;
}

export function toStorageObjectKey(folder: string, fileName: string): string {
  const safeFolder = normalizeStorageFolder(folder);
  const safeFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '-');

  if (!safeFileName || safeFileName === '.' || safeFileName === '..') {
    throw new Error('Invalid storage file name.');
  }

  return `${safeFolder}/${safeFileName}`;
}

export function buildPublicStorageUrl(options: {
  endpoint: string;
  bucket: string;
  objectKey: string;
  publicBaseUrl?: string;
}): string {
  const publicBase = options.publicBaseUrl?.trim();
  const objectPath = encodeObjectPath(trimBoundarySlashes(options.objectKey));
  if (!publicBase) {
    return `/api/media/${objectPath}`;
  }

  const base = trimTrailingSlashes(publicBase);
  return `${base}/${objectPath}`;
}

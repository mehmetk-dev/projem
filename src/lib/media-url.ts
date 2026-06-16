const LEGACY_UPLOAD_FOLDER_MAP: Record<string, string> = {
  journal: 'gunluk',
  gunluk: 'gunluk',
  blog: 'blog',
  notes: 'notlar',
  notlar: 'notlar',
  projects: 'projeler',
  projeler: 'projeler',
};

function encodeMediaPath(value: string): string {
  return value
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

export function normalizeMediaUrl(value: string | null | undefined): string {
  const url = value?.trim();
  if (!url) return '';

  if (
    url.startsWith('/api/media/') ||
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  const legacyUploadMatch = url.match(/^\/?uploads\/([^/]+)\/(.+)$/);
  if (legacyUploadMatch) {
    const folder = LEGACY_UPLOAD_FOLDER_MAP[legacyUploadMatch[1]] || legacyUploadMatch[1];
    return `/api/media/${encodeMediaPath(`${folder}/${legacyUploadMatch[2]}`)}`;
  }

  return url;
}

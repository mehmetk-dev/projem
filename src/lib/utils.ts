import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProjectImages(imageField: string | null | undefined): string[] {
  const fallback = '/placeholder.svg';
  if (!imageField) return [fallback];
  const trimmed = imageField.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return [fallback];
  }

  const cleanUrl = (url: string) => {
    const u = url.trim();
    if (!u || u === 'null' || u === 'undefined') return '';
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/')) {
      return u;
    }
    const firstSlash = u.indexOf('/');
    const hostPart = firstSlash === -1 ? u : u.substring(0, firstSlash);
    if (hostPart.includes('.')) {
      return 'https://' + u;
    }
    return '/' + u;
  };

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const filtered = parsed
          .map(img => typeof img === 'string' ? cleanUrl(img) : '')
          .filter(Boolean);
        if (filtered.length > 0) {
          return filtered;
        }
      }
    } catch {
      // fallback
    }
  }

  const singleCleaned = cleanUrl(trimmed);
  return singleCleaned ? [singleCleaned] : [fallback];
}

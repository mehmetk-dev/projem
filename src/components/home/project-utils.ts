import { getProjectImages } from '@/lib/utils';
import type { HomeProject } from './types';

export function projectHost(project: Pick<HomeProject, 'link' | 'slug'>) {
  if (project.link) {
    try {
      return new URL(project.link).hostname.replace(/^www\./, '');
    } catch {
      // geçersiz link — slug'a düş
    }
  }
  return `projects/${project.slug}`;
}

export function projectCover(project: Pick<HomeProject, 'image'>) {
  return getProjectImages(project.image)[0] || '/placeholder.svg';
}

export function projectStack(project: Pick<HomeProject, 'stack'>) {
  return project.stack
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** "değer | açıklama" satırlarından sonuç rakamları; ayraç yoksa satır açıklamasız değer sayılır */
export function projectResults(project: Pick<HomeProject, 'results'>) {
  return (project.results ?? '')
    .split('\n')
    .map((line) => {
      const [value, ...label] = line.split('|');
      return { value: value.trim(), label: label.join('|').trim() };
    })
    .filter((result) => result.value)
    .slice(0, 4);
}

/** Kartlarda gösterilecek kısa metin: özet yoksa açıklamanın ilk paragrafı */
export function projectTeaser(project: Pick<HomeProject, 'summary' | 'description'>) {
  return project.summary || project.description.split(/\n\s*\n/)[0]?.trim() || '';
}

/** Öne çıkan projeleri seçer; hiç işaretlenmemişse sıradaki ilk projeleri kullanır */
export function splitFeatured<T extends Pick<HomeProject, 'featured'>>(projects: T[], limit: number) {
  const marked = projects.filter((project) => project.featured).slice(0, limit);
  const featured = marked.length > 0 ? marked : projects.slice(0, limit);
  return { featured, rest: projects.filter((project) => !featured.includes(project)) };
}

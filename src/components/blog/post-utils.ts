import GithubSlugger from 'github-slugger';

interface PostLike {
  excerpt: string | null;
  content: string;
}

export function formatPostDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Markdown işaretlerinden arındırılmış kısa özet */
export function postExcerpt(post: PostLike, length = 160) {
  if (post.excerpt) return post.excerpt;
  const plain = stripInlineMarkdown(
    post.content.replace(/```[\s\S]*?```/g, ' ').replace(/^\s*(#{1,6}|>+|[-*+]|\d+\.)\s+/gm, '')
  )
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > length ? `${plain.slice(0, length).trim()}…` : plain;
}

/** Dakikada ~200 kelimeden okuma süresi */
export function readingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export interface PostHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Satır içi markdown işaretlerini kaldırır: bağlantı, görsel, kalın, italik, kod */
export function stripInlineMarkdown(text: string) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .trim();
}

/**
 * İçindekiler için ## ve ### başlıkları. Kimlikler rehype-slug ile aynı şekilde üretilir:
 * tüm başlık seviyeleri aynı sayaçtan geçer, böylece tekrar eden başlıklar da eşleşir.
 */
export function postHeadings(content: string): PostHeading[] {
  const slugger = new GithubSlugger();
  const headings: PostHeading[] = [];
  let fence: string | null = null;

  for (const line of content.replace(/\r\n/g, '\n').split('\n')) {
    const fenceMatch = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0];
      else if (fenceMatch[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;

    const match = /^\s{0,3}(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/.exec(line);
    if (!match) continue;
    const text = stripInlineMarkdown(match[2]);
    const id = slugger.slug(text);
    const level = match[1].length;
    if (level === 2 || level === 3) headings.push({ id, text, level });
  }

  return headings;
}

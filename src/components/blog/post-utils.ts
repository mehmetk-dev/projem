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
  const plain = post.content.replace(/[#*`>_[\]]/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > length ? `${plain.slice(0, length).trim()}…` : plain;
}

/** Dakikada ~200 kelimeden okuma süresi */
export function readingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export type ContentBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'quote'; text: string }
  | { type: 'code'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string };

/** Yazı içeriğini basit bloklara ayırır: ## başlık, > alıntı, ``` kod, - liste ve paragraflar */
export function contentBlocks(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const codeParts = content.replace(/\r\n/g, '\n').split(/```[^\n]*\n?/);

  codeParts.forEach((part, index) => {
    // Tek indeksler ``` arasındaki kod bloklarıdır
    if (index % 2 === 1) {
      if (part.trim()) blocks.push({ type: 'code', text: part.replace(/\n$/, '') });
      return;
    }
    for (const chunk of part.split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean)) {
      const lines = chunk.split('\n');
      const heading = /^(#{2,3})\s+(.+)$/.exec(chunk);
      if (heading && lines.length === 1) {
        blocks.push({ type: 'heading', level: heading[1].length === 2 ? 2 : 3, text: heading[2] });
      } else if (/^#\s+/.test(chunk) && lines.length === 1) {
        blocks.push({ type: 'heading', level: 2, text: chunk.replace(/^#\s+/, '') });
      } else if (lines.every((line) => line.startsWith('>'))) {
        blocks.push({ type: 'quote', text: lines.map((line) => line.replace(/^>\s?/, '')).join('\n') });
      } else if (lines.every((line) => /^[-*]\s+/.test(line))) {
        blocks.push({ type: 'list', items: lines.map((line) => line.replace(/^[-*]\s+/, '')) });
      } else {
        blocks.push({ type: 'paragraph', text: chunk });
      }
    }
  });

  return blocks;
}

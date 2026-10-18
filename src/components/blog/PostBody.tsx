import { MarkdownAsync } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeShiki, { type RehypeShikiOptions } from '@shikijs/rehype';
import { markdownComponents, postBodyClass } from './markdown';

const shikiOptions: RehypeShikiOptions = {
  theme: 'github-dark-default',
  // Yalnızca yazılarda geçen diller yüklenir; tanınmayan dil düz metin olur
  lazy: true,
  fallbackLanguage: 'text',
  defaultLanguage: 'text',
  transformers: [
    {
      pre(node) {
        node.properties['data-language'] = this.options.lang;
      },
    },
  ],
};

// Blog yazısının markdown gövdesi; kod renklendirmesi sunucuda yapılır, istemciye JS gitmez
export default function PostBody({ content }: { content: string }) {
  return (
    <div className={postBodyClass}>
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeShiki, shikiOptions]]}
        components={markdownComponents}
      >
        {content}
      </MarkdownAsync>
    </div>
  );
}

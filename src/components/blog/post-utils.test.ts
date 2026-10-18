import assert from 'node:assert/strict';
import test from 'node:test';
import { postExcerpt, postHeadings } from './post-utils';

test('postHeadings returns h2/h3 with rehype-slug compatible ids', () => {
  const content = [
    '# Giriş',
    '## Neden `use cache`?',
    'Paragraf',
    '### [Önbellek](https://example.com) katmanları',
    '```md',
    '## Kod içindeki başlık sayılmaz',
    '```',
    '## Giriş',
    '#### Derin başlık',
  ].join('\n');

  assert.deepEqual(postHeadings(content), [
    { id: 'neden-use-cache', text: 'Neden use cache?', level: 2 },
    { id: 'önbellek-katmanları', text: 'Önbellek katmanları', level: 3 },
    { id: 'giriş-1', text: 'Giriş', level: 2 },
  ]);
});

test('postExcerpt strips markdown but keeps hyphenated words', () => {
  const post = {
    excerpt: null,
    content: '## Başlık\n\n- **Full-stack** bir [rehber](https://example.com).\n\n```ts\nconst a = 1;\n```',
  };
  assert.equal(postExcerpt(post), 'Başlık Full-stack bir rehber.');
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownToEmailHtml, renderNewsletter } from './newsletter';

test('markdownToEmailHtml renders markdown and drops raw HTML', async () => {
  const html = await markdownToEmailHtml('## Başlık\n\n**Kalın** [link](https://example.com)\n\n<script>alert(1)</script>');
  assert.match(html, /<h2>Başlık<\/h2>/);
  assert.match(html, /<strong>Kalın<\/strong>/);
  assert.match(html, /<a href="https:\/\/example.com">link<\/a>/);
  assert.doesNotMatch(html, /<script>/);
});

test('renderNewsletter escapes subject and includes unsubscribe link', async () => {
  const { html, text } = await renderNewsletter({
    subject: 'Ekim <notları>',
    markdown: 'Merhaba',
    unsubscribeUrl: 'https://example.com/bulten/ayril?email=a%40b.com',
    siteUrl: 'https://example.com',
  });
  assert.match(html, /Ekim &lt;notları&gt;/);
  assert.match(html, /bulten\/ayril\?email=a%40b.com/);
  assert.match(text, /Bültenden ayrılmak için: https:\/\/example.com\/bulten\/ayril/);
});

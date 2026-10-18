import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// Bülten e-postası: sitenin açık temasına benzeyen, satır içi stillerle çizilen tek sütunlu şablon.
// E-posta istemcileri harici CSS yüklemediği için renkler burada sabit.
const C = {
  paper: '#fafaf9',
  surface: '#ffffff',
  ink: '#0c0a09',
  inkSoft: '#44403c',
  inkMuted: '#78716c',
  line: '#e7e5e4',
  accent: '#2563eb',
};

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

/** Markdown gövdeyi HTML'e çevirir; ham HTML (allowDangerousHtml kapalı) atılır */
export async function markdownToEmailHtml(markdown: string) {
  const file = await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).process(markdown);
  return String(file);
}

export async function renderNewsletter({
  subject,
  markdown,
  unsubscribeUrl,
  siteUrl,
}: {
  subject: string;
  markdown: string;
  unsubscribeUrl: string;
  siteUrl: string;
}) {
  const body = await markdownToEmailHtml(markdown);
  const host = new URL(siteUrl).host;

  const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
<style>
  .mk-body { color: ${C.inkSoft}; font-size: 16px; line-height: 1.7; }
  .mk-body h1, .mk-body h2, .mk-body h3 { color: ${C.ink}; line-height: 1.25; margin: 28px 0 10px; }
  .mk-body h1, .mk-body h2 { font-size: 21px; }
  .mk-body h3 { font-size: 17px; }
  .mk-body p, .mk-body ul, .mk-body ol { margin: 0 0 16px; }
  .mk-body li { margin: 0 0 6px; }
  .mk-body a { color: ${C.accent}; }
  .mk-body strong { color: ${C.ink}; }
  .mk-body blockquote { margin: 0 0 16px; padding-left: 16px; border-left: 2px solid ${C.accent}; color: ${C.ink}; font-style: italic; }
  .mk-body code { background: #f3f3f1; border: 1px solid ${C.line}; border-radius: 4px; padding: 1px 5px; font-size: 14px; }
  .mk-body pre { background: ${C.ink}; color: #f5f5f4; border-radius: 12px; padding: 16px; overflow-x: auto; }
  .mk-body pre code { background: none; border: 0; padding: 0; color: inherit; }
  .mk-body img { max-width: 100%; border-radius: 12px; }
</style>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="background:${C.paper};padding:32px 16px;font-family:${FONT};">
  <div style="max-width:600px;margin:0 auto;background:${C.surface};border:1px solid ${C.line};border-radius:20px;padding:36px 32px;">
    <p style="margin:0 0 20px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${C.accent};">Mehmet Kerem · Bülten</p>
    <h1 style="margin:0 0 24px;font-size:28px;line-height:1.15;letter-spacing:-0.02em;color:${C.ink};">${escapeHtml(subject)}</h1>
    <div class="mk-body">${body}</div>
  </div>
  <p style="max-width:600px;margin:20px auto 0;font-size:12px;line-height:1.6;color:${C.inkMuted};text-align:center;">
    Bu e-postayı <a href="${escapeHtml(siteUrl)}" style="color:${C.inkMuted};">${escapeHtml(host)}</a> bültenine abone olduğunuz için aldınız.<br>
    <a href="${escapeHtml(unsubscribeUrl)}" style="color:${C.inkMuted};">Bültenden ayrılın</a>
  </p>
</div>
</body>
</html>`;

  const text = `${subject}\n\n${markdown}\n\n—\nBültenden ayrılmak için: ${unsubscribeUrl}`;
  return { html, text };
}

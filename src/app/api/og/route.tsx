import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { siteUrl } from '@/lib/site';

export const runtime = 'edge';

// Sitenin açık temasıyla aynı renkler (src/app/portfolio.css)
const C = {
  paper: '#fafaf9',
  ink: '#0c0a09',
  inkSoft: '#44403c',
  inkMuted: '#78716c',
  line: '#e7e5e4',
  accent: '#2563eb',
};

type FontSpec = { name: string; family: string; weight: 400 | 600; style: 'normal' | 'italic' };

const FONTS: FontSpec[] = [
  { name: 'Geist', family: 'Geist:wght@600', weight: 600, style: 'normal' },
  { name: 'Geist', family: 'Geist:wght@400', weight: 400, style: 'normal' },
  { name: 'Geist Mono', family: 'Geist+Mono:wght@400', weight: 400, style: 'normal' },
  { name: 'Instrument Serif', family: 'Instrument+Serif:ital@1', weight: 400, style: 'italic' },
];

// Google Fonts'tan yalnızca görseldeki karakterleri içeren TTF alt kümesini indirir
async function loadFont(family: string, text: string) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`).then(
    (res) => res.text()
  );
  const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
  if (!url) throw new Error(`Font bulunamadı: ${family}`);
  return fetch(url).then((res) => res.arrayBuffer());
}

// Fontlar yüklenemezse görsel varsayılan yazı tipiyle yine de üretilir
async function loadFonts(text: string) {
  const results = await Promise.allSettled(FONTS.map((font) => loadFont(font.family, text)));
  return results.flatMap((result, i) =>
    result.status === 'fulfilled'
      ? [{ name: FONTS[i].name, data: result.value, weight: FONTS[i].weight, style: FONTS[i].style }]
      : []
  );
}

function clamp(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = clamp(searchParams.get('title') || 'Mehmet Kerem', 90);
    const description = clamp(searchParams.get('description') || 'Full-Stack Web Geliştirici', 150);
    // Mono satırlar büyük harf; textTransform Türkçe i/İ ayrımını bilmediği için burada çevrilir
    const label = clamp(searchParams.get('label') || '', 40).toLocaleUpperCase('tr-TR');
    const host = new URL(siteUrl).host.toUpperCase();

    // Başlığın son kelimesi sitedeki gibi italik serif ve mavi vurgulu
    const words = title.split(/\s+/);
    const lastWord = words.pop() ?? '';
    const titleSize = title.length > 60 ? 64 : title.length > 32 ? 78 : 96;
    const footer = 'İSTANBUL — FULL-STACK WEB GELİŞTİRİCİ';

    const fonts = await loadFonts(`Mehmet Kerem ${title} ${description} ${label} ${host} ${footer}…·`);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: C.paper,
            padding: '64px 72px',
            position: 'relative',
            fontFamily: 'Geist',
            color: C.ink,
          }}
        >
          {/* Üstte hafif mavi ışık — hero arka planındaki gibi */}
          <div
            style={{
              position: 'absolute',
              top: -260,
              left: 150,
              width: 900,
              height: 560,
              borderRadius: 9999,
              backgroundImage: 'radial-gradient(ellipse at center, rgba(37,99,235,0.16), rgba(37,99,235,0) 65%)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg width="60" height="56" viewBox="0 0 30 28">
                <circle cx="10" cy="14" r="9" fill={C.ink} />
                <circle cx="20" cy="14" r="9" fill={C.accent} />
                <path d="M15 6.52A9 9 0 0 1 15 21.48A9 9 0 0 1 15 6.52Z" fill={C.paper} />
              </svg>
              <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 34, fontWeight: 600, letterSpacing: -0.6 }}>
                <span>Mehmet</span>
                <span
                  style={{
                    marginLeft: 9,
                    fontFamily: 'Instrument Serif',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: 39,
                    color: C.accent,
                  }}
                >
                  Kerem
                </span>
              </div>
            </div>
            {label && (
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Geist Mono',
                  fontSize: 20,
                  letterSpacing: 2.6,
                  color: C.accent,
                  backgroundColor: '#eff6ff',
                  border: '1px solid #dbe6fd',
                  borderRadius: 9999,
                  padding: '10px 22px',
                }}
              >
                {label}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                fontSize: titleSize,
                fontWeight: 600,
                lineHeight: 1.04,
                letterSpacing: titleSize * -0.04,
                maxWidth: 1040,
              }}
            >
              {words.map((word, i) => (
                <span key={i} style={{ marginRight: titleSize * 0.24 }}>
                  {word}
                </span>
              ))}
              <span
                style={{
                  fontFamily: 'Instrument Serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: titleSize * 1.08,
                  letterSpacing: titleSize * -0.02,
                  color: C.accent,
                }}
              >
                {lastWord}
              </span>
            </div>
            <div style={{ display: 'flex', marginTop: 28, fontSize: 30, lineHeight: 1.4, color: C.inkSoft, maxWidth: 940 }}>
              {description}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${C.line}`,
              paddingTop: 26,
              fontFamily: 'Geist Mono',
              fontSize: 20,
              letterSpacing: 2.2,
              color: C.inkMuted,
            }}
          >
            <span>{host}</span>
            <span>{footer}</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts }
    );
  } catch (e) {
    console.error('OG Image Error:', e);
    return new Response('OG Image generation failed', { status: 500 });
  }
}

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Mehmet Kerem';
    const description = searchParams.get('description') || 'Yazılım Geliştirici';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: 'linear-gradient(135deg, #000000 0%, #111111 100%)',
            padding: 80,
            position: 'relative',
          }}
        >
          {/* Subtle grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.05,
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Accent line */}
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: 80,
              width: 60,
              height: 4,
              backgroundColor: '#ffffff',
              borderRadius: 2,
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
              }}
            />
            <span
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              mehmetkerem.com
            </span>
          </div>

          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: 24,
              maxWidth: 900,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.4,
              maxWidth: 800,
            }}
          >
            {description}
          </p>

          <div
            style={{
              position: 'absolute',
              bottom: 80,
              left: 80,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 500,
              }}
            >
              Mehmet Kerem
            </span>
            <span
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              |
            </span>
            <span
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              Yazılım Geliştirici
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('OG Image Error:', e);
    return new Response('OG Image generation failed', { status: 500 });
  }
}

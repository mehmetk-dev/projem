'use client';

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#0a0a0a', color: '#fff' }}>
          <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Kritik Hata</h2>
            <p style={{ color: '#737373', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Uygulama çöktü. Lütfen tekrar deneyin veya ana sayfaya dönün.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => unstable_retry()}
                style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
              >
                Tekrar Dene
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', color: '#fff', textDecoration: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
              >
                Ana Sayfa
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
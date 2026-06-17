import type { NextConfig } from "next";

function remoteImagePatternFromUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port,
      pathname: '/**',
    };
  } catch {
    return null;
  }
}

const remoteImagePatterns = [
  remoteImagePatternFromUrl(process.env.R2_ENDPOINT),
  remoteImagePatternFromUrl(process.env.R2_PUBLIC_URL),
  { protocol: 'https' as const, hostname: 'i.scdn.co', pathname: '/**' },
].filter((pattern): pattern is NonNullable<typeof pattern> => Boolean(pattern));

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: remoteImagePatterns,
  },
  async redirects() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/media/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sdk.scdn.co https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: i.scdn.co; font-src 'self'; connect-src 'self' https://api.spotify.com https://accounts.spotify.com https://*.spotify.com https://cloudflareinsights.com https://*.cloudflareinsights.com; frame-src https://sdk.scdn.co https://open.spotify.com; media-src 'self' https://*.spotify.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

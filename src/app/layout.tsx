import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { ServiceWorker } from "@/components/ServiceWorker";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent('Mehmet Kerem')}&description=${encodeURIComponent('Yazılım Geliştirici')}`;

export const metadata: Metadata = {
  title: "Mehmet Kerem | Yazılım Geliştirici",
  description: "Tasarım ve mühendisliği birleştirerek kusursuz dijital deneyimler yaratıyorum. Modern teknolojiler ile geleceğin ürünlerini inşa ediyorum.",
  keywords: ["Mehmet Kerem", "Yazılım Geliştirici", "React", "Next.js", "TypeScript"],
  authors: [{ name: "Mehmet Kerem" }],
  manifest: '/manifest.json',
  alternates: {
    types: {
      'application/rss+xml': `${siteUrl}/feed.xml`,
    },
  },
  openGraph: {
    title: "Mehmet Kerem | Yazılım Geliştirici",
    description: "Tasarım ve mühendisliği birleştirerek kusursuz dijital deneyimler yaratıyorum.",
    type: "website",
    locale: "tr_TR",
    images: [ogImageUrl],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mehmet Kerem | Yazılım Geliştirici",
    description: "Tasarım ve mühendisliği birleştirerek kusursuz dijital deneyimler yaratıyorum.",
    images: [ogImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full h-full flex flex-col">
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster />
            <ServiceWorker />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

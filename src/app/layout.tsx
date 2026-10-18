import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorker } from "@/components/ServiceWorker";
import { siteUrl, ogImageUrl as buildOgImageUrl } from "@/lib/site";

const ogImageUrl = buildOgImageUrl('Mehmet Kerem', 'Full-Stack Web Geliştirici');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Mehmet Kerem | Full-Stack Web Geliştirici",
  description: "Ajanslar ve markalar için kurumsal web siteleri ve özel web uygulamaları geliştiriyorum. Next.js, React ve TypeScript ile hızlı, erişilebilir ve bakımı kolay ürünler.",
  keywords: ["Mehmet Kerem", "Full-Stack Geliştirici", "Freelance Web Geliştirici", "Kurumsal Web Sitesi", "React", "Next.js", "TypeScript"],
  authors: [{ name: "Mehmet Kerem" }],
  manifest: '/manifest.json',
  alternates: {
    types: {
      'application/rss+xml': `${siteUrl}/feed.xml`,
    },
  },
  openGraph: {
    title: "Mehmet Kerem | Full-Stack Web Geliştirici",
    description: "Ajanslar ve markalar için hızlı, erişilebilir ve bakımı kolay web siteleri ve uygulamalar geliştiriyorum.",
    type: "website",
    locale: "tr_TR",
    images: [ogImageUrl],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mehmet Kerem | Full-Stack Web Geliştirici",
    description: "Ajanslar ve markalar için hızlı, erişilebilir ve bakımı kolay web siteleri ve uygulamalar geliştiriyorum.",
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
      data-scroll-behavior="smooth"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster />
          <ServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  );
}

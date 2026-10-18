@AGENTS.md

## Proje notları

Mehmet Kerem'in Türkçe portfolyo + blog sitesi ve kişisel yönetim paneli (Next.js 16 App Router, Tailwind v4, Drizzle + Turso/libSQL).

### Public site tasarımı
- Tüm public sayfalar `src/components/home/SiteShell.tsx` ile sarılır (menü `PillMenu`, footer `HomeFooter`, fontlar, `.home-theme`). Yeni public sayfa eklerken bunu kullan; `getSocialLinks().catch(() => [])` ile sosyal linkleri ver.
- Public site yalnızca açık tema. Renkler token olarak kullanılır: `bg-paper`, `bg-surface`, `bg-surface-2`, `text-ink`, `text-ink-soft`, `text-ink-muted`, `border-line`, `text-accent`, `bg-accent-soft` (tanımlar: `src/app/portfolio.css`, `src/app/globals.css`). `neutral-*` / `dark:` sınıfları public sayfalarda kullanılmaz.
- Sayfa üst bölümü kalıbı: `home-dot-grid` arka plan, `font-mono` küçük üst etiket, başlıkta `font-serif-display text-accent` vurgu, `home-reveal` giriş animasyonu. Örnek: `src/app/search/page.tsx`, `src/app/guestbook/page.tsx`.
- `SiteShell` dışında temayı kullanan ekranlar (hata sayfası, `AuthLayout`) fontları `src/components/home/fonts.ts`'ten alır.
- Dashboard aynı token'ları kullanır ve açık/koyu modu destekler: koyu değerler `src/app/dashboard/dashboard.css`'te `.dark .dash-theme` altında tanımlı. Modüllerde nötr renkler için `dark:` yazılmaz (sadece durum renkleri için, ör. `text-emerald-600 dark:text-emerald-400`). Ortak parçalar `src/components/dashboard/ui.tsx`'te: `PageHeader`, `ui.card`, `ui.input`, `ui.btnPrimary` vb.

### İçerik ve ayarlar
- Markdown çizimi tek yerde: `src/components/blog/markdown.tsx` (bileşenler + `postBodyClass`). Blog, `/simdi` ve dashboard önizlemeleri bunu kullanır; sunucuda kod renklendirme için `PostBody`.
- Panelden yönetilen site ayarları `site_settings` tablosunda: müsaitlik (`src/lib/availability.ts`), `/simdi` içeriği (`getNowPage`). Bu anahtarları değiştiren action'lar `revalidatePath('/', 'layout')` çağırır çünkü footer'da görünürler.
- Migration'lar elle yazılıyor (`drizzle/00xx_*.sql` + `meta/_journal.json`); `drizzle-kit generate` eski snapshot'lar yüzünden çalışmıyor.

### Genel
- Site adresi tek yerde: `src/lib/site.ts` (`NEXT_PUBLIC_SITE_URL`). Metadata, sitemap, robots, RSS ve JSON-LD buradan okur.
- Kişisel veri toplayan her yeni forma `/gizlilik` linkli kısa bir not eklenmeli.
- Site şimdilik yalnızca Türkçe; i18n sistemi kaldırıldı.

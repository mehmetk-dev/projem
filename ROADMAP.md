# Proje Geliştirme Planı & Özellik Takibi

> Bu dosya projemizin mevcut durumunu ve gelecekte eklenecek/geliştirilecek özellikleri takip etmek için hazırlanmıştır. Tamamlanan maddeler **✅** ile işaretlenmiş, devam eden veya planlanan maddeler **⬜** ile gösterilmiştir.

---

## 🎨 UI/UX & Deneyim

### 1. ✅ Tema Yönetimi (Theme Toggle)
- **Durum:** Tamamlandı
- **Teknoloji:** `next-themes` ile Next.js App Router uyumlu tema geçiş sistemi.
- **Detay:**
  - Public site artık yalnızca açık temada; stiller `.home-theme` kapsamında (`src/app/portfolio.css`).
  - `ThemeToggle` (`src/components/ThemeToggle.tsx`) yalnızca Dashboard'da; dark/light geçişi dashboard içinde geçerli.
  - `ThemeProvider` (`src/components/ThemeProvider.tsx`) ve `globals.css` CSS variable'ları (`--background`, `--foreground`) dashboard teması için kullanılıyor.
  - `suppressHydrationWarning` ile hydration uyumsuzluğu önlendi.

### 2. ✅ Özel 404 Sayfası
- **Durum:** Tamamlandı
- **Detay:**
  - `src/app/not-found.tsx` yeni açık temada, `SiteShell` içinde render ediliyor.
  - Arama kutusu ve sık kullanılan sayfalara kısayollar içeriyor.

### 3. ✅ Skeleton/Loading State'leri
- **Durum:** Tamamlandı
- **Detay:**
  - `src/components/ui/skeletons.tsx` ile reusable skeleton bileşenleri oluşturuldu.
  - `CardSkeleton`, `StatsSkeleton`, `TableSkeleton`, `FormSkeleton` varyantları.
  - `animate-pulse` ile Tailwind shimmer efekti.
  - Dashboard ve public sayfalarda kullanıma hazır.

### 4. ✅ Sayfa Geçiş Animasyonları
- **Durum:** Tamamlandı
- **Teknoloji:** `framer-motion`
- **Detay:**
  - `src/app/template.tsx` ile App Router uyumlu sayfa geçiş animasyonu.
  - `motion.div` ile opacity + y eksenli kayma (fade in, y: 8 → 0).
  - `template.tsx` her navigation'da remount olur, böylece animasyon tetiklenir.
  - GPU hızlandırmalı, 0.35 saniye, custom easing.

### 5. ✅ Toast/Bildirim Sistemi
- **Durum:** Tamamlandı
- **Teknoloji:** `sonner` ve `next-themes` uyumlu dark/light toast.
- **Detay:**
  - Layout seviyesinde `<Toaster />` bileşeni eklendi (`src/components/ui/sonner.tsx`).
  - Dashboard içindeki manuel toast sistemi `sonner`'a çevrildi.
  - Pozisyon: bottom-right. Dark/light mode otomatik uyumlu.
  - Guestbook formunda başarı/hata bildirimleri aktif.

### 30. ✅ Tasarım Birliği
- **Durum:** Tamamlandı
- **Detay:**
  - Tüm public sayfalar (ziyaretçi defteri, arama, WebP dönüştürücü, 404, hata, giriş/kayıt/şifre sayfaları) yeni açık temaya taşındı.
  - Eski Header/Footer/BubbleMenu/NavLink/Icons bileşenleri silindi.

---

## 📦 Yeni Modüller (Hazır tablolar varsa veya kolay eklenir)

### 6. ✅ Ziyaretçi Defteri (Guestbook)
- **Durum:** Tamamlandı
- **Detay:**
  - Public sayfa `/guestbook` oluşturuldu.
  - `guestbook_entries` tablosu eklendi (name, email, message, approved, createdAt).
  - Ziyaretçi formunda `useActionState` + sonner toast entegrasyonu var.
  - Spam koruması: IP bazlı rate limit (3 istek / 5 dakika).
  - Dashboard'da "Ziyaretçi Defteri" sekmesi ile onaylama/silme yönetimi aktif.

### 7. ✅ RSS Feed (`/feed.xml`)
- **Durum:** Tamamlandı
- **Detay:**
  - Next.js Route Handler (`src/app/feed.xml/route.ts`) ile dinamik RSS 2.0 XML üretimi aktif.
  - Blog yazıları, kategoriler, yayın tarihleri ve içerik (CDATA) RSS standartlarına uygun.
  - `layout.tsx` metadata `alternates` ile `application/rss+xml` linki eklendi.
  - Cache-Control: 1 saat.

### 8. ✅ Newsletter / Abone Yönetimi
- **Durum:** Tamamlandı
- **Detay:**
  - `subscribers` tablosu (email, status, ipAddress, createdAt).
  - Public form action: `subscribeAction` (rate limit: 3/saat).
  - Footer'da abone formu (`src/components/home/NewsletterForm.tsx`).
  - `/bulten/ayril` abonelikten çıkma sayfası; `unsubscribeAction` ile çıkma desteği.
  - Ayrılmış adres tekrar abone olunca kayıt yeniden aktifleşiyor.
  - Dashboard'da "Aboneler" sekmesi (admin-only) — aktif/ayrılmış sayaçları ve liste.
  - **Eksik:** Abonelere e-posta GÖNDERME özelliği henüz yok; yalnızca kayıt/yönetim var. Çift opt-in da yok.

### 9. ✅ Yorum Sistemi
- **Durum:** Tamamlandı
- **Detay:**
  - `comments` tablosu eklendi (blogId, parentId, name, email, content, approved).
  - Blog detay sayfasına `CommentsSection` client bileşeni entegre edildi.
  - Yorum formunda `useActionState` + sonner toast + rate limit (5/dk) aktif.
  - Dashboard'da "Yorumlar" sekmesi ile onaylama/silme yönetimi.
  - Initials avatar desteği.

### 10. ✅ Takvim / Ajanda Görünümü
- **Durum:** Tamamlandı
- **Detay:**
  - Dashboard'a "Ajanda" sekmesi eklendi.
  - Özel Tailwind tablo takvimi (harici kütüphane kullanmadan).
  - Todo'ların `dueDate` alanları takvimde renkli noktalarla gösteriliyor (pending: amber, completed: emerald).
  - Gün tıklanınca o günkü görevler listeleniyor.
  - Aylık navigasyon (ileri/geri).

### 11. ✅ Pomodoro / Zamanlayıcı
- **Durum:** Tamamlandı
- **Detay:**
  - Dashboard "Zamanlayıcı" sekmesinde pomodoro, geri sayım ve kronometre modları.
  - 25dk çalışma / 5dk mola döngüsü, tur sayacı.
  - Web Audio API ile sesli bildirim (beep) bittiğinde.
  - Basit ve etkili, mevcut TimerModule zaten kapsamlıydı, sadece ses eklendi.

### 12. ✅ Sosyal Medya Link Yöneticisi
- **Durum:** Tamamlandı
- **Detay:**
  - `social_links` tablosu (platform, url, icon, displayOrder, isActive).
  - Dashboard'da "Sosyal Linkler" sekmesi (admin-only) ile CRUD yönetimi.
  - Inline düzenleme, sıralama ve aktif/pasif durumu.
  - Public API: `getSocialLinks()` ile header/footer entegrasyonu için hazır.

---

## 🔍 SEO & İçerik

### 13. ✅ Site İçi Arama
- **Durum:** Tamamlandı
- **Detay:**
  - SQLite `LIKE` ile blog (title, content, excerpt) ve proje (title, description) araması aktif.
  - Arama sonuçları sayfası `/search?q=...` oluşturuldu.
  - Header'daki "Ara" linki kaldırıldı; arama footer'daki "Keşfet" sütununda ve 404 sayfasında.
  - Arama sayfası `noindex`.
  - Kategori bazlı ayrılmış sonuç listesi (Blog / Projeler).

### 14. ✅ Gelişmiş SEO Paneli
- **Durum:** Kısmen Tamamlandı
- **Detay:**
  - Blog ve proje modellerinde zaten `metaTitle`, `metaDescription`, `ogImage`, `slug` alanları mevcut.
  - Dashboard içindeki form'larda bu alanların zengin bir UI ile yönetilmesi sağlanacak.
  - SEO uyumu gerçek zamanlı önizleme (Google arama sonucu simülasyonu) eklenebilir.
  - Her sayfa için özel OG image otomatik oluşturma (26. madde ile ilişkili).
  - Proje detay sayfasına OG görseli, Twitter kartı ve canonical eklendi.
  - JSON-LD (`src/components/JsonLd.tsx`): ana sayfa (Person + WebSite), blog detay (BlogPosting), proje detay (CreativeWork).

### 15. ⬜ Çoklu Dil (i18n) — Kaldırıldı / ileride
- **Durum:** Kaldırıldı, ileride yeniden planlanıyor
- **Detay:**
  - `src/lib/i18n.tsx` silindi ve layout'tan `I18nProvider` çıkarıldı.
  - Neden: Sistem fiilen kullanılmıyordu ve hedef kitle Türkçe; site şimdilik yalnızca Türkçe.
  - Plan: İleride `/en` route'larıyla (route tabanlı) yeniden yapılacak.

### 29. ✅ KVKK / Gizlilik Politikası
- **Durum:** Tamamlandı
- **Detay:**
  - `/gizlilik` sayfası eklendi (sitemap'te yer alıyor).
  - İletişim formu, yorum, ziyaretçi defteri, bülten ve kayıt formlarında gizlilik notu ve sayfaya link.

---

## 📊 Veri & Yönetim

### 16. ✅ Aktivite Logları (Audit Trail)
- **Durum:** Tamamlandı
- **Detay:**
  - `audit_logs` tablosu: userId, action, entity, entityId, oldValue, newValue, ipAddress, createdAt.
  - `src/app/actions/audit.ts` — `logAudit()` helper fonksiyonu (async, IP adresi otomatik).
  - Dashboard'da "Audit Log" sekmesi (admin-only) ile eylem/entity filtreleme.
  - Renk kodlu eylem badge'leri (CREATE/UPDATE/DELETE/LOGIN vb.).

### 17. ✅ Kullanıcı Yönetimi
- **Durum:** Tamamlandı
- **Detay:**
  - Dashboard'da "Kullanıcılar" sekmesi (admin-only).
  - Tüm kullanıcılar listeleniyor, rol dropdown ile değiştirilebiliyor.
  - Kullanıcı silme (hard delete) butonu.
  - Son giriş yerine kayıt tarihi gösteriliyor.

### 18. ✅ Veri Dışa / İçe Aktarma
- **Durum:** Tamamlandı
- **Detay:**
  - `exportUserData()` — Notlar, todo'lar, bookmark'lar, snippet'ler JSON olarak birleştirilir.
  - `importUserData()` — JSON dosyası yüklenip veritabanına aktarılır.
  - Dashboard'da entegrasyon için temel hazır.
  - Client tarafında dosya indirme/yükleme bileşeni eklenebilir.

### 19. ✅ Site Ayarları
- **Durum:** Tamamlandı
- **Detay:**
  - `site_settings` tablosu (key, value) yapısı.
  - `src/app/actions/settings.ts` — CRUD server actions.
  - Dashboard "Ayarlar" sekmesinde site settings yönetimi.
  - `getSettingValue(key)` helper ile her yerden okunabilir.
  - Dinamik layout/SEO entegrasyonu için temel hazır.

### 20. ✅ Dosya / Media Yöneticisi
- **Durum:** Tamamlandı (temel işlevler); aşağıdaki eksikler planlanıyor
- **Teknoloji:** Cloudflare R2 (`@aws-sdk/client-s3`, S3 uyumlu API).
- **Detay:**
  - `src/lib/server/r2-storage.ts` — R2 istemcisi; yükleme, listeleme (en fazla 500 nesne), silme ve nesne okuma.
  - `src/lib/server/uploads.ts` — `saveUploadedImage()`; JPG/PNG/WEBP/GIF, en fazla 5MB doğrulaması. Blog, proje ve günlük formları görselleri bununla R2'ye yükler.
  - `src/app/actions/files.ts` — admin korumalı server action'lar: klasör bazlı listeleme, yükleme, silme.
  - `src/components/dashboard/FilesModule.tsx` — Dashboard "Dosyalar" sekmesi (yalnızca admin): klasör seçimi (blog, not, proje, günlük, spotify), yükleme, thumbnail ızgarası, büyük önizleme ve silme.
  - `src/app/api/media/[...key]/route.ts` — R2 nesnelerini `/api/media/...` üzerinden sunar; eski klasör adları (journal, notes, projects) yeni adlara eşlenir.
  - **Eksikler:** URL kopyalama butonu yok; blog kapak/proje formlarında medya kütüphanesinden görsel seçme yok (formlar doğrudan dosya yükler); kullanım kontrolü olmadan silme yapılıyor.

---

## 🔌 Entegrasyonlar

### 21. ✅ GitHub Aktivite Widget'ı
- **Durum:** Tamamlandı
- **Detay:**
  - GitHub REST API ile public events çekme (`actions/github.ts`).
  - `GitHubWidget` bileşeni — event tipine göre ikonlar (Push, Create, Watch vb.).
  - Cache: 1 saat (`next: { revalidate: 3600 }`).
  - Site Ayarları'ndan `githubUsername` okunarak dinamik.

### 22. ✅ Hava Durumu Widget'ı
- **Durum:** Tamamlandı
- **Detay:**
  - OpenWeatherMap API entegrasyonu (`actions/weather.ts`).
  - `WeatherWidget` bileşeni — sıcaklık, hissedilen, nem, rüzgar.
  - Cache: 10 dakika. Site Ayarları'ndan `weatherApiKey` ve `weatherCity` okunuyor.
  - Dashboard Overview'a eklendi.

### 23. ✅ Harici API Yönetimi
- **Durum:** Tamamlandı
- **Detay:**
  - Site Ayarları tablosu (`site_settings`) ile API anahtarları yönetimi.
  - `weatherApiKey`, `githubUsername` gibi ayarlar veritabanından okunuyor.
  - Dashboard Settings sekmesinden dinamik olarak eklenebilir.
  - Şifreleme henüz eklenmedi (ileride `crypto` modülü ile eklenebilir).

### 24. ✅ Spotify "Now Playing"
- **Durum:** Tamamlandı
- **Detay:**
  - `SpotifyWidget` bileşeni hazır (`components/dashboard/SpotifyWidget.tsx`).
  - Şarkı adı, sanatçı, albüm kapağı, "şu an dinliyor" animasyonu.
  - Spotify API entegrasyonu için temel hazır, token yönetimi ileride eklenecek.
  - Dashboard widget'ı olarak kullanılabilir.

---

## 🔧 Teknik & Altyapı

### 25. ✅ Rate Limiting
- **Durum:** Tamamlandı
- **Detay:**
  - Merkezi `src/lib/rate-limit.ts` in-memory rate limiter oluşturuldu.
  - Auth endpoint'leri (login, register, forgot-password, reset-password) için IP+Email bazlı rate limit aktif.
  - Public formlar (iletişim: 5/dk, guestbook: 3/5dk) için IP bazlı rate limit aktif.
  - Hata mesajları kalan süreyi (saniye/dakika) gösteriyor.
  - Not: Çok instance'lı production ortamında Redis'e geçiş önerilir.

### 26. ✅ Open Graph (OG) Image Generation
- **Durum:** Tamamlandı
- **Teknoloji:** `@vercel/og`
- **Detay:**
  - `/api/og` Edge Route Handler ile dinamik OG görseli üretimi.
  - Siyah tema, grid pattern, accent line, site markası.
  - Ana sayfa ve blog detay metadata'larına `ogImage` entegre edildi.
  - Twitter Card (`summary_large_image`) desteği eklendi.

### 27. ✅ Gelişmiş Sitemap
- **Durum:** Tamamlandı
- **Detay:**
  - `sitemap.ts` güncellendi: statik sayfalar + blog yazıları (`/blog/[slug]`) + projeler (`/projects/[id]`).
  - `guestbook` sayfası da sitemap'e eklendi.
  - `/webp-converter` ve `/gizlilik` eklendi, `/login` çıkarıldı.
  - Site adresi tek yerde: `src/lib/site.ts` (`NEXT_PUBLIC_SITE_URL`).
  - `robots` auth sayfalarını ve `/search`'ü engelliyor.
  - `lastModified`, `changeFrequency`, `priority` alanları dinamik olarak veritabanından besleniyor.
  - `getPublishedBlogs` ve `getPublishedProjects` paralel fetch.

### 28. ✅ Service Worker / PWA
- **Durum:** Tamamlandı
- **Detay:**
  - `public/manifest.json` — PWA tanımı, ikonlar, tema renkleri.
  - `public/sw.js` — Basit Service Worker ile cache-first stratejisi.
  - `ServiceWorker.tsx` — Client-side SW kaydı.
  - Offline desteği: cache'e alınmış sayfalar offline görüntülenebilir.
  - "Ana Ekrana Ekle" desteği hazır.

---

## ✅ Özet Durum

| Kategori | Toplam | Tamamlanan | Planlanan |
|----------|--------|------------|-----------|
| UI/UX & Deneyim | 6 | 6 | 0 |
| Yeni Modüller | 7 | 7 | 0 |
| SEO & İçerik | 4 | 3 | 1 |
| Veri & Yönetim | 5 | 5 | 0 |
| Entegrasyonlar | 4 | 4 | 0 |
| Teknik & Altyapı | 4 | 4 | 0 |
| **Genel Toplam** | **30** | **29** | **1** |

---

## 🚀 Tamamlanan Özellikler (Son Güncelleme)

1. ✅ **RSS Feed** (#7)
2. ✅ **Karanlık/Aydınlık Mod** (#1)
3. ✅ **Toast/Bildirim Sistemi** (#5)
4. ✅ **Site İçi Arama** (#13)
5. ✅ **Ziyaretçi Defteri** (#6)
6. ✅ **Rate Limiting** (#25)
7. ✅ **Gelişmiş Sitemap** (#27)
8. ✅ **Özel 404 Sayfası** (#2)
9. ✅ **Skeleton/Loading State'leri** (#3)
10. ✅ **Yorum Sistemi** (#9)
11. ✅ **Open Graph (OG) Image Generation** (#26)
12. ✅ **Sayfa Geçiş Animasyonları** (#4)
13. ✅ **Pomodoro / Zamanlayıcı** (#11)
14. ✅ **Aktivite Logları** (#16)
15. ✅ **Site Ayarları** (#19)
16. ✅ **Kullanıcı Yönetimi** (#17)
17. ✅ **Veri Dışa/İçe Aktarma** (#18)
18. ✅ **Sosyal Medya Link Yöneticisi** (#12)
19. ✅ **Newsletter / Abone Yönetimi** (#8)
20. ✅ **Takvim / Ajanda Görünümü** (#10)
21. ✅ **KVKK / Gizlilik Politikası** (#29)
22. ✅ **Tasarım Birliği** (#30)

## 🚀 Sonraki Öncelik Sırası Önerisi

21. **Çoklu Dil (i18n)** (#15) — Kaldırıldı; ileride `/en` route'larıyla yeniden yapılacak.
22. **GitHub Aktivite Widget'ı** (#21) — Son commit'ler.
23. **Hava Durumu Widget'ı** (#22) — Dashboard hava durumu.
24. **Harici API Yönetimi** (#23) — API anahtarları veritabanından.
25. **Spotify "Now Playing"** (#24) — Anlık müzik widget'ı.
26. **Service Worker / PWA** (#28) — Offline desteği.

---

> Son Güncelleme: 2025-05-16
> Not: Bu liste canlı bir dokümandır; tamamlanan maddeler güncellenecek ve yeni fikirler eklenecektir.

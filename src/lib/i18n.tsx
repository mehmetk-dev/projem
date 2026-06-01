'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type Lang = 'tr' | 'en';

const translations: Record<Lang, Record<string, string>> = {
  tr: {
    'nav.home': 'Ana Sayfa',
    'nav.blog': 'Blog',
    'nav.search': 'Ara',
    'nav.contact': 'İletişim',
    'nav.login': 'Giriş',
    'nav.register': 'Kayıt Ol',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Çıkış Yap',
    'hero.title': 'Yazılım Geliştirici & Ürün Tasarımcısı',
    'hero.subtitle': 'Selam! Ben Kerem. Tasarım ve yazılımı birleştirerek modern, hızlı ve kullanıcı dostu dijital ürünler inşa ediyorum.',
    'footer.copyright': '© 2026 Mehmet Kerem. Tüm hakları saklıdır.',
    'search.placeholder': 'Blog yazısı veya proje ara...',
    'search.button': 'Ara',
    'search.results': 'sonuç bulundu.',
    'guestbook.title': 'Ziyaretçi Defteri',
    'guestbook.subtitle': 'Düşüncelerinizi paylaşın ve topluluğa katılın.',
    'guestbook.name': 'İsim',
    'guestbook.email': 'E-posta',
    'guestbook.message': 'Mesaj',
    'guestbook.submit': 'Gönder',
    'guestbook.pending': 'Mesajınız onaylandıktan sonra yayınlanacaktır.',
    'blog.title': 'Blog',
    'blog.subtitle': 'Tasarım, yazılım ve ürün düşünce yapısı hakkındaki yazılar.',
    'blog.empty': 'Henüz yayınlanmış bir yazı yok.',
    'comments.title': 'Yorumlar',
    'comments.placeholder': 'Düşüncelerinizi paylaşın...',
    'comments.submit': 'Yorum Gönder',
    'comments.pending': 'Yorumunuz onaylandıktan sonra yayınlanacaktır.',
    'notfound.title': 'Sayfa Bulunamadı',
    'notfound.subtitle': 'Aradığınız sayfa mevcut değil veya başka bir adres taşınmış olabilir.',
    'notfound.home': 'Ana Sayfaya Dön',
    'notfound.blog': "Blog'a Git",
  },
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.search': 'Search',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    'hero.title': 'Product Designer & Developer',
    'hero.subtitle': 'Creating seamless digital experiences by blending design and engineering.',
    'footer.copyright': '© 2026 Mehmet Kerem. All rights reserved.',
    'search.placeholder': 'Search blog posts or projects...',
    'search.button': 'Search',
    'search.results': 'results found.',
    'guestbook.title': 'Guestbook',
    'guestbook.subtitle': 'Share your thoughts and join the community.',
    'guestbook.name': 'Name',
    'guestbook.email': 'Email',
    'guestbook.message': 'Message',
    'guestbook.submit': 'Send',
    'guestbook.pending': 'Your message will be published after approval.',
    'blog.title': 'Blog',
    'blog.subtitle': 'Writings on design, software, and product thinking.',
    'blog.empty': 'No published posts yet.',
    'comments.title': 'Comments',
    'comments.placeholder': 'Share your thoughts...',
    'comments.submit': 'Submit Comment',
    'comments.pending': 'Your comment will be published after approval.',
    'notfound.title': 'Page Not Found',
    'notfound.subtitle': 'The page you are looking for does not exist or has been moved.',
    'notfound.home': 'Back to Home',
    'notfound.blog': 'Go to Blog',
  },
};

interface I18nContext {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContext | null>(null);

const STORAGE_KEY = 'i18n-lang';

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'tr';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'tr' || stored === 'en') return stored;
    const navigatorLang = navigator.language.slice(0, 2);
    if (navigatorLang === 'tr') return 'tr';
  } catch { /* ignore */ }
  return 'tr';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch { /* ignore */ }
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[lang][key] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

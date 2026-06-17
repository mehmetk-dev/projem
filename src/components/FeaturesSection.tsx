'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, LineChart, FileText, Image as ImageIcon, CheckSquare, Layers, TrendingUp, Terminal, Calendar, Activity } from 'lucide-react';
import { Orbitron } from 'next/font/google';
import CircularGallery from './ui/CircularGallery';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
});

function cloneWithStyles(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  
  const copyStyles = (source: HTMLElement, target: HTMLElement) => {
    const computed = window.getComputedStyle(source);
    for (let i = 0; i < computed.length; i++) {
      const key = computed[i];
      target.style.setProperty(key, computed.getPropertyValue(key));
    }
    
    if (source.tagName.toLowerCase() === 'svg') {
      target.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    
    for (let i = 0; i < source.children.length; i++) {
      copyStyles(source.children[i] as HTMLElement, target.children[i] as HTMLElement);
    }
  };
  
  copyStyles(element, clone);
  return clone;
}

async function captureElement(element: HTMLElement): Promise<string> {
  const width = element.offsetWidth || 320;
  const height = element.offsetHeight || 400;
  const scale = 2; // 2x scale for sharp rendering while keeping GPU workload manageable
  
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  
  const cloned = cloneWithStyles(element);
  cloned.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  cloned.style.width = '100%';
  cloned.style.height = '100%';
  cloned.style.margin = '0';
  cloned.style.boxSizing = 'border-box';
  
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="${width}" height="${height}">
        ${new XMLSerializer().serializeToString(cloned)}
      </foreignObject>
    </svg>
  `;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Canvas context is null'));
      }
    };
    img.onerror = () => {
      reject(new Error('Failed to load SVG image into canvas'));
    };
  });
}

const MODULES = [
  {
    icon: Layers,
    title: 'Kişisel Portfolyo',
    desc: 'Yaptığım projeleri, tasarım çalışmalarımı ve yazılım tecrübelerimi modern bir arayüzle sergilediğim kişisel showcase alanı.',
    color: 'from-blue-500/20 to-indigo-500/5',
    glowColor: 'bg-blue-500/5',
    borderColor: 'group-hover/card:border-blue-500/40',
    iconColor: 'text-blue-400',
    badge: 'Portfolyo',
    renderVisual: () => (
      <div className="mt-4 p-4 bg-neutral-900/60 border border-blue-500/10 rounded-[1.2rem] space-y-4 backdrop-blur-md shadow-inner">
        {/* Profile Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-blue-500/20 font-mono">&lt;/&gt;</div>
            <div className="leading-none">
              <p className="text-xs font-bold text-white font-mono">Mehmet Kerem</p>
              <p className="text-[9px] text-blue-400 font-mono tracking-wider mt-0.5">FULL-STACK DEVELOPER</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] text-emerald-300 font-bold font-mono">AKTİF</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
            <p className="text-[10px] text-neutral-450 font-mono">Projeler</p>
            <p className="text-sm font-bold text-white font-mono mt-0.5">18+</p>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
            <p className="text-[10px] text-neutral-450 font-mono">Skor</p>
            <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">%100</p>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
            <p className="text-[10px] text-neutral-450 font-mono">Deneyim</p>
            <p className="text-sm font-bold text-blue-400 font-mono mt-0.5">5y+</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {['Next.js 16', 'React 19', 'WebGL', 'GSAP'].map((tag) => (
            <span key={tag} className="text-[9px] px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/5 text-blue-300 font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>
    )
  },
  {
    icon: MessageSquare,
    title: 'AI Kişisel Asistan',
    desc: 'Sesli yanıt (TTS/STT) özellikli, tüm veritabanı notlarımı ve projelerimi analiz edebilen entegre yapay zeka sohbet modülü.',
    color: 'from-purple-500/20 to-pink-500/5',
    glowColor: 'bg-purple-500/5',
    borderColor: 'group-hover/card:border-purple-500/40',
    iconColor: 'text-purple-400',
    badge: 'Yapay Zeka',
    renderVisual: () => (
      <div className="mt-4 p-4 bg-neutral-900/60 border border-purple-500/10 rounded-[1.2rem] space-y-3.5 backdrop-blur-md shadow-inner text-[11px] font-mono">
        {/* Chat bubbles */}
        <div className="space-y-2.5">
          <div className="flex justify-end">
            <div className="bg-neutral-850 text-neutral-200 px-3 py-1.5 rounded-2xl rounded-tr-sm max-w-[85%] border border-white/5 text-right leading-relaxed">
              Projelerimi analiz et.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-[10px] shrink-0">🤖</div>
            <div className="bg-purple-950/30 text-purple-200/90 px-3 py-1.5 rounded-2xl rounded-tl-sm max-w-[85%] border border-purple-500/20 leading-relaxed text-[10.5px]">
              Notlar ve portfolyo tarandı. 12 aktif proje tespit edildi.
            </div>
          </div>
        </div>

        {/* Voice and Waveform Overlay */}
        <div className="flex items-center justify-between bg-purple-950/20 border border-purple-500/15 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1 h-6 w-28">
            {[0.4, 0.7, 0.9, 0.3, 0.5, 0.8, 0.4, 0.6, 0.3].map((h, i) => (
              <span 
                key={i} 
                style={{ height: `${h * 100}%` }} 
                className="w-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-pulse" 
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-purple-300 uppercase tracking-widest animate-pulse font-bold">
            <Activity size={10} /> TTS Aktif
          </div>
        </div>
      </div>
    )
  },
  {
    icon: LineChart,
    title: 'Finansal Analitik',
    desc: 'Gelir-gider tabloları, kategorik harcama analizleri ve etkileşimli SVG grafiklerle donatılmış gelişmiş finans yönetim paneli.',
    color: 'from-emerald-500/20 to-teal-500/5',
    glowColor: 'bg-emerald-500/5',
    borderColor: 'group-hover/card:border-emerald-500/40',
    iconColor: 'text-emerald-400',
    badge: 'Muhasebe',
    renderVisual: () => (
      <div className="mt-4 p-4 bg-neutral-900/60 border border-emerald-500/10 rounded-[1.2rem] space-y-3.5 backdrop-blur-md shadow-inner">
        {/* Balance & Stats */}
        <div className="flex items-center justify-between text-mono">
          <div>
            <p className="text-[10px] text-neutral-450 uppercase tracking-wider font-mono">Net Bakiye</p>
            <p className="text-base font-black text-white font-mono mt-0.5">₺134,850.00</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
              <TrendingUp size={10} /> +%14.2
            </div>
            <p className="text-[9px] text-neutral-450 font-mono mt-1">Son 30 Gün</p>
          </div>
        </div>

        {/* SVG Mini Line Chart */}
        <div className="relative h-14 w-full mt-1 bg-neutral-950/40 rounded-lg border border-white/5 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            {/* Gradient Area under curve */}
            <path d="M 0 40 L 0 32 Q 25 18 40 25 T 80 8 Q 90 10 100 2 L 100 40 Z" fill="url(#chart-grad)" />
            {/* Curve stroke */}
            <path d="M 0 32 Q 25 18 40 25 T 80 8 Q 90 10 100 2" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            {/* Intersect point dot */}
            <circle cx="80" cy="8" r="1.5" fill="#10b981" />
            <circle cx="80" cy="8" r="3" fill="none" stroke="#10b981" strokeWidth="0.5" className="animate-ping" style={{ transformOrigin: '80px 8px' }} />
          </svg>
          {/* Chart Tooltip */}
          <div className="absolute top-1 right-6 bg-emerald-500 text-neutral-950 px-1.5 py-0.5 rounded text-[9px] font-black font-mono shadow-md">
            ₺24,500
          </div>
        </div>
      </div>
    )
  },
  {
    icon: FileText,
    title: 'Markdown Editörü',
    desc: 'R2 bulut medya kütüphanesi entegrasyonu ve anlık canlı önizleme özelliği sunan zengin blog yazma ve not alma editörü.',
    color: 'from-amber-500/20 to-orange-500/5',
    glowColor: 'bg-amber-500/5',
    borderColor: 'group-hover/card:border-amber-500/40',
    iconColor: 'text-amber-400',
    badge: 'Blog Editör',
    renderVisual: () => (
      <div className="mt-4 p-3 bg-neutral-900/60 border border-amber-500/10 rounded-[1.2rem] backdrop-blur-md shadow-inner grid grid-cols-2 gap-2 h-24 text-[9px] font-mono overflow-hidden">
        {/* Editor (Left) */}
        <div className="bg-neutral-950/80 p-2 rounded-lg border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <span className="text-[8px] text-neutral-450 uppercase tracking-widest flex items-center gap-1"><Terminal size={8} /> EDITÖR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="space-y-0.5 text-neutral-300 font-light overflow-hidden text-[8px] leading-snug">
            <p><span className="text-amber-500">#</span> Mehmet Kerem</p>
            <p className="text-neutral-600">---</p>
            <p><span className="text-amber-500">&gt;</span> Fullstack</p>
            <p><span className="text-amber-500">-</span> React 19</p>
            <p><span className="text-amber-500">-</span> WebGL & GSAP</p>
          </div>
        </div>

        {/* Live Preview (Right) */}
        <div className="bg-white/[0.02] p-2 rounded-lg border border-amber-500/15 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-amber-500/10">
            <span className="text-[8px] text-amber-400 uppercase tracking-widest flex items-center gap-1"><FileText size={8} /> ÖNİZLEME</span>
            <span className="text-[7px] text-emerald-400 px-1 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold uppercase">CANLI</span>
          </div>
          <div className="space-y-0.5 text-neutral-200 font-sans leading-tight overflow-hidden text-[8.5px]">
            <h4 className="font-bold text-white text-[9px] leading-tight">Mehmet Kerem</h4>
            <div className="border-l border-amber-500/50 pl-1 py-0.5 text-[7.5px] text-neutral-300 italic">
              Fullstack
            </div>
            <ul className="list-disc pl-2 space-y-0.5 text-neutral-300 leading-none">
              <li>React 19</li>
              <li>WebGL & GSAP</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: ImageIcon,
    title: 'Lokal WebP Dönüştürücü',
    desc: 'Resimleri tarayıcıda tamamen yerel (HTML5 Canvas) olarak işleyen, hiçbir sunucuya yüklemeden sıkıştıran gizlilik odaklı araç.',
    color: 'from-cyan-500/20 to-blue-500/5',
    glowColor: 'bg-cyan-500/5',
    borderColor: 'group-hover/card:border-cyan-500/40',
    iconColor: 'text-cyan-400',
    badge: 'Resim Optimizasyon',
    renderVisual: () => (
      <div className="mt-4 p-4 bg-neutral-900/60 border border-cyan-500/10 rounded-[1.2rem] space-y-3.5 backdrop-blur-md shadow-inner">
        {/* Upload area with glowing dashed border */}
        <div className="border border-dashed border-cyan-500/35 bg-cyan-950/10 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-white/5 flex flex-col items-center justify-center relative shrink-0">
              <span className="text-[8px] font-mono text-neutral-450 uppercase">PNG</span>
              <span className="text-[9px] text-white font-bold font-mono mt-0.5">2.4<span className="text-[7px]">MB</span></span>
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-bold text-white font-mono">avatar.png</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="w-[84%] h-full bg-cyan-400 rounded-full" />
                </div>
                <span className="text-[9px] text-cyan-400 font-mono font-bold animate-pulse">84%</span>
              </div>
            </div>
          </div>
          
          <div className="text-right shrink-0">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex flex-col items-center justify-center relative shadow-md shadow-cyan-500/10">
              <span className="text-[8px] font-mono text-cyan-300 uppercase">WEBP</span>
              <span className="text-[9px] text-cyan-400 font-bold font-mono mt-0.5">380<span className="text-[7px]">KB</span></span>
            </div>
          </div>
        </div>

        {/* Efficiency Badge */}
        <div className="flex items-center justify-between text-[10.5px] font-mono bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg">
          <span className="text-neutral-300">Gizlilik: %100 Yerel İşlem</span>
          <span className="text-cyan-400 font-bold font-mono uppercase tracking-wider">-%84 Boyut</span>
        </div>
      </div>
    )
  },
  {
    icon: CheckSquare,
    title: 'Üretkenlik Merkezi',
    desc: 'Yapılacaklar listesi (Todos), favori linklerin saklandığı yer imleri (Bookmarks) ve hızlı kod kütüphanesi (Snippets).',
    color: 'from-rose-500/20 to-red-500/5',
    glowColor: 'bg-rose-500/5',
    borderColor: 'group-hover/card:border-rose-500/40',
    iconColor: 'text-rose-400',
    badge: 'Ajanda',
    renderVisual: () => (
      <div className="mt-4 p-3 bg-neutral-900/60 border border-rose-500/10 rounded-[1.2rem] backdrop-blur-md shadow-inner grid grid-cols-2 gap-2 h-24 text-[9px] font-mono overflow-hidden">
        {/* Checklist */}
        <div className="bg-neutral-950/80 p-2 rounded-lg border border-white/5 space-y-1.5">
          <div className="text-[8px] text-neutral-450 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center gap-1"><CheckSquare size={8} /> GÖREVLER</div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-neutral-500 line-through">
              <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-[7px] text-rose-400 shrink-0">✓</div>
              <span className="truncate">CardSwap Refactor</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500 line-through">
              <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-[7px] text-rose-400 shrink-0">✓</div>
              <span className="truncate">WebP Converter</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-200">
              <div className="w-3 h-3 rounded border border-white/10 flex items-center justify-center text-[7px] shrink-0" />
              <span className="truncate flex items-center gap-1">Yayınla <span className="w-1 h-1 rounded-full bg-rose-400 animate-ping" /></span>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white/[0.02] p-2 rounded-lg border border-rose-500/15 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-rose-500/10">
            <span className="text-[8px] text-rose-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={8} /> AJANDA</span>
            <span className="text-[7px] text-neutral-455 font-bold">HAZİRAN</span>
          </div>
          <div className="flex justify-between items-center gap-1 mt-1">
            {/* Small Calendar Row */}
            {['Pt', 'Sa', 'Ça', 'Pe', 'Cu'].map((day, idx) => (
              <div key={day} className={`flex flex-col items-center flex-1 py-0.5 rounded ${idx === 0 ? 'bg-rose-500/25 border border-rose-500/30 font-bold text-rose-300' : 'text-neutral-500'}`}>
                <span className="text-[6px] uppercase">{day}</span>
                <span className="text-[8px] font-mono mt-0.5">{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
];

// Helper to yield to the main thread between heavy operations
const yieldToMain = () => new Promise<void>(resolve => setTimeout(resolve, 0));

// Schedule work during idle time to avoid blocking user interactions
const scheduleIdle = (cb: () => void): number => {
  if (typeof requestIdleCallback === 'function') {
    return requestIdleCallback(cb, { timeout: 6000 }) as unknown as number;
  }
  return setTimeout(cb, 3000) as unknown as number;
};

const cancelIdle = (id: number) => {
  if (typeof cancelIdleCallback === 'function') {
    cancelIdleCallback(id as unknown as number);
  } else {
    clearTimeout(id);
  }
};

export default function FeaturesSection() {
  const [cardImages, setCardImages] = useState<string[]>([]);
  const [showHiddenCards, setShowHiddenCards] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Defer rendering of hidden capture cards to avoid bloating initial DOM
  useEffect(() => {
    const id = scheduleIdle(() => setShowHiddenCards(true));
    return () => cancelIdle(id);
  }, []);

  useEffect(() => {
    if (!showHiddenCards) return;

    let observer: IntersectionObserver | null = null;
    let didCapture = false;
    let cancelled = false;

    const captureAll = async () => {
      if (didCapture || cancelled) return;
      didCapture = true;

      if (observer) {
        observer.disconnect();
      }

      // Small delay to ensure browser layout is stable
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const images: string[] = [];
      for (let i = 0; i < cardRefs.current.length; i++) {
        if (cancelled) return;
        const el = cardRefs.current[i];
        if (el) {
          try {
            const dataUrl = await captureElement(el);
            images.push(dataUrl);
            // Yield to main thread between captures to prevent long tasks
            await yieldToMain();
          } catch (err) {
            console.error('Failed to capture card', i, err);
          }
        }
      }
      if (!cancelled && images.length === cardRefs.current.length) {
        setCardImages(images);
      }
    };

    // Use requestIdleCallback so capture doesn't compete with initial page interactions
    const idleId = scheduleIdle(() => { captureAll(); });

    // Intersection observer to trigger capture when user scrolls near
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          cancelIdle(idleId);
          captureAll();
        }
      }, {
        rootMargin: '400px'
      });

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
    }

    return () => {
      cancelled = true;
      cancelIdle(idleId);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [showHiddenCards]);

  return (
    <section id="capabilities" ref={sectionRef} className="py-24 border-t border-white/5 bg-black relative overflow-hidden">
      {/* Hidden element to force browser to load Orbitron font file locally complying with CSP */}
      <span className={`${orbitron.className} absolute opacity-0 pointer-events-none -z-50`} aria-hidden="true">
        Orbitron Font Loader
      </span>

      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[35vw] bg-white/[0.01] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-white/[0.02] rounded-full blur-[90px] pointer-events-none" />

      {/* Invisible capturing container – deferred to avoid bloating initial render */}
      {showHiddenCards && <div className="absolute opacity-0 pointer-events-none -z-50 top-0 left-0 flex flex-col gap-4" style={{ width: '320px' }}>
        {MODULES.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.title}
              ref={(el) => { cardRefs.current[idx] = el; }}
              className={`group/card relative overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 p-6 ${mod.borderColor} w-[320px] h-[400px] flex flex-col justify-between`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-30 pointer-events-none`} />
              <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-25 pointer-events-none ${mod.glowColor}`} />

              <div className="relative z-10 flex flex-col h-full justify-between w-full">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center ${mod.iconColor} shrink-0`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest uppercase border border-white/10 bg-white/10 px-2.5 py-1 rounded-md text-neutral-300">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2.5 tracking-tight">
                    {mod.title}
                  </h3>
                  <p className="text-neutral-300 text-[13px] leading-relaxed font-normal">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-3.5">
                  {mod.renderVisual()}
                </div>
              </div>
            </div>
          );
        })}
      </div>}

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
          
          {/* Left: Text Content */}
          <div className="max-w-2xl lg:max-w-xl animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono tracking-widest uppercase text-neutral-300 mb-6">
              <Sparkles size={11} className="text-yellow-500 animate-pulse" />
              <span>Kişisel Ekosistem</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 leading-tight">
              Peki, Nedir<br />Bu Site?
            </h2>
            <p className="mt-6 text-neutral-350 text-lg sm:text-xl leading-relaxed font-light">
              Burası aslında benim internetteki küçük atölyem. Hem yaptığım projeleri paylaşıyorum hem de günlük hayatta işime yarayan küçük araçları burada toplayıp kullanıyorum.
            </p>
            <p className="mt-4 text-neutral-400 text-sm sm:text-base leading-relaxed font-light">
              Kendi ihtiyaçlarıma göre şekillendirdiğim, yeni bir şeye ihtiyaç duydukça geliştirmeye devam ettiğim bir yer. Yani sadece sabit bir site değil, benimle birlikte büyüyüp değişen canlı bir köşe.
            </p>
          </div>

          {/* Right: Circular Gallery (WebGL) */}
          <div className="w-full h-[500px] lg:w-[60%] animate-on-scroll relative overflow-hidden flex items-center justify-center">
            {cardImages.length > 0 ? (
              <CircularGallery
                bend={1}
                textColor="#ffffff"
                borderRadius={0.05}
                scrollEase={0.05}
                font={`bold 24px ${orbitron.style.fontFamily}`}
                scrollSpeed={2}
                items={cardImages.map((img, idx) => ({
                  image: img,
                  text: MODULES[idx].title
                }))}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-neutral-500 font-mono text-xs">
                <span className="w-6 h-6 rounded-full border border-t-transparent border-neutral-500 animate-spin" />
                <span>Modüller Hazırlanıyor...</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

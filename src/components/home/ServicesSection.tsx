'use client';

import { useState, type ReactNode } from 'react';

const SERVICES: { title: string; desc: string; tags: string[]; visual: () => ReactNode }[] = [
  {
    title: 'Kurumsal web siteleri',
    desc: 'Markanızı doğru yansıtan, her cihazda hızlı açılan ve içerik ekibinizin kolayca güncelleyebileceği kurumsal siteler ve kampanya sayfaları.',
    tags: ['Next.js', 'Yönetim paneli', 'Çoklu dil'],
    visual: SiteVisual,
  },
  {
    title: 'Özel web uygulamaları',
    desc: 'Müşteri panelleri, rezervasyon sistemleri, şirket içi araçlar… Hazır çözümlerin yetmediği yerde, ihtiyaca özel ve ölçeklenebilir uygulamalar.',
    tags: ['Üyelik sistemi', 'Panel ve raporlar', 'Entegrasyonlar'],
    visual: AppVisual,
  },
  {
    title: 'Tasarımdan koda',
    desc: 'Figma tasarımlarını piksel hassasiyetinde; responsive, erişilebilir ve akıcı animasyonlu arayüzlere dönüştürüyorum. Tasarımcınızın emeği birebir yayına çıkar.',
    tags: ['Figma', 'Mobil uyum', 'Animasyon'],
    visual: DesignVisual,
  },
  {
    title: 'Hız & SEO',
    desc: 'Sayfa hızı iyileştirmeleri, görsel optimizasyonu ve Google’ın beklediği teknik düzenlemelerle ziyaretçiyi bekletmeyen, aramalarda öne çıkan siteler.',
    tags: ['Hızlı açılış', 'Google uyumu', 'Görsel optimizasyonu'],
    visual: PerformanceVisual,
  },
];

export default function ServicesSection() {
  const [active, setActive] = useState(0);
  const Visual = SERVICES[active].visual;

  return (
    <section id="services" className="scroll-mt-16 border-t border-line bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="animate-on-scroll grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Hizmetler</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink md:text-5xl">
              Fikirden yayına, ihtiyacınız olan her adımda.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-ink-soft lg:col-span-5">
            İster sıfırdan yeni bir ürün, ister ekibinize ek geliştirme gücü. Projeye nereden dahil olursam olayım,
            işi sahiplenir ve sonuna kadar götürürüm.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6 lg:order-2">
            <div className="relative overflow-hidden rounded-[28px] sm:aspect-[5/4] border border-line bg-gradient-to-br from-accent-soft via-[#e3ecff] to-[#cddcfd] lg:sticky lg:top-28">
              <div className="home-dot-grid absolute inset-0 opacity-50" aria-hidden="true" />
              <div key={active} className="home-reveal relative flex items-center justify-center px-5 pb-12 pt-8 sm:absolute sm:inset-0 sm:p-10">
                <Visual />
              </div>
              <span className="absolute bottom-4 left-5 font-mono text-[12px] text-accent/80">
                {String(active + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          <ul className="lg:col-span-6 lg:order-1" role="tablist" aria-label="Hizmetler">
            {SERVICES.map((service, index) => {
              const selected = index === active;
              return (
                <li key={service.title} className="border-t border-line last:border-b">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    className="group relative w-full py-7 text-left"
                  >
                    <span
                      className={`absolute -left-5 top-7 h-[calc(100%-3.5rem)] w-[3px] origin-top rounded-full bg-accent transition-transform duration-500 md:-left-6 ${
                        selected ? 'scale-y-100' : 'scale-y-0'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="flex items-baseline gap-5">
                      <span
                        className={`font-mono text-[13px] transition-colors ${selected ? 'text-accent' : 'text-ink-muted'}`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-2xl font-semibold tracking-[-0.02em] transition-colors duration-300 md:text-[2rem] ${
                          selected ? 'text-ink' : 'text-ink/35 group-hover:text-ink/70'
                        }`}
                      >
                        {service.title}
                      </span>
                    </span>

                    <span
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                        selected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <span className="overflow-hidden">
                        <span className="block pl-[2.6rem] pt-4 text-[17px] leading-relaxed text-ink-soft">
                          {service.desc}
                        </span>
                        <span className="flex flex-wrap gap-2 pl-[2.6rem] pt-5">
                          {service.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-line px-3 py-1 text-[13px] text-ink-soft">
                              {tag}
                            </span>
                          ))}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="animate-on-scroll mt-14 text-[15px] text-ink-soft">
          Ajansınızın markası altında, doğrudan ekibinizin bir parçası gibi de çalışabilirim.{' '}
          <a href="#contact" className="font-medium text-accent underline-offset-4 hover:underline">
            Detayları konuşalım →
          </a>
        </p>
      </div>
    </section>
  );
}

/* ── İllüstrasyonlar: saf CSS/SVG, görsel dosyası gerektirmez ─────────────── */

function Window({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-white/70 bg-white shadow-[0_24px_60px_-24px_rgba(29,78,216,0.45)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
      </div>
      {children}
    </div>
  );
}

function SiteVisual() {
  return (
    <Window className="w-full max-w-[420px]">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="h-2.5 w-14 rounded-full bg-ink" />
          <span className="flex gap-2">
            <span className="h-2 w-8 rounded-full bg-line" />
            <span className="h-2 w-8 rounded-full bg-line" />
            <span className="h-2 w-8 rounded-full bg-line" />
            <span className="h-2 w-10 rounded-full bg-accent" />
          </span>
        </div>
        <div className="mt-6 grid grid-cols-5 gap-4">
          <div className="col-span-3 space-y-2 pt-2">
            <span className="block h-3.5 w-full rounded bg-ink" />
            <span className="block h-3.5 w-4/5 rounded bg-ink" />
            <span className="block h-2 w-full rounded bg-line" />
            <span className="block h-2 w-3/4 rounded bg-line" />
            <span className="mt-3 block h-6 w-20 rounded-full bg-accent" />
          </div>
          <div className="col-span-2 aspect-[4/5] rounded-lg bg-gradient-to-br from-accent to-[#7ea6f7]" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-line p-2.5">
              <span className="block h-5 w-5 rounded-md bg-accent-soft" />
              <span className="mt-2 block h-1.5 w-full rounded bg-line" />
              <span className="mt-1 block h-1.5 w-2/3 rounded bg-line" />
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

function AppVisual() {
  const bars = [38, 62, 48, 80, 56, 92, 70];
  return (
    <Window className="w-full max-w-[440px]">
      <div className="flex">
        <div className="w-24 shrink-0 space-y-2 border-r border-line p-3">
          <span className="mb-4 block h-2.5 w-12 rounded-full bg-ink" />
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`block h-5 rounded-md ${i === 1 ? 'bg-accent-soft' : ''}`}>
              <span className={`ml-2 mt-[7px] block h-1.5 w-12 rounded ${i === 1 ? 'bg-accent' : 'bg-line'}`} />
            </span>
          ))}
        </div>
        <div className="flex-1 p-4">
          <div className="grid grid-cols-3 gap-2">
            {['₺48K', '1.240', '%96'].map((value) => (
              <div key={value} className="rounded-lg border border-line p-2">
                <span className="block h-1.5 w-8 rounded bg-line" />
                <span className="mt-1.5 block text-[13px] font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex h-28 items-end gap-1.5 rounded-lg border border-line p-3">
            {bars.map((height, i) => (
              <span
                key={i}
                className={`flex-1 rounded-t ${i === 5 ? 'bg-accent' : 'bg-accent/25'}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-md border border-line px-2 py-1.5">
                <span className="h-4 w-4 rounded-full bg-surface-2" />
                <span className="h-1.5 flex-1 rounded bg-line" />
                <span className={`h-3 w-10 rounded-full ${i === 0 ? 'bg-emerald-100' : 'bg-amber-100'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}

function DesignVisual() {
  return (
    <div className="relative w-full max-w-[440px]">
      <div className="rounded-xl border border-white/70 bg-white p-4 shadow-[0_24px_60px_-24px_rgba(29,78,216,0.45)]">
        <span className="font-mono text-[10px] text-ink-muted">Frame · Hero</span>
        <div className="relative mt-2 rounded-lg border-2 border-dashed border-accent/50 p-4">
          <span className="block h-3 w-3/4 rounded bg-ink" />
          <span className="mt-2 block h-2 w-1/2 rounded bg-line" />
          <span className="relative mt-4 inline-flex h-7 w-24 items-center justify-center rounded-full bg-accent ring-2 ring-accent ring-offset-2">
            <span className="h-1.5 w-12 rounded bg-white/80" />
            {[
              '-left-1.5 -top-1.5',
              '-right-1.5 -top-1.5',
              '-bottom-1.5 -left-1.5',
              '-bottom-1.5 -right-1.5',
            ].map((pos) => (
              <span key={pos} className={`absolute h-2 w-2 border border-accent bg-white ${pos}`} />
            ))}
          </span>
          <svg className="absolute left-[7.5rem] top-[4.6rem] h-5 w-5 text-ink" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4 2l16 10-7 1.5L9.5 21z" />
          </svg>
          <span className="absolute left-[8.6rem] top-[5.9rem] rounded bg-[#f24e1e] px-1.5 py-0.5 text-[10px] font-medium text-white">
            Tasarımcı
          </span>
        </div>
      </div>
      <div className="-mt-6 ml-10 rounded-xl bg-ink p-4 font-mono text-[12px] leading-relaxed shadow-[0_24px_60px_-20px_rgba(12,10,9,0.6)] sm:ml-16">
        <div>
          <span className="text-[#93b4f8]">&lt;Button</span> <span className="text-[#fbbf24]">variant</span>
          <span className="text-white/60">=</span>
          <span className="text-[#86efac]">&quot;primary&quot;</span>
          <span className="text-[#93b4f8]">&gt;</span>
        </div>
        <div className="pl-4 text-white/80">Projeyi incele</div>
        <div className="text-[#93b4f8]">&lt;/Button&gt;</div>
      </div>
    </div>
  );
}

function PerformanceVisual() {
  const scores = ['Hız', 'Erişilebilirlik', 'Kalite', 'SEO'];
  return (
    <div className="w-full max-w-[440px] rounded-xl border border-white/70 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(29,78,216,0.45)]">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-3">
        {scores.map((label) => (
          <div key={label} className="flex flex-col items-center text-center">
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15.5" fill="#ecfdf5" stroke="#d1fae5" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeDasharray="97.4 97.4" />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-lg font-semibold text-emerald-700">100</span>
            </div>
            <span className="mt-2 text-[11px] leading-tight text-ink-soft">{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
        {[
          ['Açılış süresi', '1.1 sn'],
          ['Sayfa kayması', 'Yok'],
          ['Tepki süresi', '80 ms'],
        ].map(([metric, value]) => (
          <div key={metric}>
            <div className="font-mono text-[10px] text-ink-muted">{metric}</div>
            <div className="mt-0.5 text-sm font-semibold text-emerald-700">{value}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center font-mono text-[10px] text-ink-muted">Google PageSpeed’de her projede hedeflenen skorlar</p>
    </div>
  );
}

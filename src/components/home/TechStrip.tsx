// Tek düz şerit: solda sabit etiket, sağda tek satır kayan araç/yetkinlik listesi
const ITEMS = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'Figma',
  'Kurumsal siteler',
  'Web uygulamaları',
  'Mobil uyum',
  'Animasyon',
  'SEO',
  'Hız optimizasyonu',
];

export default function TechStrip() {
  return (
    <section aria-label="Araçlar ve yetkinlikler" className="border-y border-line bg-surface py-5 md:py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 md:flex-row md:items-center md:gap-6 md:px-8">
        <p className="shrink-0 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">
          Araçlar &amp; yetkinlikler
        </p>
        <span className="hidden h-5 w-px shrink-0 bg-line md:block" aria-hidden="true" />
        <div className="home-fade-x min-w-0 flex-1 overflow-hidden">
          <div className="home-marquee flex w-max animate-scroll hover:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                {ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-8 pr-8 md:gap-10 md:pr-10">
                    <span className="whitespace-nowrap text-lg font-medium tracking-[-0.01em] text-ink-soft md:text-xl">
                      {item}
                    </span>
                    <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-accent/60" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

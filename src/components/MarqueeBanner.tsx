const MARQUEE_ITEMS = [
  'YENİ PROJELERE AÇIĞIM',
  'TASARIM & GELİŞTİRME',
  'BİRLİKTE HARİKA İŞLER ÇIKARALIM',
  'YENİ PROJELERE AÇIĞIM',
  'TASARIM & GELİŞTİRME',
];

export default function MarqueeBanner() {
  return (
    <div className="py-12 border-y border-white/5 bg-neutral-950 overflow-hidden relative rotate-[-1deg] scale-105 transform-gpu">
      <div className="marquee-content flex w-fit animate-[scroll_30s_linear_infinite]">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-12 px-6 whitespace-nowrap text-[15px] font-mono uppercase tracking-[0.2em] text-neutral-500"
          >
            {MARQUEE_ITEMS.map((item, idx) => (
              <span key={`${i}-${idx}`} className={idx % 2 === 0 ? 'text-white' : ''}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

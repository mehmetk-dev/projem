import { Check } from 'lucide-react';

const STEPS = [
  {
    title: 'Keşif',
    desc: 'Hedeflerinizi, kitlenizi ve beklentilerinizi dinliyorum. Kapsamı ve teknik gereksinimleri birlikte netleştiriyoruz.',
    deliverables: ['Kapsam ve hedef özeti', 'Teknik gereksinimler', 'Süre ve bütçe tahmini'],
    tone: 'bg-surface text-ink border-line',
  },
  {
    title: 'Planlama',
    desc: 'Sayfaları, iş takvimini ve teslim aşamalarını belirliyorum. Ne zaman neyi teslim alacağınızı en baştan bilirsiniz.',
    deliverables: ['Sayfa ve özellik haritası', 'Kullanılacak teknolojiler', 'Aşamalı teslim takvimi'],
    tone: 'bg-[#eaf1ff] text-ink border-[#d5e2fd]',
  },
  {
    title: 'Geliştirme',
    desc: 'Düzenli ara teslimlerle ilerliyorum. Her adımı canlı bir önizleme bağlantısında görür, anında geri bildirim verirsiniz.',
    deliverables: ['Canlı önizleme bağlantısı', 'Düzenli ara teslimler', 'Geri bildirim turları'],
    tone: 'bg-ink text-white border-ink',
  },
  {
    title: 'Yayın & destek',
    desc: 'Hız, Google uyumu ve erişilebilirlik kontrollerinden sonra yayına alıyorum. Yayın sonrasında da yanınızdayım.',
    deliverables: ['Hız ve Google kontrolleri', 'Yayına alma ve alan adı kurulumu', 'Yayın sonrası bakım'],
    tone: 'bg-accent text-white border-accent',
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="animate-on-scroll grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-accent">Süreç</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink md:text-5xl">
              Sürprizsiz, şeffaf bir çalışma düzeni.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-ink-soft lg:col-span-5">
            Net bir kapsam, düzenli ara teslimler ve açık iletişim. Projenin hangi aşamada olduğunu her an bilirsiniz.
          </p>
        </div>

        {/* Kaydırdıkça üst üste binen yapışkan kartlar — saf CSS */}
        <ol className="mt-16 flex flex-col gap-6">
          {STEPS.map((step, index) => {
            const dark = index >= 2;
            return (
              <li
                key={step.title}
                className={`sticky rounded-[28px] border p-7 shadow-[0_-12px_40px_-24px_rgba(12,10,9,0.25)] md:p-12 ${step.tone}`}
                style={{ top: `${96 + index * 28}px` }}
              >
                <div className="grid gap-8 md:grid-cols-12 md:gap-10">
                  <div className="md:col-span-5">
                    <span
                      className={`block text-[5rem] font-semibold leading-none tracking-[-0.06em] md:text-[7rem] ${
                        dark ? 'text-white/20' : 'text-accent/20'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 text-3xl font-semibold tracking-[-0.025em] md:text-4xl">{step.title}</h3>
                  </div>
                  <div className="flex flex-col justify-end md:col-span-7">
                    <p className={`text-lg leading-relaxed ${dark ? 'text-white/75' : 'text-ink-soft'}`}>{step.desc}</p>
                    <div className={`mt-8 border-t pt-6 ${dark ? 'border-white/15' : 'border-ink/10'}`}>
                      <p className={`font-mono text-[12px] uppercase tracking-[0.12em] ${dark ? 'text-white/50' : 'text-ink-muted'}`}>
                        Bu aşamada teslim alacaklarınız
                      </p>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
                        {step.deliverables.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-[15px] leading-snug">
                            <Check size={16} className={`mt-0.5 shrink-0 ${dark ? 'text-white/70' : 'text-accent'}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

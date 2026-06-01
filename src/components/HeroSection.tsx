'use client';

import Image from 'next/image';
import { LocationIcon } from './Icons';
import { AnimatedText } from './AnimatedText';
import Galaxy from './Galaxy';

interface HeroSectionProps {
  displayName: string;
}

export default function HeroSection({ displayName }: HeroSectionProps) {
  return (
    <section id="about" className="relative min-h-screen lg:min-h-[100svh] flex items-center pt-28 pb-16 lg:py-0 overflow-hidden">
      {/* WebGL Galaxy background covering the entire section */}
      <div className="absolute inset-0 pointer-events-none opacity-85 z-0">
        <Galaxy 
          mouseRepulsion
          mouseInteraction
          density={1}
          glowIntensity={0.3}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
        />
      </div>

      {/* Abstract glowing background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-white/5 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center justify-center lg:justify-start w-full">
          <div className="hidden lg:flex flex-col items-center justify-center h-full shrink-0">
            <div className="[writing-mode:vertical-rl] rotate-180 text-[clamp(60px,10vh,120px)] leading-[0.75] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-t from-white via-white to-neutral-900 select-none opacity-90">
              <AnimatedText text={displayName} />
            </div>
          </div>

          <div className="lg:hidden w-full text-center mb-4">
            <div className="text-[clamp(40px,10vw,80px)] leading-tight font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500 flex items-center justify-center">
              <AnimatedText text={displayName} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center lg:items-center justify-between w-full gap-12 lg:gap-16">
            {/* Photo: Right Side on Desktop */}
            <div className="relative group shrink-0 w-[260px] h-[340px] md:w-[320px] md:h-[420px] lg:w-[360px] lg:h-[480px] animate-on-scroll">
              <div className="absolute -inset-4 border border-white/10 rounded-[2rem] transform rotate-3 transition-transform duration-700 group-hover:rotate-6 group-hover:border-white/20 shadow-2xl shadow-black/40" />
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black rounded-[2rem] overflow-hidden">
                <Image
                  src="/images/hero-main.png"
                  alt="Mehmet Kerem"
                  fill
                  sizes="(max-width: 768px) 260px, (max-width: 1024px) 320px, 360px"
                  className="object-cover object-bottom [filter:contrast(1.04)_brightness(0.88)_saturate(0.78)] transition-all duration-700 group-hover:[filter:contrast(1.06)_brightness(0.94)_saturate(0.9)] group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Bio: Left Side on Desktop */}
            <div className="flex flex-col max-w-xl">
              <div className="flex items-center gap-4 mb-4 text-[10px] md:text-[11px] font-mono tracking-[0.3em] uppercase text-neutral-500">
                <span>Yazılım Geliştirici & Ürün Tasarımcısı</span>
                <span className="w-1 h-1 bg-neutral-500 rounded-full" />
                <span className="flex items-center gap-2">
                  <LocationIcon />
                  İstanbul, TR
                </span>
              </div>

              <div className="text-2xl md:text-3xl lg:text-4xl font-light text-neutral-400 leading-[1.3] tracking-tight">
                <AnimatedText text="Selam! Ben Kerem." /> <br className="hidden md:block" />
                <AnimatedText text="Tasarım ve yazılımı birleştirerek " />
                <strong className="font-medium text-white">
                  <AnimatedText text="modern ve hızlı" />
                </strong>
                <AnimatedText text=" dijital ürünler inşa ediyorum." />
                
                <div className="mt-6 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-xl">
                  <AnimatedText text="Karmaşık fikirleri basit, estetik ve hızlı çözümlere dönüştürmeyi çok seviyorum. Seninle tanıştığıma memnun oldum!" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

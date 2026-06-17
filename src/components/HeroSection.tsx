'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { LocationIcon } from './Icons';
import SplitText from './SplitText';

const Galaxy = dynamic(() => import('./Galaxy'), { ssr: false });

interface HeroSectionProps {
  displayName: string;
}

export default function HeroSection({ displayName }: HeroSectionProps) {
  const [showGalaxy, setShowGalaxy] = useState(false);
  const [greetingComplete, setGreetingComplete] = useState(false);
  const [sentenceComplete, setSentenceComplete] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!desktopQuery.matches || motionQuery.matches) return;

    // Delay Galaxy mount so WebGL shader compilation doesn't block initial paint
    const scheduleGalaxy = () => {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => setShowGalaxy(true), { timeout: 2000 });
      } else {
        setTimeout(() => setShowGalaxy(true), 1200);
      }
    };

    scheduleGalaxy();

    const update = () => {
      const shouldShow = desktopQuery.matches && !motionQuery.matches;
      if (!shouldShow) setShowGalaxy(false);
    };

    desktopQuery.addEventListener('change', update);
    motionQuery.addEventListener('change', update);

    return () => {
      desktopQuery.removeEventListener('change', update);
      motionQuery.removeEventListener('change', update);
    };
  }, []);

  return (
    <section id="about" className="relative min-h-screen lg:min-h-[100svh] flex items-center pt-28 pb-16 lg:py-0 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_18%_72%,rgba(255,255,255,0.05),transparent_26%)]" />

      <div className="absolute inset-0 pointer-events-none opacity-85 z-0">
        {showGalaxy && (
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
        )}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-white/5 blur-[100px] rounded-full pointer-events-none z-0 hidden md:block" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center justify-center lg:justify-start w-full">
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
                <span>Yazılım Geliştirici</span>
                <span className="w-1 h-1 bg-neutral-500 rounded-full" />
                <span className="flex items-center gap-2">
                  <LocationIcon />
                  İstanbul, TR
                </span>
              </div>

              <div 
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}
                className="text-2xl md:text-3xl lg:text-4xl font-light text-neutral-400 leading-[1.3] tracking-tight"
              >
                <SplitText 
                  text="Selam! Ben Mehmet." 
                  splitType="lines" 
                  className="inline-block" 
                  delay={200}
                  onLetterAnimationComplete={() => setGreetingComplete(true)} 
                /> <br className="hidden md:block" />
                
                <SplitText 
                  splitType="lines" 
                  play={greetingComplete} 
                  delay={200}
                  onLetterAnimationComplete={() => setSentenceComplete(true)}
                >
                  Tasarım ve yazılımı birleştirerek <strong className="font-medium text-white">modern ve hızlı</strong> dijital ürünler inşa ediyorum.
                </SplitText>
                
                <div className="mt-6 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-xl">
                  <SplitText 
                    text="Karmaşık fikirleri basit, estetik ve hızlı çözümlere dönüştürmeyi çok seviyorum. Seninle tanıştığıma memnun oldum!" 
                    splitType="lines" 
                    play={sentenceComplete} 
                    delay={150} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

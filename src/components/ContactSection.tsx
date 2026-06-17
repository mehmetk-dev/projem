'use client';

import { useActionState } from 'react';
import { submitContactAction } from '@/app/actions/messages';
import { EmailIcon, LocationIcon, SendArrowIcon } from './Icons';

export default function ContactSection() {
  const [state, formAction, isPending] = useActionState(submitContactAction, null);
  const submitSuccess = !!state?.success;

  return (
    <section id="contact" className="py-32 lg:py-48 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800/20 via-black to-black pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 lg:gap-32">
          <div className="flex flex-col justify-center animate-on-scroll">
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase text-white mb-8 leading-[0.9]">
              Fikrini
              <br />
              Hayata
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-neutral-700">
                Geçir
              </span>
            </h2>
            <p className="text-2xl text-neutral-400 font-light mb-16 max-w-md">
              Geleceği şekillendiren projeler üzerine konuşmak için sabırsızlanıyorum.
            </p>

            <div className="flex flex-col gap-8">
              <a
                href="mailto:mehmetkerem2109@gmail.com"
                className="flex items-center gap-6 group"
              >
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-colors">
                  <EmailIcon className="text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-1">
                    E-Posta
                  </div>
                  <div className="text-xl font-medium text-white group-hover:text-neutral-300 transition-colors">
                    mehmetkerem2109@gmail.com
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                  <LocationIcon className="text-neutral-400" />
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-1">
                    Lokasyon
                  </div>
                  <div className="text-xl font-medium text-white">İstanbul, Türkiye</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/20 backdrop-blur-xl border border-white/10 p-6 sm:p-10 md:p-16 rounded-2xl sm:rounded-[3rem] animate-on-scroll">
            <h3 className="text-3xl font-bold tracking-tight mb-12">Mesaj Bırak</h3>
            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-6 animate-contact-fade-in">
                <div className="relative mb-6">
                  {/* Floating Hearts/Sparkles */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 text-rose-500 animate-ping opacity-75">♥</div>
                  <div className="absolute -top-4 -right-1 w-3 h-3 text-amber-400 animate-pulse">✦</div>
                  
                  <svg
                    viewBox="0 0 200 200"
                    className="w-40 h-40 text-emerald-400 fill-current drop-shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-cat-wag"
                  >
                    {/* Ears */}
                    <path d="M50 80 L30 30 L80 65 Z" fill="currentColor" />
                    <path d="M150 80 L170 30 L120 65 Z" fill="currentColor" />
                    {/* Inner Ears */}
                    <path d="M52 75 L38 40 L72 63 Z" fill="#1a1a1a" />
                    <path d="M148 75 L162 40 L128 63 Z" fill="#1a1a1a" />
                    {/* Head/Face */}
                    <path d="M40 100 C40 50, 160 50, 160 100 C160 140, 40 140, 40 100 Z" fill="currentColor" />
                    {/* Cheeks Blush */}
                    <circle cx="62" cy="108" r="8" fill="#f43f5e" opacity="0.5" />
                    <circle cx="138" cy="108" r="8" fill="#f43f5e" opacity="0.5" />
                    {/* Eyes */}
                    <circle cx="80" cy="98" r="6" fill="#1a1a1a" />
                    <circle cx="120" cy="98" r="6" fill="#1a1a1a" />
                    {/* Eye Sparkles */}
                    <circle cx="78" cy="96" r="2" fill="#ffffff" />
                    <circle cx="118" cy="96" r="2" fill="#ffffff" />
                    {/* Nose */}
                    <path d="M97 105 L103 105 L100 108 Z" fill="#1a1a1a" />
                    {/* Smile */}
                    <path d="M93 111 Q100 117 100 112 Q100 117 107 111" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Whiskers */}
                    <line x1="32" y1="102" x2="12" y2="100" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                    <line x1="32" y1="110" x2="10" y2="112" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                    <line x1="168" y1="102" x2="188" y2="100" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                    <line x1="168" y1="110" x2="190" y2="112" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                    {/* Cute Paws */}
                    <rect x="65" y="128" width="24" height="18" rx="9" fill="currentColor" />
                    <rect x="111" y="128" width="24" height="18" rx="9" fill="currentColor" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2 tracking-tight">Mesajınız İletildi!</h4>
                <p className="text-neutral-400 font-light leading-relaxed max-w-sm mb-6 text-sm">
                  {state.success}
                </p>
                <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" />
              </div>
            ) : (
              <form action={formAction} className="flex flex-col gap-10">
                <input
                  type="text"
                  name="name"
                  required
                  suppressHydrationWarning
                  placeholder="Adınız Soyadınız"
                  className="w-full bg-transparent border-b border-white/20 text-2xl font-light text-white placeholder:text-neutral-700 pb-4 focus:border-white focus:outline-none transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  required
                  suppressHydrationWarning
                  placeholder="E-Posta Adresiniz"
                  className="w-full bg-transparent border-b border-white/20 text-2xl font-light text-white placeholder:text-neutral-700 pb-4 focus:border-white focus:outline-none transition-colors"
                />
                <textarea
                  name="content"
                  required
                  suppressHydrationWarning
                  placeholder="Projenizden bahsedin..."
                  rows={4}
                  className="w-full bg-transparent border-b border-white/20 text-2xl font-light text-white placeholder:text-neutral-700 pb-4 focus:border-white focus:outline-none transition-colors resize-none"
                />

                {state?.error && (
                  <div className="text-rose-400 text-sm">{state.error}</div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="group mt-8 flex items-center justify-between w-full bg-white text-black px-8 py-6 rounded-full font-bold text-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  <span>{isPending ? 'Gönderiliyor...' : 'Gönder'}</span>
                  {!isPending && (
                    <span className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                      <SendArrowIcon />
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

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
            <h2 className="text-7xl md:text-8xl font-black tracking-tighter uppercase text-white mb-8 leading-[0.9]">
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
                href="mailto:merhaba@mehmetkerem.com"
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
                    merhaba@mehmetkerem.com
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

          <div className="bg-neutral-900/20 backdrop-blur-xl border border-white/10 p-10 md:p-16 rounded-[3rem] animate-on-scroll">
            <h3 className="text-3xl font-bold tracking-tight mb-12">Mesaj Bırak</h3>
            {submitSuccess ? (
              <div className="text-emerald-400 text-lg font-medium py-12 text-center">
                {state.success}
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

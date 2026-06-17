'use client';

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface SplitTextProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
  play?: boolean;
  enableScrollTrigger?: boolean;
}

const SplitText: React.FC<SplitTextProps> = ({
  text = '',
  children,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'left',
  onLetterAnimationComplete,
  play = true,
  enableScrollTrigger = false
}) => {
  const ref = useRef<HTMLElement>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
      return;
    }
    // Race: wait for fonts OR timeout after 1.5s to avoid blocking animations
    let done = false;
    const mark = () => { if (!done) { done = true; setFontsLoaded(true); } };
    document.fonts.ready.then(mark);
    const timer = setTimeout(mark, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [splitInstance, setSplitInstance] = useState<SplitType | null>(null);

  useEffect(() => {
    if (!ref.current || !fontsLoaded) return;
    
    const el = ref.current;
    const typesMap = {
      chars: 'chars,words',
      words: 'words',
      lines: 'lines'
    };

    // Defer SplitType to next frame to avoid layout thrashing during initial paint
    const rafId = requestAnimationFrame(() => {
      const instance = new SplitType(el, {
        types: typesMap[splitType] as any,
        tagName: 'span'
      });
      setSplitInstance(instance);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (splitInstance) splitInstance.revert();
    };
  }, [text, splitType, fontsLoaded]);

  useGSAP(
    () => {
      if (!splitInstance || !play) return;
      if (animationCompletedRef.current) return;

      const el = ref.current;
      let targets: HTMLElement[] = [];
      if (splitType === 'chars' && splitInstance.chars) {
        targets = splitInstance.chars;
      } else if (splitType === 'words' && splitInstance.words) {
        targets = splitInstance.words;
      } else if (splitType === 'lines' && splitInstance.lines) {
        targets = splitInstance.lines;
      }

      if (!targets.length) return;

      if (splitType === 'lines') {
        gsap.set(targets, { display: 'block', willChange: 'transform, opacity' });
      } else {
        gsap.set(targets, { display: 'inline-block', willChange: 'transform, opacity' });
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      // Set targets to from state and make parent visible to prevent flashes
      gsap.set(targets, { ...from });
      gsap.set(el, { opacity: 1 });

      const scrollTriggerConfig = enableScrollTrigger ? {
        trigger: el,
        start,
        once: true,
        fastScrollEnd: true,
        anticipatePin: 0.4
      } : undefined;

      const tween = gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: scrollTriggerConfig,
          onComplete: () => {
            animationCompletedRef.current = true;
            // Release compositor layers after animation completes
            targets.forEach(t => { t.style.willChange = 'auto'; });
            onCompleteRef.current?.();
          },
          force3D: true
        }
      );

      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
      };
    },
    {
      dependencies: [
        splitInstance,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        play,
        enableScrollTrigger
      ],
      scope: ref
    }
  );

  const renderTag = () => {
    const style: React.CSSProperties = {
      textAlign,
      wordWrap: 'break-word',
      display: 'inline-block',
      width: '100%',
      opacity: ((play && splitInstance) || animationCompletedRef.current) ? undefined : 0
    };
    const classes = `split-parent overflow-hidden ${className}`;
    const Tag = (tag || 'p') as React.ElementType;

    return (
      <Tag ref={ref} style={style} className={classes}>
        {children || text}
      </Tag>
    );
  };

  return renderTag();
};

export default SplitText;

'use client';

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  ReactNode,
  RefObject,
  useEffect,
  useMemo,
  useRef
} from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card cursor-pointer ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  children
}) => {
  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children]);
  const refs = useMemo<CardRef[]>(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr.length]);

  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const timeoutRef = useRef<number>(0);
  const swapRef = useRef<(targetPos?: number) => void>(() => {});
  const container = useRef<HTMLDivElement>(null);
  const isHovered = useRef<boolean>(false);

  const handleCardClick = (i: number) => {
    // If an animation is currently active, ignore clicks to prevent glitching
    if (tlRef.current && tlRef.current.isActive()) return;

    const targetPos = order.current.indexOf(i);
    
    if (targetPos === 0) {
      // If clicking the front card, swap it to the back as usual
      clearTimeout(timeoutRef.current);
      swapRef.current(0);
    } else if (targetPos > 0) {
      // If clicking any card behind, bring it directly to the front
      clearTimeout(timeoutRef.current);
      swapRef.current(targetPos);
    }
  };

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      if (r.current) {
        placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
      }
    });

    const swap = (targetPos: number = 0) => {
      // Prevent overlapping animations during transitions
      if (tlRef.current && tlRef.current.isActive()) return;
      if (order.current.length < 2) return;
      if (targetPos < 0 || targetPos >= order.current.length) return;

      const tl = gsap.timeline();
      tlRef.current = tl;

      const easeCurve = 'power3.inOut';

      if (targetPos === 0) {
        // Standard swap: front card goes to the back
        const front = order.current[0];
        const rest = order.current.slice(1);
        if (!refs[front]?.current) return;
        const elFront = refs[front].current!;

        const durDrop = 0.45;
        const durMove = 0.4;
        const durReturn = 0.45;
        const promoteOverlap = 0.8;
        const returnDelay = 0.05;

        // Drop front card down
        tl.to(elFront, {
          y: '+=500',
          duration: durDrop,
          ease: easeCurve
        });

        // Promote other cards forward
        tl.addLabel('promote', `-=${durDrop * promoteOverlap}`);
        rest.forEach((idx, i) => {
          if (!refs[idx]?.current) return;
          const el = refs[idx].current!;
          const slot = makeSlot(i, cardDistance, verticalDistance, total);
          tl.set(el, { zIndex: slot.zIndex }, 'promote');
          tl.to(
            el,
            {
              x: slot.x,
              y: slot.y,
              z: slot.z,
              duration: durMove,
              ease: easeCurve
            },
            `promote+=${i * 0.08}`
          );
        });

        // Return the original front card to the back of the stack
        const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
        tl.addLabel('return', `promote+=${durMove * returnDelay}`);
        tl.call(
          () => {
            gsap.set(elFront, { zIndex: backSlot.zIndex });
          },
          undefined,
          'return'
        );
        tl.to(
          elFront,
          {
            x: backSlot.x,
            y: backSlot.y,
            z: backSlot.z,
            duration: durReturn,
            ease: easeCurve
          },
          'return'
        );

        // Re-order active deck indexes and reschedule the auto-swap timer
        tl.call(() => {
          order.current = [...rest, front];
          clearTimeout(timeoutRef.current);
          if (!isHovered.current) {
            timeoutRef.current = window.setTimeout(() => swap(0), delay);
          }
        });

      } else {
        // Direct shuffle: bring background card at targetPos to the front (Slot 0)
        const clickedCard = order.current[targetPos];
        const shiftedCards = order.current.slice(0, targetPos);
        const staticCards = order.current.slice(targetPos + 1);

        if (!refs[clickedCard]?.current) return;
        const elClicked = refs[clickedCard].current!;

        const durSlideOut = 0.45;
        const durShift = 0.4;
        const durSlideIn = 0.45;
        const slideOutOverlap = 0.85;

        // Slide the clicked card out to the left to clear the stack
        const currentSlot = makeSlot(targetPos, cardDistance, verticalDistance, total);
        
        tl.to(elClicked, {
          x: currentSlot.x - 260,
          y: currentSlot.y + 30,
          skewY: -skewAmount * 1.5,
          duration: durSlideOut,
          ease: easeCurve
        });

        // Shift preceding cards backward by 1 slot
        tl.addLabel('shift', `-=${durSlideOut * slideOutOverlap}`);
        shiftedCards.forEach((idx, i) => {
          if (!refs[idx]?.current) return;
          const el = refs[idx].current!;
          const newSlot = makeSlot(i + 1, cardDistance, verticalDistance, total);
          
          tl.set(el, { zIndex: newSlot.zIndex }, 'shift');
          tl.to(
            el,
            {
              x: newSlot.x,
              y: newSlot.y,
              z: newSlot.z,
              duration: durShift,
              ease: easeCurve
            },
            'shift'
          );
        });

        // Slide clicked card back into slot 0 (front)
        const frontSlot = makeSlot(0, cardDistance, verticalDistance, total);
        tl.addLabel('slideIn', `shift+=${durShift * 0.05}`);
        
        tl.call(
          () => {
            gsap.set(elClicked, { zIndex: total + 2, z: 60 });
          },
          undefined,
          'slideIn'
        );

        tl.to(
          elClicked,
          {
            x: frontSlot.x,
            y: frontSlot.y,
            z: frontSlot.z,
            skewY: skewAmount,
            duration: durSlideIn,
            ease: easeCurve
          },
          'slideIn'
        );

        // Re-order active deck indexes and reschedule the auto-swap timer
        tl.call(() => {
          order.current = [clickedCard, ...shiftedCards, ...staticCards];
          clearTimeout(timeoutRef.current);
          if (!isHovered.current) {
            timeoutRef.current = window.setTimeout(() => swap(0), delay);
          }
        });
      }
    };

    swapRef.current = swap;

    // Reschedule initial swap timer
    timeoutRef.current = window.setTimeout(() => swap(0), delay);

    if (pauseOnHover) {
      const node = container.current;
      if (node) {
        const pause = () => {
          isHovered.current = true;
          // Clear future auto-swap timeouts, but let the active animation complete smoothly
          clearTimeout(timeoutRef.current);
        };
        const resume = () => {
          isHovered.current = false;
          clearTimeout(timeoutRef.current);
          timeoutRef.current = window.setTimeout(() => swap(0), delay);
        };
        node.addEventListener('mouseenter', pause);
        node.addEventListener('mouseleave', resume);
        return () => {
          node.removeEventListener('mouseenter', pause);
          node.removeEventListener('mouseleave', resume);
          clearTimeout(timeoutRef.current);
        };
      }
    }
    return () => clearTimeout(timeoutRef.current);
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, refs]);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: e => {
            child.props.onClick?.(e as React.MouseEvent<HTMLDivElement>);
            onCardClick?.(i);
            handleCardClick(i);
          }
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child
  );

  return (
    <div ref={container} className="card-swap-container" style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;

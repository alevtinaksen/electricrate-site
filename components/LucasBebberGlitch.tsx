'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GlitchSlice {
  id: number;
  top: number;
  height: number;
  offsetRed: number;
  offsetGreen: number;
  offsetBlue: number;
  opacity: number;
}

interface LucasBebberGlitchProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export default function LucasBebberGlitch({ scrollContainerRef }: LucasBebberGlitchProps) {
  const [slices, setSlices] = useState<GlitchSlice[]>([]);
  const velocityRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const idleTimerRef = useRef(0);
  const idleBurstRef = useRef(0);

  useEffect(() => {
    const targetElement = scrollContainerRef?.current || window;

    const handleScroll = () => {
      let currentScrollTop = 0;
      if (scrollContainerRef?.current) {
        currentScrollTop = scrollContainerRef.current.scrollTop;
      } else {
        currentScrollTop = window.scrollY || document.documentElement.scrollTop;
      }

      const delta = Math.abs(currentScrollTop - lastScrollTopRef.current);
      lastScrollTopRef.current = currentScrollTop;

      // Accumulate velocity gently
      velocityRef.current = Math.min(45, velocityRef.current + delta * 0.3);
    };

    targetElement.addEventListener('scroll', handleScroll, { passive: true });

    let animationFrameId: number;

    const updateGlitch = () => {
      // Rapid decay to keep effect subtle and fleeting
      velocityRef.current *= 0.76;
      if (velocityRef.current < 0.15) velocityRef.current = 0;

      // Rare subtle idle micro-glitch (every 5-8 seconds, 1-2 frames only)
      idleTimerRef.current++;
      if (idleTimerRef.current > 300 + Math.random() * 200) {
        idleBurstRef.current = Math.floor(Math.random() * 2 + 1); // 1-2 frames
        idleTimerRef.current = 0;
      }

      let intensity = 0;
      let isGlitching = false;

      if (velocityRef.current > 1.2) {
        isGlitching = true;
        intensity = Math.min(1, velocityRef.current / 20);
      } else if (idleBurstRef.current > 0) {
        isGlitching = true;
        intensity = Math.random() * 0.3 + 0.2;
        idleBurstRef.current--;
      }

      if (isGlitching && Math.random() < 0.8) {
        // Subtle 1-2 thin slices maximum
        const sliceCount = Math.floor(intensity * 2) + 1;
        const newSlices: GlitchSlice[] = [];

        for (let i = 0; i < sliceCount; i++) {
          const top = Math.random() * 96; // %
          const height = Math.random() * 1.8 + 0.6; // very thin micro-slice 0.6% - 2.4%
          const maxDx = intensity * 3.5 + 1.2; // delicate micro-shift 1.2px - 4.7px
          const dx = (Math.random() - 0.5) * maxDx;
          const opacity = Math.random() * 0.08 * intensity + 0.05; // delicate 5% - 13% opacity

          newSlices.push({
            id: Math.random(),
            top,
            height,
            offsetRed: dx * 1.4,
            offsetGreen: -dx * 0.9,
            offsetBlue: dx * 1.1,
            opacity,
          });
        }

        setSlices(newSlices);
      } else {
        setSlices([]);
      }

      animationFrameId = requestAnimationFrame(updateGlitch);
    };

    animationFrameId = requestAnimationFrame(updateGlitch);

    return () => {
      targetElement.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollContainerRef]);

  if (slices.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[46] select-none overflow-hidden will-change-transform">
      {slices.map((slice) => (
        <div
          key={slice.id}
          className="absolute left-0 right-0 w-full overflow-hidden"
          style={{
            top: `${slice.top}%`,
            height: `${slice.height}%`,
          }}
        >
          {/* 1. Subtle Red Channel */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translateX(${slice.offsetRed}px)`,
              background: `rgba(255, 34, 68, ${slice.opacity * 0.85})`,
              mixBlendMode: 'screen',
            }}
          />

          {/* 2. Subtle Lime Green Channel (SVG flood2 limegreen) */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translateX(${slice.offsetGreen}px)`,
              background: `rgba(0, 230, 90, ${slice.opacity * 0.75})`,
              mixBlendMode: 'screen',
            }}
          />

          {/* 3. Subtle Electric Blue Channel */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translateX(${slice.offsetBlue}px)`,
              background: `rgba(20, 88, 230, ${slice.opacity})`,
              mixBlendMode: 'screen',
            }}
          />
        </div>
      ))}
    </div>
  );
}

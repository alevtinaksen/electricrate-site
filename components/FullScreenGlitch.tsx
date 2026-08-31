'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GlitchSlice {
  id: number;
  top: number;
  height: number;
  offsetRed: number;
  offsetGreen: number;
  offsetBlue: number;
  offsetSource: number;
  opacity: number;
}

interface FullScreenGlitchProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export default function FullScreenGlitch({ scrollContainerRef }: FullScreenGlitchProps) {
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

      // Increase velocity on rapid scroll
      velocityRef.current = Math.min(55, velocityRef.current + delta * 0.4);
    };

    targetElement.addEventListener('scroll', handleScroll, { passive: true });

    let animationFrameId: number;

    const updateGlitch = () => {
      // Smooth rapid decay
      velocityRef.current *= 0.80;
      if (velocityRef.current < 0.1) velocityRef.current = 0;

      // Idle random glitch burst (every 5-8 seconds, 1-2 frames)
      idleTimerRef.current++;
      if (idleTimerRef.current > 280 + Math.random() * 200) {
        idleBurstRef.current = Math.floor(Math.random() * 3 + 1); // 1-3 frames
        idleTimerRef.current = 0;
      }

      let intensity = 0;
      let isGlitching = false;

      if (velocityRef.current > 0.8) {
        isGlitching = true;
        intensity = Math.min(1, velocityRef.current / 20);
      } else if (idleBurstRef.current > 0) {
        isGlitching = true;
        intensity = Math.random() * 0.4 + 0.35;
        idleBurstRef.current--;
      }

      if (isGlitching && Math.random() < 0.9) {
        // Generate 2-5 full-width elongated sliced horizontal strips
        const sliceCount = Math.floor(intensity * 4) + 1;
        const newSlices: GlitchSlice[] = [];

        for (let i = 0; i < sliceCount; i++) {
          const top = Math.random() * 95; // %
          const height = Math.random() * 4.5 + 1.2; // % elongated strip height
          const maxDx = intensity * 16 + 4; // displacement px
          const dx = (Math.random() - 0.5) * maxDx * 2;
          const opacity = Math.random() * 0.18 * intensity + 0.10; // 10% - 28% rich chromatic opacity

          newSlices.push({
            id: Math.random(),
            top,
            height,
            offsetRed: dx * 1.3,
            offsetGreen: -dx * 0.7,
            offsetBlue: dx * 1.1,
            offsetSource: dx * 0.5,
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
    <div className="fixed inset-0 pointer-events-none z-[48] select-none overflow-hidden will-change-transform">
      {slices.map((slice) => (
        <div
          key={slice.id}
          className="absolute left-0 right-0 w-full overflow-hidden pointer-events-none"
          style={{
            top: `${slice.top}%`,
            height: `${slice.height}%`,
          }}
        >
          {/* 1. Full-Width Elongated Red Chromatic Channel (#FF2244) */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translateX(${slice.offsetRed}px)`,
              background: `linear-gradient(90deg, rgba(255, 34, 68, ${slice.opacity * 0.95}) 0%, rgba(255, 34, 68, ${slice.opacity * 0.6}) 100%)`,
              mixBlendMode: 'screen',
            }}
          />

          {/* 2. Full-Width Elongated Limegreen Channel (#00E65A) */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translateX(${slice.offsetGreen}px)`,
              background: `linear-gradient(90deg, rgba(0, 230, 90, ${slice.opacity * 0.85}) 0%, rgba(0, 230, 90, ${slice.opacity * 0.5}) 100%)`,
              mixBlendMode: 'screen',
            }}
          />

          {/* 3. Full-Width Elongated Electric Blue Channel (#1458E6) */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translateX(${slice.offsetBlue}px)`,
              background: `linear-gradient(90deg, rgba(20, 88, 230, ${slice.opacity}) 0%, rgba(0, 140, 255, ${slice.opacity * 0.65}) 100%)`,
              mixBlendMode: 'screen',
            }}
          />

          {/* 4. White Razor Scanline Core in the center of the strip */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              transform: `translateX(${slice.offsetSource}px)`,
            }}
          >
            <div
              className="w-full h-[1.5px] bg-white opacity-40 absolute"
              style={{ top: '50%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

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

interface CombinedGlitchEngineProps {
  targetContainerRef: React.RefObject<HTMLElement | null>;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

export default function CombinedGlitchEngine({
  targetContainerRef,
  scrollContainerRef,
}: CombinedGlitchEngineProps) {
  const [slices, setSlices] = useState<GlitchSlice[]>([]);
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const offRedRef = useRef<SVGFEOffsetElement | null>(null);
  const offGreenRef = useRef<SVGFEOffsetElement | null>(null);
  const offBlueRef = useRef<SVGFEOffsetElement | null>(null);

  const velocityRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const idleTimerRef = useRef(0);
  const idleBurstRef = useRef(0);
  const frameCounterRef = useRef(0);
  const slicesActiveRef = useRef(false);

  useEffect(() => {
    const scrollTarget = scrollContainerRef?.current || window;
    const targetEl = targetContainerRef?.current;

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
      velocityRef.current = Math.min(45, velocityRef.current + delta * 0.22);
    };

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    let animationFrameId: number;

    const update = () => {
      frameCounterRef.current++;

      // Smooth rapid decay
      velocityRef.current *= 0.70;
      if (velocityRef.current < 0.1) velocityRef.current = 0;

      // Idle spontaneous micro-glitch trigger (every 5-8 seconds, 1-2 frames)
      idleTimerRef.current++;
      if (idleTimerRef.current > 320 + Math.random() * 200) {
        idleBurstRef.current = Math.floor(Math.random() * 2 + 1);
        idleTimerRef.current = 0;
      }

      let intensity = 0;
      let isGlitching = false;

      if (velocityRef.current > 1.6) {
        isGlitching = true;
        intensity = Math.min(1, velocityRef.current / 22);
      } else if (idleBurstRef.current > 0) {
        isGlitching = true;
        intensity = Math.random() * 0.25 + 0.2;
        idleBurstRef.current--;
      }

      // ── 1. Update SVG Real Geometric Content Distortion & RGB Matrix Split (Calm & Soft) ──
      const turb = turbRef.current;
      const disp = dispRef.current;
      const offR = offRedRef.current;
      const offG = offGreenRef.current;
      const offB = offBlueRef.current;

      if (targetEl) {
        if (isGlitching) {
          targetEl.style.filter = 'url(#combined-glitch-filter)';

          const scale = Math.floor(intensity * 5 + 1.2); // 1.2px - 6.2px gentle displacement
          const dxRed = -Math.round(intensity * 1.8 + 0.6); // -0.6px to -2.4px subtle red shift
          const dxBlue = Math.round(intensity * 1.8 + 0.6); // +0.6px to +2.4px subtle blue shift
          const dxGreen = 0;
          const freqY = (Math.random() * 0.10 + 0.03).toFixed(3);

          if (turb) turb.setAttribute('baseFrequency', `0.00001 ${freqY}`);
          if (disp) disp.setAttribute('scale', scale.toString());
          if (offR) offR.setAttribute('dx', dxRed.toString());
          if (offB) offB.setAttribute('dx', dxBlue.toString());
          if (offG) offG.setAttribute('dx', dxGreen.toString());
        } else {
          targetEl.style.filter = 'none';
        }
      }

      // ── 2. Update Full-Screen Elongated Sliced Horizontal RGB Strips (Guaranteed Clean Clearance) ──
      if (isGlitching) {
        if (frameCounterRef.current % 3 === 0 || !slicesActiveRef.current) {
          const sliceCount = Math.floor(intensity * 1.5) + 1; // 1-2 thin slices
          const newSlices: GlitchSlice[] = [];

          for (let i = 0; i < sliceCount; i++) {
            const top = Math.random() * 96; // %
            const height = Math.random() * 1.8 + 0.5; // % (0.5% - 2.3% very thin strips)
            const maxDx = intensity * 6 + 1.5; // px (1.5px - 7.5px gentle shift)
            const dx = (Math.random() - 0.5) * maxDx * 2;
            const opacity = Math.random() * 0.06 * intensity + 0.04; // 4% - 10% delicate opacity

            newSlices.push({
              id: Math.random(),
              top,
              height,
              offsetRed: dx * 1.1,
              offsetGreen: -dx * 0.5,
              offsetBlue: dx * 0.9,
              offsetSource: dx * 0.3,
              opacity,
            });
          }

          setSlices(newSlices);
          slicesActiveRef.current = true;
        }
      } else {
        if (slicesActiveRef.current) {
          setSlices([]);
          slicesActiveRef.current = false;
        }
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
      if (targetEl) {
        targetEl.style.filter = 'none';
      }
    };
  }, [scrollContainerRef, targetContainerRef]);

  return (
    <>
      {/* ── 1. SVG Filter Definition for Real Geometric Content Distortion & RGB Split ── */}
      <svg
        className="absolute w-0 h-0 pointer-events-none opacity-0 overflow-hidden"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="combined-glitch-filter"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            filterUnits="userSpaceOnUse"
          >
            {/* Procedural Noise Distortion */}
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.00001 0.05"
              numOctaves="1"
              result="warpNoise"
            />

            {/* Geometric Y-Axis Content Displacement */}
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="warpNoise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />

            {/* RGB Channel Separation Matrix */}
            <feColorMatrix
              in="displaced"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="redChannel"
            />
            <feOffset ref={offRedRef} in="redChannel" dx="-3" dy="0" result="redShifted" />

            <feColorMatrix
              in="displaced"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="greenChannel"
            />
            <feOffset ref={offGreenRef} in="greenChannel" dx="0" dy="0" result="greenShifted" />

            <feColorMatrix
              in="displaced"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blueChannel"
            />
            <feOffset ref={offBlueRef} in="blueChannel" dx="3" dy="0" result="blueShifted" />

            {/* Blend Channels with Screen Recomposition */}
            <feBlend in="redShifted" in2="greenShifted" mode="screen" result="rgBlend" />
            <feBlend in="rgBlend" in2="blueShifted" mode="screen" result="finalGlitch" />
          </filter>
        </defs>
      </svg>

      {/* ── 2. Full-Screen Elongated Sliced Horizontal RGB Strips (Over Entire Viewport) ── */}
      {slices.length > 0 && (
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
              {/* Full-Width Red Chromatic Channel */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  transform: `translateX(${slice.offsetRed}px)`,
                  background: `linear-gradient(90deg, rgba(255, 34, 68, ${slice.opacity * 0.95}) 0%, rgba(255, 34, 68, ${slice.opacity * 0.6}) 100%)`,
                  mixBlendMode: 'screen',
                }}
              />

              {/* Full-Width Limegreen Channel */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  transform: `translateX(${slice.offsetGreen}px)`,
                  background: `linear-gradient(90deg, rgba(0, 230, 90, ${slice.opacity * 0.85}) 0%, rgba(0, 230, 90, ${slice.opacity * 0.5}) 100%)`,
                  mixBlendMode: 'screen',
                }}
              />

              {/* Full-Width Electric Blue Channel */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  transform: `translateX(${slice.offsetBlue}px)`,
                  background: `linear-gradient(90deg, rgba(20, 88, 230, ${slice.opacity}) 0%, rgba(0, 140, 255, ${slice.opacity * 0.65}) 100%)`,
                  mixBlendMode: 'screen',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

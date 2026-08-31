'use client';

import React, { useEffect, useRef } from 'react';

interface TrueGlitchFilterProps {
  targetContainerRef: React.RefObject<HTMLElement | null>;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

export default function TrueGlitchFilter({
  targetContainerRef,
  scrollContainerRef,
}: TrueGlitchFilterProps) {
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const offRedRef = useRef<SVGFEOffsetElement | null>(null);
  const offGreenRef = useRef<SVGFEOffsetElement | null>(null);
  const offBlueRef = useRef<SVGFEOffsetElement | null>(null);

  const velocityRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const idleTimerRef = useRef(0);
  const idleBurstRef = useRef(0);

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

      // Increase velocity on rapid scroll
      velocityRef.current = Math.min(60, velocityRef.current + delta * 0.35);
    };

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    let animationFrameId: number;

    const update = () => {
      // Rapid decay of velocity
      velocityRef.current *= 0.72;
      if (velocityRef.current < 0.1) velocityRef.current = 0;

      // Idle random geometric micro-glitch (1 frame blip every 6-10 seconds)
      idleTimerRef.current++;
      if (idleTimerRef.current > 360 + Math.random() * 240) {
        idleBurstRef.current = Math.floor(Math.random() * 2 + 1); // 1-2 frames
        idleTimerRef.current = 0;
      }

      let isGlitching = false;
      let intensity = 0;

      if (velocityRef.current > 1.1) {
        isGlitching = true;
        intensity = Math.min(1, velocityRef.current / 20);
      } else if (idleBurstRef.current > 0) {
        isGlitching = true;
        intensity = Math.random() * 0.4 + 0.35;
        idleBurstRef.current--;
      }

      const turb = turbRef.current;
      const disp = dispRef.current;
      const offR = offRedRef.current;
      const offG = offGreenRef.current;
      const offB = offBlueRef.current;

      if (targetEl) {
        if (isGlitching) {
          targetEl.style.filter = 'url(#true-glitch-filter)';

          const scale = Math.floor(intensity * 9 + 2.5); // 2.5px to 11.5px geometric displacement (1.5x stronger)
          const dxRed = -Math.round(intensity * 3.3 + 1.2); // -1.2px to -4.5px red shift (1.5x stronger)
          const dxBlue = Math.round(intensity * 3.3 + 1.2); // +1.2px to +4.5px blue shift (1.5x stronger)
          const dxGreen = 0;
          const freqY = (Math.random() * 0.10 + 0.03).toFixed(3);

          if (turb) turb.setAttribute('baseFrequency', `0.00001 ${freqY}`);
          if (disp) disp.setAttribute('scale', scale.toString());
          if (offR) offR.setAttribute('dx', dxRed.toString());
          if (offB) offB.setAttribute('dx', dxBlue.toString());
          if (offG) offG.setAttribute('dx', dxGreen.toString());
        } else {
          // Zero overhead in static state: completely remove filter
          targetEl.style.filter = 'none';
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
    <svg
      className="absolute w-0 h-0 pointer-events-none opacity-0 overflow-hidden"
      aria-hidden="true"
    >
      <defs>
        <filter
          id="true-glitch-filter"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          filterUnits="userSpaceOnUse"
        >
          {/* 1. Procedural Noise Distortion Map */}
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.00001 0.05"
            numOctaves="1"
            result="warpNoise"
          />

          {/* 2. Geometric Y-Axis Displacement of Content */}
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="warpNoise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          {/* 3. True RGB Color Separation Matrix */}
          {/* Red Channel Extraction */}
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

          {/* Green Channel Extraction */}
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

          {/* Blue Channel Extraction */}
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

          {/* 4. Chromatic Recomposition (Screen Blending) */}
          <feBlend in="redShifted" in2="greenShifted" mode="screen" result="rgBlend" />
          <feBlend in="rgBlend" in2="blueShifted" mode="screen" result="finalGlitch" />
        </filter>
      </defs>
    </svg>
  );
}

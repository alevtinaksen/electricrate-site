'use client';

import React, { useEffect, useRef } from 'react';

interface GlitchSlice {
  y: number;
  height: number;
  offset: number;
  color: string;
  alpha: number;
}

interface ScrollGlitchOverlayProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export default function ScrollGlitchOverlay({ scrollContainerRef }: ScrollGlitchOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const velocityRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);
  const idleTimerRef = useRef<number>(0);
  const idleGlitchActiveRef = useRef<boolean>(false);
  const idleGlitchFramesRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

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

      // Add to scroll velocity proportional to delta (capped at 50)
      velocityRef.current = Math.min(50, velocityRef.current + delta * 0.35);
    };

    targetElement.addEventListener('scroll', handleScroll, { passive: true });

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth inertia decay of scroll velocity
      velocityRef.current *= 0.88;
      if (velocityRef.current < 0.05) velocityRef.current = 0;

      // Idle spontaneous glitch trigger (rare micro-blips every 4-7 seconds)
      idleTimerRef.current++;
      if (idleTimerRef.current > 240 + Math.random() * 220) {
        idleGlitchActiveRef.current = true;
        idleGlitchFramesRef.current = Math.floor(Math.random() * 3 + 2); // 2-4 frames
        idleTimerRef.current = 0;
      }

      let isGlitching = false;
      let intensity = 0;

      if (velocityRef.current > 0.6) {
        isGlitching = true;
        intensity = Math.min(1, velocityRef.current / 22);
      } else if (idleGlitchActiveRef.current && idleGlitchFramesRef.current > 0) {
        isGlitching = true;
        intensity = Math.random() * 0.35 + 0.2;
        idleGlitchFramesRef.current--;
        if (idleGlitchFramesRef.current <= 0) {
          idleGlitchActiveRef.current = false;
        }
      }

      if (isGlitching && Math.random() < 0.88) {
        const sliceCount = Math.floor(intensity * 7) + 1;
        const slices: GlitchSlice[] = [];

        for (let i = 0; i < sliceCount; i++) {
          const sliceHeight = Math.random() * 24 + 3;
          const sliceY = Math.random() * (height - sliceHeight);
          const maxOffset = intensity * 24 + 4;
          const offset = (Math.random() - 0.5) * maxOffset * 2;
          const isBlue = Math.random() > 0.35;
          const color = isBlue ? '20, 88, 230' : '255, 60, 60';
          const alpha = Math.random() * 0.3 * intensity + 0.08;

          slices.push({
            y: sliceY,
            height: sliceHeight,
            offset,
            color,
            alpha,
          });
        }

        // Render chromatic RGB glitch slices
        slices.forEach((slice) => {
          // Horizontal chromatic bar
          ctx.fillStyle = `rgba(${slice.color}, ${slice.alpha})`;
          ctx.fillRect(0, slice.y, width, slice.height);

          // Fast horizontal white scan blip
          if (Math.random() > 0.45) {
            ctx.fillStyle = `rgba(255, 255, 255, ${slice.alpha * 0.9})`;
            const lineY = slice.y + Math.random() * slice.height;
            ctx.fillRect(0, lineY, width, 1.2);
          }

          // Scattered digital offset micro-block
          if (Math.random() > 0.35) {
            const blockW = Math.random() * 160 + 40;
            const blockX = Math.random() * (width - blockW);
            ctx.fillStyle = `rgba(255, 255, 255, ${slice.alpha * 0.75})`;
            ctx.fillRect(blockX, slice.y, blockW, Math.min(slice.height, 4));
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      targetElement.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollContainerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[46] w-full h-full select-none"
      style={{
        mixBlendMode: 'screen',
        opacity: 0.95,
      }}
    />
  );
}

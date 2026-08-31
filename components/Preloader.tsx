'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // If mobile (< 768px) or already seen in this session, skip immediately
    if (
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || sessionStorage.getItem('electricrate_preloader_seen'))
    ) {
      setIsFinished(true);
      onComplete?.();
      return;
    }

    // Smooth cinematic progress counter stopping at 99% to slide up
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          try {
            sessionStorage.setItem('electricrate_preloader_seen', '1');
          } catch {}
          setTimeout(() => {
            setIsFinished(true);
            onComplete?.();
          }, 120);
          return 99;
        }
        const jump = prev < 70 ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 7) + 3;
        return Math.min(prev + jump, 99);
      });
    }, 24);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="preloader-overlay"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-[#0d0d0d] text-white hidden md:flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden"
          style={{ fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace' }}
        >
          {/* Top Bar */}
          <div
            style={{ fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace' }}
            className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-white/60 w-full font-mono"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1458E6] animate-ping" />
              <span className="text-white">ВЛАД САПУНОВ</span>
            </div>
            <span className="hidden sm:inline">СЪЕМКА & МОНТАЖ</span>
            <span>2026</span>
          </div>

          {/* Bottom Counter spanning full width and aligned to the right edge */}
          <div className="flex flex-col gap-4 w-full mt-auto">
            <div className="flex justify-end items-baseline w-full">
              <span
                className="font-semibold uppercase tracking-tight text-white select-none flex items-baseline font-mono"
                style={{
                  fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                  fontSize: 'clamp(72px, 16vw, 200px)',
                  lineHeight: 0.85,
                  fontWeight: 600,
                  letterSpacing: '-2px',
                }}
              >
                {progress}
                <span
                  className="text-white/40 ml-2 font-mono"
                  style={{
                    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                    fontSize: 'clamp(24px, 4vw, 48px)',
                    fontWeight: 600,
                  }}
                >
                  %
                </span>
              </span>
            </div>

            {/* Edge-to-Edge Progress Bar Line across entire screen width */}
            <div className="fixed bottom-0 left-0 right-0 w-screen h-[4px] bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-[#1458E6]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

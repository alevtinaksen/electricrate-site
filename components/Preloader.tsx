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
    // Smooth, realistic cinematic progress increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFinished(true);
            onComplete?.();
          }, 350);
          return 100;
        }
        // Accelerate near the end
        const jump = prev < 60 ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + jump, 100);
      });
    }, 28);

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
          className="fixed inset-0 z-[9999] bg-[#0d0d0d] text-white font-mono flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-white/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1458E6] animate-ping" />
              <span className="text-white">ВЛАД САПУНОВ</span>
            </div>
            <span>СЪЕМКА & МОНТАЖ</span>
            <span>2026</span>
          </div>

          {/* Center Brand Monogram */}
          <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-xs sm:text-sm tracking-[0.3em] uppercase text-white/40 font-semibold text-center"
            >
              PORTFOLIO SHOWCASE
            </motion.div>
          </div>

          {/* Bottom Counter & Minimal Progress Line */}
          <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase text-[#8C8E96] tracking-wider">
                LOADING EXPERIENCE
              </span>
              <span
                className="font-bold tracking-tight text-white"
                style={{
                  fontSize: 'clamp(48px, 10vw, 120px)',
                  lineHeight: 0.9,
                }}
              >
                {progress}
                <span className="text-xs sm:text-lg font-normal text-white/40 ml-1">%</span>
              </span>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
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

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [dotCount, setDotCount] = useState(1);

  // Dynamic cycling animated dots (. -> .. -> ...)
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 280);
    return () => clearInterval(dotInterval);
  }, []);

  // Smooth realistic progress counter
  useEffect(() => {
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
        const jump = prev < 70 ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 6) + 3;
        return Math.min(prev + jump, 100);
      });
    }, 32);

    return () => clearInterval(interval);
  }, [onComplete]);

  const dots = '.'.repeat(dotCount);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-[#0d0d0d] text-white flex flex-col items-center justify-center select-none overflow-hidden"
          style={{ fontFamily: '"Geist Mono", monospace' }}
        >
          {/* Centered Minimal Container in the style of Hobro */}
          <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[280px] sm:max-w-[360px]">
            {/* Number with dynamic updating dots: e.g. "42..." */}
            <div className="flex items-baseline justify-center font-mono font-bold text-white text-[20px] sm:text-[24px] tracking-tight h-[32px]">
              <span>{progress}</span>
              <span className="text-[#1458E6] text-base sm:text-lg font-normal ml-0.5">%</span>
              <span className="inline-block w-[24px] text-left text-white/70 ml-1">
                {dots}
              </span>
            </div>

            {/* Centered Blue Progress Line */}
            <div className="w-full h-[2px] sm:h-[3px] bg-white/10 rounded-full overflow-hidden relative">
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

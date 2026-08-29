'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Language } from '@/types';
import { ServicesContent, DEFAULT_SERVICES } from '@/lib/supabase';

interface ProcessSectionProps {
  lang: Language;
  containerRef?: React.RefObject<HTMLElement | null>;
  services?: ServicesContent;
}

export default function ProcessSection({
  lang,
  containerRef,
  services = DEFAULT_SERVICES,
}: ProcessSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Bind scroll to the parent container
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ['start start', 'end end'],
  });

  // ─── 4 Solid Cards Pure Slide-in (Completely hidden at progress 0, rises as user scrolls) ───
  const card1Y = useTransform(scrollYProgress, [0.06, 0.28], [1400, 0]);
  const card2Y = useTransform(scrollYProgress, [0.28, 0.50], [1400, 0]);
  const card3Y = useTransform(scrollYProgress, [0.50, 0.72], [1400, 0]);
  const card4Y = useTransform(scrollYProgress, [0.72, 0.94], [1400, 0]);

  const cards = services.cards || DEFAULT_SERVICES.cards;
  const card1 = cards[0] || DEFAULT_SERVICES.cards[0];
  const card2 = cards[1] || DEFAULT_SERVICES.cards[1];
  const card3 = cards[2] || DEFAULT_SERVICES.cards[2];
  const card4 = cards[3] || DEFAULT_SERVICES.cards[3];

  const headline =
    lang === 'ru'
      ? services.headline_ru || DEFAULT_SERVICES.headline_ru
      : services.headline_en || DEFAULT_SERVICES.headline_en;

  return (
    <div
      ref={sectionRef}
      id="services"
      className="relative w-full h-[400vh] font-mono select-none bg-transparent"
    >
      {/* ── Fixed Fullscreen Stage (Transparent background matching site #0d0d0d) ── */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
        {/* ── Background Giant H1 (Pinned behind the cards, left aligned / center) ── */}
        <div className="absolute inset-0 flex items-center justify-center text-center z-0 pointer-events-none p-4">
          <h1
            className="font-mono uppercase font-semibold text-center select-none text-white tracking-[-2.56px] whitespace-pre-line"
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: 'clamp(44px, 7.5vw, 128px)',
              fontWeight: 600,
              lineHeight: '90%',
              letterSpacing: '-2.56px',
              color: '#FFFFFF',
            }}
          >
            {headline}
          </h1>
        </div>

        {/* ── Cards Interactive Stacking Deck Layer (Fullscreen bounds) ── */}
        <div className="relative w-full max-w-[964px] h-screen flex items-center justify-center pointer-events-auto overflow-hidden">
          {/* ── Card 1: Pinned strictly to Left-0 Top-0, z-10 ── */}
          <motion.div
            style={{
              y: card1Y,
              zIndex: 10,
              padding: '24px',
              backgroundColor: card1.bg_color || '#1458E6',
              color: card1.text_color || '#FFFFFF',
            }}
            className="absolute left-0 top-0 w-[539px] max-w-[85vw] h-[480px] sm:h-[506px] flex flex-col justify-between items-start rounded-none shadow-none"
          >
            {/* Top text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
              {lang === 'ru' ? card1.top_text_ru : card1.top_text_en}
            </div>

            {/* Center title */}
            <h2
              className="font-mono font-semibold uppercase text-center w-full my-2 tracking-[-2.56px] whitespace-pre-line"
              style={{
                fontSize: 'clamp(56px, 9vw, 128px)',
                lineHeight: '90%',
              }}
            >
              {lang === 'ru' ? card1.title_ru : card1.title_en}
            </h2>

            {/* Bottom text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase max-w-[326px] whitespace-pre-line">
              {lang === 'ru' ? card1.bottom_text_ru : card1.bottom_text_en}
            </div>
          </motion.div>

          {/* ── Card 2: Pinned to Right-0, z-20 ── */}
          <motion.div
            style={{
              y: card2Y,
              zIndex: 20,
              padding: '24px',
              backgroundColor: card2.bg_color || '#FFFFFF',
              color: card2.text_color || '#1458E6',
            }}
            className="absolute right-0 top-[60px] sm:top-[80px] w-[446px] max-w-[85vw] h-[480px] sm:h-[506px] flex flex-col justify-between items-start rounded-none shadow-none"
          >
            {/* Top text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
              {lang === 'ru' ? card2.top_text_ru : card2.top_text_en}
            </div>

            {/* Center title */}
            <h2
              className="font-mono font-semibold uppercase text-center w-full my-2 tracking-[-2.56px] whitespace-pre-line"
              style={{
                fontSize: 'clamp(44px, 6.5vw, 64px)',
                lineHeight: '90%',
              }}
            >
              {lang === 'ru' ? card2.title_ru : card2.title_en}
            </h2>

            {/* Bottom text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase max-w-[326px] whitespace-pre-line">
              {lang === 'ru' ? card2.bottom_text_ru : card2.bottom_text_en}
            </div>
          </motion.div>

          {/* ── Card 3: Center, z-30 ── */}
          <motion.div
            style={{
              y: card3Y,
              zIndex: 30,
              padding: '24px',
              backgroundColor: card3.bg_color || '#1E1E22',
              color: card3.text_color || '#FFFFFF',
            }}
            className="absolute left-[80px] sm:left-[140px] lg:left-[200px] top-[140px] sm:top-[170px] w-[539px] max-w-[85vw] h-[480px] sm:h-[506px] flex flex-col justify-between items-start rounded-none shadow-none"
          >
            {/* Top text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
              {lang === 'ru' ? card3.top_text_ru : card3.top_text_en}
            </div>

            {/* Center title */}
            <h2
              className="font-mono font-semibold uppercase text-center w-full my-2 tracking-[-2.56px] whitespace-pre-line"
              style={{
                fontSize: 'clamp(42px, 6.5vw, 64px)',
                lineHeight: '90%',
              }}
            >
              {lang === 'ru' ? card3.title_ru : card3.title_en}
            </h2>

            {/* Bottom text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase max-w-[326px] whitespace-pre-line">
              {lang === 'ru' ? card3.bottom_text_ru : card3.bottom_text_en}
            </div>
          </motion.div>

          {/* ── Card 4: Pinned to Bottom-0 and Right-0, z-40 ── */}
          <motion.div
            style={{
              y: card4Y,
              zIndex: 40,
              padding: '24px',
              backgroundColor: card4.bg_color || '#1458E6',
              color: card4.text_color || '#FFFFFF',
            }}
            className="absolute right-0 bottom-0 w-[640px] max-w-[92vw] h-[480px] sm:h-[506px] flex flex-col justify-between items-start rounded-none shadow-none"
          >
            {/* Top text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
              {lang === 'ru' ? card4.top_text_ru : card4.top_text_en}
            </div>

            {/* Center title */}
            <h2
              className="font-mono font-semibold uppercase text-center w-full my-2 tracking-[-2.56px] whitespace-pre-line"
              style={{
                fontSize: 'clamp(56px, 9vw, 128px)',
                lineHeight: '90%',
              }}
            >
              {lang === 'ru' ? card4.title_ru : card4.title_en}
            </h2>

            {/* Bottom text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase max-w-[326px] whitespace-pre-line">
              {lang === 'ru' ? card4.bottom_text_ru : card4.bottom_text_en}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

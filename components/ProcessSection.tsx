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
    <div id="services" className="w-full">
      {/* ── MOBILE VERSION (< 768px): Full-width cards stacked vertically with gap-0, no animation, equal title size ── */}
      <div className="block md:hidden w-full font-mono flex flex-col gap-0 pt-4 pb-12">
        {/* Mobile Header Headline — exactly 2 lines matching screenshot */}
        <h2
          className="font-mono uppercase font-semibold text-center text-white tracking-[-1px] px-2 leading-[100%] whitespace-pre-line m-0"
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 'clamp(22px, 6.4vw, 38px)',
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          {headline}
        </h2>

        {/* Exact 48px gap between headline and first service card */}
        <div className="h-[48px] w-full shrink-0" />

        {/* 4 Full-Width Cards Stacked with gap-0 */}
        <div className="w-full flex flex-col gap-0">
          {cards.map((card, idx) => {
            const topText = lang === 'ru' ? card.top_text_ru : card.top_text_en;
            const cardTitle = lang === 'ru' ? card.title_ru : card.title_en;
            const bottomText = lang === 'ru' ? card.bottom_text_ru : card.bottom_text_en;

            return (
              <div
                key={card.id || `mob-card-${idx}`}
                style={{
                  padding: '20px 20px',
                  backgroundColor: card.bg_color || (idx === 0 || idx === 3 ? '#1458E6' : idx === 1 ? '#FFFFFF' : '#1E1E22'),
                  color: card.text_color || (idx === 1 ? '#1458E6' : '#FFFFFF'),
                }}
                className="w-full flex flex-col justify-between items-start rounded-none shrink-0"
              >
                {/* 1. Card Title: 32px font size, single line */}
                <h3
                  className="font-mono font-semibold uppercase text-left w-full tracking-[-1px] text-[clamp(24px,7.5vw,32px)] leading-[90%]"
                  style={{
                    fontFamily: '"Geist Mono", monospace',
                    fontWeight: 600,
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {cardTitle}
                </h3>

                {/* 2. Exact 52px gap between title and bottom texts */}
                <div className="h-[52px] w-full shrink-0" />

                {/* 3. Bottom Texts Container (two texts with 8px gap, stretched full width, bottom text has 40% opacity) */}
                <div className="w-full flex flex-col gap-[8px]">
                  {/* First text (top text from desktop card) */}
                  <p className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase w-full m-0 whitespace-pre-line">
                    {topText}
                  </p>

                  {/* Second text (bottom text with opacity-40) */}
                  <p className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase w-full m-0 whitespace-pre-line opacity-40">
                    {bottomText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP VERSION (>= 768px): Preserved exact stacking deck with scroll pinning ── */}
      <div
        ref={sectionRef}
        className="hidden md:block relative w-full h-[400vh] font-mono bg-transparent isolate"
      >
        {/* ── Fixed Fullscreen Stage (Transparent background matching site #0d0d0d) ── */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
          {/* ── Background Giant H1 (Pinned behind the cards, left aligned / center) ── */}
          <div className="absolute inset-0 flex items-center justify-center text-center z-0 pointer-events-none p-4">
            <h1
              className="font-mono uppercase font-semibold text-center text-white tracking-[-2.56px] whitespace-pre-line"
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
                className="font-mono font-semibold uppercase text-center w-full my-auto tracking-[-2.56px] whitespace-pre-line"
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

            {/* ── Card 2: Left-aligned at boundary of СЪЕМКА, z-20 (White Card) ── */}
            <motion.div
              style={{
                y: card2Y,
                zIndex: 20,
                padding: '24px',
                backgroundColor: card2.bg_color || '#FFFFFF',
                color: card2.text_color || '#1458E6',
              }}
              className="absolute left-[130px] sm:left-[165px] top-[110px] sm:top-[130px] w-[500px] max-w-[85vw] h-[480px] sm:h-[506px] flex flex-col justify-between items-start rounded-none shadow-none"
            >
              {/* Top text */}
              <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
                {lang === 'ru' ? card2.top_text_ru : card2.top_text_en}
              </div>

              {/* Center title (Centered horizontally and vertically) */}
              <h2
                className="font-mono font-semibold uppercase text-center w-full my-auto tracking-[-2.56px] whitespace-pre-line"
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

            {/* ── Card 3: Pinned strictly to Right-0, showing ПОЛНЫЙ, z-30 (Black Card) ── */}
            <motion.div
              style={{
                y: card3Y,
                zIndex: 30,
                padding: '24px',
                backgroundColor: card3.bg_color || '#1E1E22',
                color: card3.text_color || '#FFFFFF',
              }}
              className="absolute right-0 top-[150px] sm:top-[170px] w-[539px] max-w-[85vw] h-[480px] sm:h-[506px] flex flex-col justify-between items-start rounded-none shadow-none"
            >
              {/* Top text */}
              <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
                {lang === 'ru' ? card3.top_text_ru : card3.top_text_en}
              </div>

              {/* Center title (Centered horizontally and vertically) */}
              <h2
                className="font-mono font-semibold uppercase text-center w-full my-auto tracking-[-2.56px] whitespace-pre-line"
                style={{
                  fontSize: 'clamp(44px, 6.5vw, 68px)',
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
                className="font-mono font-semibold uppercase text-center w-full my-auto tracking-[-2.56px] whitespace-pre-line"
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
    </div>
  );
}

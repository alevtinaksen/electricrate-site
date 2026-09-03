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
      {/* ── MOBILE & TABLET VERSION (< 1280px): Full-width cards stacked vertically with gap-0, no animation ── */}
      <div className="block xl:hidden w-full font-mono flex flex-col gap-0 pt-4 pb-12">
        {/* Mobile Header Headline — slightly larger, exactly 2 lines */}
        <h2
          className="font-mono uppercase font-semibold text-center text-white tracking-[-1.5px] px-2 leading-[96%] whitespace-pre-line m-0"
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: 'clamp(26px, 7.6vw, 42px)',
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
                  padding: '24px 20px',
                  backgroundColor: card.bg_color || (idx === 0 || idx === 3 ? '#1458E6' : idx === 1 ? '#FFFFFF' : '#1E1E22'),
                  color: card.text_color || (idx === 1 ? '#1458E6' : '#FFFFFF'),
                }}
                className="w-full flex flex-col justify-between items-start rounded-none shrink-0"
              >
                {/* 1. Card Title */}
                <h3
                  className="font-mono font-semibold uppercase text-left w-full tracking-[-1px] text-[24px] sm:text-[28px] md:text-[32px] leading-[90%]"
                  style={{
                    fontFamily: '"Geist Mono", monospace',
                    fontWeight: 600,
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {cardTitle}
                </h3>

                {/* 2. Extra 40px spacing between title and bottom texts (exact ~90-100px gap) */}
                <div className="h-[90px] sm:h-[100px] md:h-[110px] w-full shrink-0" />

                {/* 3. Bottom Texts Container */}
                <div className="w-full flex flex-col gap-[8px]">
                  {topText && (
                    <p
                      className="font-mono uppercase font-bold text-left m-0 text-[13px] sm:text-[15px] leading-[120%]"
                      style={{
                        fontFamily: '"Geist Mono", monospace',
                      }}
                    >
                      {topText}
                    </p>
                  )}
                  {bottomText && (
                    <p
                      className="font-mono uppercase font-bold text-left m-0 text-[13px] sm:text-[15px] leading-[120%] opacity-40"
                      style={{
                        fontFamily: '"Geist Mono", monospace',
                      }}
                    >
                      {bottomText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP SCROLL PROGRESSION PINNED CONTAINER (>= 1280px) ── */}
      <div
        ref={sectionRef}
        className="hidden xl:block relative w-full h-[400vh] font-mono bg-transparent isolate"
      >
        {/* ── Fixed Fullscreen Stage (Transparent background matching site #0d0d0d) ── */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
          {/* ── Background Giant H1 (Pinned behind the cards, center) ── */}
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

          {/* ── Cards Interactive Stacking Deck Layer (Centered on any viewport height) ── */}
          <div className="relative w-full max-w-[964px] 2xl:max-w-[1150px] h-[580px] flex items-center justify-center pointer-events-auto">
            {/* ── Card 1: Pinned to Left-0 Top-0, z-10 ── */}
            <motion.div
              style={{
                y: card1Y,
                zIndex: 10,
                padding: '28px',
                backgroundColor: card1.bg_color || '#1458E6',
                color: card1.text_color || '#FFFFFF',
              }}
              className="absolute left-0 top-0 w-[520px] 2xl:w-[580px] max-w-[85vw] h-[460px] 2xl:h-[490px] flex flex-col justify-between items-start rounded-none shadow-none"
            >
              <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
                {lang === 'ru' ? card1.top_text_ru : card1.top_text_en}
              </div>

              <h2
                className="font-mono font-semibold uppercase text-center w-full my-auto tracking-[-2.56px] whitespace-pre-line"
                style={{
                  fontSize: 'clamp(52px, 8vw, 110px)',
                  lineHeight: '90%',
                }}
              >
                {lang === 'ru' ? card1.title_ru : card1.title_en}
              </h2>

              <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase max-w-[326px] whitespace-pre-line">
                {lang === 'ru' ? card1.bottom_text_ru : card1.bottom_text_en}
              </div>
            </motion.div>

            {/* ── Card 2: Left-aligned, top-35px, z-20 (White Card) ── */}
            <motion.div
              style={{
                y: card2Y,
                zIndex: 20,
                padding: '28px',
                backgroundColor: card2.bg_color || '#FFFFFF',
                color: card2.text_color || '#1458E6',
              }}
              className="absolute left-[60px] 2xl:left-[90px] top-[35px] w-[500px] 2xl:w-[560px] max-w-[85vw] h-[460px] 2xl:h-[490px] flex flex-col justify-between items-start rounded-none shadow-none"
            >
              <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
                {lang === 'ru' ? card2.top_text_ru : card2.top_text_en}
              </div>

              <h2
                className="font-mono font-semibold uppercase text-center w-full my-auto tracking-[-2.56px] whitespace-pre-line"
                style={{
                  fontSize: 'clamp(40px, 6vw, 60px)',
                  lineHeight: '90%',
                }}
              >
                {lang === 'ru' ? card2.title_ru : card2.title_en}
              </h2>

              <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase max-w-[326px] whitespace-pre-line">
                {lang === 'ru' ? card2.bottom_text_ru : card2.bottom_text_en}
              </div>
            </motion.div>

            {/* ── Card 3: Right-aligned, top-70px, z-30 (Black Card) ── */}
            <motion.div
              style={{
                y: card3Y,
                zIndex: 30,
                padding: '28px',
                backgroundColor: card3.bg_color || '#1E1E22',
                color: card3.text_color || '#FFFFFF',
              }}
              className="absolute right-[40px] 2xl:right-[60px] top-[70px] w-[520px] 2xl:w-[580px] max-w-[85vw] h-[460px] 2xl:h-[490px] flex flex-col justify-between items-start rounded-none shadow-none"
            >
              <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
                {lang === 'ru' ? card3.top_text_ru : card3.top_text_en}
              </div>

              <h2
                className="font-mono font-semibold uppercase text-center w-full my-auto tracking-[-2.56px] whitespace-pre-line"
                style={{
                  fontSize: 'clamp(40px, 6vw, 64px)',
                  lineHeight: '90%',
                }}
              >
                {lang === 'ru' ? card3.title_ru : card3.title_en}
              </h2>

              <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase max-w-[326px] whitespace-pre-line">
                {lang === 'ru' ? card3.bottom_text_ru : card3.bottom_text_en}
              </div>
            </motion.div>

            {/* ── Card 4: Right-0, top-105px, z-40 ── */}
            <motion.div
              style={{
                y: card4Y,
                zIndex: 40,
                padding: '28px',
                backgroundColor: card4.bg_color || '#1458E6',
                color: card4.text_color || '#FFFFFF',
              }}
              className="absolute right-0 top-[105px] w-[560px] 2xl:w-[620px] max-w-[92vw] h-[460px] 2xl:h-[490px] flex flex-col justify-between items-start rounded-none shadow-none"
            >
              <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] lowercase whitespace-pre-line">
                {lang === 'ru' ? card4.top_text_ru : card4.top_text_en}
              </div>

              <h2
                className="font-mono font-semibold uppercase text-center w-full my-auto tracking-[-2.56px] whitespace-pre-line"
                style={{
                  fontSize: 'clamp(52px, 8vw, 110px)',
                  lineHeight: '90%',
                }}
              >
                {lang === 'ru' ? card4.title_ru : card4.title_en}
              </h2>

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

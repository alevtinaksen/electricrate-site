'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Language } from '@/types';
import { AboutContent, DEFAULT_ABOUT } from '@/lib/supabase';

interface AboutSectionProps {
  lang: Language;
  about?: AboutContent;
}

// Masked slide-up line animation
function MaskedLine({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden block ${className}`}>
      <motion.div
        initial={{ y: '110%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1], // easeOutExpo
          delay,
        }}
        className="block"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function AboutSection({
  lang,
  about = DEFAULT_ABOUT,
}: AboutSectionProps) {
  const isRu = lang === 'ru';
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax transforms for photo and typography layers
  const photoY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const topTextY = useTransform(scrollYProgress, [0, 1], ['20px', '-40px']);
  const bottomTextY = useTransform(scrollYProgress, [0, 1], ['40px', '-20px']);

  const topTextRaw = isRu
    ? about.top_text_ru || DEFAULT_ABOUT.top_text_ru
    : about.top_text_en || DEFAULT_ABOUT.top_text_en;

  const bottomTextRaw = isRu
    ? about.bottom_text_ru || DEFAULT_ABOUT.bottom_text_ru
    : about.bottom_text_en || DEFAULT_ABOUT.bottom_text_en;

  // Split lines if multiline or break by sensible chunks
  const topLines = topTextRaw.includes('\n')
    ? topTextRaw.split('\n')
    : isRu
    ? [
        'Я —',
        'ВИДЕОМЕЙКЕР',
        'ИЗ',
        'ПЕТЕРБУРГА.',
        'В ЭТОЙ',
        'СФЕРЕ',
        'БОЛЬШЕ 10',
        'ЛЕТ.',
      ]
    : [
        'I AM A',
        'VIDEOMAKER',
        'FROM',
        'ST. PETERSBURG.',
        'IN THIS',
        'FIELD',
        'FOR OVER 10',
        'YEARS.',
      ];

  const bottomLines = bottomTextRaw.includes('\n')
    ? bottomTextRaw.split('\n')
    : isRu
    ? [
        'РАБОТАЮ',
        'В РАЗНЫХ',
        'СФЕРАХ :',
        'ПРОМЫШЛЕННОСТЬ,',
        'ЮРИСТЫ,',
        'НЕДВИЖИМОСТЬ,',
        'HORECA, СПОРТ.',
      ]
    : [
        'WORKING',
        'IN VARIOUS',
        'SPHERES :',
        'INDUSTRY,',
        'LEGAL,',
        'REAL ESTATE,',
        'HORECA, SPORT.',
      ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full max-w-[1020px] min-h-[110vh] py-20 lg:py-28 relative flex flex-col justify-between select-none font-mono text-white overflow-hidden"
    >
      {/* ── Background Vlad Portrait (Stretches across entire right side with parallax) ── */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[75%] lg:w-[65%] h-full pointer-events-none z-0 overflow-hidden flex items-center justify-end">
        <motion.div
          style={{ y: photoY }}
          className="relative w-full h-[120%] -top-[10%]"
        >
          <img
            src={about.photo_url || '/vlad-portrait.jpg'}
            alt="Влад Сапунов"
            className="w-full h-full object-cover object-center filter grayscale-[15%] contrast-110"
          />
          {/* Deep cinematic fade into site background #0d0d0d */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-[#0d0d0d]" />
        </motion.div>
      </div>

      {/* ── Top-Left Editorial Typography with Parallax & Masked Reveal ── */}
      <motion.div
        style={{ y: topTextY }}
        className="relative z-20 flex flex-col items-start text-left max-w-2xl"
      >
        <h2
          className="font-mono uppercase font-semibold text-white tracking-[-1.5px]"
          style={{
            fontSize: 'clamp(34px, 5.5vw, 78px)',
            lineHeight: '92%',
          }}
        >
          {topLines.map((line, idx) => (
            <MaskedLine key={`top-${idx}`} delay={idx * 0.06}>
              <span>{line}</span>
            </MaskedLine>
          ))}
        </h2>
      </motion.div>

      {/* Spacer for scroll depth */}
      <div className="h-[20vh] w-full" />

      {/* ── Bottom-Right Editorial Typography with Parallax & Masked Reveal ── */}
      <motion.div
        style={{ y: bottomTextY }}
        className="relative z-20 flex flex-col items-end text-right w-full"
      >
        <h2
          className="font-mono uppercase font-semibold text-white tracking-[-1.5px] flex flex-col items-end"
          style={{
            fontSize: 'clamp(34px, 5.5vw, 78px)',
            lineHeight: '92%',
          }}
        >
          {bottomLines.map((line, idx) => (
            <MaskedLine key={`bottom-${idx}`} delay={0.15 + idx * 0.06}>
              <span>{line}</span>
            </MaskedLine>
          ))}
        </h2>
      </motion.div>
    </section>
  );
}

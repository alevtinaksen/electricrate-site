'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Language } from '@/types';
import { AboutContent, DEFAULT_ABOUT } from '@/lib/supabase';

interface AboutSectionProps {
  lang: Language;
  about?: AboutContent;
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

  // Smooth subtle vertical parallax for portrait
  const photoY = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);

  const topTextRaw = isRu
    ? about.top_text_ru || DEFAULT_ABOUT.top_text_ru
    : about.top_text_en || DEFAULT_ABOUT.top_text_en;

  const bottomTextRaw = isRu
    ? about.bottom_text_ru || DEFAULT_ABOUT.bottom_text_ru
    : about.bottom_text_en || DEFAULT_ABOUT.bottom_text_en;

  // Split lines if formatted with newlines or provide exact fallback
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
        'FILMMAKER',
        'FROM',
        'ST. PETERSBURG.',
        'IN THIS',
        'INDUSTRY',
        'OVER 10',
        'YEARS.',
      ];

  const bottomLines = bottomTextRaw.includes('\n')
    ? bottomTextRaw.split('\n')
    : isRu
    ? [
        'РАБОТАЮ',
        'В РАЗНЫХ',
        'СФЕРАХ:',
        'ПРОМЫШЛЕННОСТЬ,',
        'ЮРИСТЫ,',
        'НЕДВИЖИМОСТЬ,',
        'HORECA, СПОРТ.',
      ]
    : [
        'WORKING',
        'ACROSS',
        'INDUSTRIES:',
        'INDUSTRIAL,',
        'LEGAL,',
        'REAL ESTATE,',
        'HORECA, SPORT.',
      ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full max-w-[964px] mx-auto bg-[#0D0D0E] overflow-hidden flex flex-col p-6 sm:p-10 lg:p-12 select-none font-mono text-white"
      style={{ fontFamily: '"Geist Mono", monospace' }}
    >
      {/* ── Top-Left Typography Block ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-start text-left max-w-[420px]"
      >
        <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] leading-[1.05] tracking-[-1px] text-white font-bold text-left uppercase m-0 p-0 whitespace-pre-line">
          {topLines.map((line, idx) => (
            <span key={`top-${idx}`} className="block">
              {line}
            </span>
          ))}
        </h2>
      </motion.div>

      {/* ── Vlad Portrait (Stretches full width of right side, height adapts naturally) ── */}
      <motion.div
        style={{ y: photoY }}
        className="w-full sm:w-[65%] lg:w-[60%] self-end -mt-16 sm:-mt-24 z-0 flex items-center justify-end overflow-hidden pointer-events-none select-none"
      >
        <img
          src={about.photo_url || '/vlad-portrait.jpg'}
          alt="Влад Сапунов"
          style={{
            maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          }}
          className="w-full h-auto object-cover object-center"
        />
      </motion.div>

      {/* ── Bottom-Right Typography Block (Placed lower down below portrait) ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative z-10 self-end text-left max-w-[480px] mt-6 sm:mt-10"
      >
        <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] leading-[1.05] tracking-[-1px] text-white font-bold text-left uppercase m-0 p-0 whitespace-pre-line">
          {bottomLines.map((line, idx) => (
            <span key={`bottom-${idx}`} className="block">
              {line}
            </span>
          ))}
        </h2>
      </motion.div>
    </section>
  );
}

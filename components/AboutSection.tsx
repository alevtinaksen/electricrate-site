'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '@/types';

interface AboutSectionProps {
  lang: Language;
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
        viewport={{ once: false, amount: 0.3 }}
        transition={{
          duration: 0.85,
          ease: [0.16, 1, 0.3, 1], // cinematic smooth easeOutExpo
          delay,
        }}
        className="block"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function AboutSection({ lang }: AboutSectionProps) {
  const isRu = lang === 'ru';

  const topLines = isRu
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

  const bottomLines = isRu
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
        'IN VARIOUS',
        'SPHERES:',
        'INDUSTRY,',
        'LEGAL,',
        'REAL ESTATE,',
        'HORECA, SPORTS.',
      ];

  return (
    <section
      id="about"
      className="w-full max-w-[1020px] min-h-screen py-16 lg:py-24 relative flex flex-col justify-between select-none font-mono text-white overflow-hidden"
    >
      {/* ── Top-Left Editorial Text Block ── */}
      <div className="relative z-20 flex flex-col items-start text-left max-w-2xl">
        <h2
          className="font-mono uppercase font-semibold text-white tracking-[-1.5px] leading-[92%]"
          style={{
            fontSize: 'clamp(32px, 5.2vw, 76px)',
            lineHeight: '92%',
          }}
        >
          {topLines.map((line, idx) => (
            <MaskedLine key={`top-${idx}`} delay={idx * 0.07}>
              <span>{line}</span>
            </MaskedLine>
          ))}
        </h2>
      </div>

      {/* ── Center/Right Vlad Portrait with Smooth Blend Vignette ── */}
      <div className="relative my-8 lg:-my-16 w-full flex justify-center lg:justify-end z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[300px] sm:w-[380px] lg:w-[460px] aspect-[4/5] overflow-hidden rounded-2xl"
        >
          <img
            src="/vlad-portrait.jpg"
            alt="Влад Сапунов"
            className="w-full h-full object-cover object-top filter grayscale-[20%] contrast-110"
          />
          {/* Subtle cinematic gradient fades into dark background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-[#0d0d0d]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/60 via-transparent to-[#0d0d0d]/60" />
        </motion.div>
      </div>

      {/* ── Bottom-Right Editorial Text Block ── */}
      <div className="relative z-20 flex flex-col items-end text-right w-full">
        <h2
          className="font-mono uppercase font-semibold text-white tracking-[-1.5px] leading-[92%] flex flex-col items-end"
          style={{
            fontSize: 'clamp(32px, 5.2vw, 76px)',
            lineHeight: '92%',
          }}
        >
          {bottomLines.map((line, idx) => (
            <MaskedLine key={`bottom-${idx}`} delay={0.2 + idx * 0.07}>
              <span>{line}</span>
            </MaskedLine>
          ))}
        </h2>
      </div>
    </section>
  );
}

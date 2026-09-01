'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '@/types';
import { FaqItem, DEFAULT_FAQS } from '@/lib/supabase';

interface FaqSectionProps {
  lang: Language;
  faqs?: FaqItem[];
}

export default function FaqSection({ lang, faqs = DEFAULT_FAQS }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const isRu = lang === 'ru';

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="w-full max-w-[964px] pt-0 pb-24 font-mono text-white flex flex-col items-start"
    >
      {/* ── Header "ВОПРОСЫ" (64px, 90% leading, -2.56px, weight 600, paddingLeft 20px, paddingBottom 20px) ── */}
      <h2
        className="font-mono font-semibold uppercase text-white text-left w-full"
        style={{
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
          fontSize: 'clamp(44px, 6vw, 64px)',
          lineHeight: '90%',
          letterSpacing: '-2.56px',
          fontWeight: 600,
          color: '#FFFFFF',
          paddingLeft: '20px',
          paddingBottom: '20px',
        }}
      >
        {isRu ? 'ВОПРОСЫ' : 'QUESTIONS'}
      </h2>

      {/* ── Questions List Container with 20px paddings and thin borders ── */}
      <div className="w-full flex flex-col border-t border-b border-white/20 mt-0">
        {faqs.map((faq, index) => {
          const isOpen = openId === faq.id;
          const questionText = isRu ? faq.question_ru : faq.question_en;
          const leftAnswer = isRu ? faq.answer_left_ru : faq.answer_left_en;
          const rightAnswer = isRu ? faq.answer_right_ru : faq.answer_right_en;

          return (
            <div
              key={faq.id}
              className={`w-full flex flex-col transition-colors ${
                index !== 0 ? 'border-t border-white/20' : ''
              }`}
            >
              {isOpen ? (
                /* ── Opened Accordion Item: Solid White Box with exact Figma paddings (top 8, bottom 30, left/right 20, col gap 20) ── */
                <div
                  onClick={() => toggleAccordion(faq.id)}
                  style={{
                    paddingTop: '8px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '30px',
                    backgroundColor: '#FFFFFF',
                  }}
                  className="w-full flex flex-col gap-[8px] text-black cursor-pointer rounded-none transition-all"
                >
                  {/* Top Question Row in Opened State: gray text #8C8E96, triangle ▲ pinned to top right aligned with first line */}
                  <div className="w-full flex items-start justify-between gap-4 text-left">
                    <span className="lowercase font-mono text-[14px] sm:text-[16px] font-bold tracking-[-0.2px] text-[#8C8E96] leading-[125%] whitespace-normal">
                      {questionText}
                    </span>
                    <span className="shrink-0 text-[10px] sm:text-[12px] text-[#8C8E96] leading-none pt-1">
                      ▲
                    </span>
                  </div>

                  {/* 2-Column Bold Black Answers with exact 20px gap */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] items-start w-full pt-1">
                    {/* Left Column */}
                    <div className="flex-1 flex flex-col">
                      <p
                        className="font-mono font-bold uppercase text-black tracking-[-0.2px] m-0"
                        style={{
                          fontSize: '18px',
                          lineHeight: '120%',
                        }}
                      >
                        {leftAnswer}
                      </p>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 flex flex-col">
                      <p
                        className="font-mono font-bold uppercase text-black tracking-[-0.2px] m-0"
                        style={{
                          fontSize: '18px',
                          lineHeight: '120%',
                        }}
                      >
                        {rightAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Closed Question Row: Allows 2-line wraps with top-aligned arrow ── */
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  style={{
                    paddingLeft: '20px',
                    paddingRight: '20px',
                  }}
                  className="w-full min-h-[34px] py-1.5 md:py-0 md:h-[34px] flex items-start md:items-center justify-between gap-4 text-left transition-colors duration-150 rounded-none cursor-pointer outline-none border-none text-white hover:bg-white hover:text-black"
                >
                  <span className="lowercase font-mono text-[14px] sm:text-[16px] font-bold tracking-[-0.2px] transition-colors leading-[125%] whitespace-normal">
                    {questionText}
                  </span>
                  <span className="shrink-0 text-[10px] sm:text-[12px] opacity-80 leading-none pt-1 md:pt-0">
                    ▼
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

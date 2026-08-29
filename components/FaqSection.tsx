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
      className="w-full max-w-[964px] min-h-screen py-16 lg:py-24 font-mono text-white flex flex-col items-center select-none"
    >
      {/* ── Giant Header "F.A.Q." strictly matching Screenshot 1 & 2 ── */}
      <h2
        className="font-mono font-semibold uppercase tracking-[-2.56px] text-white select-none text-center w-full mb-12 sm:mb-16"
        style={{
          fontSize: 'clamp(64px, 12vw, 160px)',
          lineHeight: '90%',
        }}
      >
        F.A.Q.
      </h2>

      {/* ── Questions Accordion List ── */}
      <div className="w-full flex flex-col gap-2">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          const questionText = isRu ? faq.question_ru : faq.question_en;
          const leftAnswer = isRu ? faq.answer_left_ru : faq.answer_left_en;
          const rightAnswer = isRu ? faq.answer_right_ru : faq.answer_right_en;

          return (
            <div
              key={faq.id}
              className="w-full flex flex-col transition-colors group cursor-pointer"
              onClick={() => toggleAccordion(faq.id)}
            >
              {/* Question Row */}
              <div className="w-full py-4 sm:py-5 flex items-center justify-between gap-4 border-b border-white/10 hover:border-white/30 transition-colors">
                <span
                  className={`lowercase font-mono text-[16px] sm:text-[18px] md:text-[20px] font-bold tracking-[-0.2px] transition-all duration-200 ${
                    isOpen
                      ? 'text-white'
                      : 'text-white/90 group-hover:text-white'
                  }`}
                >
                  {questionText}
                </span>

                {/* Triangle Toggle Indicator (▼ / ▲) */}
                <div className="shrink-0 text-white/80 group-hover:text-white transition-transform duration-200 text-xs sm:text-sm">
                  {isOpen ? '▲' : '▼'}
                </div>
              </div>

              {/* Accordion Expandable Content (Two-column layout matching Screenshot 2) */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`content-${faq.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: 'auto',
                      opacity: 1,
                      transition: {
                        height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.3, delay: 0.1 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.2 },
                      },
                    }}
                    className="overflow-hidden w-full"
                  >
                    <div className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
                      {/* Left Highlight Column with underline */}
                      <div className="flex flex-col">
                        <span
                          className="font-mono font-bold uppercase text-white tracking-[-0.5px] border-b-2 border-[#1458E6] pb-1 w-fit"
                          style={{
                            fontSize: 'clamp(18px, 2.4vw, 28px)',
                            lineHeight: '120%',
                          }}
                        >
                          {leftAnswer}
                        </span>
                      </div>

                      {/* Right Detail Column */}
                      <div className="flex flex-col">
                        <span
                          className="font-mono font-bold uppercase text-white tracking-[-0.5px]"
                          style={{
                            fontSize: 'clamp(18px, 2.4vw, 28px)',
                            lineHeight: '120%',
                          }}
                        >
                          {rightAnswer}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

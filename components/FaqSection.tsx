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
      className="w-full max-w-[964px] min-h-[90vh] py-16 lg:py-24 font-mono text-white flex flex-col items-center select-none"
    >
      {/* ── Giant Header "F.A.Q." stretched across the top of the right panel ── */}
      <h2
        className="font-mono font-bold uppercase tracking-[-3px] sm:tracking-[-6px] text-white select-none text-center w-full"
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 'clamp(96px, 18vw, 220px)',
          lineHeight: '85%',
        }}
      >
        F.A.Q.
      </h2>

      {/* ── Questions List Container (Width strictly 570px matching Figma layout) ── */}
      <div className="w-full max-w-[570px] mx-auto flex flex-col gap-2 mt-10 sm:mt-16">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          const questionText = isRu ? faq.question_ru : faq.question_en;
          const leftAnswer = isRu ? faq.answer_left_ru : faq.answer_left_en;
          const rightAnswer = isRu ? faq.answer_right_ru : faq.answer_right_en;

          return (
            <div
              key={faq.id}
              className="w-full flex flex-col transition-colors cursor-pointer"
            >
              {/* Question Row: No underline, white-bar hover effect with generous 32px horizontal padding */}
              <button
                onClick={() => toggleAccordion(faq.id)}
                className={`w-full py-3.5 px-8 flex items-center justify-between gap-4 text-left transition-colors duration-150 rounded-none cursor-pointer outline-none border-none ${
                  isOpen
                    ? 'text-[#8C8E96] hover:bg-white hover:text-black'
                    : 'text-white hover:bg-white hover:text-black'
                }`}
              >
                <span className="lowercase font-mono text-[15px] sm:text-[17px] font-bold tracking-[-0.2px] transition-colors leading-[125%]">
                  {questionText}
                </span>

                {/* Triangle Indicator (▲ / ▼) */}
                <span className="shrink-0 text-[10px] sm:text-[12px] opacity-80 leading-none">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Opened Accordion Content with extra space below question header */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`content-${faq.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: 'auto',
                      opacity: 1,
                      transition: {
                        height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.25, delay: 0.05 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.15 },
                      },
                    }}
                    className="overflow-hidden w-full"
                  >
                    <div className="pt-[40px] pb-8 px-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start w-full">
                      {/* Left Column (flex: 1 0 0) */}
                      <div className="flex-1 flex flex-col">
                        <p
                          className="font-mono font-bold uppercase text-white tracking-[-0.2px]"
                          style={{
                            fontSize: '20px',
                            lineHeight: '110%', // 22px
                          }}
                        >
                          {leftAnswer}
                        </p>
                      </div>

                      {/* Right Column (flex: 1 0 0) */}
                      <div className="flex-1 flex flex-col">
                        <p
                          className="font-mono font-bold uppercase text-white tracking-[-0.2px]"
                          style={{
                            fontSize: '20px',
                            lineHeight: '110%', // 22px
                          }}
                        >
                          {rightAnswer}
                        </p>
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

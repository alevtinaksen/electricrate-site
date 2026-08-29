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
      {/* ── Giant Header "F.A.Q." 254px matching Figma screenshot ── */}
      <h2
        className="font-mono font-semibold uppercase text-white select-none text-center w-full"
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 'clamp(96px, 20vw, 254px)',
          lineHeight: '90%',
          letterSpacing: '-5.08px',
        }}
      >
        F.A.Q.
      </h2>

      {/* ── Questions List Container (Width strictly 553px - 570px matching Figma layout) ── */}
      <div className="w-full max-w-[553px] mx-auto flex flex-col gap-2 mt-10 sm:mt-16">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          const questionText = isRu ? faq.question_ru : faq.question_en;
          const leftAnswer = isRu ? faq.answer_left_ru : faq.answer_left_en;
          const rightAnswer = isRu ? faq.answer_right_ru : faq.answer_right_en;

          return (
            <div
              key={faq.id}
              className="w-full flex flex-col transition-colors"
            >
              {isOpen ? (
                /* ── Opened Accordion Item: Solid White Box with exact padding 8px 8px 30px 8px and gap 8px ── */
                <div
                  onClick={() => toggleAccordion(faq.id)}
                  style={{
                    paddingTop: '8px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    paddingBottom: '30px',
                    backgroundColor: '#FFFFFF',
                  }}
                  className="w-full flex flex-col gap-[8px] text-black cursor-pointer select-none rounded-none"
                >
                  {/* Top Question Row in Opened State: gray text #8C8E96, triangle ▲ pinned to top */}
                  <div className="w-full flex items-start justify-between gap-4 text-left">
                    <span className="lowercase font-mono text-[15px] sm:text-[17px] font-bold tracking-[-0.2px] text-[#8C8E96] leading-[125%]">
                      {questionText}
                    </span>
                    <span className="shrink-0 text-[10px] sm:text-[12px] text-[#8C8E96] leading-none pt-[3px]">
                      ▲
                    </span>
                  </div>

                  {/* 2-Column Bold Black Answers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start w-full">
                    {/* Left Column */}
                    <div className="flex-1 flex flex-col">
                      <p
                        className="font-mono font-bold uppercase text-black tracking-[-0.2px] m-0"
                        style={{
                          fontSize: '18px',
                          lineHeight: '115%',
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
                          lineHeight: '115%',
                        }}
                      >
                        {rightAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Closed Question Row: Text white, hover:bg-white hover:text-black, arrow pinned to top ── */
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  style={{
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                  }}
                  className="w-full flex items-start justify-between gap-4 text-left transition-colors duration-150 rounded-none cursor-pointer outline-none border-none text-white hover:bg-white hover:text-black"
                >
                  <span className="lowercase font-mono text-[15px] sm:text-[17px] font-bold tracking-[-0.2px] transition-colors leading-[125%]">
                    {questionText}
                  </span>
                  <span className="shrink-0 text-[10px] sm:text-[12px] opacity-80 leading-none pt-[3px]">
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

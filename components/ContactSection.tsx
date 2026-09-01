'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '@/types';
import { SiteSettings, DEFAULT_SETTINGS, formatExternalUrl } from '@/lib/supabase';

interface ContactSectionProps {
  lang: Language;
  settings?: SiteSettings;
}

export default function ContactSection({
  lang,
  settings = DEFAULT_SETTINGS,
}: ContactSectionProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const isRu = lang === 'ru';

  const contactItems = [
    {
      short: 'TG',
      full: 'TELEGRAM',
      url: formatExternalUrl(settings.telegram, 'https://t.me/sapunov_vlad'),
    },
    {
      short: 'BE',
      full: 'BEHANCE',
      url: formatExternalUrl(settings.behance, 'https://behance.net/vladsapunov'),
    },
    {
      short: 'YT',
      full: 'YOUTUBE',
      url: formatExternalUrl(settings.youtube, 'https://youtube.com/@vladsapunov'),
    },
    {
      short: 'IN*',
      full: 'INSTAGRAM*',
      url: formatExternalUrl(settings.instagram, 'https://instagram.com/sapunov_vlad'),
    },
  ];

  const instagramMetaTooltip = isRu
    ? '*Instagram принадлежит компании Meta, признанной экстремистской организацией и запрещенной в РФ'
    : '*Instagram is owned by Meta, recognized as extremist and prohibited in the Russian Federation';

  const trackContactClick = (name: string) => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactName: name }),
    }).catch(() => {});
  };

  return (
    <section
      id="contacts"
      className="w-full max-w-[964px] font-mono text-white flex flex-col items-center pt-0 pb-0"
    >
      {/* ── Title «ЕСТЬ ИДЕЯ? ПРЕВРАТИМ ЕЕ В СИЛЬНОЕ КИНО» ── */}
      <h2
        className="font-mono font-semibold uppercase text-white text-center w-full leading-[95%] px-4"
        style={{
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
          fontSize: 'clamp(28px, 6.5vw, 64px)',
          lineHeight: '95%',
          letterSpacing: '-1.5px',
          fontWeight: 600,
          color: '#FFFFFF',
          paddingBottom: '40px',
        }}
      >
        {isRu ? (
          settings?.contacts_title_ru ? (
            <span className="whitespace-pre-line">{settings.contacts_title_ru}</span>
          ) : (
            <>
              ЕСТЬ ИДЕЯ? ПРЕВРАТИМ
              <br />
              ЕЕ В СИЛЬНОЕ КИНО
            </>
          )
        ) : (
          settings?.contacts_title_en ? (
            <span className="whitespace-pre-line">{settings.contacts_title_en}</span>
          ) : (
            <>
              GOT AN IDEA? WRITE TO ME
              <br />
              RIGHT NOW
            </>
          )
        )}
      </h2>

      {/* ── Vertical Column of Interactive Contact Circles/Pills (Exact 2px gap between buttons) ── */}
      <div className="flex flex-col items-center gap-[2px] mt-0 w-full px-4 sm:px-0">
        {contactItems.map((item, index) => {
          const isHovered = hoveredIdx === index;

          return (
            <div key={item.short} className="relative flex flex-col items-center w-full sm:w-auto">
              {/* Mobile: Always expanded pill — width hugs content */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactClick(item.full)}
                style={{
                  fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: '125%',
                  letterSpacing: '-0.16px',
                  height: '54px',
                  paddingLeft: '28px',
                  paddingRight: '28px',
                }}
                className="md:hidden flex items-center justify-center bg-white text-[#0B0B0B] rounded-full uppercase cursor-pointer active:scale-95 transition-colors shadow-lg overflow-hidden w-fit no-underline"
              >
                <span className="whitespace-nowrap select-none font-bold">{item.full}</span>
              </a>

              {/* Desktop: Interactive expanding circular pill */}
              <motion.a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactClick(item.full)}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                layout
                transition={{
                  layout: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
                }}
                style={{
                  fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: '125%',
                  letterSpacing: '-0.16px',
                  minWidth: '54px',
                  height: '54px',
                  paddingLeft: isHovered ? '28px' : '0px',
                  paddingRight: isHovered ? '28px' : '0px',
                }}
                className={`hidden md:flex items-center justify-center bg-white text-[#0B0B0B] rounded-full uppercase cursor-pointer active:scale-95 transition-colors shadow-lg hover:shadow-2xl overflow-hidden ${
                  isHovered ? 'w-auto' : 'w-[54px]'
                }`}
              >
                <motion.span
                  key={isHovered ? item.full : item.short}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap select-none font-bold"
                >
                  {isHovered ? item.full : item.short}
                </motion.span>
              </motion.a>

              {/* Mobile: Centered Instagram Meta Notice shown directly below Instagram pill with exact 2px gap */}
              {item.short === 'IN*' && (
                <div
                  style={{ marginTop: '2px' }}
                  className="flex md:hidden flex-col items-center gap-0 select-none text-center pointer-events-none"
                >
                  {isRu ? (
                    <>
                      <span
                        style={{
                          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: '130%',
                          letterSpacing: '-0.1px',
                          backgroundColor: '#3A3A3A',
                          color: '#E6E6E6',
                          padding: '1px 6px',
                        }}
                        className="inline-block w-fit whitespace-nowrap uppercase rounded-none m-0"
                      >
                        *INSTAGRAM ПРИНАДЛЕЖИТ КОМПАНИИ META,
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: '130%',
                          letterSpacing: '-0.1px',
                          backgroundColor: '#3A3A3A',
                          color: '#E6E6E6',
                          padding: '1px 6px',
                        }}
                        className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px]"
                      >
                        ПРИЗНАННОЙ ЭКСТРЕМИСТСКОЙ ОРГАНИЗАЦИЕЙ
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: '130%',
                          letterSpacing: '-0.1px',
                          backgroundColor: '#3A3A3A',
                          color: '#E6E6E6',
                          padding: '1px 6px',
                        }}
                        className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px]"
                      >
                        И ЗАПРЕЩЕННОЙ В РФ
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        style={{
                          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: '130%',
                          letterSpacing: '-0.1px',
                          backgroundColor: '#3A3A3A',
                          color: '#E6E6E6',
                          padding: '1px 6px',
                        }}
                        className="inline-block w-fit whitespace-nowrap uppercase rounded-none m-0"
                      >
                        *INSTAGRAM IS OWNED BY META,
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: '130%',
                          letterSpacing: '-0.1px',
                          backgroundColor: '#3A3A3A',
                          color: '#E6E6E6',
                          padding: '1px 6px',
                        }}
                        className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px]"
                      >
                        RECOGNIZED AS EXTREMIST IN RF
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Desktop: Hover Tooltip for Instagram Meta Notice */}
              <AnimatePresence>
                {item.short === 'IN*' && isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="hidden md:flex absolute left-full ml-4 sm:ml-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none flex-col items-start gap-0 select-none text-left"
                  >
                    {isRu ? (
                      <>
                        <span
                          style={{
                            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                            fontSize: '11px',
                            fontWeight: 700,
                            lineHeight: '130%',
                            letterSpacing: '-0.1px',
                            backgroundColor: '#3A3A3A',
                            color: '#E6E6E6',
                            padding: '1px 6px',
                          }}
                          className="inline-block w-fit whitespace-nowrap uppercase rounded-none m-0 block"
                        >
                          *INSTAGRAM ПРИНАДЛЕЖИТ КОМПАНИИ META,
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                            fontSize: '11px',
                            fontWeight: 700,
                            lineHeight: '130%',
                            letterSpacing: '-0.1px',
                            backgroundColor: '#3A3A3A',
                            color: '#E6E6E6',
                            padding: '1px 6px',
                          }}
                          className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px] block"
                        >
                          ПРИЗНАННОЙ ЭКСТРЕМИСТСКОЙ ОРГАНИЗАЦИЕЙ
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                            fontSize: '11px',
                            fontWeight: 700,
                            lineHeight: '130%',
                            letterSpacing: '-0.1px',
                            backgroundColor: '#3A3A3A',
                            color: '#E6E6E6',
                            padding: '1px 6px',
                          }}
                          className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px] block"
                        >
                          И ЗАПРЕЩЕННОЙ В РФ
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          style={{
                            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                            fontSize: '11px',
                            fontWeight: 700,
                            lineHeight: '130%',
                            letterSpacing: '-0.1px',
                            backgroundColor: '#3A3A3A',
                            color: '#E6E6E6',
                            padding: '1px 6px',
                          }}
                          className="inline-block w-fit whitespace-nowrap uppercase rounded-none m-0 block"
                        >
                          *INSTAGRAM IS OWNED BY META,
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                            fontSize: '11px',
                            fontWeight: 700,
                            lineHeight: '130%',
                            letterSpacing: '-0.1px',
                            backgroundColor: '#3A3A3A',
                            color: '#E6E6E6',
                            padding: '1px 6px',
                          }}
                          className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px] block"
                        >
                          RECOGNIZED AS EXTREMIST IN RF
                        </span>
                      </>
                    )}
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

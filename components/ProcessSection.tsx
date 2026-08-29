'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Language } from '@/types';

interface ProcessSectionProps {
  lang: Language;
  containerRef?: React.RefObject<HTMLElement | null>;
}

export default function ProcessSection({ lang, containerRef }: ProcessSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Bind scroll to the parent container
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ['start start', 'end end'],
  });

  // ─── 4 Solid Cards Pure Slide-in (100% Opaque, No Transparency) ───
  // Card 1: slides into final position (0.05 -> 0.25)
  const card1Y = useTransform(scrollYProgress, [0.02, 0.24], [900, 0]);

  // Card 2: slides over Card 1 (0.24 -> 0.48)
  const card2Y = useTransform(scrollYProgress, [0.24, 0.48], [900, 0]);

  // Card 3: slides over Card 1 & 2 (0.48 -> 0.72)
  const card3Y = useTransform(scrollYProgress, [0.48, 0.72], [900, 0]);

  // Card 4: slides over Card 2 & 3 to complete the deck (0.72 -> 0.96)
  const card4Y = useTransform(scrollYProgress, [0.72, 0.96], [900, 0]);

  return (
    <div
      ref={sectionRef}
      id="services"
      className="relative w-full h-[400vh] font-mono select-none bg-transparent"
    >
      {/* ── Fixed Fullscreen Stage (Transparent background matching site #0d0d0d) ── */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
        {/* ── Background Giant H1 (Pinned behind the cards, left aligned / center) ── */}
        <div className="absolute inset-0 flex items-center justify-center text-center z-0 pointer-events-none p-4">
          <h1
            className="font-mono uppercase font-semibold text-center select-none text-white tracking-[-2.56px]"
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: 'clamp(44px, 7.5vw, 128px)',
              fontWeight: 600,
              lineHeight: '90%', // 115.2px
              letterSpacing: '-2.56px',
              color: '#FFFFFF',
            }}
          >
            {lang === 'ru' ? (
              <>
                КАРТИНКА
                <br />
                УРОВНЯ КИНО :
                <br />
                ОТ ИДЕИ ДО
                <br />
                РЕЛИЗА
              </>
            ) : (
              <>
                CINEMATIC
                <br />
                QUALITY :
                <br />
                FROM IDEA TO
                <br />
                RELEASE
              </>
            )}
          </h1>
        </div>

        {/* ── Cards Interactive Stacking Deck Layer (Frame matching user screenshot) ── */}
        <div className="relative w-full max-w-[964px] h-[720px] flex items-center justify-center pointer-events-auto">
          {/* ── Card 1: СЪЕМКА (Top-Left, z-10, #2957DE, 539x506, Solid Opacity) ── */}
          <motion.div
            style={{
              y: card1Y,
              zIndex: 10,
              padding: '24px',
            }}
            className="absolute left-0 top-0 w-[539px] max-w-[92vw] h-[506px] bg-[#2957DE] flex flex-col justify-between items-start rounded-none shadow-none"
          >
            {/* Top text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-white lowercase">
              {lang === 'ru' ? (
                <>
                  <p>снимаю на sony g-master</p>
                  <p>с кино-светом.</p>
                </>
              ) : (
                <>
                  <p>shooting on sony g-master</p>
                  <p>with cinema lighting.</p>
                </>
              )}
            </div>

            {/* Center title (128px Geist Mono) */}
            <h2
              className="font-mono font-semibold uppercase text-white text-center w-full my-2 tracking-[-2.56px]"
              style={{
                fontSize: 'clamp(56px, 9vw, 128px)',
                lineHeight: '90%',
              }}
            >
              {lang === 'ru' ? 'СЪЕМКА' : 'SHOOTING'}
            </h2>

            {/* Bottom text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-white lowercase max-w-[326px]">
              {lang === 'ru' ? (
                <>
                  <p>картинка выглядит дорого —</p>
                  <p>хоть в студии, хоть в репортаже,</p>
                  <p>хоть в грязи по колено.</p>
                </>
              ) : (
                <>
                  <p>looks premium everywhere —</p>
                  <p>studio, reportage,</p>
                  <p>or knee-deep in mud.</p>
                </>
              )}
            </div>
          </motion.div>

          {/* ── Card 2: МОНТАЖ И ЦВЕТ (Top-Right, z-20, #FFFFFF, 446x506, Solid Opacity) ── */}
          <motion.div
            style={{
              y: card2Y,
              zIndex: 20,
              padding: '24px',
            }}
            className="absolute right-0 top-[50px] w-[446px] max-w-[90vw] h-[506px] bg-[#FFFFFF] flex flex-col justify-between items-start rounded-none shadow-none"
          >
            {/* Top text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-[#2957DE] lowercase">
              {lang === 'ru' ? (
                <p>монтирую и крашу в davinci.</p>
              ) : (
                <p>editing & grading in davinci.</p>
              )}
            </div>

            {/* Center title (64px Geist Mono) */}
            <h2
              className="font-mono font-semibold uppercase text-[#2957DE] text-center w-full my-2 tracking-[-2.56px]"
              style={{
                fontSize: 'clamp(44px, 6.5vw, 64px)',
                lineHeight: '90%',
              }}
            >
              {lang === 'ru' ? (
                <>
                  МОНТАЖ И
                  <br />
                  ЦВЕТ
                </>
              ) : (
                <>
                  EDITING &
                  <br />
                  COLOR
                </>
              )}
            </h2>

            {/* Bottom text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-[#2957DE] lowercase max-w-[326px]">
              {lang === 'ru' ? (
                <>
                  <p>авторская цветокоррекция — то,</p>
                  <p>что отличает «снято на телефон»</p>
                  <p>от «снято как кино».</p>
                </>
              ) : (
                <>
                  <p>signature color grading —</p>
                  <p>what separates phone videos</p>
                  <p>from cinematic art.</p>
                </>
              )}
            </div>
          </motion.div>

          {/* ── Card 3: ПОЛНЫЙ ЦИКЛ ПОД КЛЮЧ (Center-Left, z-30, #232323, 539x506, Solid Opacity) ── */}
          <motion.div
            style={{
              y: card3Y,
              zIndex: 30,
              padding: '24px',
            }}
            className="absolute left-[80px] top-[120px] w-[539px] max-w-[92vw] h-[506px] bg-[#232323] flex flex-col justify-between items-start rounded-none shadow-none"
          >
            {/* Top text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-white lowercase">
              {lang === 'ru' ? (
                <>
                  <p>от идеи до мастеринга</p>
                  <p>веду сам</p>
                </>
              ) : (
                <>
                  <p>from idea to mastering</p>
                  <p>led personally</p>
                </>
              )}
            </div>

            {/* Center title (64px Geist Mono) */}
            <h2
              className="font-mono font-semibold uppercase text-white text-center w-full my-2 tracking-[-2.56px]"
              style={{
                fontSize: 'clamp(42px, 6.5vw, 64px)',
                lineHeight: '90%',
              }}
            >
              {lang === 'ru' ? (
                <>
                  ПОЛНЫЙ ЦИКЛ
                  <br />
                  ПОД КЛЮЧ
                </>
              ) : (
                <>
                  FULL CYCLE
                  <br />
                  TURNKEY
                </>
              )}
            </h2>

            {/* Bottom text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-white lowercase max-w-[326px]">
              {lang === 'ru' ? (
                <>
                  <p>без испорченного телефона между</p>
                  <p>оператором, монтажёром и колористом.</p>
                </>
              ) : (
                <>
                  <p>seamless workflow without lost in translation</p>
                  <p>between camera, editor, and colorist.</p>
                </>
              )}
            </div>
          </motion.div>

          {/* ── Card 4: КОМАНДА (Bottom-Right, z-40, #2957DE, 640x506, Solid Opacity) ── */}
          <motion.div
            style={{
              y: card4Y,
              zIndex: 40,
              padding: '24px',
            }}
            className="absolute right-0 top-[214px] w-[640px] max-w-[95vw] h-[506px] bg-[#2957DE] flex flex-col justify-between items-start rounded-none shadow-none"
          >
            {/* Top text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-white lowercase">
              {lang === 'ru' ? (
                <>
                  <p>для больших проектов</p>
                  <p>привлекаю проверенных</p>
                  <p>профи</p>
                </>
              ) : (
                <>
                  <p>for large-scale projects</p>
                  <p>bringing trusted</p>
                  <p>pros</p>
                </>
              )}
            </div>

            {/* Center title (128px Geist Mono) */}
            <h2
              className="font-mono font-semibold uppercase text-white text-center w-full my-2 tracking-[-2.56px]"
              style={{
                fontSize: 'clamp(56px, 9vw, 128px)',
                lineHeight: '90%',
              }}
            >
              {lang === 'ru' ? 'КОМАНДА' : 'TEAM'}
            </h2>

            {/* Bottom text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-white lowercase max-w-[326px]">
              {lang === 'ru' ? (
                <>
                  <p>вы общаетесь только со мной,</p>
                  <p>а я ручаюсь за результат всей команды.</p>
                </>
              ) : (
                <>
                  <p>you only communicate with me,</p>
                  <p>and i vouch for the team result.</p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

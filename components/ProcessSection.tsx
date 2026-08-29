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

  // Bind scroll to the parent container if provided, otherwise window
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ['start start', 'end end'],
  });

  // ─── Card 1: СЪЕМКА (Enters at 15% -> 35%) ───
  const card1Y = useTransform(scrollYProgress, [0.12, 0.32], [500, 0]);
  const card1Opacity = useTransform(scrollYProgress, [0.12, 0.22], [0, 1]);
  const card1Scale = useTransform(scrollYProgress, [0.12, 0.32], [0.95, 1]);

  // ─── Card 2: МОНТАЖ И ЦВЕТ (Enters at 32% -> 52%) ───
  const card2Y = useTransform(scrollYProgress, [0.32, 0.52], [500, 0]);
  const card2Opacity = useTransform(scrollYProgress, [0.32, 0.42], [0, 1]);
  const card2Scale = useTransform(scrollYProgress, [0.32, 0.52], [0.95, 1]);

  // ─── Card 3: ПОЛНЫЙ ЦИКЛ ПОД КЛЮЧ (Enters at 52% -> 72%) ───
  const card3Y = useTransform(scrollYProgress, [0.52, 0.72], [500, 0]);
  const card3Opacity = useTransform(scrollYProgress, [0.52, 0.62], [0, 1]);
  const card3Scale = useTransform(scrollYProgress, [0.52, 0.72], [0.95, 1]);

  // ─── Card 4: КОМАНДА (Enters at 72% -> 92%) ───
  const card4Y = useTransform(scrollYProgress, [0.72, 0.92], [500, 0]);
  const card4Opacity = useTransform(scrollYProgress, [0.72, 0.82], [0, 1]);
  const card4Scale = useTransform(scrollYProgress, [0.72, 0.92], [0.95, 1]);

  return (
    <div
      ref={sectionRef}
      id="services"
      className="relative w-full h-[380vh] font-mono select-none"
    >
      {/* ── Fixed Fullscreen Stage (Pinning Deck) ── */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* ── Background Giant H1 (Pinned behind the cards) ── */}
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

        {/* ── Cards Interactive Stacking Deck Layer (max-w-[964px] bounds) ── */}
        <div className="relative w-full max-w-[964px] h-[580px] flex items-center justify-center pointer-events-auto">
          {/* ── Card 1: СЪЕМКА (Left / Center, z-10, #1458E6) ── */}
          <motion.div
            style={{
              y: card1Y,
              opacity: card1Opacity,
              scale: card1Scale,
              zIndex: 10,
              padding: '24px',
            }}
            className="absolute left-[2%] sm:left-[6%] top-[8%] sm:top-[12%] w-[90%] sm:w-[440px] md:w-[480px] min-h-[440px] bg-[#1458E6] flex flex-col justify-between items-start shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/10"
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

            {/* Center title */}
            <h2
              className="font-mono font-semibold uppercase text-white text-center w-full my-4 tracking-[-2.56px]"
              style={{
                fontSize: 'clamp(52px, 8vw, 96px)',
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

          {/* ── Card 2: МОНТАЖ И ЦВЕТ (Right, z-20, #FFFFFF) ── */}
          <motion.div
            style={{
              y: card2Y,
              opacity: card2Opacity,
              scale: card2Scale,
              zIndex: 20,
              padding: '24px',
            }}
            className="absolute right-[2%] sm:right-[6%] top-[14%] sm:top-[18%] w-[90%] sm:w-[420px] md:w-[450px] min-h-[440px] bg-[#FFFFFF] flex flex-col justify-between items-start shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-black/10"
          >
            {/* Top text */}
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-[#1458E6] lowercase">
              {lang === 'ru' ? (
                <p>монтирую и крашу в davinci.</p>
              ) : (
                <p>editing & grading in davinci.</p>
              )}
            </div>

            {/* Center title */}
            <h2
              className="font-mono font-semibold uppercase text-[#1458E6] text-center w-full my-4 tracking-[-2.56px]"
              style={{
                fontSize: 'clamp(42px, 6vw, 60px)',
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
            <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-[#1458E6] lowercase max-w-[326px]">
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

          {/* ── Card 3: ПОЛНЫЙ ЦИКЛ ПОД КЛЮЧ (Left-Center, z-30, #18181B) ── */}
          <motion.div
            style={{
              y: card3Y,
              opacity: card3Opacity,
              scale: card3Scale,
              zIndex: 30,
              padding: '24px',
            }}
            className="absolute left-[6%] sm:left-[12%] top-[22%] sm:top-[26%] w-[90%] sm:w-[440px] md:w-[480px] min-h-[440px] bg-[#18181B] flex flex-col justify-between items-start shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/10"
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

            {/* Center title */}
            <h2
              className="font-mono font-semibold uppercase text-white text-center w-full my-4 tracking-[-2.56px]"
              style={{
                fontSize: 'clamp(40px, 5.5vw, 56px)',
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

          {/* ── Card 4: КОМАНДА (Right-Center, z-40, #1458E6) ── */}
          <motion.div
            style={{
              y: card4Y,
              opacity: card4Opacity,
              scale: card4Scale,
              zIndex: 40,
              padding: '24px',
            }}
            className="absolute right-[4%] sm:right-[10%] top-[28%] sm:top-[32%] w-[90%] sm:w-[460px] md:w-[500px] min-h-[440px] bg-[#1458E6] flex flex-col justify-between items-start shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/10"
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

            {/* Center title */}
            <h2
              className="font-mono font-semibold uppercase text-white text-center w-full my-4 tracking-[-2.56px]"
              style={{
                fontSize: 'clamp(52px, 8vw, 96px)',
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

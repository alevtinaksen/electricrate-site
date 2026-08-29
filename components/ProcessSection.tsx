'use client';

import { Language } from '@/types';

interface ProcessSectionProps {
  lang: Language;
}

export default function ProcessSection({ lang }: ProcessSectionProps) {
  return (
    <section
      id="services"
      className="relative w-full max-w-[964px] mx-auto py-10 flex flex-col font-mono select-none"
    >
      {/* ── Section Title ── */}
      <h2
        className="font-mono uppercase text-center w-full max-w-[846px] mx-auto mb-16"
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: '90%',
          letterSpacing: '-2.56px',
          color: '#FFFFFF',
        }}
      >
        {lang === 'ru' ? (
          <>
            КАРТИНКА УРОВНЯ КИНО:
            <br />
            ОТ ИДЕИ ДО РЕЛИЗА
          </>
        ) : (
          <>
            CINEMATIC QUALITY:
            <br />
            FROM IDEA TO RELEASE
          </>
        )}
      </h2>

      {/* ── Sticky Stacking Cards Container ── */}
      <div className="w-full flex flex-col gap-16 relative pb-24">
        {/* ── Card 1: СЪЕМКА (Left, sticky top-[100px] z-10, #2957DE) ── */}
        <div
          style={{
            zIndex: 10,
          }}
          className="sticky top-[100px] w-full max-w-[539px] min-h-[460px] bg-[#2957DE] p-8 md:p-10 flex flex-col justify-between items-start self-start shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transition-transform duration-200"
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

          {/* Center Main Title */}
          <h3
            className="font-mono font-semibold uppercase text-white text-center w-full my-6 tracking-[-2.56px]"
            style={{
              fontSize: 'clamp(56px, 9vw, 110px)',
              lineHeight: '90%',
            }}
          >
            {lang === 'ru' ? 'СЪЕМКА' : 'SHOOTING'}
          </h3>

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
        </div>

        {/* ── Card 2: МОНТАЖ И ЦВЕТ (Right, sticky top-[140px] z-20, #FFFFFF) ── */}
        <div
          style={{
            zIndex: 20,
          }}
          className="sticky top-[140px] w-full max-w-[480px] min-h-[460px] bg-[#FFFFFF] p-8 md:p-10 flex flex-col justify-between items-start self-end shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transition-transform duration-200"
        >
          {/* Top text */}
          <div className="font-mono text-[14px] font-bold leading-[125%] tracking-[-0.14px] text-[#2957DE] lowercase">
            {lang === 'ru' ? (
              <p>монтирую и крашу в davinci.</p>
            ) : (
              <p>editing & grading in davinci.</p>
            )}
          </div>

          {/* Center Main Title */}
          <h3
            className="font-mono font-semibold uppercase text-[#2957DE] text-center w-full my-6 tracking-[-2.56px]"
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
          </h3>

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
        </div>

        {/* ── Card 3: ПОЛНЫЙ ЦИКЛ ПОД КЛЮЧ (Left, sticky top-[180px] z-30, #18181B) ── */}
        <div
          style={{
            zIndex: 30,
          }}
          className="sticky top-[180px] w-full max-w-[539px] min-h-[460px] bg-[#18181B] p-8 md:p-10 flex flex-col justify-between items-start self-start shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transition-transform duration-200"
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

          {/* Center Main Title */}
          <h3
            className="font-mono font-semibold uppercase text-white text-center w-full my-6 tracking-[-2.56px]"
            style={{
              fontSize: 'clamp(44px, 6.5vw, 64px)',
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
          </h3>

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
        </div>

        {/* ── Card 4: КОМАНДА (Right, sticky top-[220px] z-40, #2957DE) ── */}
        <div
          style={{
            zIndex: 40,
          }}
          className="sticky top-[220px] w-full max-w-[580px] min-h-[460px] bg-[#2957DE] p-8 md:p-10 flex flex-col justify-between items-start self-end shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transition-transform duration-200"
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

          {/* Center Main Title */}
          <h3
            className="font-mono font-semibold uppercase text-white text-center w-full my-6 tracking-[-2.56px]"
            style={{
              fontSize: 'clamp(56px, 9vw, 110px)',
              lineHeight: '90%',
            }}
          >
            {lang === 'ru' ? 'КОМАНДА' : 'TEAM'}
          </h3>

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
        </div>
      </div>
    </section>
  );
}

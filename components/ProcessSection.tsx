'use client';

import { Language } from '@/types';

interface ProcessSectionProps {
  lang: Language;
}

export default function ProcessSection({ lang }: ProcessSectionProps) {
  return (
    <section
      id="services"
      className="w-full max-w-[964px] font-mono flex flex-col items-center select-none"
    >
      {/* ── Section Title (Figma Screenshot 1: 64px, 600, 90% (57.6px), -2.56px, uppercase, w-[846px]) ── */}
      <h2
        className="font-mono uppercase text-center w-full max-w-[846px]"
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 'clamp(36px, 5.5vw, 64px)',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: '90%', // 57.6px
          letterSpacing: '-2.56px',
          color: '#FFFFFF',
          margin: 0,
          padding: 0,
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

      {/* 32px exact spacing between title and Card 1 (Screenshot 1) */}
      <div className="h-[32px] w-full shrink-0" />

      {/* ── 4 Parallax Layering Cards Stack ── */}
      <div className="w-full flex flex-col relative pb-12">
        {/* ── Card 1: СЪЕМКА (Frame 15: 539x506, #2957DE, Left Aligned) ── */}
        <div
          style={{
            zIndex: 10,
          }}
          className="w-full max-w-[539px] h-[506px] bg-[#2957DE] rounded-none p-[24px] flex flex-col justify-between items-start self-start shadow-2xl transition-all duration-300 hover:scale-[1.01]"
        >
          {/* Top text (text/XS: 14px, 700, 125%, -0.14px, lowercase) */}
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '125%', // 17.5px
              letterSpacing: '-0.14px',
            }}
            className="text-white lowercase"
          >
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

          {/* Center Main Title (h1: 128px, 600, 90%, -2.56px, uppercase, text-center, w-full) */}
          <h3
            className="font-mono uppercase text-white text-center w-full self-stretch select-none"
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: 'clamp(56px, 10vw, 128px)',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '90%', // 115.2px
              letterSpacing: '-2.56px',
            }}
          >
            {lang === 'ru' ? 'СЪЕМКА' : 'SHOOTING'}
          </h3>

          {/* Bottom text (text/XS: 14px, 700, 125%, -0.14px, lowercase, w-[326px]) */}
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '125%', // 17.5px
              letterSpacing: '-0.14px',
              maxWidth: '326px',
            }}
            className="text-white lowercase"
          >
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

        {/* ── Card 2: МОНТАЖ И ЦВЕТ (Frame 16: 446x506, #FFFFFF, Right Aligned) ── */}
        <div
          style={{
            zIndex: 20,
          }}
          className="w-full max-w-[446px] h-[506px] bg-[#FFFFFF] rounded-none p-[24px] flex flex-col justify-between items-start self-end -mt-[140px] md:-mt-[180px] shadow-2xl transition-all duration-300 hover:scale-[1.01]"
        >
          {/* Top text (text/XS: 14px, 700, 125%, -0.14px, lowercase) */}
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '125%',
              letterSpacing: '-0.14px',
            }}
            className="text-[#2957DE] lowercase"
          >
            {lang === 'ru' ? (
              <p>монтирую и крашу в davinci.</p>
            ) : (
              <p>editing & grading in davinci.</p>
            )}
          </div>

          {/* Center Main Title (h2: 64px, 600, 90%, -2.56px, uppercase, text-center, color: #2957DE) */}
          <h3
            className="font-mono uppercase text-[#2957DE] text-center w-full self-stretch select-none"
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: 'clamp(40px, 6.5vw, 64px)',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '90%', // 57.6px
              letterSpacing: '-2.56px',
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

          {/* Bottom text (text/XS: 14px, 700, 125%, -0.14px, lowercase, w-[326px]) */}
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '125%',
              letterSpacing: '-0.14px',
              maxWidth: '326px',
            }}
            className="text-[#2957DE] lowercase"
          >
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

        {/* ── Card 3: ПОЛНЫЙ ЦИКЛ ПОД КЛЮЧ (Frame 161: 539x506, #232323, Left-Center) ── */}
        <div
          style={{
            zIndex: 30,
          }}
          className="w-full max-w-[539px] h-[506px] bg-[#232323] rounded-none p-[24px] flex flex-col justify-between items-start self-start ml-0 md:ml-[30px] -mt-[140px] md:-mt-[180px] shadow-2xl transition-all duration-300 hover:scale-[1.01]"
        >
          {/* Top text */}
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '125%',
              letterSpacing: '-0.14px',
            }}
            className="text-white lowercase"
          >
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

          {/* Center Main Title (h2: 64px, 600, 90%, -2.56px, uppercase, text-center) */}
          <h3
            className="font-mono uppercase text-white text-center w-full self-stretch select-none"
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: 'clamp(40px, 6.5vw, 64px)',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '90%', // 57.6px
              letterSpacing: '-2.56px',
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
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '125%',
              letterSpacing: '-0.14px',
              maxWidth: '326px',
            }}
            className="text-white lowercase"
          >
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

        {/* ── Card 4: КОМАНДА (Frame 162: 640x506, #2957DE, Right Aligned) ── */}
        <div
          style={{
            zIndex: 40,
          }}
          className="w-full max-w-[640px] h-[506px] bg-[#2957DE] rounded-none p-[24px] flex flex-col justify-between items-start self-end -mt-[140px] md:-mt-[180px] shadow-2xl transition-all duration-300 hover:scale-[1.01]"
        >
          {/* Top text */}
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '125%',
              letterSpacing: '-0.14px',
            }}
            className="text-white lowercase"
          >
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

          {/* Center Main Title (h1: 128px, 600, 90%, -2.56px, uppercase, text-center) */}
          <h3
            className="font-mono uppercase text-white text-center w-full self-stretch select-none"
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: 'clamp(56px, 10vw, 128px)',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '90%', // 115.2px
              letterSpacing: '-2.56px',
            }}
          >
            {lang === 'ru' ? 'КОМАНДА' : 'TEAM'}
          </h3>

          {/* Bottom text */}
          <div
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '125%',
              letterSpacing: '-0.14px',
              maxWidth: '326px',
            }}
            className="text-white lowercase"
          >
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

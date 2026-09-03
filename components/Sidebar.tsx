'use client';

import { Language } from '@/types';

interface SidebarProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  phone?: string;
  email?: string;
}

export default function Sidebar({
  lang,
  onLangChange,
  phone,
  email,
}: SidebarProps) {
  return (
    <>
      {/* ── RU / EN Language Toggle Pill: Desktop only in sidebar (mobile is rendered globally fixed) ── */}
      <div className="hidden md:flex absolute top-0 left-0 z-50 items-center overflow-hidden shrink-0">
        <button
          onClick={() => onLangChange('ru')}
          style={{
            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: '125%',
            letterSpacing: '-0.16px',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '4px',
            paddingBottom: '4px',
          }}
          className={`transition-colors cursor-pointer uppercase ${
            lang === 'ru'
              ? 'bg-[#1458E6] text-white hover:bg-white hover:text-[#0B0B0B]'
              : 'bg-white text-[#0B0B0B] hover:bg-[#1458E6] hover:text-white'
          }`}
        >
          RU
        </button>
        <button
          onClick={() => onLangChange('en')}
          style={{
            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: '125%',
            letterSpacing: '-0.16px',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '4px',
            paddingBottom: '4px',
          }}
          className={`transition-colors cursor-pointer uppercase ${
            lang === 'en'
              ? 'bg-[#1458E6] text-white hover:bg-white hover:text-[#0B0B0B]'
              : 'bg-white text-[#0B0B0B] hover:bg-[#1458E6] hover:text-white'
          }`}
        >
          EN
        </button>
      </div>

      <aside
        style={{
          backgroundColor: '#141416',
        }}
        className="sticky top-0 h-[450px] sm:h-[480px] md:h-[520px] min-h-[450px] max-h-none xl:h-screen xl:min-h-0 xl:max-h-none w-full xl:w-[42vw] xl:min-w-[380px] xl:max-w-[1100px] @container rounded-none shrink-0 z-40 flex flex-col justify-between relative overflow-hidden pb-4 xl:pb-0"
      >
        {/* ══════════════════════════════════════════════════════════════════════
            DESKTOP LAYOUT (hidden on mobile/tablets, visible xl:flex)
            Order: Name at top -> Contacts right below name -> Bio text at bottom
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="hidden xl:flex w-full flex-col relative z-10 pt-10">
          {/* 1. Name: Vector SVG expanding to fill 100% width of the left column */}
          <div
            style={{
              paddingTop: '0px',
              paddingRight: '20px',
              paddingBottom: '0px',
              paddingLeft: '20px',
            }}
            className="w-full flex flex-col items-end text-right"
          >
            <svg
              viewBox={lang === 'ru' ? "0 0 540 215" : "0 0 540 205"}
              className="w-full h-auto select-none pointer-events-none block"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="540"
                y="95"
                textAnchor="end"
                fill="#FFFFFF"
                style={{
                  fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                  fontWeight: 600,
                  fontSize: '115px',
                  letterSpacing: '-3.5px',
                }}
              >
                {lang === 'ru' ? 'ВЛАД' : 'VLAD'}
              </text>
              <text
                x="540"
                y="200"
                textAnchor="end"
                fill="#FFFFFF"
                style={{
                  fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                  fontWeight: 600,
                  fontSize: '115px',
                  letterSpacing: '-3.5px',
                }}
              >
                {lang === 'ru' ? 'САПУНОВ' : 'SAPUNOV'}
              </text>
            </svg>
          </div>

          {/* ── Desktop Contact Info Row (right below name) ── */}
          <div
            style={{
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '6px',
              paddingBottom: '0px',
              fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
              fontSize: '18px',
              fontWeight: 700,
              lineHeight: '115%',
              letterSpacing: '-0.2px',
            }}
            className="w-full flex items-start justify-between uppercase mt-1"
          >
            <div className="flex flex-col text-[#8C8E96] text-left leading-[115%]">
              <span>{lang === 'ru' ? 'ЗВОНИ:' : 'CALL:'}</span>
              <span>{lang === 'ru' ? 'ПИШИ:' : 'WRITE:'}</span>
            </div>
            <div className="flex flex-col items-end text-right leading-[115%]">
              <a
                href={`tel:${(phone || '+7(950)016-17-51').replace(/[^\d+]/g, '')}`}
                onClick={() => {
                  fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contactName: 'Телефон (Сайдбар)' }),
                  }).catch(() => {});
                }}
                className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-1.5 py-0.5 inline-block whitespace-nowrap"
              >
                {phone || '+7(950)016-17-51'}
              </a>
              <a
                href={`mailto:${email || 'ELECTICRATE@GMAIL.COM'}`}
                onClick={() => {
                  fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contactName: 'Email (Сайдбар)' }),
                  }).catch(() => {});
                }}
                className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-1.5 py-0.5 inline-block whitespace-nowrap"
              >
                {email || 'ELECTICRATE@GMAIL.COM'}
              </a>
            </div>
          </div>
        </div>

        {/* ── Desktop Bio Text at bottom ── */}
        <div
          style={{
            paddingTop: '16px',
            paddingRight: '20px',
            paddingBottom: '24px',
            paddingLeft: '20px',
          }}
          className="hidden xl:flex w-full flex-col items-start text-left relative z-10"
        >
          <p
            className="font-mono font-bold uppercase text-white max-w-[500px] m-0 text-[14px] lg:text-[16px]"
            style={{
              fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
              lineHeight: '125%',
              letterSpacing: '-0.16px',
            }}
          >
            {lang === 'ru' ? (
              <>
                ВИДЕОМЕЙКЕР ПОЛНОГО ЦИКЛА.
                <br />
                КАРТИНКА УРОВНЯ КИНО — ОТ ИДЕИ
                <br />
                ДО МАСТЕРИНГА
              </>
            ) : (
              <>
                FULL-SERVICE VIDEO MAKER.
                <br />
                CINEMA-QUALITY IMAGES: FROM CONCEPT
                <br />
                TO MASTERING.
              </>
            )}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MOBILE & TABLET LAYOUT (visible on mobile/tablet, hidden xl:hidden)
            Order: 1. Name -> 2. Bio text -> 3. Contacts at bottom (mt-auto)
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex xl:hidden w-full flex-col h-full justify-between relative z-10 pt-8 sm:pt-10">
          {/* Top section: Name + Bio */}
          <div className="w-full flex flex-col items-start">
            {/* 1. Mobile & Tablet Name: Vector SVG expanding to fill 100% width */}
            <div
              style={{
                paddingTop: '0px',
                paddingRight: '16px',
                paddingBottom: '0px',
                paddingLeft: '16px',
              }}
              className="w-full flex flex-col items-end text-right"
            >
              <svg
                viewBox={lang === 'ru' ? "0 0 540 215" : "0 0 540 205"}
                className="w-full h-auto select-none pointer-events-none block"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="540"
                  y="95"
                  textAnchor="end"
                  fill="#FFFFFF"
                  style={{
                    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                    fontWeight: 600,
                    fontSize: '115px',
                    letterSpacing: '-3.5px',
                  }}
                >
                  {lang === 'ru' ? 'ВЛАД' : 'VLAD'}
                </text>
                <text
                  x="540"
                  y="200"
                  textAnchor="end"
                  fill="#FFFFFF"
                  style={{
                    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                    fontWeight: 600,
                    fontSize: '115px',
                    letterSpacing: '-3.5px',
                  }}
                >
                  {lang === 'ru' ? 'САПУНОВ' : 'SAPUNOV'}
                </text>
              </svg>
            </div>

            {/* 2. Mobile & Tablet Bio text immediately below name */}
            <div
              style={{
                paddingTop: '16px',
                paddingRight: '16px',
                paddingBottom: '16px',
                paddingLeft: '16px',
              }}
              className="w-full flex flex-col items-start text-left"
            >
              <p
                className="font-mono font-bold uppercase text-white w-full m-0 text-[16px] sm:text-[18px] md:text-[20px]"
                style={{
                  fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                  lineHeight: '122%',
                  letterSpacing: '-0.16px',
                }}
              >
                {lang === 'ru' ? (
                  <>
                    ВИДЕОМЕЙКЕР ПОЛНОГО ЦИКЛА.
                    <br />
                    КАРТИНКА УРОВНЯ КИНО — ОТ ИДЕИ
                    <br />
                    ДО МАСТЕРИНГА
                  </>
                ) : (
                  <>
                    FULL-SERVICE VIDEO MAKER.
                    <br />
                    CINEMA-QUALITY IMAGES: FROM CONCEPT
                    <br />
                    TO MASTERING.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 3. Mobile & Tablet Contacts at the bottom of the block (mt-auto) */}
          <div
            style={{
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '16px',
              fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
              fontSize: '15px',
              fontWeight: 700,
              lineHeight: '120%',
              letterSpacing: '-0.16px',
            }}
            className="w-full flex items-start justify-between uppercase mt-auto"
          >
            <div className="flex flex-col text-[#8C8E96] text-left leading-[120%]">
              <span>{lang === 'ru' ? 'ЗВОНИ:' : 'CALL:'}</span>
              <span>{lang === 'ru' ? 'ПИШИ:' : 'WRITE:'}</span>
            </div>
            <div className="flex flex-col items-end text-right leading-[120%]">
              <a
                href={`tel:${(phone || '+7(950)016-17-51').replace(/[^\d+]/g, '')}`}
                onClick={() => {
                  fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contactName: 'Телефон (Сайдбар)' }),
                  }).catch(() => {});
                }}
                className="cursor-pointer text-white transition-colors duration-150 rounded-none px-1 py-0.5 inline-block whitespace-nowrap"
              >
                {phone || '+7(950)016-17-51'}
              </a>
              <a
                href={`mailto:${email || 'ELECTICRATE@GMAIL.COM'}`}
                onClick={() => {
                  fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contactName: 'Email (Сайдбар)' }),
                  }).catch(() => {});
                }}
                className="cursor-pointer text-white transition-colors duration-150 rounded-none px-1 py-0.5 inline-block whitespace-nowrap"
              >
                {email || 'ELECTICRATE@GMAIL.COM'}
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

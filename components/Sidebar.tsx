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
        className="sticky top-0 h-[450px] min-h-[450px] max-h-[450px] md:h-screen md:min-h-0 md:max-h-none w-full md:flex-1 md:min-w-[360px] @container rounded-none shrink-0 z-40 flex flex-col justify-between relative overflow-hidden pb-4 md:pb-0"
      >
        {/* ══════════════════════════════════════════════════════════════════════
            DESKTOP LAYOUT (hidden on mobile, visible md:flex)
            Order: Name at top -> Contacts right below name -> Bio text at bottom
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:flex w-full flex-col relative z-10 pt-0">
          {/* ── Name: «ВЛАД САПУНОВ» (always with 20px padding on left & right) ── */}
          <div
            style={{
              paddingTop: '12px',
              paddingRight: '20px',
              paddingBottom: '0px',
              paddingLeft: '20px',
            }}
            className="w-full flex flex-col items-end text-right"
          >
            <h1
              className="font-mono uppercase font-semibold text-white text-right flex flex-col items-end w-full"
              style={{
                fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                fontSize: 'clamp(44px, 20.5cqw, 240px)',
                lineHeight: '90%',
                letterSpacing: '-1.5px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              <span
                style={{ marginBottom: '8px' }}
                className="text-right block w-full"
              >
                {lang === 'ru' ? 'ВЛАД' : 'VLAD'}
              </span>
              <span className="text-right block w-full whitespace-nowrap">
                {lang === 'ru' ? 'САПУНОВ' : 'SAPUNOV'}
              </span>
            </h1>
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
          className="hidden md:flex w-full flex-col items-start text-left relative z-10"
        >
          <p
            className="font-mono font-bold uppercase text-white max-w-[440px] m-0 text-[14px] lg:text-[16px]"
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
                FULL CYCLE FILMMAKER.
                <br />
                CINEMA QUALITY VISUALS — FROM CONCEPT
                <br />
                TO MASTERING
              </>
            )}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MOBILE LAYOUT (visible on mobile, hidden md:hidden)
            Order: Name at top -> Bio text immediately below -> Contacts at bottom
            Exact 450px fixed container height matching specification
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex md:hidden w-full flex-col relative z-10 pt-10">
          {/* 1. Mobile Name — full width impactful layout matching iPhone mockup */}
          <div
            style={{
              paddingTop: '0px',
              paddingRight: '14px',
              paddingBottom: '0px',
              paddingLeft: '14px',
            }}
            className="w-full flex flex-col items-end text-right"
          >
            <h1
              className="font-mono uppercase font-semibold text-white text-right flex flex-col items-end w-full"
              style={{
                fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                fontSize: 'clamp(74px, 23.5vw, 115px)',
                lineHeight: '88%',
                letterSpacing: '-3px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              <span
                style={{ marginBottom: '8px' }}
                className="text-right block w-full"
              >
                {lang === 'ru' ? 'ВЛАД' : 'VLAD'}
              </span>
              <span className="text-right block w-full whitespace-nowrap">
                {lang === 'ru' ? 'САПУНОВ' : 'SAPUNOV'}
              </span>
            </h1>
          </div>

          {/* 2. Mobile Bio text immediately below name */}
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
              className="font-mono font-bold uppercase text-white w-full m-0 text-[16px] sm:text-[18px]"
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
                  FULL CYCLE FILMMAKER.
                  <br />
                  CINEMA QUALITY VISUALS — FROM CONCEPT
                  <br />
                  TO MASTERING
                </>
              )}
            </p>
          </div>
        </div>

        {/* 3. Mobile Contacts at bottom of the 450px hero block */}
        <div
          style={{
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '8px',
            paddingBottom: '20px',
            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: '120%',
            letterSpacing: '-0.16px',
          }}
          className="flex md:hidden w-full items-start justify-between uppercase mt-auto"
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
      </aside>
    </>
  );
}

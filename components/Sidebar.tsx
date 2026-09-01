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
      {/* ── RU/EN fixed on mobile, absolute on desktop ── */}
      <div className="fixed md:absolute top-0 left-0 z-[60] flex items-center overflow-hidden shrink-0">
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
        className="sticky top-0 h-auto md:h-screen w-full md:w-[360px] md:min-w-[360px] lg:w-[440px] lg:min-w-[440px] xl:w-[538px] xl:min-w-[538px] rounded-none shrink-0 z-40 flex flex-col justify-between relative overflow-hidden pb-4 md:pb-0 min-h-[85dvh] md:min-h-0"
      >
        {/* ── Top section: name + bio (mobile), name + contact + bio (desktop) ── */}
        <div className="w-full flex flex-col relative z-10 pt-12 md:pt-0">
          {/* ── Name: «ВЛАД САПУНОВ» ── */}
          <div
            style={{
              paddingTop: '12px',
              paddingRight: '20px',
              paddingBottom: '0px',
              paddingLeft: '0px',
            }}
            className="w-full flex flex-col items-end text-right"
          >
            <h1
              className="font-mono uppercase font-semibold text-white text-right flex flex-col items-end w-full"
              style={{
                fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                fontSize: 'clamp(40px, 14vw, 120px)',
                lineHeight: '90%',
                letterSpacing: '-1.5px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              <span className="text-right block w-full">
                {lang === 'ru' ? 'ВЛАД' : 'VLAD'}
              </span>
              <span className="text-right block w-full whitespace-nowrap">
                {lang === 'ru' ? 'САПУНОВ' : 'SAPUNOV'}
              </span>
            </h1>
          </div>

          {/* ── Desktop only: Contact Info Row (right below name) ── */}
          <div
            style={{
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '4px',
              paddingBottom: '0px',
              fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
              fontSize: '18px',
              fontWeight: 700,
              lineHeight: '115%',
              letterSpacing: '-0.2px',
            }}
            className="hidden md:flex w-full items-start justify-between uppercase mt-1"
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

          {/* ── Bio Text ── */}
          <div
            style={{
              paddingTop: '16px',
              paddingRight: '20px',
              paddingBottom: '24px',
              paddingLeft: '20px',
            }}
            className="w-full flex flex-col items-start text-left relative z-10"
          >
            <p
              className="font-mono font-bold uppercase text-white max-w-[426px] m-0 text-[14px] sm:text-[16px]"
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
        </div>

        {/* ── Mobile only: Contact Info Row at bottom ── */}
        <div
          style={{
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '4px',
            paddingBottom: '12px',
            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: '115%',
            letterSpacing: '-0.2px',
          }}
          className="md:hidden w-full flex items-start justify-between uppercase"
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
      </aside>
    </>
  );
}

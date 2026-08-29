'use client';

import { Language } from '@/types';

interface ClientsSectionProps {
  lang: Language;
}

// 54x54 SVG client logos matching Screenshot 4
function PntLogo() {
  return (
    <div className="w-[54px] h-[54px] min-w-[54px] min-h-[54px] rounded-full bg-white flex flex-col items-center justify-center p-1 shadow-sm shrink-0">
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <path d="M4 6C10 3 18 10 24 6" stroke="#0080FF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M4 11C10 8 18 15 24 11" stroke="#002D62" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="text-[7px] font-bold text-black tracking-tight leading-none">ПНТ</span>
    </div>
  );
}

function FinntrailLogo() {
  return (
    <div className="w-[54px] h-[54px] min-w-[54px] min-h-[54px] rounded-full bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
      <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
        <path d="M6 5H24L20 9H12L10 12H18L16 15H8L4 5Z" fill="black" />
      </svg>
    </div>
  );
}

function SberLogo() {
  return (
    <div className="w-[54px] h-[54px] min-w-[54px] min-h-[54px] rounded-full bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="14" stroke="url(#sberGrad)" strokeWidth="3" />
        <path d="M12 17L15.5 20.5L22 13.5" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="sberGrad" x1="3" y1="3" x2="31" y2="31" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" />
            <stop offset="0.5" stopColor="#22c55e" />
            <stop offset="1" stopColor="#eab308" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function SpiefLogo() {
  return (
    <div className="w-[54px] h-[54px] min-w-[54px] min-h-[54px] rounded-full bg-[#B89758] flex items-center justify-center p-1 shadow-sm shrink-0">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1" />
        <path d="M4 18L3 12h18l-1 6" />
        <path d="M12 12V3" />
        <path d="M12 3l7 4-7 4" />
      </svg>
    </div>
  );
}

function KtkLogo() {
  return (
    <div className="w-[54px] h-[54px] min-w-[54px] min-h-[54px] rounded-full bg-[#001435] flex items-center justify-center p-1 shadow-sm shrink-0 border border-[#002868]">
      <span className="text-[13px] font-black italic tracking-tighter text-[#E30613]">
        <span className="text-white">K</span>TK
      </span>
    </div>
  );
}

export default function ClientsSection({ lang }: ClientsSectionProps) {
  return (
    <section
      id="clients"
      className="w-full max-w-[964px] font-mono flex flex-col items-center select-none"
    >
      {/* Subtitle "КЛИЕНТЫ" matching Screenshot 1 & 3 */}
      <h3
        className="uppercase text-center shrink-0"
        style={{
          color: '#FFFFFF',
          fontFamily: '"Lebowski by Pragmatica", monospace',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '125%', // 25px
          letterSpacing: '-0.2px',
          textTransform: 'uppercase',
          margin: 0,
          padding: 0,
        }}
      >
        {lang === 'ru' ? 'КЛИЕНТЫ' : 'CLIENTS'}
      </h3>

      {/* Exact 12px gap between header and client list */}
      <div className="h-[12px] w-full shrink-0" />

      {/* Client List strictly styled with 70px Geist Mono, explicit 12px logo spacing, and white dots */}
      <div
        className="w-full text-center"
        style={{
          color: '#FFFFFF',
          fontFamily: '"Lebowski by Pragmatica", monospace',
          fontSize: 'clamp(30px, 4.8vw, 70px)',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '98%', // 68.6px
          letterSpacing: '-0.7px',
          textTransform: 'uppercase',
        }}
      >
        {/* Line 1: Logo + 12px + ПЕТЕРБУРГСКИЙ */}
        <div className="flex flex-wrap items-center justify-center gap-[12px] my-1.5">
          <PntLogo />
          <span>{lang === 'ru' ? 'ПЕТЕРБУРГСКИЙ' : 'PETERSBURG'}</span>
        </div>

        {/* Line 2: НЕФТЯНОЙ ТЕРМИНАЛ · */}
        <div className="flex flex-wrap items-center justify-center my-1.5">
          <span>{lang === 'ru' ? 'НЕФТЯНОЙ ТЕРМИНАЛ' : 'OIL TERMINAL'}</span>
          <span className="mx-4 text-white font-bold">·</span>
        </div>

        {/* Line 3: Logo + 12px + FINNTRAIL · */}
        <div className="flex flex-wrap items-center justify-center gap-[12px] my-1.5">
          <FinntrailLogo />
          <span>FINNTRAIL</span>
          <span className="ml-2 text-white font-bold">·</span>
        </div>

        {/* Line 4: Logo + 12px + СБЕРСТРАХОВАНИЕ · */}
        <div className="flex flex-wrap items-center justify-center gap-[12px] my-1.5">
          <SberLogo />
          <span>{lang === 'ru' ? 'СБЕРСТРАХОВАНИЕ' : 'SBERINSURANCE'}</span>
          <span className="ml-2 text-white font-bold">·</span>
        </div>

        {/* Line 5: Logo + 12px + ПМЭФ · Logo + 12px + КТК */}
        <div className="flex flex-wrap items-center justify-center gap-[16px] my-1.5">
          <div className="inline-flex items-center gap-[12px]">
            <SpiefLogo />
            <span>{lang === 'ru' ? 'ПМЭФ' : 'SPIEF'}</span>
          </div>
          <span className="text-white font-bold">·</span>
          <div className="inline-flex items-center gap-[12px]">
            <KtkLogo />
            <span>KTK</span>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { Language } from '@/types';
import { ClientItem, DEFAULT_CLIENTS } from '@/lib/supabase';

interface ClientsSectionProps {
  lang: Language;
  clients?: ClientItem[];
  onVideoSelect?: (title: string, videoUrl: string, posterUrl?: string) => void;
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

export default function ClientsSection({
  lang,
  clients = DEFAULT_CLIENTS,
  onVideoSelect,
}: ClientsSectionProps) {
  const isRu = lang === 'ru';

  const handleClientClick = (client: ClientItem) => {
    const title = isRu ? client.name_ru : client.name_en;
    const video = client.video_url || 'https://assets.mixkit.co/videos/41870/41870-720.mp4';
    onVideoSelect?.(title, video);
  };

  return (
    <section
      id="clients"
      className="w-full max-w-[964px] font-mono flex flex-col items-center select-none"
    >
      {/* Subtitle "КЛИЕНТЫ" */}
      <h3
        className="uppercase text-center shrink-0"
        style={{
          color: '#FFFFFF',
          fontFamily: '"Geist Mono", monospace',
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
        {isRu ? 'КЛИЕНТЫ' : 'CLIENTS'}
      </h3>

      {/* Exact 12px gap between header and client list */}
      <div className="h-[12px] w-full shrink-0" />

      {/* Client List with full white hover fill, black text, and video modal trigger */}
      <div
        className="w-full flex flex-col items-center text-center gap-1.5"
        style={{
          color: '#FFFFFF',
          fontFamily: '"Geist Mono", monospace',
          fontSize: 'clamp(28px, 4.5vw, 64px)',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '100%',
          letterSpacing: '-0.7px',
          textTransform: 'uppercase',
        }}
      >
        {/* Line 1: ПНТ */}
        <div
          onClick={() => handleClientClick(clients[0] || DEFAULT_CLIENTS[0])}
          className="group cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 flex items-center justify-center gap-[12px] w-fit mx-auto"
        >
          <PntLogo />
          <span className="transition-colors group-hover:text-black">
            {isRu ? 'ПЕТЕРБУРГСКИЙ' : 'PETERSBURG'}
          </span>
        </div>

        {/* Line 2: НЕФТЯНОЙ ТЕРМИНАЛ · */}
        <div
          onClick={() => handleClientClick(clients[0] || DEFAULT_CLIENTS[0])}
          className="group cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 flex items-center justify-center w-fit mx-auto"
        >
          <span className="transition-colors group-hover:text-black">
            {isRu ? 'НЕФТЯНОЙ ТЕРМИНАЛ' : 'OIL TERMINAL'}
          </span>
          <span className="mx-4 text-white group-hover:text-black font-bold">·</span>
        </div>

        {/* Line 3: FINNTRAIL · */}
        <div
          onClick={() => handleClientClick(clients[1] || DEFAULT_CLIENTS[1])}
          className="group cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 flex items-center justify-center gap-[12px] w-fit mx-auto"
        >
          <FinntrailLogo />
          <span className="transition-colors group-hover:text-black">FINNTRAIL</span>
          <span className="ml-2 text-white group-hover:text-black font-bold">·</span>
        </div>

        {/* Line 4: СБЕРСТРАХОВАНИЕ · */}
        <div
          onClick={() => handleClientClick(clients[2] || DEFAULT_CLIENTS[2])}
          className="group cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 flex items-center justify-center gap-[12px] w-fit mx-auto"
        >
          <SberLogo />
          <span className="transition-colors group-hover:text-black">
            {isRu ? 'СБЕРСТРАХОВАНИЕ' : 'SBERINSURANCE'}
          </span>
          <span className="ml-2 text-white group-hover:text-black font-bold">·</span>
        </div>

        {/* Line 5: SPIEF + KTK */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-fit mx-auto">
          <div
            onClick={() => handleClientClick(clients[3] || DEFAULT_CLIENTS[3])}
            className="group cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 flex items-center justify-center gap-[12px]"
          >
            <SpiefLogo />
            <span className="transition-colors group-hover:text-black">
              {isRu ? 'ПМЭФ' : 'SPIEF'}
            </span>
            <span className="ml-2 text-white group-hover:text-black font-bold">·</span>
          </div>

          <div
            onClick={() => handleClientClick(clients[4] || DEFAULT_CLIENTS[4])}
            className="group cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 flex items-center justify-center gap-[12px]"
          >
            <KtkLogo />
            <span className="transition-colors group-hover:text-black">
              {isRu ? 'КТК' : 'KTK'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

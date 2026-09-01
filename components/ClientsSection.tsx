'use client';

import { Language } from '@/types';
import { ClientItem, DEFAULT_CLIENTS } from '@/lib/supabase';

interface ClientsSectionProps {
  lang: Language;
  clients?: ClientItem[];
  onVideoSelect?: (title: string, videoUrl: string, posterUrl?: string) => void;
}

// 24x24 on mobile, 54x54 on desktop SVG client logos
function PntLogo() {
  return (
    <div className="w-[24px] h-[24px] min-w-[24px] min-h-[24px] md:w-[54px] md:h-[54px] md:min-w-[54px] md:min-h-[54px] rounded-full bg-white flex flex-col items-center justify-center p-0.5 shadow-sm shrink-0">
      <svg width="14" height="10" viewBox="0 0 28 20" fill="none" className="md:w-[28px] md:h-[20px]">
        <path d="M4 6C10 3 18 10 24 6" stroke="#0080FF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M4 11C10 8 18 15 24 11" stroke="#002D62" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="text-[4px] md:text-[7px] font-bold text-black tracking-tight leading-none">ПНТ</span>
    </div>
  );
}

function FinntrailLogo() {
  return (
    <div className="w-[24px] h-[24px] min-w-[24px] min-h-[24px] md:w-[54px] md:h-[54px] md:min-w-[54px] md:min-h-[54px] rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm shrink-0">
      <svg width="14" height="10" viewBox="0 0 30 20" fill="none" className="md:w-[30px] md:h-[20px]">
        <path d="M6 5H24L20 9H12L10 12H18L16 15H8L4 5Z" fill="black" />
      </svg>
    </div>
  );
}

function SberLogo() {
  return (
    <div className="w-[24px] h-[24px] min-w-[24px] min-h-[24px] md:w-[54px] md:h-[54px] md:min-w-[54px] md:min-h-[54px] rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm shrink-0">
      <svg width="16" height="16" viewBox="0 0 34 34" fill="none" className="md:w-[34px] md:h-[34px]">
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
    <div className="w-[24px] h-[24px] min-w-[24px] min-h-[24px] md:w-[54px] md:h-[54px] md:min-w-[54px] md:min-h-[54px] rounded-full bg-[#B89758] flex items-center justify-center p-0.5 shadow-sm shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="md:w-[28px] md:h-[28px]">
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
    <div className="w-[24px] h-[24px] min-w-[24px] min-h-[24px] md:w-[54px] md:h-[54px] md:min-w-[54px] md:min-h-[54px] rounded-full bg-[#001435] flex items-center justify-center p-0.5 shadow-sm shrink-0 border border-[#002868]">
      <span className="text-[6px] md:text-[13px] font-black italic tracking-tighter text-[#E30613]">
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

  const visibleClients = (clients || []).filter((c) => !c.hidden);
  if (visibleClients.length === 0) return null;

  const renderLogo = (client: ClientItem, index: number) => {
    if (client.hide_logo) {
      return null;
    }
    if (client.logo_url) {
      return (
        <img
          src={client.logo_url}
          alt={isRu ? client.name_ru : client.name_en}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.png';
          }}
          className="w-[24px] h-[24px] min-w-[24px] min-h-[24px] md:w-[54px] md:h-[54px] md:min-w-[54px] md:min-h-[54px] rounded-full object-contain bg-white shrink-0 p-0.5 md:p-1"
        />
      );
    }
    if (index === 0) return <PntLogo />;
    if (index === 1) return <FinntrailLogo />;
    if (index === 2) return <SberLogo />;
    if (index === 3) return <SpiefLogo />;
    return <KtkLogo />;
  };

  const getClientName = (client: ClientItem) => {
    return isRu ? (client.name_ru || client.name_en) : (client.name_en || client.name_ru);
  };

  const c0 = visibleClients[0];
  const c1 = visibleClients[1];
  const c2 = visibleClients[2];
  const c3 = visibleClients[3];
  const c4 = visibleClients[4];

  return (
    <section
      id="clients"
      className="w-full max-w-[964px] font-mono flex flex-col items-center"
    >
      {/* Subtitle "КЛИЕНТЫ" (16px on mobile, 20px on desktop) */}
      <h3
        className="uppercase text-center shrink-0 text-[16px] md:text-[20px]"
        style={{
          color: '#FFFFFF',
          fontFamily: '"Geist Mono", monospace',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '125%',
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

      {/* Client List with clean white text-only hover fill, black text, and video modal trigger */}
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
        {/* Line 1: Client 0 (Directly renders whatever is typed in admin) */}
        {c0 && (
          <div className="flex items-center justify-center gap-[12px] w-fit max-w-full mx-auto">
            {renderLogo(c0, 0)}
            <span
              onClick={() => handleClientClick(c0)}
              className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 inline-block text-center leading-[1.05] whitespace-pre-line"
            >
              {getClientName(c0)}
            </span>
            <span className="text-white font-bold ml-1 select-none">·</span>
          </div>
        )}

        {/* Line 2: Client 1 */}
        {c1 && (
          <div className="flex items-center justify-center gap-[12px] w-fit mx-auto">
            {renderLogo(c1, 1)}
            <span
              onClick={() => handleClientClick(c1)}
              className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 whitespace-nowrap"
            >
              {getClientName(c1)}
            </span>
            <span className="text-white font-bold ml-1 select-none">·</span>
          </div>
        )}

        {/* Line 3: Client 2 */}
        {c2 && (
          <div className="flex items-center justify-center gap-[12px] w-fit mx-auto">
            {renderLogo(c2, 2)}
            <span
              onClick={() => handleClientClick(c2)}
              className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 whitespace-nowrap"
            >
              {getClientName(c2)}
            </span>
            <span className="text-white font-bold ml-1 select-none">·</span>
          </div>
        )}

        {/* Line 4: Client 3 & Client 4 (+ any extra clients) — exact uniform gap-y-1.5 between all wrapped lines */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 w-fit mx-auto">
          {c3 && (
            <div className="flex items-center justify-center gap-[12px]">
              {renderLogo(c3, 3)}
              <span
                onClick={() => handleClientClick(c3)}
                className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 whitespace-nowrap"
              >
                {getClientName(c3)}
              </span>
              <span className="text-white font-bold ml-1 select-none">·</span>
            </div>
          )}

          {c4 && (
            <div className="flex items-center justify-center gap-[12px]">
              {renderLogo(c4, 4)}
              <span
                onClick={() => handleClientClick(c4)}
                className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 whitespace-nowrap"
              >
                {getClientName(c4)}
              </span>
              {/* Dot stays with KTK on the line if there are subsequent clients */}
              {visibleClients.length > 5 && (
                <span className="text-white font-bold ml-1 select-none">·</span>
              )}
            </div>
          )}

          {visibleClients.slice(5).map((extraClient, i) => (
            <div key={extraClient.id || i} className="flex items-center justify-center gap-[12px]">
              {renderLogo(extraClient, i + 5)}
              <span
                onClick={() => handleClientClick(extraClient)}
                className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-4 py-1.5 whitespace-nowrap"
              >
                {getClientName(extraClient)}
              </span>
              {i < visibleClients.slice(5).length - 1 && (
                <span className="text-white font-bold ml-1 select-none">·</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

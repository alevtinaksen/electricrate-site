'use client';

import { Language } from '@/types';
import { ClientItem, DEFAULT_CLIENTS } from '@/lib/supabase';

interface ClientsSectionProps {
  lang: Language;
  clients?: ClientItem[];
  onVideoSelect?: (title: string, videoUrl: string, posterUrl?: string) => void;
}

// Scaled logos strictly matching font cap-height (0.72em)
function PntLogo() {
  return (
    <div className="w-[0.72em] h-[0.72em] min-w-[0.72em] min-h-[0.72em] rounded-full bg-white flex flex-col items-center justify-center p-[0.05em] shadow-sm shrink-0">
      <svg viewBox="0 0 28 20" fill="none" className="w-[80%] h-auto">
        <path d="M4 6C10 3 18 10 24 6" stroke="#0080FF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M4 11C10 8 18 15 24 11" stroke="#002D62" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="text-[0.18em] font-bold text-black tracking-tight leading-none">ПНТ</span>
    </div>
  );
}

function FinntrailLogo() {
  return (
    <div className="w-[0.72em] h-[0.72em] min-w-[0.72em] min-h-[0.72em] rounded-full bg-white flex items-center justify-center p-[0.05em] shadow-sm shrink-0">
      <svg viewBox="0 0 30 20" fill="none" className="w-[75%] h-auto">
        <path d="M6 5H24L20 9H12L10 12H18L16 15H8L4 5Z" fill="black" />
      </svg>
    </div>
  );
}

function SberLogo() {
  return (
    <div className="w-[0.72em] h-[0.72em] min-w-[0.72em] min-h-[0.72em] rounded-full bg-white flex items-center justify-center p-[0.05em] shadow-sm shrink-0">
      <svg viewBox="0 0 34 34" fill="none" className="w-[85%] h-auto">
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
    <div className="w-[0.72em] h-[0.72em] min-w-[0.72em] min-h-[0.72em] rounded-full bg-[#B89758] flex items-center justify-center p-[0.05em] shadow-sm shrink-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[75%] h-auto">
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
    <div className="w-[0.72em] h-[0.72em] min-w-[0.72em] min-h-[0.72em] rounded-full bg-[#001435] flex items-center justify-center p-[0.05em] shadow-sm shrink-0 border border-[#002868]">
      <span className="text-[0.26em] font-black italic tracking-tighter text-[#E30613]">
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
          className="w-[0.72em] h-[0.72em] min-w-[0.72em] min-h-[0.72em] rounded-full object-contain bg-white shrink-0 p-[0.05em]"
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
        className="w-full flex flex-col items-center text-center gap-1.5 text-[clamp(24px,4.5vw,38px)] xl:text-[clamp(34px,2.6vw,54px)] 2xl:text-[clamp(44px,2.9vw,64px)]"
        style={{
          color: '#FFFFFF',
          fontFamily: '"Geist Mono", monospace',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '100%',
          letterSpacing: '-0.7px',
          textTransform: 'uppercase',
        }}
      >
        {/* Line 1: Client 0 */}
        {c0 && (
          <div className="flex items-center justify-center gap-[0.22em] w-fit mx-auto">
            {renderLogo(c0, 0)}
            <span
              onClick={() => handleClientClick(c0)}
              className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-2.5 py-1 whitespace-nowrap"
            >
              {getClientName(c0)}
            </span>
            <span className="text-white font-bold ml-1 select-none">·</span>
          </div>
        )}

        {/* Line 2: Client 1 */}
        {c1 && (
          <div className="flex items-center justify-center gap-[0.22em] w-fit mx-auto">
            {renderLogo(c1, 1)}
            <span
              onClick={() => handleClientClick(c1)}
              className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-2.5 py-1 whitespace-nowrap"
            >
              {getClientName(c1)}
            </span>
            <span className="text-white font-bold ml-1 select-none">·</span>
          </div>
        )}

        {/* Line 3: Client 2 */}
        {c2 && (
          <div className="flex items-center justify-center gap-[0.22em] w-fit mx-auto">
            {renderLogo(c2, 2)}
            <span
              onClick={() => handleClientClick(c2)}
              className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-2.5 py-1 whitespace-nowrap"
            >
              {getClientName(c2)}
            </span>
            <span className="text-white font-bold ml-1 select-none">·</span>
          </div>
        )}

        {/* Line 4: Client 3 & Client 4 (ПМЭФ · КТК) */}
        <div className="flex items-center justify-center gap-x-4 w-fit mx-auto">
          {c3 && (
            <div className="flex items-center justify-center gap-[0.22em]">
              {renderLogo(c3, 3)}
              <span
                onClick={() => handleClientClick(c3)}
                className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-2.5 py-1 whitespace-nowrap"
              >
                {getClientName(c3)}
              </span>
              <span className="text-white font-bold ml-1 select-none">·</span>
            </div>
          )}

          {c4 && (
            <div className="flex items-center justify-center gap-[0.22em]">
              {renderLogo(c4, 4)}
              <span
                onClick={() => handleClientClick(c4)}
                className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-2.5 py-1 whitespace-nowrap"
              >
                {getClientName(c4)}
              </span>
              {visibleClients.length > 5 && (
                <span className="text-white font-bold ml-1 select-none">·</span>
              )}
            </div>
          )}
        </div>

        {/* Line 5: Extra clients (CPO-GROUP etc.) on a dedicated separate line */}
        {visibleClients.slice(5).length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 w-fit mx-auto">
            {visibleClients.slice(5).map((extraClient, i) => (
              <div key={extraClient.id || i} className="flex items-center justify-center gap-[0.22em]">
                {renderLogo(extraClient, i + 5)}
                <span
                  onClick={() => handleClientClick(extraClient)}
                  className="cursor-pointer hover:bg-white text-white hover:text-black transition-colors duration-150 rounded-none px-2.5 py-1 whitespace-nowrap"
                >
                  {getClientName(extraClient)}
                </span>
                {i < visibleClients.slice(5).length - 1 && (
                  <span className="text-white font-bold ml-1 select-none">·</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

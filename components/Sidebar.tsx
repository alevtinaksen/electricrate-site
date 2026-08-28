'use client';

import { useState } from 'react';
import { Language } from '@/types';

interface SidebarProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  onSectionClick: (section: string) => void;
}

const MENU_ITEMS = [
  { key: 'clients',  label: { ru: 'клиенты',   en: 'clients' } },
  { key: 'reels',    label: { ru: 'проекты',   en: 'projects' } },
  { key: 'services', label: { ru: 'услуги',    en: 'services' } },
  { key: 'about',    label: { ru: 'обо мне',   en: 'about me' } },
  { key: 'faq',      label: { ru: 'f.a.q.',    en: 'f.a.q.' } },
  { key: 'contact',  label: { ru: 'контакты',  en: 'contacts' } },
];

export default function Sidebar({ lang, onLangChange, onSectionClick }: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <aside className="sticky top-0 h-screen w-[320px] min-w-[320px] lg:w-[380px] lg:min-w-[380px] shrink-0 z-40 flex flex-col justify-between bg-[#0d0d0d] p-5 lg:p-7 relative select-none">
      {/* Top: Name + Subtitle — z-50 strictly ON TOP of PNG masks */}
      <div className="flex flex-col relative z-50">
        {/* Main Title — fixed 522px with nowrap and +8px left padding added */}
        <div className="relative z-50 w-[522px] min-w-[522px] pointer-events-none pl-[8px]">
          <h1
            className="font-mono uppercase font-semibold text-white whitespace-nowrap"
            style={{
              fontSize: 'clamp(64px, 8.5vw, 128.49px)',
              lineHeight: '93%',
              letterSpacing: '-1.285px',
              color: '#FFFFFF',
            }}
          >
            ВЛАД
            <br />
            САПУНОВ
          </h1>
        </div>

        {/* Subtitle description with exact 150px left padding */}
        <div className="mt-4 pl-[150px] text-white/90 font-mono text-[13px] sm:text-[14px] leading-[1.4] whitespace-nowrap relative z-50">
          <p>видеомейкер полного цикла.</p>
          <p>картинка уровня кино — от идеи</p>
          <p>до мастеринга.</p>
        </div>
      </div>

      {/* Center: White Menu Button (Burger) + White Rectangular Badges */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-[24px] z-50"
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        <div className="relative flex items-center z-50">
          {/* Main 65x65 White Circle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Меню навигации"
            className="w-[65px] h-[65px] rounded-full bg-white hover:bg-[#e6e6e6] active:scale-95 transition-all duration-200 flex flex-col items-center justify-center gap-[6px] cursor-pointer shadow-none z-50"
          >
            <span className={`w-6 h-[2.5px] bg-[#0B0B0B] rounded-full transition-transform duration-200 ${isMenuOpen ? 'rotate-45 translate-y-[4.5px]' : ''}`} />
            <span className={`w-6 h-[2.5px] bg-[#0B0B0B] rounded-full transition-transform duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
          </button>

          {/* White Rectangular Menu Badges Stack with 2px gap and px-8 py-4 paddings */}
          <div
            className={`absolute left-[74px] top-1/2 -translate-y-1/2 flex flex-col gap-[2px] transition-all duration-200 pointer-events-auto z-50 ${
              isMenuOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-3 scale-95 pointer-events-none'
            }`}
          >
            {MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onSectionClick(item.key);
                  setIsMenuOpen(false);
                }}
                className="w-auto inline-block text-left bg-white hover:bg-[#e6e6e6] text-[#0B0B0B] font-mono font-bold text-[16px] px-[8px] py-[4px] leading-tight transition-colors cursor-pointer whitespace-nowrap shadow-md"
              >
                {item.label[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Left Corner: 65x65 White Social Buttons (TG, EM, VK) aligned on red line */}
      <div className="absolute left-[24px] bottom-[20px] flex flex-col gap-2.5 z-50">
        <a
          href="https://t.me/"
          target="_blank"
          rel="noopener noreferrer"
          title="Telegram"
          className="w-[65px] h-[65px] rounded-full bg-white hover:bg-[#e6e6e6] active:scale-95 transition-all duration-200 flex items-center justify-center text-[#0B0B0B] font-mono font-bold text-[20px] leading-[25px] tracking-[-0.2px] uppercase shadow-none z-50"
        >
          TG
        </a>
        <a
          href="mailto:vlad@sapunov.ru"
          title="Email"
          className="w-[65px] h-[65px] rounded-full bg-white hover:bg-[#e6e6e6] active:scale-95 transition-all duration-200 flex items-center justify-center text-[#0B0B0B] font-mono font-bold text-[20px] leading-[25px] tracking-[-0.2px] uppercase shadow-none z-50"
        >
          EM
        </a>
        <a
          href="https://vk.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="ВКонтакте"
          className="w-[65px] h-[65px] rounded-full bg-white hover:bg-[#e6e6e6] active:scale-95 transition-all duration-200 flex items-center justify-center text-[#0B0B0B] font-mono font-bold text-[20px] leading-[25px] tracking-[-0.2px] uppercase shadow-none z-50"
        >
          VK
        </a>
      </div>
    </aside>
  );
}

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
    <aside
      style={{
        marginTop: '12px',
        marginBottom: '12px',
        marginLeft: '12px',
        height: 'calc(100vh - 24px)',
      }}
      className="sticky top-[12px] w-[320px] min-w-[320px] lg:w-[380px] lg:min-w-[380px] shrink-0 z-50 flex flex-col justify-between bg-transparent p-5 lg:p-7 relative select-none"
    >
      {/* Top: Name + Subtitle — ВЛАД and САПУНОВ aligned to the left of each other */}
      <div className="flex flex-col relative z-50 w-full items-start pl-1 sm:pl-2">
        <div className="relative z-50 w-fit pointer-events-none flex flex-col items-start">
          <h1
            className="font-mono uppercase font-semibold text-white whitespace-nowrap text-left flex flex-col items-start w-fit"
            style={{
              fontSize: 'clamp(56px, 7.5vw, 128.49px)',
              lineHeight: '93%',
              letterSpacing: '-1.285px',
              color: '#FFFFFF',
            }}
          >
            <span className="text-left block w-full">ВЛАД</span>
            <span className="text-left block w-full">САПУНОВ</span>
          </h1>
        </div>
      </div>

      {/* Center: White Menu Button (Burger) + White Rectangular Badges — z-50 ON TOP of PNG masks */}
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
            className="w-[65px] h-[65px] rounded-full bg-white hover:bg-[#1458E6] hover:text-white active:scale-95 transition-all duration-200 flex flex-col items-center justify-center gap-[6px] cursor-pointer shadow-none border-none outline-none z-50 group"
          >
            <span className={`w-6 h-[2.5px] bg-[#0B0B0B] group-hover:bg-white rounded-full transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-[4.5px]' : ''}`} />
            <span className={`w-6 h-[2.5px] bg-[#0B0B0B] group-hover:bg-white rounded-full transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
          </button>

          {/* White Rectangular Menu Badges Stack with 2px gap, items-start to adapt to text length, and px-8 py-4 paddings */}
          <div
            className={`absolute left-[74px] top-1/2 -translate-y-1/2 flex flex-col items-start gap-[2px] transition-all duration-200 pointer-events-auto z-50 ${
              isMenuOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-3 scale-95 pointer-events-none'
            }`}
          >
            {/* Language Switcher Button at top of menu */}
            <button
              onClick={() => {
                onLangChange(lang === 'ru' ? 'en' : 'ru');
              }}
              className="w-fit inline-block text-left bg-white hover:bg-[#1458E6] hover:text-white text-[#0B0B0B] font-mono font-bold text-[16px] px-[8px] py-[4px] leading-tight transition-colors cursor-pointer whitespace-nowrap shadow-none border-none outline-none uppercase"
            >
              {lang === 'ru' ? 'EN' : 'RU'}
            </button>

            {MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onSectionClick(item.key);
                  setIsMenuOpen(false);
                }}
                className="w-fit inline-block text-left bg-white hover:bg-[#1458E6] hover:text-white text-[#0B0B0B] font-mono font-bold text-[16px] px-[8px] py-[4px] leading-tight transition-colors cursor-pointer whitespace-nowrap shadow-none border-none outline-none"
              >
                {item.label[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Left Corner: 65x65 White Social Buttons (TG and @) with gap-0, blue hover */}
      <div className="absolute left-[24px] bottom-[20px] flex flex-col gap-0 z-50">
        <a
          href="https://t.me/sapunov_vlad"
          target="_blank"
          rel="noopener noreferrer"
          title="Telegram"
          className="w-[65px] h-[65px] rounded-full bg-white hover:bg-[#1458E6] hover:text-white active:scale-95 transition-all duration-200 flex items-center justify-center text-[#0B0B0B] font-mono font-bold text-[20px] leading-[25px] tracking-[-0.2px] uppercase shadow-none border-none outline-none focus:outline-none cursor-pointer"
        >
          TG
        </a>
        <a
          href="mailto:vlad@sapunov.ru"
          title="Email"
          className="w-[65px] h-[65px] rounded-full bg-white hover:bg-[#1458E6] hover:text-white active:scale-95 transition-all duration-200 flex items-center justify-center text-[#0B0B0B] font-mono font-bold text-[22px] leading-none shadow-none border-none outline-none focus:outline-none cursor-pointer"
        >
          @
        </a>
      </div>
    </aside>
  );
}

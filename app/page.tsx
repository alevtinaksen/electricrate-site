'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ReelsSection from '@/components/ReelsSection';
import ClientsSection from '@/components/ClientsSection';
import WorksSection from '@/components/WorksSection';
import ProcessSection from '@/components/ProcessSection';
import VideoModal from '@/components/VideoModal';
import { HERO_REELS, WORK_SECTIONS, HeroReel, WorkCategoryGroup } from '@/lib/supabase';
import { Language } from '@/types';

export default function Home() {
  const [lang, setLang] = useState<Language>('ru');
  const [reels, setReels] = useState<HeroReel[]>(HERO_REELS);
  const [works, setWorks] = useState<WorkCategoryGroup[]>(WORK_SECTIONS);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Load custom data from /api/content + localStorage
  useEffect(() => {
    const loadContent = async () => {
      // 1. Instant local cache
      const savedHero = localStorage.getItem('custom_hero_reels');
      if (savedHero) {
        try {
          const parsed = JSON.parse(savedHero);
          if (Array.isArray(parsed) && parsed.length > 0) setReels(parsed);
        } catch {}
      }
      const savedWorks = localStorage.getItem('custom_work_sections');
      if (savedWorks) {
        try {
          const parsed = JSON.parse(savedWorks);
          if (Array.isArray(parsed) && parsed.length > 0) setWorks(parsed);
        } catch {}
      }

      // 2. Fetch fresh published content from server API
      try {
        const res = await fetch('/api/content', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.heroReels) && data.heroReels.length > 0) {
            setReels(data.heroReels);
          }
          if (Array.isArray(data.workSections) && data.workSections.length > 0) {
            setWorks(data.workSections);
          }
        }
      } catch (e) {
        // Fallback to local state
      }
    };

    loadContent();

    // Listen for storage events and window focus
    window.addEventListener('storage', loadContent);
    window.addEventListener('focus', loadContent);
    return () => {
      window.removeEventListener('storage', loadContent);
      window.removeEventListener('focus', loadContent);
    };
  }, []);

  // Video Lightbox Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl: string;
    posterUrl?: string;
  }>({
    isOpen: false,
    title: '',
    videoUrl: '',
    posterUrl: '',
  });

  const openVideoModal = (title: string, videoUrl: string, posterUrl?: string) => {
    setModalState({
      isOpen: true,
      title,
      videoUrl,
      posterUrl,
    });
  };

  const closeVideoModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const scrollToSection = (section: string) => {
    const targetId =
      section === 'reels' || section === 'проекты'
        ? 'reels'
        : section === 'works' || section === 'all' || section === 'услуги'
        ? 'works'
        : section === 'clients' || section === 'клиенты'
        ? 'clients'
        : 'works';
    const el = document.getElementById(targetId);
    if (el && rightPanelRef.current) {
      rightPanelRef.current.scrollTo({
        top: el.offsetTop - 20,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex h-screen w-full overflow-x-hidden bg-[#0d0d0d] font-mono text-white relative">
      {/* ── Left column: Frame 154 fixed Sidebar ── */}
      <Sidebar
        lang={lang}
        onLangChange={setLang}
        onSectionClick={scrollToSection}
      />

      {/* ── Right column: pinned to the right side on resize, max-w-[964px] content ── */}
      <main
        ref={rightPanelRef}
        className="right-panel flex-1 h-screen overflow-y-auto overflow-x-hidden relative flex flex-col items-end"
      >
        <div className="w-full max-w-[964px] flex flex-col items-center py-6 px-4 sm:px-6 mr-0 pb-36">
          {/* Section 1: 5 Hero Reels */}
          <ReelsSection
            reels={reels}
            lang={lang}
            onVideoSelect={openVideoModal}
          />

          {/* 150px exact spacing between Hero-reels and Clients */}
          <div className="h-[150px] w-full shrink-0" />

          {/* Section 2: Clients with 54x54 logos, 12px gap, and white dots */}
          <ClientsSection
            lang={lang}
          />

          {/* 150px exact spacing between Clients and Works */}
          <div className="h-[150px] w-full shrink-0" />

          {/* Section 3: All Works */}
          <WorksSection
            sections={works}
            lang={lang}
            onVideoSelect={openVideoModal}
          />

          {/* 150px exact spacing between Works and Process Section */}
          <div className="h-[150px] w-full shrink-0" />

          {/* Section 4: Process / Cinema Quality from idea to release (Scroll Pinning & Stacking Deck) */}
          <ProcessSection
            lang={lang}
            containerRef={rightPanelRef}
          />
        </div>

        {/* ── Fixed Bottom CTA Button «СВЯЗАТЬСЯ» in White (187x65px, no glow) ── */}
        <div className="fixed bottom-[24px] z-50 right-4 sm:right-8 md:right-[calc((min(100vw-380px,964px)-187px)/2)] pointer-events-auto">
          <button
            onClick={() => window.open('https://t.me/', '_blank')}
            aria-label="Связаться"
            style={{
              width: '187px',
              height: '65px',
              backgroundColor: '#FFFFFF',
              borderRadius: '56px',
              color: '#0B0B0B',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '125%', // 25px
              letterSpacing: '-0.2px',
              textTransform: 'uppercase',
            }}
            className="flex items-center justify-center hover:bg-[#e6e6e6] active:scale-95 transition-all duration-200 cursor-pointer shadow-none border-none outline-none"
          >
            {lang === 'ru' ? 'СВЯЗАТЬСЯ' : 'CONTACT'}
          </button>
        </div>
      </main>

      {/* ── Video Lightbox Popup Modal ── */}
      <VideoModal
        isOpen={modalState.isOpen}
        onClose={closeVideoModal}
        title={modalState.title}
        videoUrl={modalState.videoUrl}
        posterUrl={modalState.posterUrl}
      />
    </div>
  );
}

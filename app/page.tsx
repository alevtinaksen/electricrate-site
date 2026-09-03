'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import Sidebar from '@/components/Sidebar';
import ReelsSection from '@/components/ReelsSection';
import ClientsSection from '@/components/ClientsSection';
import WorksSection from '@/components/WorksSection';
import ProcessSection from '@/components/ProcessSection';
import AboutSection from '@/components/AboutSection';
import FaqSection from '@/components/FaqSection';
import ContactSection from '@/components/ContactSection';
import Preloader from '@/components/Preloader';
import VideoModal from '@/components/VideoModal';
import TrueGlitchFilter from '@/components/TrueGlitchFilter';
import {
  HERO_REELS,
  WORK_SECTIONS,
  DEFAULT_CLIENTS,
  DEFAULT_SETTINGS,
  DEFAULT_FAQS,
  DEFAULT_SERVICES,
  DEFAULT_ABOUT,
  HeroReel,
  WorkCategoryGroup,
  ClientItem,
  SiteSettings,
  FaqItem,
  ServicesContent,
  AboutContent,
  formatExternalUrl,
} from '@/lib/supabase';
import { Language } from '@/types';

export default function Home() {
  const [lang, setLang] = useState<Language>('ru');
  const [reels, setReels] = useState<HeroReel[]>(HERO_REELS);
  const [works, setWorks] = useState<WorkCategoryGroup[]>(WORK_SECTIONS);
  const [clients, setClients] = useState<ClientItem[]>(DEFAULT_CLIENTS);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [services, setServices] = useState<ServicesContent>(DEFAULT_SERVICES);
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  const [isLoaded, setIsLoaded] = useState(true);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis Smooth Scroll (desktop only >= 1280px — mobile & tablets use native window scroll)
  useEffect(() => {
    if (!rightPanelRef.current || typeof window === 'undefined' || window.innerWidth < 1280) return;

    const lenis = new Lenis({
      wrapper: rightPanelRef.current,
      content: rightPanelRef.current,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth inertia curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Load custom data from /api/content + localStorage with throttle on focus
  useEffect(() => {
    let lastLoadedAt = 0;

    const loadContent = async (isFocusEvent = false) => {
      const now = Date.now();
      // Throttle window focus events to once every 15 seconds
      if (isFocusEvent && now - lastLoadedAt < 15000) return;
      lastLoadedAt = now;

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
      const savedClients = localStorage.getItem('custom_clients');
      if (savedClients) {
        try {
          const parsed = JSON.parse(savedClients);
          if (Array.isArray(parsed) && parsed.length > 0) setClients(parsed);
        } catch {}
      }
      const savedSettings = localStorage.getItem('custom_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed) setSettings(parsed);
        } catch {}
      }
      const savedFaqs = localStorage.getItem('custom_faqs');
      if (savedFaqs) {
        try {
          const parsed = JSON.parse(savedFaqs);
          if (Array.isArray(parsed) && parsed.length > 0) setFaqs(parsed);
        } catch {}
      }
      const savedServices = localStorage.getItem('custom_services');
      if (savedServices) {
        try {
          const parsed = JSON.parse(savedServices);
          if (parsed && parsed.cards) setServices(parsed);
        } catch {}
      }
      const savedAbout = localStorage.getItem('custom_about');
      if (savedAbout) {
        try {
          const parsed = JSON.parse(savedAbout);
          if (parsed && parsed.photo_url) setAbout(parsed);
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
          if (Array.isArray(data.clients) && data.clients.length > 0) {
            setClients(data.clients);
          }
          if (data.settings) {
            setSettings(data.settings);
          }
          if (Array.isArray(data.faqs) && data.faqs.length > 0) {
            setFaqs(data.faqs);
          }
          if (data.services && data.services.cards) {
            setServices(data.services);
          }
          if (data.about && data.about.photo_url) {
            setAbout(data.about);
          }
        }
      } catch (e) {
        // Fallback to local state
      }
    };

    loadContent();

    const handleFocus = () => loadContent(true);
    const handleStorage = () => loadContent(false);

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Video Lightbox Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl: string;
    posterUrl?: string;
    playlist: { title: string; videoUrl: string; posterUrl?: string; isVertical?: boolean }[];
    currentIndex: number;
  }>({
    isOpen: false,
    title: '',
    videoUrl: '',
    posterUrl: '',
    playlist: [],
    currentIndex: -1,
  });

  const openVideoModal = (
    title: string,
    videoUrl: string,
    posterUrl?: string,
    explicitPlaylist?: { title: string; videoUrl: string; posterUrl?: string; isVertical?: boolean }[],
    explicitIndex?: number
  ) => {
    let playlist = explicitPlaylist;
    let idx = explicitIndex ?? -1;

    if (!playlist || playlist.length === 0) {
      const heroList = reels
        .filter((r) => !r.hidden && (r.video_url || r.preview_video_url))
        .map((r) => ({
          title: lang === 'ru' ? r.title_ru : r.title_en,
          videoUrl: r.video_url || r.preview_video_url,
          posterUrl: r.thumbnail_url,
          isVertical: false,
        }));

      const worksList = works.flatMap((g) =>
        g.items
          .filter((i) => !i.hidden && i.video_url)
          .map((i) => ({
            title: lang === 'ru' ? i.title_ru : i.title_en,
            videoUrl: i.video_url,
            posterUrl: i.thumbnail_url,
            isVertical: g.isVertical,
          }))
      );

      playlist = [...heroList, ...worksList];
      idx = playlist.findIndex((item) => item.videoUrl === videoUrl);
      if (idx === -1) idx = 0;
    }

    setModalState({
      isOpen: true,
      title,
      videoUrl,
      posterUrl,
      playlist,
      currentIndex: idx,
    });

    if (title || videoUrl) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoTitle: title || 'Без названия', videoUrl }),
      }).catch(() => {});
    }
  };

  const navigateModalVideo = (newIndex: number) => {
    const nextItem = modalState.playlist[newIndex];
    if (!nextItem) return;

    setModalState((prev) => ({
      ...prev,
      title: nextItem.title,
      videoUrl: nextItem.videoUrl,
      posterUrl: nextItem.posterUrl,
      currentIndex: newIndex,
    }));

    if (nextItem.title || nextItem.videoUrl) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: nextItem.title || 'Без названия',
          videoUrl: nextItem.videoUrl,
        }),
      }).catch(() => {});
    }
  };

  const closeVideoModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: string) => {
    const targetId =
      section === 'works' || section === 'all' || section === 'projects' || section === 'проекты'
        ? 'works'
        : section === 'reels'
        ? 'reels'
        : section === 'services' || section === 'услуги'
        ? 'services'
        : section === 'clients' || section === 'клиенты'
        ? 'clients'
        : section === 'about' || section === 'обо мне'
        ? 'about'
        : section === 'faq' || section === 'f.a.q.'
        ? 'faq'
        : section === 'contacts' || section === 'контакты' || section === 'связаться'
        ? 'contacts'
        : 'works';

    setIsMenuOpen(false);

    const el = document.getElementById(targetId);
    if (!el) return;

    if (lenisRef.current && typeof window !== 'undefined' && window.innerWidth >= 1280) {
      lenisRef.current.scrollTo(el, { offset: -20, duration: 1.2 });
    } else if (typeof window !== 'undefined') {
      const elRect = el.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const targetTop = elRect.top + currentScrollY - 20;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });

      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {}
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuContainerRef.current?.contains(target) ||
        mobileMenuRef.current?.contains(target)
      ) {
        return;
      }
      setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  const MENU_ITEMS = [
    { key: 'works',    label: { ru: 'проекты',   en: 'projects' } },
    { key: 'clients',  label: { ru: 'клиенты',   en: 'clients' } },
    { key: 'services', label: { ru: 'услуги',    en: 'services' } },
    { key: 'contacts', label: { ru: 'контакты',  en: 'contacts' } },
  ];

  return (
    <>
      {/* ── Minimal Hobro-style Preloader with % counter and cycling dots (Desktop Only >= 1280px) ── */}
      <div className="hidden xl:block">
        <Preloader onComplete={() => setIsLoaded(true)} />
      </div>

      {/* ── True Geometric Displacement & RGB Chromatic Glitch Filter (Full Website, No Overlay Strips) ── */}
      <TrueGlitchFilter
        targetContainerRef={mainWrapperRef}
        scrollContainerRef={rightPanelRef}
      />

      <motion.div
        ref={mainWrapperRef}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="flex flex-col xl:flex-row min-h-screen xl:h-screen w-full overflow-x-hidden bg-[#0d0d0d] font-mono text-white relative will-change-transform transform-gpu"
      >
        {/* ── Left column: Frame 154 fixed Sidebar ── */}
        <Sidebar
          lang={lang}
          onLangChange={setLang}
          phone={settings.phone}
          email={settings.email}
        />

        {/* ── Right column: dynamic 58vw on desktop >=1280px (stretching on 2K/4K), fluid centered on mobile/tablets ── */}
        <main
          ref={rightPanelRef}
          className="right-panel w-full xl:w-[58vw] xl:flex-1 xl:min-w-[640px] min-h-screen xl:h-screen xl:overflow-y-auto overflow-x-hidden relative flex flex-col items-center xl:items-start"
        >
          <div className="w-full flex flex-col items-center py-6 px-4 sm:px-6 xl:px-8 2xl:px-12 pb-0">
            {/* Section 1: 5 Hero Reels */}
            <ReelsSection
              reels={reels.filter((r) => !r.hidden)}
              lang={lang}
              onVideoSelect={openVideoModal}
            />

            {/* 150px exact spacing between Hero Reels and Clients Section */}
            {!(settings.hidden_sections || []).includes('clients') && (
              <div className="h-[150px] w-full shrink-0" />
            )}

            {/* Section 2: Clients Grid Section */}
            {!(settings.hidden_sections || []).includes('clients') && (
              <ClientsSection
                lang={lang}
                clients={clients}
                onVideoSelect={openVideoModal}
              />
            )}

            {/* 150px exact spacing before Works Section */}
            {!(settings.hidden_sections || []).includes('works') && (
              <div className="h-[150px] w-full shrink-0" />
            )}

            {/* Section 3: Works by Categories */}
            {!(settings.hidden_sections || []).includes('works') && (
              <WorksSection
                sections={works}
                lang={lang}
                onVideoSelect={openVideoModal}
              />
            )}

            {/* 150px exact spacing between Works Section and Process/Services Section */}
            {!(settings.hidden_sections || []).includes('services') && (
              <div className="h-[150px] w-full shrink-0" />
            )}

            {/* Section 4: Process Section */}
            {!(settings.hidden_sections || []).includes('services') && (
              <ProcessSection
                lang={lang}
                containerRef={rightPanelRef}
                services={services}
              />
            )}

            {/* Section 5: About Vlad Section (hidden by default via hidden_sections) */}
            {!(settings.hidden_sections || ['about']).includes('about') && (
              <>
                <div className="h-[150px] w-full shrink-0" />
                <AboutSection
                  lang={lang}
                  about={about}
                />
              </>
            )}

            {/* 150px exact spacing between Clients/About Section and FAQ Section */}
            {!(settings.hidden_sections || []).includes('faq') && (
              <div className="h-[150px] w-full shrink-0" />
            )}

            {/* Section 6: FAQ Section with single open state */}
            {!(settings.hidden_sections || []).includes('faq') && (
              <FaqSection
                lang={lang}
                faqs={faqs}
              />
            )}

            {/* 150px exact spacing between FAQ Section and Contacts Section */}
            {!(settings.hidden_sections || []).includes('contacts') && (
              <div className="h-[150px] w-full shrink-0" />
            )}

            {/* Section 7: Contacts Section with interactive expanding pills (TG, BE, YT, IN*) */}
            {!(settings.hidden_sections || []).includes('contacts') && (
              <ContactSection
                lang={lang}
                settings={settings}
              />
            )}

            {/* 150px exact spacing at the very end of the site */}
            <div className="h-[150px] w-full shrink-0" />
          </div>
        </main>
      </motion.div>

      {/* ── MOBILE Globally Fixed RU / EN Language Toggle (Hidden when video modal is open) ── */}
      {!modalState.isOpen && (
        <div className="md:hidden fixed top-0 left-0 z-[100] flex items-center overflow-hidden shrink-0 shadow-lg">
          <button
            onClick={() => setLang('ru')}
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
            onClick={() => setLang('en')}
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
      )}

      {/* ── MOBILE Navigation Popup: Truly fixed to full viewport width with 20px padding on left and right ── */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden fixed left-[20px] right-[20px] bottom-[78px] bg-white flex flex-col transition-all duration-200 z-[110] shadow-2xl ${
          isMenuOpen && !modalState.isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
        }`}
        style={{ padding: '24px 20px 20px' }}
      >
        {/* Nav links: 2px gap between items */}
        <div className="flex flex-col gap-[2px]">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.key);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                scrollToSection(item.key);
              }}
              style={{
                fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: '130%',
                letterSpacing: '-0.2px',
              }}
              className="w-full text-left bg-transparent text-[#0B0B0B] hover:text-[#1458E6] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap border-none outline-none uppercase rounded-none p-0"
            >
              {item.label[lang]}
            </button>
          ))}
        </div>

        {/* Exact 52px gap between menu links and contacts (no border line) */}
        <div className="h-[52px] w-full shrink-0" />

        {/* Contact info at bottom of mobile popup: exact layout and font size (16px) matching hero screen */}
        <div
          style={{
            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: '120%',
            letterSpacing: '-0.16px',
          }}
          className="flex w-full items-start justify-between uppercase"
        >
          <div className="flex flex-col text-[#8C8E96] text-left leading-[120%]">
            <span>{lang === 'ru' ? 'ЗВОНИ:' : 'CALL:'}</span>
            <span>{lang === 'ru' ? 'ПИШИ:' : 'WRITE:'}</span>
          </div>
          <div className="flex flex-col items-end text-right leading-[120%]">
            <a
              href={`tel:${(settings.phone || '+7(950)016-17-51').replace(/[^\d+]/g, '')}`}
              className="text-[#0B0B0B] whitespace-nowrap"
            >
              {settings.phone || '+7(950)016-17-51'}
            </a>
            <a
              href={`mailto:${settings.email || 'ELECTICRATE@GMAIL.COM'}`}
              className="text-[#0B0B0B] whitespace-nowrap"
            >
              {settings.email || 'ELECTICRATE@GMAIL.COM'}
            </a>
          </div>
        </div>
      </div>

      {/* ── Globally Fixed Floating Bar (Hidden when video modal is open) ── */}
      {!modalState.isOpen && (
        <div className="fixed bottom-[16px] left-1/2 -translate-x-1/2 xl:translate-x-0 xl:left-[42vw] xl:pl-4 z-[100] flex items-center pointer-events-none">
          <div className="relative flex items-center gap-0 pointer-events-auto">
            {/* Menu Popup Container */}
            <div
              ref={menuContainerRef}
              onMouseEnter={() => setIsMenuOpen(true)}
              onMouseLeave={() => setIsMenuOpen(false)}
              className="relative group/menu"
            >
              {/* White Burger Button (54px on mobile, 58px on desktop) */}
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label="Меню навигации"
                className="w-[54px] h-[54px] xl:w-[58px] xl:h-[58px] rounded-full bg-white hover:bg-[#1458E6] hover:text-white active:scale-95 transition-all duration-200 flex flex-col items-center justify-center gap-[5px] cursor-pointer shadow-2xl border-none outline-none z-50 group shrink-0"
              >
                <span className={`w-5 h-[2px] bg-[#0B0B0B] group-hover:bg-white rounded-full transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
                <span className={`w-5 h-[2px] bg-[#0B0B0B] group-hover:bg-white rounded-full transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
              </button>

              {/* Navigation Badges Stack appearing above the burger for all screens */}
              <div
                style={{ paddingBottom: '12px' }}
                className={`flex absolute left-0 bottom-[56px] xl:bottom-[62px] flex-col items-start gap-[2px] transition-all duration-200 pointer-events-auto z-[150] shadow-2xl ${
                  isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
                }`}
              >
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      scrollToSection(item.key);
                      setIsMenuOpen(false);
                    }}
                    style={{
                      paddingLeft: '12px',
                      paddingRight: '16px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '125%',
                      letterSpacing: '-0.16px',
                    }}
                    className="w-full min-w-[130px] inline-block text-left bg-white hover:bg-[#1458E6] hover:text-white text-[#0B0B0B] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shadow-md border-none outline-none uppercase rounded-none"
                  >
                    {item.label[lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* Blue Contact Pill Button (Neat 20px horizontal padding, natural width) */}
            <a
              href={formatExternalUrl(settings.contact_button_url || settings.telegram, 'https://t.me/sapunov_vlad')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                fetch('/api/analytics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contactName: 'Кнопка СВЯЗАТЬСЯ' }),
                }).catch(() => {});
              }}
              aria-label="Связаться"
              style={{
                paddingLeft: '20px',
                paddingRight: '20px',
                fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '-0.2px',
                textTransform: 'uppercase',
              }}
              className="h-[54px] xl:h-[58px] flex items-center justify-center bg-[#1458E6] hover:bg-white hover:text-[#0B0B0B] text-white rounded-full active:scale-95 transition-all duration-200 cursor-pointer shadow-2xl border-none outline-none focus:outline-none shrink-0 no-underline whitespace-nowrap"
            >
              {lang === 'ru' ? 'СВЯЗАТЬСЯ' : 'CONTACT'}
            </a>
          </div>
        </div>
      )}

      {/* ── Video Lightbox Popup Modal (Placed at true root level) ── */}
      <VideoModal
        isOpen={modalState.isOpen}
        onClose={closeVideoModal}
        title={modalState.title}
        videoUrl={modalState.videoUrl}
        posterUrl={modalState.posterUrl}
        playlist={modalState.playlist}
        currentIndex={modalState.currentIndex}
        onNavigate={navigateModalVideo}
      />
    </>
  );
}

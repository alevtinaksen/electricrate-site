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

  // Initialize Lenis Smooth Scroll (identical to hobro.digital)
  useEffect(() => {
    if (!rightPanelRef.current) return;

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
    const el = document.getElementById(targetId);
    if (el) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -20, duration: 1.2 });
      } else if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({
          top: el.offsetTop - 20,
          behavior: 'smooth',
        });
      }
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const MENU_ITEMS = [
    { key: 'works',    label: { ru: 'проекты',   en: 'projects' } },
    { key: 'clients',  label: { ru: 'клиенты',   en: 'clients' } },
    { key: 'services', label: { ru: 'услуги',    en: 'services' } },
    { key: 'contacts', label: { ru: 'контакты',  en: 'contacts' } },
  ];

  return (
    <>
      {/* ── Minimal Hobro-style Preloader with % counter and cycling dots ── */}
      <Preloader onComplete={() => setIsLoaded(true)} />

      {/* ── True Geometric Displacement & RGB Chromatic Glitch Filter (Full Website, No Overlay Strips) ── */}
      <TrueGlitchFilter
        targetContainerRef={mainWrapperRef}
        scrollContainerRef={rightPanelRef}
      />

      <motion.div
        ref={mainWrapperRef}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row min-h-screen md:h-screen w-full overflow-x-hidden bg-[#0d0d0d] font-mono text-white relative will-change-transform transform-gpu"
      >
        {/* ── Left column: Frame 154 fixed Sidebar ── */}
        <Sidebar
          lang={lang}
          onLangChange={setLang}
          phone={settings.phone}
          email={settings.email}
        />

        {/* ── Right column: Lenis smooth scroll container, fixed 964px feed pinned to right ── */}
        <main
          ref={rightPanelRef}
          className="right-panel w-full md:w-[964px] md:min-w-[964px] md:max-w-[964px] min-h-screen md:h-screen md:overflow-y-auto overflow-x-hidden relative flex flex-col items-center shrink-0 bg-[#0d0d0d]"
        >
          <div className="w-full max-w-[964px] flex flex-col items-center py-6 px-4 sm:px-6 pb-0">
            {/* Section 1: 5 Hero Reels */}
            <ReelsSection
              reels={reels.filter((r) => !r.hidden)}
              lang={lang}
              onVideoSelect={openVideoModal}
            />

            {/* Section 2: Works by Categories */}
            <WorksSection
              sections={works}
              lang={lang}
              onVideoSelect={openVideoModal}
            />

            {/* 150px exact spacing between Works Section and Process/Services Section */}
            <div className="h-[150px] w-full shrink-0" />

            {/* Section 3: Process Section */}
            <ProcessSection
              lang={lang}
              containerRef={rightPanelRef}
              services={services}
            />

            {/* 150px exact spacing between Process Section and Clients Section */}
            <div className="h-[150px] w-full shrink-0" />

            {/* Section 4: Clients Grid Section */}
            <ClientsSection
              lang={lang}
              clients={clients}
              onVideoSelect={openVideoModal}
            />

            {/* 150px exact spacing between Clients Section and About Vlad Section */}
            <div className="h-[150px] w-full shrink-0" />

            {/* Section 5: About Vlad Section */}
            <AboutSection
              lang={lang}
              about={about}
            />

            {/* 150px exact spacing between About Vlad Section and FAQ Section */}
            <div className="h-[150px] w-full shrink-0" />

            {/* Section 6: FAQ Section with single open state */}
            <FaqSection
              lang={lang}
              faqs={faqs}
            />

            {/* 150px exact spacing between FAQ Section and Contacts Section */}
            <div className="h-[150px] w-full shrink-0" />

            {/* Section 7: Contacts Section with interactive expanding pills (TG, BE, YT, IN*) */}
            <ContactSection
              lang={lang}
              settings={settings}
            />

            {/* 150px exact spacing at the very end of the site */}
            <div className="h-[150px] w-full shrink-0" />
          </div>

          {/* ── Fixed Bottom-Left Floating Bar: Menu Burger Button + Blue «СВЯЗАТЬСЯ» Button (Frame 135BBEFD) ── */}
          <div className="fixed bottom-[16px] left-[16px] sm:left-[24px] md:left-[calc(100vw-964px+20px)] z-50 flex items-center pointer-events-none">
            <div
              style={{
                paddingTop: '0px',
                paddingRight: '0px',
                paddingBottom: '0px',
                paddingLeft: '0px',
              }}
              className="relative flex items-center gap-0 pointer-events-auto"
            >
              {/* Menu Popup Container (Opens on hover and on click, persists until mouse leaves or item clicked) */}
              <div
                ref={menuContainerRef}
                onMouseEnter={() => setIsMenuOpen(true)}
                onMouseLeave={() => setIsMenuOpen(false)}
                className="relative group/menu"
              >
                {/* 65x65 White Burger Button */}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-label="Меню навигации"
                  className="w-[65px] h-[65px] rounded-full bg-white hover:bg-[#1458E6] hover:text-white active:scale-95 transition-all duration-200 flex flex-col items-center justify-center gap-[6px] cursor-pointer shadow-none border-none outline-none z-50 group shrink-0"
                >
                  <span className={`w-6 h-[2.5px] bg-[#0B0B0B] group-hover:bg-white rounded-full transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-[4.5px]' : ''}`} />
                  <span className={`w-6 h-[2.5px] bg-[#0B0B0B] group-hover:bg-white rounded-full transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
                </button>

                {/* Badges Stack appearing above the burger (exact 20px gap between bottom item and burger button) */}
                <div
                  style={{ paddingBottom: '20px' }}
                  className={`absolute left-0 bottom-[65px] flex flex-col items-start gap-[2px] transition-all duration-200 pointer-events-auto z-50 ${
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
                        padding: '6px',
                        fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                        fontSize: '16px',
                        fontWeight: 700,
                        lineHeight: '125%',
                        letterSpacing: '-0.16px',
                      }}
                      className="w-fit inline-block text-left bg-white hover:bg-[#1458E6] hover:text-white text-[#0B0B0B] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shadow-none border-none outline-none uppercase rounded-none"
                    >
                      {item.label[lang]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blue Contact Pill Button (Opens custom link from Settings -> Contacts) */}
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
                  width: '187px',
                  height: '65px',
                  fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: '125%',
                  letterSpacing: '-0.2px',
                  textTransform: 'uppercase',
                }}
                className="flex items-center justify-center bg-[#1458E6] hover:bg-white hover:text-[#0B0B0B] text-white rounded-full active:scale-95 transition-all duration-200 cursor-pointer shadow-none border-none outline-none focus:outline-none shrink-0 no-underline"
              >
                {lang === 'ru' ? 'СВЯЗАТЬСЯ' : 'CONTACT'}
              </a>
            </div>
          </div>
        </main>

        {/* ── Video Lightbox Popup Modal ── */}
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
      </motion.div>
    </>
  );
}

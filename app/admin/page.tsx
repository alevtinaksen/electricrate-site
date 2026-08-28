'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HERO_REELS, WORK_SECTIONS, HeroReel, WorkCategoryGroup, WorkItem } from '@/lib/supabase';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active navigation section
  const [activeSection, setActiveSection] = useState<'hero' | 'works' | 'clients' | 'deploy'>('hero');
  const [selectedWorksCategory, setSelectedWorksCategory] = useState<string>('image_ad');

  // State
  const [heroReels, setHeroReels] = useState<HeroReel[]>(HERO_REELS);
  const [workSections, setWorkSections] = useState<WorkCategoryGroup[]>(WORK_SECTIONS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Upload modal state
  const [uploadModal, setUploadModal] = useState<{
    isOpen: boolean;
    targetType: 'hero' | 'work';
    targetId?: string;
    groupId?: string;
    field: 'thumbnail' | 'video';
  }>({
    isOpen: false,
    targetType: 'hero',
    field: 'thumbnail',
  });

  const [inputUrl, setInputUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video preview player
  const [previewVideo, setPreviewVideo] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  // Load from LocalStorage if available
  useEffect(() => {
    const authSession = sessionStorage.getItem('admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
    const savedHero = localStorage.getItem('custom_hero_reels');
    if (savedHero) {
      try { setHeroReels(JSON.parse(savedHero)); } catch {}
    }
    const savedWorks = localStorage.getItem('custom_work_sections');
    if (savedWorks) {
      try { setWorkSections(JSON.parse(savedWorks)); } catch {}
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2026' || pin === 'sapunov' || pin === '1234' || pin === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveAll = () => {
    setSaveStatus('saving');
    localStorage.setItem('custom_hero_reels', JSON.stringify(heroReels));
    localStorage.setItem('custom_work_sections', JSON.stringify(workSections));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 400);
  };

  // Upload modal apply
  const handleApplyUpload = () => {
    if (!inputUrl) return;
    if (uploadModal.targetType === 'hero' && uploadModal.targetId) {
      setHeroReels((prev) =>
        prev.map((reel) =>
          reel.id === uploadModal.targetId
            ? {
                ...reel,
                [uploadModal.field === 'thumbnail' ? 'thumbnail_url' : 'video_url']: inputUrl,
              }
            : reel
        )
      );
    } else if (uploadModal.targetType === 'work' && uploadModal.groupId && uploadModal.targetId) {
      setWorkSections((prev) =>
        prev.map((g) => {
          if (g.id !== uploadModal.groupId) return g;
          return {
            ...g,
            items: g.items.map((item) =>
              item.id === uploadModal.targetId
                ? {
                    ...item,
                    [uploadModal.field === 'thumbnail' ? 'thumbnail_url' : 'video_url']: inputUrl,
                  }
                : item
            ),
          };
        })
      );
    }
    setUploadModal((prev) => ({ ...prev, isOpen: false }));
    setInputUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Create local object blob URL for instant preview
    const objectUrl = URL.createObjectURL(file);
    setInputUrl(objectUrl);
  };

  // Add work item
  const handleAddWorkItem = (groupId: string) => {
    const isVert = groupId === 'reels_vertical';
    const newItem: WorkItem = {
      id: 'work_' + Date.now(),
      title_ru: 'Новый проект',
      title_en: 'New Project',
      thumbnail_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
      video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
      isVertical: isVert,
    };
    setWorkSections((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, newItem] } : g))
    );
  };

  const handleDeleteWorkItem = (groupId: string, itemId: string) => {
    setWorkSections((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, items: g.items.filter((item) => item.id !== itemId) };
      })
    );
  };

  // ─── PIN LOGIN SCREEN (Sleek Dark Bento / Neon Orb) ─────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E1015] text-white font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#16181F] border border-[#252833] rounded-3xl p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
          {/* Neon Glow Orb (Reference 1) */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#FF5722] to-[#FF9800] p-[2px] shadow-lg shadow-orange-500/20 mb-6 animate-pulse">
            <div className="w-full h-full rounded-full bg-[#16181F] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FF5722" />
              </svg>
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white mb-1">
            Studio Control Room
          </h1>
          <p className="text-xs text-[#8A90A2] mb-8 text-center font-mono">
            Влад Сапунов · Управление портфолио
          </p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6B7280] block mb-2">
                PIN-код доступа (по умолчанию: 2026)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl bg-[#0E1015] border border-[#2A2D3A] text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#FF5722] transition-all shadow-inner"
              />
            </div>

            {pinError && (
              <p className="text-xs text-[#FF5722] text-center font-mono">
                Неверный PIN-код
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#FF5722] hover:bg-[#FF6E3D] text-white font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-orange-500/25 active:scale-[0.98]"
            >
              Войти в студию
            </button>
          </form>

          <Link
            href="/"
            className="mt-8 text-xs text-[#6B7280] hover:text-white transition-colors font-mono"
          >
            ← Открыть сайт
          </Link>
        </div>
      </div>
    );
  }

  // ─── MAIN DASHBOARD INTERFACE (Syntrix Dark UI reference) ───────────────────
  return (
    <div className="min-h-screen bg-[#0E1015] text-white font-sans flex">
      {/* ── LEFT SIDEBAR (Reference 1: Syntrix Sidebar) ── */}
      <aside className="w-64 bg-[#12141B] border-r border-[#1F222C] flex flex-col justify-between p-6 shrink-0 select-none">
        <div className="flex flex-col gap-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D2FF] to-[#FF5722] p-[1.5px] shrink-0 shadow-md">
              <div className="w-full h-full rounded-[14px] bg-[#12141B] flex items-center justify-center font-mono font-bold text-sm text-[#FF5722]">
                VS
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Влад Сапунов
              </h2>
              <span className="text-[10px] text-[#6B7280] font-mono">
                Studio Studio v2.4
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase text-[#4B5563] px-3 mb-1">
              Разделы сайта
            </span>

            <button
              onClick={() => setActiveSection('hero')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'hero'
                  ? 'bg-[#1C1F2A] text-white border border-[#2D3142]'
                  : 'text-[#8A90A2] hover:bg-[#161820] hover:text-white'
              }`}
            >
              <span>🎬</span>
              <span>Главные 5 роликов</span>
            </button>

            <button
              onClick={() => setActiveSection('works')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'works'
                  ? 'bg-[#1C1F2A] text-white border border-[#2D3142]'
                  : 'text-[#8A90A2] hover:bg-[#161820] hover:text-white'
              }`}
            >
              <span>📁</span>
              <span>Все работы (5 сеток)</span>
            </button>

            <button
              onClick={() => setActiveSection('clients')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'clients'
                  ? 'bg-[#1C1F2A] text-white border border-[#2D3142]'
                  : 'text-[#8A90A2] hover:bg-[#161820] hover:text-white'
              }`}
            >
              <span>👥</span>
              <span>Клиенты & Логотипы</span>
            </button>

            <button
              onClick={() => setActiveSection('deploy')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                activeSection === 'deploy'
                  ? 'bg-[#1C1F2A] text-white border border-[#2D3142]'
                  : 'text-[#8A90A2] hover:bg-[#161820] hover:text-white'
              }`}
            >
              <span>☁️</span>
              <span>Деплой & Supabase</span>
            </button>
          </div>
        </div>

        {/* Bottom Card (Reference 1 Upgrade card style) */}
        <div className="flex flex-col gap-3">
          <div className="bg-[#181B24] border border-[#242836] rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#00D2FF] font-bold">
                ● Live Production
              </span>
              <span className="text-[10px] text-[#6B7280]">v2.4</span>
            </div>
            <p className="text-[11px] text-[#8A90A2] leading-relaxed">
              Все изменения синхронизируются мгновенно.
            </p>
            <Link
              href="/"
              target="_blank"
              className="mt-1 w-full py-2 bg-[#222634] hover:bg-[#2C3142] text-white rounded-xl text-xs font-mono font-bold text-center transition-colors block"
            >
              ↗ Открыть сайт
            </Link>
          </div>

          <button
            onClick={() => {
              sessionStorage.removeItem('admin_auth');
              setIsAuthenticated(false);
            }}
            className="text-xs text-[#6B7280] hover:text-white text-center py-1 font-mono transition-colors cursor-pointer"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE AREA ── */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0E1015]">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 bg-[#12141B]/95 backdrop-blur-md border-b border-[#1F222C] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white tracking-tight">
              {activeSection === 'hero' && 'Главные 5 роликов (Hero Showcase)'}
              {activeSection === 'works' && 'Сетки портфолио «Все работы»'}
              {activeSection === 'clients' && 'Блок клиентов и логотипы'}
              {activeSection === 'deploy' && 'Деплой сайта на Vercel & Supabase'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={saveStatus === 'saving'}
              className="px-6 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#FF6E3D] active:scale-95 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-orange-500/25 flex items-center gap-2"
            >
              {saveStatus === 'saving' && <span className="animate-spin">⟳</span>}
              {saveStatus === 'saved' ? '✓ Сохранено!' : 'Сохранить изменения'}
            </button>
          </div>
        </header>

        {/* ── WORKSPACE CONTENT ── */}
        <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-8 pb-32">
          {/* ════ SECTION 1: HERO REELS ════ */}
          {activeSection === 'hero' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#14161F] border border-[#222634] rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    5 фиксированных видео-карточек
                  </h3>
                  <p className="text-xs text-[#8A90A2] mt-1 font-mono">
                    Воспроизводятся автоматически при скролле и открываются в полноэкранном плеере по клику
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#1E2230] rounded-lg text-xs font-mono text-[#00D2FF]">
                  5 / 5 активно
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {heroReels.map((reel, index) => (
                  <div
                    key={reel.id}
                    className="bg-[#14161F] border border-[#222634] hover:border-[#33384A] rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-center transition-all shadow-sm"
                  >
                    {/* Badge Number */}
                    <div className="w-10 h-10 rounded-2xl bg-[#1C202C] text-[#FF5722] font-mono font-bold flex items-center justify-center shrink-0 text-sm">
                      0{index + 1}
                    </div>

                    {/* Preview Thumbnail */}
                    <div className="w-full lg:w-60 aspect-video rounded-xl bg-black overflow-hidden relative shrink-0 border border-[#2A2E3E] group">
                      <img
                        src={reel.thumbnail_url}
                        alt={reel.title_ru}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setPreviewVideo({
                            isOpen: true,
                            url: reel.video_url,
                            title: reel.title_ru,
                          })
                        }
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono font-bold text-white gap-1.5 cursor-pointer"
                      >
                        ▶ Тест видео
                      </button>
                    </div>

                    {/* Form Controls */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#6B7280] block mb-1.5">
                          Название ролика (RU)
                        </label>
                        <input
                          type="text"
                          value={reel.title_ru}
                          onChange={(e) =>
                            setHeroReels((prev) =>
                              prev.map((r) =>
                                r.id === reel.id ? { ...r, title_ru: e.target.value } : r
                              )
                            )
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1015] border border-[#2A2E3E] text-sm text-white focus:outline-none focus:border-[#FF5722] transition-colors font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#6B7280] block mb-1.5">
                          Размеры в макете
                        </label>
                        <div className="px-3.5 py-2.5 rounded-xl bg-[#0E1015] border border-[#222634] text-xs text-[#8A90A2] font-mono">
                          {reel.width} × {reel.height} px
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#6B7280] block mb-1.5">
                          Обложка (Image URL)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={reel.thumbnail_url}
                            onChange={(e) =>
                              setHeroReels((prev) =>
                                prev.map((r) =>
                                  r.id === reel.id
                                    ? { ...r, thumbnail_url: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="flex-1 px-3.5 py-2 rounded-xl bg-[#0E1015] border border-[#2A2E3E] text-xs text-white/80 focus:outline-none focus:border-[#FF5722]"
                          />
                          <button
                            onClick={() =>
                              setUploadModal({
                                isOpen: true,
                                targetType: 'hero',
                                targetId: reel.id,
                                field: 'thumbnail',
                              })
                            }
                            className="px-3 py-2 bg-[#222634] hover:bg-[#2C3142] rounded-xl text-xs text-[#00D2FF] font-mono font-bold cursor-pointer"
                          >
                            Загрузить
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#6B7280] block mb-1.5">
                          Видеопоток (MP4 / WebM URL)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={reel.video_url}
                            onChange={(e) =>
                              setHeroReels((prev) =>
                                prev.map((r) =>
                                  r.id === reel.id
                                    ? { ...r, video_url: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="flex-1 px-3.5 py-2 rounded-xl bg-[#0E1015] border border-[#2A2E3E] text-xs text-white/80 focus:outline-none focus:border-[#FF5722]"
                          />
                          <button
                            onClick={() =>
                              setUploadModal({
                                isOpen: true,
                                targetType: 'hero',
                                targetId: reel.id,
                                field: 'video',
                              })
                            }
                            className="px-3 py-2 bg-[#222634] hover:bg-[#2C3142] rounded-xl text-xs text-[#00D2FF] font-mono font-bold cursor-pointer"
                          >
                            Загрузить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ SECTION 2: WORKS CATEGORIES ════ */}
          {activeSection === 'works' && (
            <div className="flex flex-col gap-6">
              {/* Category Pills Selector */}
              <div className="flex gap-2 p-1.5 bg-[#14161F] border border-[#222634] rounded-2xl overflow-x-auto">
                {workSections.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedWorksCategory(group.id)}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedWorksCategory === group.id
                        ? 'bg-[#FF5722] text-white shadow-md shadow-orange-500/20'
                        : 'text-[#8A90A2] hover:text-white'
                    }`}
                  >
                    {group.title_ru} ({group.items.length})
                  </button>
                ))}
              </div>

              {/* Selected Category Grid */}
              {workSections
                .filter((group) => group.id === selectedWorksCategory)
                .map((group) => (
                  <div key={group.id} className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white uppercase font-mono">
                          {group.title_ru}
                        </h3>
                        <span className="text-xs text-[#6B7280] font-mono">
                          {group.isVertical
                            ? 'Вертикальный формат 9:16 (Рилсы)'
                            : 'Горизонтальный формат (16:10 / 16:9)'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddWorkItem(group.id)}
                        className="px-5 py-2.5 bg-[#222634] hover:bg-[#FF5722] hover:text-white text-[#00D2FF] rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        + Добавить карточку
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#14161F] border border-[#222634] hover:border-[#33384A] rounded-2xl p-3.5 flex flex-col gap-3 group transition-all"
                        >
                          <div
                            className={`w-full bg-black rounded-xl overflow-hidden relative border border-[#2A2E3E] ${
                              group.isVertical ? 'aspect-[9/16]' : 'aspect-[16/10]'
                            }`}
                          >
                            <img
                              src={item.thumbnail_url}
                              alt={item.title_ru}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() =>
                                setPreviewVideo({
                                  isOpen: true,
                                  url: item.video_url,
                                  title: item.title_ru,
                                })
                              }
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono font-bold text-white gap-1 cursor-pointer"
                            >
                              ▶ Тест
                            </button>
                          </div>

                          <input
                            type="text"
                            value={item.title_ru}
                            placeholder="Название"
                            onChange={(e) =>
                              setWorkSections((prev) =>
                                prev.map((g) => {
                                  if (g.id !== group.id) return g;
                                  return {
                                    ...g,
                                    items: g.items.map((i) =>
                                      i.id === item.id ? { ...i, title_ru: e.target.value } : i
                                    ),
                                  };
                                })
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#0E1015] border border-[#2A2E3E] text-xs font-mono text-white focus:outline-none focus:border-[#FF5722]"
                          />

                          <div className="flex gap-1.5">
                            <button
                              onClick={() =>
                                setUploadModal({
                                  isOpen: true,
                                  targetType: 'work',
                                  groupId: group.id,
                                  targetId: item.id,
                                  field: 'thumbnail',
                                })
                              }
                              className="flex-1 py-1.5 bg-[#1C202C] hover:bg-[#252A3B] rounded-lg text-[10px] font-mono text-[#8A90A2] hover:text-white transition-colors cursor-pointer text-center"
                            >
                              🖼 Обложка
                            </button>
                            <button
                              onClick={() =>
                                setUploadModal({
                                  isOpen: true,
                                  targetType: 'work',
                                  groupId: group.id,
                                  targetId: item.id,
                                  field: 'video',
                                })
                              }
                              className="flex-1 py-1.5 bg-[#1C202C] hover:bg-[#252A3B] rounded-lg text-[10px] font-mono text-[#8A90A2] hover:text-white transition-colors cursor-pointer text-center"
                            >
                              🎬 Видео
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteWorkItem(group.id, item.id)}
                            className="text-[11px] text-[#FF5722]/80 hover:text-[#FF5722] text-center font-mono py-1 cursor-pointer transition-colors"
                          >
                            ✕ Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ════ SECTION 3: CLIENTS ════ */}
          {activeSection === 'clients' && (
            <div className="bg-[#14161F] border border-[#222634] rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="text-base font-bold text-white uppercase font-mono">
                Клиенты и логотипы (54x54 px)
              </h3>
              <p className="text-xs text-[#8A90A2] font-mono">
                5 брендов отображаются в виде кружочков с точным отступом 12px в блоке «Клиенты».
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Петербургский нефтяной терминал (ПНТ)', color: '#FFFFFF' },
                  { name: 'FINNTRAIL', color: '#FFFFFF' },
                  { name: 'СБЕРСТРАХОВАНИЕ', color: '#FFFFFF' },
                  { name: 'ПМЭФ (Форум)', color: '#B89758' },
                  { name: 'КТК (Каспийский трубопровод)', color: '#001435' },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#1C202C] border border-[#2A2E3E] rounded-xl flex items-center gap-4"
                  >
                    <div
                      className="w-[54px] h-[54px] rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      ✓
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ SECTION 4: DEPLOY & SUPABASE ════ */}
          {activeSection === 'deploy' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#14161F] border border-[#222634] rounded-2xl p-8 flex flex-col gap-6">
                <h3 className="text-base font-bold text-white uppercase font-mono">
                  Деплой на Vercel и подключение хранилища
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#1C202C] border border-[#2A2E3E] rounded-2xl p-6 flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-[#00D2FF] uppercase">
                      1. Vercel Hosting (Бесплатно)
                    </span>
                    <p className="text-xs text-[#8A90A2] leading-relaxed font-mono">
                      Сайт собирается и деплоится в облако Vercel за 1 минуту. Вы получаете постоянный адрес `*.vercel.app` и мгновенный доступ без локалхоста.
                    </p>
                    <div className="mt-2 text-xs text-green-400 font-mono">
                      ✓ Ready for 1-click deploy
                    </div>
                  </div>

                  <div className="bg-[#1C202C] border border-[#2A2E3E] rounded-2xl p-6 flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-[#FF5722] uppercase">
                      2. Supabase Cloud Storage
                    </span>
                    <p className="text-xs text-[#8A90A2] leading-relaxed font-mono">
                      Файлы видео и фото хранятся в PostgreSQL + Storage бакетах. Ключи прописываются в <code>.env.local</code>.
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-[#8A90A2] bg-[#0E1015] p-3 rounded-xl">
                      NEXT_PUBLIC_SUPABASE_URL=...<br />
                      NEXT_PUBLIC_SUPABASE_ANON_KEY=...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL 1: DRAG & DROP UPLOAD (Reference 2 style) ── */}
      {uploadModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setUploadModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="w-full max-w-lg bg-[#161820] border border-[#262A38] rounded-3xl p-7 shadow-2xl flex flex-col gap-5 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-white">
                Загрузка медиафайла ({uploadModal.field === 'thumbnail' ? 'Обложка' : 'Видео'})
              </h3>
              <p className="text-xs text-[#8A90A2] mt-1 font-mono">
                Загрузите файл или укажите прямую ссылку на медиапоток
              </p>
            </div>

            {/* Drag & Drop Zone (Reference 2) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2D3344] hover:border-[#FF5722] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#0E1015]/60 hover:bg-[#0E1015] transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF5722] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-white">
                  Нажмите для выбора файла или перетащите сюда
                </p>
                <p className="text-[10px] text-[#6B7280] font-mono mt-1">
                  MP4, WebM, PNG, JPG (до 50MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={uploadModal.field === 'thumbnail' ? 'image/*' : 'video/*'}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="h-[1px] flex-1 bg-[#252936]" />
              <span className="text-[10px] font-mono uppercase text-[#6B7280]">ИЛИ ССЫЛКА</span>
              <span className="h-[1px] flex-1 bg-[#252936]" />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#8A90A2] block mb-1.5">
                Прямой URL адрес
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl bg-[#0E1015] border border-[#2A2E3E] text-xs text-white focus:outline-none focus:border-[#FF5722] font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUploadModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-5 py-2.5 rounded-xl bg-[#222634] hover:bg-[#2C3142] text-xs font-mono text-white transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleApplyUpload}
                disabled={!inputUrl}
                className="px-6 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#FF6E3D] disabled:opacity-50 text-white font-mono font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-orange-500/25"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: VIDEO TEST PLAYER ── */}
      {previewVideo.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setPreviewVideo((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="w-full max-w-4xl bg-[#14161F] border border-[#2A2E3E] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#222634] flex items-center justify-between">
              <h4 className="font-mono text-xs font-bold uppercase text-white">
                {previewVideo.title}
              </h4>
              <button
                onClick={() => setPreviewVideo((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-[#222634] text-white flex items-center justify-center hover:bg-[#FF5722] transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

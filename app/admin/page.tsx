'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HERO_REELS, WORK_SECTIONS, HeroReel, WorkCategoryGroup, WorkItem } from '@/lib/supabase';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'hero' | 'works' | 'deploy'>('hero');
  const [selectedCategory, setSelectedCategory] = useState<string>('image_ad');

  // State for content
  const [heroReels, setHeroReels] = useState<HeroReel[]>(HERO_REELS);
  const [workSections, setWorkSections] = useState<WorkCategoryGroup[]>(WORK_SECTIONS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Active testing video player in modal
  const [testPlayer, setTestPlayer] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl: string;
  }>({
    isOpen: false,
    title: '',
    videoUrl: '',
  });

  // Load from LocalStorage
  useEffect(() => {
    const authSession = sessionStorage.getItem('admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
    const savedHero = localStorage.getItem('custom_hero_reels');
    if (savedHero) {
      try {
        const parsed = JSON.parse(savedHero);
        if (Array.isArray(parsed) && parsed.length > 0) setHeroReels(parsed);
      } catch {}
    }
    const savedWorks = localStorage.getItem('custom_work_sections');
    if (savedWorks) {
      try {
        const parsed = JSON.parse(savedWorks);
        if (Array.isArray(parsed) && parsed.length > 0) setWorkSections(parsed);
      } catch {}
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

  const handleSave = () => {
    localStorage.setItem('custom_hero_reels', JSON.stringify(heroReels));
    localStorage.setItem('custom_work_sections', JSON.stringify(workSections));
    // Trigger storage event for live sync with other open tabs
    window.dispatchEvent(new Event('storage'));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  // Hero Reel editing helpers
  const updateHeroReel = (id: string, field: keyof HeroReel, value: any) => {
    setHeroReels((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Works editing helpers
  const updateWorkItem = (
    groupId: string,
    itemId: string,
    field: keyof WorkItem,
    value: any
  ) => {
    setWorkSections((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
        };
      })
    );
  };

  const addWorkItem = (groupId: string) => {
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

  const deleteWorkItem = (groupId: string, itemId: string) => {
    setWorkSections((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, items: g.items.filter((i) => i.id !== itemId) };
      })
    );
  };

  // ─── LOGIN SCREEN (Minimalist Dark) ─────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white font-mono flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#121215] border border-[#202026] rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#2957DE] text-white font-bold flex items-center justify-center text-sm mb-4">
            VS
          </div>
          <h1 className="text-base font-bold uppercase tracking-wider mb-1">
            Студия · Панель
          </h1>
          <p className="text-[11px] text-[#666] mb-6 text-center">
            Влад Сапунов · Введите PIN (2026)
          </p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#0a0a0c] border border-[#262630] text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#2957DE] transition-colors"
            />

            {pinError && (
              <p className="text-[11px] text-red-400 text-center">Неверный PIN-код</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2957DE] hover:bg-[#3463ea] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Войти
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 text-[11px] text-[#555] hover:text-white transition-colors"
          >
            ← Открыть сайт
          </Link>
        </div>
      </div>
    );
  }

  // ─── MAIN ADMIN DASHBOARD (Minimalist Dark Studio) ───────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-mono flex">
      {/* ── Minimalist Left Sidebar ── */}
      <aside className="w-64 bg-[#111216] border-r border-[#1e1f26] flex flex-col justify-between p-5 shrink-0 select-none">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#1e1f26]">
            <div className="w-8 h-8 rounded-full bg-[#2957DE] text-white font-bold flex items-center justify-center text-xs">
              VS
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Влад Сапунов
              </h2>
              <span className="text-[10px] text-[#666]">Управление видео</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('hero')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                activeTab === 'hero'
                  ? 'bg-[#2957DE] text-white'
                  : 'text-[#888] hover:bg-[#181920] hover:text-white'
              }`}
            >
              <span>🎬</span>
              <span>1. Главные 5 роликов</span>
            </button>

            <button
              onClick={() => setActiveTab('works')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                activeTab === 'works'
                  ? 'bg-[#2957DE] text-white'
                  : 'text-[#888] hover:bg-[#181920] hover:text-white'
              }`}
            >
              <span>📁</span>
              <span>2. Все работы (5 сеток)</span>
            </button>

            <button
              onClick={() => setActiveTab('deploy')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                activeTab === 'deploy'
                  ? 'bg-[#2957DE] text-white'
                  : 'text-[#888] hover:bg-[#181920] hover:text-white'
              }`}
            >
              <span>☁️</span>
              <span>3. Деплой и облако</span>
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#1e1f26]">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 bg-[#181920] hover:bg-[#20222c] text-white rounded-xl text-xs font-bold text-center transition-colors block"
          >
            ↗ Открыть сайт
          </Link>

          <button
            onClick={() => {
              sessionStorage.removeItem('admin_auth');
              setIsAuthenticated(false);
            }}
            className="text-[11px] text-[#666] hover:text-white text-center py-1 transition-colors cursor-pointer"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0a0a0c]">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 bg-[#111216]/95 backdrop-blur-md border-b border-[#1e1f26] px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold uppercase tracking-wider text-white">
              {activeTab === 'hero' && 'Главные 5 роликов (Hero-лента)'}
              {activeTab === 'works' && 'Сетки портфолио «Все работы»'}
              {activeTab === 'deploy' && 'Деплой на Vercel & Supabase'}
            </h1>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all cursor-pointer shadow-md ${
              saveStatus === 'saved'
                ? 'bg-green-500 text-black'
                : 'bg-[#2957DE] hover:bg-[#3463ea] text-white'
            }`}
          >
            {saveStatus === 'saved' ? '✓ Сохранено' : 'Сохранить изменения'}
          </button>
        </header>

        {/* Workspace Body */}
        <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8 pb-32">
          {/* ════ TAB 1: 5 HERO REELS ════ */}
          {activeTab === 'hero' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#121216] border border-[#1e1f26] rounded-xl p-4 flex items-center justify-between text-xs text-[#888]">
                <span>
                  У каждого ролика 2 источника: <b>1. Мини-видео (Loop превью)</b> для ленты и <b>2. Полный видеопоток</b> для попапа.
                </span>
                <span className="text-[#2957DE] font-bold">5 из 5 активно</span>
              </div>

              <div className="flex flex-col gap-5">
                {heroReels.map((reel, index) => (
                  <div
                    key={reel.id}
                    className="bg-[#121216] border border-[#1e1f26] hover:border-[#2b2d38] rounded-2xl p-5 flex flex-col gap-4 transition-all"
                  >
                    {/* Top Row: Number + Title + Size badge */}
                    <div className="flex items-center justify-between border-b border-[#1a1b22] pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#1a1b22] text-[#2957DE] font-bold text-xs flex items-center justify-center">
                          0{index + 1}
                        </span>
                        <span className="text-sm font-bold uppercase text-white">
                          {reel.title_ru}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#181920] text-[#888]">
                          Размер: {reel.width} × {reel.height} px
                        </span>

                        <button
                          onClick={() =>
                            setTestPlayer({
                              isOpen: true,
                              title: reel.title_ru,
                              videoUrl: reel.video_url || reel.preview_video_url,
                            })
                          }
                          className="px-3 py-1 rounded-lg bg-[#2957DE] hover:bg-[#3463ea] text-white text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          ▶ Тест видео
                        </button>
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name RU */}
                      <div>
                        <label className="text-[10px] uppercase text-[#666] block mb-1">
                          Название ролика (RU)
                        </label>
                        <input
                          type="text"
                          value={reel.title_ru}
                          onChange={(e) =>
                            updateHeroReel(reel.id, 'title_ru', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#0a0a0c] border border-[#22232b] text-xs text-white focus:outline-none focus:border-[#2957DE]"
                        />
                      </div>

                      {/* Name EN */}
                      <div>
                        <label className="text-[10px] uppercase text-[#666] block mb-1">
                          Название ролика (EN)
                        </label>
                        <input
                          type="text"
                          value={reel.title_en}
                          onChange={(e) =>
                            updateHeroReel(reel.id, 'title_en', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#0a0a0c] border border-[#22232b] text-xs text-white focus:outline-none focus:border-[#2957DE]"
                        />
                      </div>

                      {/* Attribute 1: Мини-видео (превью) */}
                      <div>
                        <label className="text-[10px] uppercase text-[#2957DE] font-bold block mb-1">
                          1. Мини-видео (Loop превью в ленте)
                        </label>
                        <input
                          type="text"
                          value={reel.preview_video_url}
                          placeholder="https://.../preview.mp4"
                          onChange={(e) =>
                            updateHeroReel(reel.id, 'preview_video_url', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#0a0a0c] border border-[#22232b] text-xs text-white focus:outline-none focus:border-[#2957DE] font-sans"
                        />
                      </div>

                      {/* Attribute 2: Полноразмерный видеопоток */}
                      <div>
                        <label className="text-[10px] uppercase text-[#2957DE] font-bold block mb-1">
                          2. Полноразмерный видеопоток (HD видео для попапа)
                        </label>
                        <input
                          type="text"
                          value={reel.video_url}
                          placeholder="https://.../full_video.mp4"
                          onChange={(e) =>
                            updateHeroReel(reel.id, 'video_url', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#0a0a0c] border border-[#22232b] text-xs text-white focus:outline-none focus:border-[#2957DE] font-sans"
                        />
                      </div>

                      {/* Attribute 3: Обложка/постер */}
                      <div className="md:col-span-2">
                        <label className="text-[10px] uppercase text-[#666] block mb-1">
                          3. Обложка / постер (Image URL)
                        </label>
                        <input
                          type="text"
                          value={reel.thumbnail_url}
                          placeholder="https://.../poster.jpg"
                          onChange={(e) =>
                            updateHeroReel(reel.id, 'thumbnail_url', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#0a0a0c] border border-[#22232b] text-xs text-white focus:outline-none focus:border-[#2957DE] font-sans"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ TAB 2: WORKS SECTION ════ */}
          {activeTab === 'works' && (
            <div className="flex flex-col gap-6">
              {/* Category selector pills */}
              <div className="flex gap-2 p-1.5 bg-[#121216] border border-[#1e1f26] rounded-xl overflow-x-auto">
                {workSections.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedCategory(group.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === group.id
                        ? 'bg-[#2957DE] text-white shadow-sm'
                        : 'text-[#888] hover:text-white'
                    }`}
                  >
                    {group.title_ru} ({group.items.length})
                  </button>
                ))}
              </div>

              {/* Selected category editor */}
              {workSections
                .filter((g) => g.id === selectedCategory)
                .map((group) => (
                  <div key={group.id} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold uppercase text-white">
                          {group.title_ru}
                        </h3>
                        <span className="text-[11px] text-[#666]">
                          {group.isVertical ? 'Вертикальный формат (9:16)' : 'Горизонтальный формат (16:10)'}
                        </span>
                      </div>

                      <button
                        onClick={() => addWorkItem(group.id)}
                        className="px-4 py-2 rounded-xl bg-[#181920] hover:bg-[#2957DE] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        + Добавить проект
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#121216] border border-[#1e1f26] hover:border-[#2b2d38] rounded-xl p-4 flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={item.title_ru}
                              placeholder="Название (RU)"
                              onChange={(e) =>
                                updateWorkItem(group.id, item.id, 'title_ru', e.target.value)
                              }
                              className="font-bold text-xs bg-transparent border-b border-[#262630] focus:border-[#2957DE] text-white focus:outline-none pb-1"
                            />

                            <button
                              onClick={() => deleteWorkItem(group.id, item.id)}
                              className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              ✕ Удалить
                            </button>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase text-[#666] block mb-1">
                              URL видеопотока (MP4)
                            </label>
                            <input
                              type="text"
                              value={item.video_url}
                              onChange={(e) =>
                                updateWorkItem(group.id, item.id, 'video_url', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0a0c] border border-[#22232b] text-[11px] text-white font-sans focus:outline-none focus:border-[#2957DE]"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase text-[#666] block mb-1">
                              URL обложки (JPG / PNG)
                            </label>
                            <input
                              type="text"
                              value={item.thumbnail_url}
                              onChange={(e) =>
                                updateWorkItem(group.id, item.id, 'thumbnail_url', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0a0c] border border-[#22232b] text-[11px] text-white font-sans focus:outline-none focus:border-[#2957DE]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ════ TAB 3: DEPLOY & CLOUD ════ */}
          {activeTab === 'deploy' && (
            <div className="bg-[#121216] border border-[#1e1f26] rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase text-white">
                Деплой на Vercel и подключение хранилища
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0a0a0c] border border-[#1e1f26] rounded-xl flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#2957DE] uppercase">
                    1. Vercel Деплой
                  </span>
                  <p className="text-xs text-[#888] leading-relaxed">
                    Репозиторий подключен к GitHub. При каждом пуше Vercel автоматически обновляет живой сайт.
                  </p>
                </div>

                <div className="p-4 bg-[#0a0a0c] border border-[#1e1f26] rounded-xl flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#2957DE] uppercase">
                    2. Supabase Storage
                  </span>
                  <p className="text-xs text-[#888] leading-relaxed">
                    Для хранения тяжелых видео вставьте ключи Supabase в <code>.env.local</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Test Video Modal Player ── */}
      {testPlayer.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setTestPlayer((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="w-full max-w-4xl bg-[#121216] border border-[#202028] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-3 border-b border-[#202028] flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white">
                {testPlayer.title}
              </span>
              <button
                onClick={() => setTestPlayer((prev) => ({ ...prev, isOpen: false }))}
                className="text-xs text-[#888] hover:text-white px-2 py-1 cursor-pointer"
              >
                ✕ Закрыть
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                src={testPlayer.videoUrl}
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

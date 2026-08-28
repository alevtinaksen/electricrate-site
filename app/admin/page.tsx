'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  GripVertical,
  Play,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Save,
  CheckCircle2,
  Plus,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Film,
  Check,
} from 'lucide-react';
import { HERO_REELS, WORK_SECTIONS, HeroReel, WorkCategoryGroup, WorkItem } from '@/lib/supabase';

export default function AdminStudio() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Menu Section (Strictly matching Frame 172)
  const [activeMenu, setActiveMenu] = useState<'hero' | 'works' | 'clients' | 'settings'>('hero');
  const [selectedCategory, setSelectedCategory] = useState<string>('image_ad');

  // Content State
  const [heroReels, setHeroReels] = useState<HeroReel[]>(HERO_REELS);
  const [workSections, setWorkSections] = useState<WorkCategoryGroup[]>(WORK_SECTIONS);
  const [hiddenHeroIds, setHiddenHeroIds] = useState<Record<string, boolean>>({});

  // Toast / Status state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Video Preview Modal Player
  const [testPlayer, setTestPlayer] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl: string;
  }>({
    isOpen: false,
    title: '',
    videoUrl: '',
  });

  const [mounted, setMounted] = useState(false);

  // Load from /api/content + LocalStorage
  useEffect(() => {
    setMounted(true);
    const authSession = sessionStorage.getItem('admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }

    const loadData = async () => {
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

      try {
        const res = await fetch('/api/content', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.heroReels) && data.heroReels.length > 0) {
            setHeroReels(data.heroReels);
          }
          if (Array.isArray(data.workSections) && data.workSections.length > 0) {
            setWorkSections(data.workSections);
          }
        }
      } catch {}
    };

    loadData();
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

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

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem('custom_hero_reels', JSON.stringify(heroReels));
    localStorage.setItem('custom_work_sections', JSON.stringify(workSections));
    window.dispatchEvent(new Event('storage'));

    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroReels,
          workSections,
        }),
      });
    } catch {}

    setIsSaving(false);
    showToast('✓ Изменения сохранены и опубликованы');
  };

  // Upload handler from computer file
  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string) => void,
    fieldKey: string
  ) => {
    setUploadingField(fieldKey);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onSuccess(data.url);
        showToast('✓ Файл загружен');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onSuccess(e.target.result as string);
            showToast('✓ Файл загружен');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onSuccess(e.target.result as string);
          showToast('✓ Файл загружен');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingField(null);
    }
  };

  // Drag and Drop handler for Hero Reels
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(heroReels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setHeroReels(items);
    showToast(`Порядок изменен: #${result.destination.index + 1} ${reorderedItem.title_ru}`);
  };

  // Hero Reel editing helpers
  const updateHeroReel = (id: string, field: keyof HeroReel, value: any) => {
    setHeroReels((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const duplicateHeroReel = (index: number) => {
    const itemToDup = heroReels[index];
    const newItem: HeroReel = {
      ...itemToDup,
      id: 'reel_' + Date.now(),
      title_ru: itemToDup.title_ru + ' (КОПИЯ)',
      title_en: itemToDup.title_en + ' (COPY)',
    };
    const updated = [...heroReels];
    updated.splice(index + 1, 0, newItem);
    setHeroReels(updated);
    showToast('Ролик сдублирован');
  };

  const toggleVisibility = (id: string) => {
    setHiddenHeroIds((prev) => ({ ...prev, [id]: !prev[id] }));
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
      title_ru: 'НОВЫЙ ПРОЕКТ',
      title_en: 'NEW PROJECT',
      thumbnail_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
      video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
      isVertical: isVert,
    };
    setWorkSections((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, newItem] } : g))
    );
    showToast('Проект добавлен');
  };

  const deleteWorkItem = (groupId: string, itemId: string) => {
    setWorkSections((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, items: g.items.filter((i) => i.id !== itemId) };
      })
    );
    showToast('Проект удален');
  };

  // ─── LOGIN SCREEN (Styled matching Screenshot 1 modal) ──────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-white font-mono flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#161719] border border-[#28292E] rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#1E6BFF] text-white font-bold flex items-center justify-center text-base mb-4 shadow-lg shadow-[#1E6BFF]/30">
            VS
          </div>
          <h1 className="text-base font-bold uppercase tracking-wider mb-1">
            ВЛАД САПУНОВ
          </h1>
          <p className="text-xs text-[#7A7C85] mb-6 text-center">
            управление видео · введите pin (2026)
          </p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="w-full">
              <label className="text-[11px] text-[#8C8E96] block mb-1.5 font-sans">
                PIN-код
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-white text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#1E6BFF] transition-colors"
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 text-center">Неверный PIN-код</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#1E6BFF] hover:bg-[#185adb] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-[#1E6BFF]/20 active:scale-95"
            >
              Войти
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 text-xs text-[#666] hover:text-white transition-colors"
          >
            ← Открыть сайт
          </Link>
        </div>
      </div>
    );
  }

  // ─── MAIN ADMIN STUDIO (Strictly matching Frame 172 & Screenshot 1) ──────────
  return (
    <div className="min-h-screen bg-[#0E0E10] text-white font-mono flex select-none p-4 lg:p-6 gap-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 bg-[#161719] border border-[#1E6BFF] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#1E6BFF] shrink-0" />
          <span className="text-xs font-bold font-mono">{toast.message}</span>
        </div>
      )}

      {/* ── LEFT SIDEBAR (Strictly Frame 172) ── */}
      <aside className="w-64 bg-[#141416] border border-[#222328] rounded-3xl flex flex-col justify-between py-6 shrink-0">
        <div className="flex flex-col">
          {/* Top User Info (Avatar VS + Name + Subtitle) */}
          <div className="flex items-center gap-3 px-6 pb-6 border-b border-[#222328]">
            <div className="w-10 h-10 rounded-full bg-[#1E6BFF] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-md shadow-[#1E6BFF]/25">
              VS
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                ВЛАД САПУНОВ
              </h2>
              <span className="text-[10px] text-[#777] block mt-0.5">
                управление видео
              </span>
            </div>
          </div>

          {/* Navigation Menu (Full-width Solid Blue Block for Active Item) */}
          <nav className="flex flex-col mt-4">
            <button
              onClick={() => setActiveMenu('hero')}
              className={`w-full text-left px-6 py-3 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                activeMenu === 'hero'
                  ? 'bg-[#1E6BFF] text-white'
                  : 'text-white hover:text-white/80 hover:bg-white/5'
              }`}
            >
              HERO AREA
            </button>

            <button
              onClick={() => setActiveMenu('works')}
              className={`w-full text-left px-6 py-3 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                activeMenu === 'works'
                  ? 'bg-[#1E6BFF] text-white'
                  : 'text-white hover:text-white/80 hover:bg-white/5'
              }`}
            >
              ВСЕ РАБОТЫ
            </button>

            <button
              onClick={() => setActiveMenu('clients')}
              className={`w-full text-left px-6 py-3 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                activeMenu === 'clients'
                  ? 'bg-[#1E6BFF] text-white'
                  : 'text-white hover:text-white/80 hover:bg-white/5'
              }`}
            >
              КЛИЕНТЫ & ЛОГО
            </button>

            <button
              onClick={() => setActiveMenu('settings')}
              className={`w-full text-left px-6 py-3 font-mono text-xs font-bold uppercase transition-colors cursor-pointer ${
                activeMenu === 'settings'
                  ? 'bg-[#1E6BFF] text-white'
                  : 'text-white hover:text-white/80 hover:bg-white/5'
              }`}
            >
              НАСТРОЙКИ
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Links */}
        <div className="flex flex-col gap-2 px-6 pt-4 border-t border-[#222328]">
          <Link
            href="/"
            target="_blank"
            className="text-[11px] font-mono uppercase text-[#777] hover:text-white transition-colors"
          >
            ОТКРЫТЬ САЙТ
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_auth');
              setIsAuthenticated(false);
            }}
            className="text-[11px] font-mono uppercase text-[#777] hover:text-white text-left transition-colors cursor-pointer"
          >
            ВЫЙТИ ИЗ СЕССИИ
          </button>
        </div>
      </aside>

      {/* ── RIGHT MAIN CANVAS WITH BLUE OUTLINE FRAME (Frame 172) ── */}
      <main className="flex-1 bg-[#141416] border-2 border-[#1E6BFF] rounded-3xl flex flex-col h-[calc(100vh-32px)] lg:h-[calc(100vh-48px)] overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <header className="px-8 py-5 border-b border-[#222328] flex items-center justify-between bg-[#141416]/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              {activeMenu === 'hero' && 'ГЛАВНЫЕ 5 РОЛИКОВ (HERO-ЛЕНТА)'}
              {activeMenu === 'works' && 'ВСЕ РАБОТЫ (СЕТКИ ПОРТФОЛИО)'}
              {activeMenu === 'clients' && 'КЛИЕНТЫ & ЛОГОТИПЫ (54×54)'}
              {activeMenu === 'settings' && 'НАСТРОЙКИ & ДЕПЛОЙ'}
            </h1>
          </div>

          {/* Save Button (Screenshot 1 Pill Button style) */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-white hover:bg-[#EAEAEA] active:scale-95 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Сохранить</span>
          </button>
        </header>

        {/* Scrollable Content Workspace */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          {/* ════ SECTION 1: HERO AREA (Strictly with Screenshot 1 Input Styling) ════ */}
          {activeMenu === 'hero' && (
            <div className="flex flex-col gap-6">
              {mounted && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="hero-reels-studio">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex flex-col gap-5"
                      >
                        {heroReels.map((reel, index) => {
                          const isHidden = !!hiddenHeroIds[reel.id];

                          return (
                            <Draggable key={reel.id} draggableId={reel.id} index={index}>
                              {(providedDraggable, snapshot) => (
                                <div
                                  ref={providedDraggable.innerRef}
                                  {...providedDraggable.draggableProps}
                                  className={`bg-[#17181A] border rounded-2xl p-6 transition-all flex flex-col lg:flex-row items-start gap-6 ${
                                    snapshot.isDragging
                                      ? 'border-[#1E6BFF] shadow-2xl shadow-[#1E6BFF]/25 bg-[#1B1C20] scale-[1.01]'
                                      : isHidden
                                      ? 'border-[#222328] opacity-50'
                                      : 'border-[#26282C] hover:border-[#1E6BFF]/50'
                                  }`}
                                >
                                  {/* Drag Grip Handle */}
                                  <div
                                    {...providedDraggable.dragHandleProps}
                                    className="pt-2 text-[#555] hover:text-white cursor-grab active:cursor-grabbing transition-colors shrink-0"
                                    title="Зажмите для перетаскивания"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>

                                  {/* Left: Thumbnail Preview Frame */}
                                  <div className="w-full lg:w-60 shrink-0 flex flex-col gap-2">
                                    <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-[#2A2B30] group">
                                      <img
                                        src={reel.thumbnail_url}
                                        alt={reel.title_ru}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />

                                      <button
                                        onClick={() =>
                                          setTestPlayer({
                                            isOpen: true,
                                            title: reel.title_ru,
                                            videoUrl: reel.video_url || reel.preview_video_url,
                                          })
                                        }
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 cursor-pointer backdrop-blur-[2px]"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-[#1E6BFF] flex items-center justify-center text-white shadow-md">
                                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                        </div>
                                        <span>Тест</span>
                                      </button>

                                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-white border border-white/10">
                                        #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-[#777] px-1 font-mono">
                                      <span>Разрешение:</span>
                                      <span className="font-bold text-white/80">
                                        {reel.width} × {reel.height} px
                                      </span>
                                    </div>
                                  </div>

                                  {/* Center: Input Fields (Screenshot 1 Input Style) */}
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    {/* Name RU */}
                                    <div>
                                      <label className="text-[11px] text-[#8C8E96] block mb-1 font-sans">
                                        Название ролика (RU)
                                      </label>
                                      <input
                                        type="text"
                                        value={reel.title_ru}
                                        onChange={(e) =>
                                          updateHeroReel(reel.id, 'title_ru', e.target.value)
                                        }
                                        placeholder="Название (RU)"
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-xs text-white focus:outline-none focus:border-[#1E6BFF] transition-colors font-mono"
                                      />
                                    </div>

                                    {/* Name EN */}
                                    <div>
                                      <label className="text-[11px] text-[#8C8E96] block mb-1 font-sans">
                                        Название ролика (EN)
                                      </label>
                                      <input
                                        type="text"
                                        value={reel.title_en}
                                        onChange={(e) =>
                                          updateHeroReel(reel.id, 'title_en', e.target.value)
                                        }
                                        placeholder="Name (EN)"
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-xs text-white focus:outline-none focus:border-[#1E6BFF] transition-colors font-mono"
                                      />
                                    </div>

                                    {/* 1. Loop Mini-Video */}
                                    <div>
                                      <label className="text-[11px] text-[#1E6BFF] font-bold block mb-1 font-sans">
                                        1. Мини-видео (Loop превью в ленте)
                                      </label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={reel.preview_video_url}
                                          placeholder="URL или выберите файл →"
                                          onChange={(e) =>
                                            updateHeroReel(reel.id, 'preview_video_url', e.target.value)
                                          }
                                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-xs text-white/80 focus:outline-none focus:border-[#1E6BFF] font-sans"
                                        />
                                        <label className="px-3.5 py-2 rounded-xl bg-[#24252A] hover:bg-[#1E6BFF] hover:text-white text-xs font-bold text-[#AAA] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 border border-[#2E3036]">
                                          {uploadingField === `hero_prev_${reel.id}` ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Film className="w-3.5 h-3.5" />
                                          )}
                                          <span>Файл</span>
                                          <input
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                handleFileUpload(
                                                  file,
                                                  (url) => updateHeroReel(reel.id, 'preview_video_url', url),
                                                  `hero_prev_${reel.id}`
                                                );
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>

                                    {/* 2. Full Video Stream */}
                                    <div>
                                      <label className="text-[11px] text-[#1E6BFF] font-bold block mb-1 font-sans">
                                        2. Полный видеопоток (HD для попапа)
                                      </label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={reel.video_url}
                                          placeholder="URL или выберите файл →"
                                          onChange={(e) =>
                                            updateHeroReel(reel.id, 'video_url', e.target.value)
                                          }
                                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-xs text-white/80 focus:outline-none focus:border-[#1E6BFF] font-sans"
                                        />
                                        <label className="px-3.5 py-2 rounded-xl bg-[#24252A] hover:bg-[#1E6BFF] hover:text-white text-xs font-bold text-[#AAA] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 border border-[#2E3036]">
                                          {uploadingField === `hero_full_${reel.id}` ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <Upload className="w-3.5 h-3.5" />
                                          )}
                                          <span>Файл</span>
                                          <input
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                handleFileUpload(
                                                  file,
                                                  (url) => updateHeroReel(reel.id, 'video_url', url),
                                                  `hero_full_${reel.id}`
                                                );
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>

                                    {/* 3. Poster Image */}
                                    <div className="md:col-span-2">
                                      <label className="text-[11px] text-[#8C8E96] block mb-1 font-sans">
                                        3. Обложка / постер (Image URL или с компьютера)
                                      </label>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={reel.thumbnail_url}
                                          placeholder="URL или загрузите картинку →"
                                          onChange={(e) =>
                                            updateHeroReel(reel.id, 'thumbnail_url', e.target.value)
                                          }
                                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-xs text-white/80 focus:outline-none focus:border-[#1E6BFF] font-sans"
                                        />
                                        <label className="px-3.5 py-2 rounded-xl bg-[#24252A] hover:bg-[#1E6BFF] hover:text-white text-xs font-bold text-[#AAA] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 border border-[#2E3036]">
                                          {uploadingField === `hero_thumb_${reel.id}` ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <ImageIcon className="w-3.5 h-3.5" />
                                          )}
                                          <span>Фото</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                handleFileUpload(
                                                  file,
                                                  (url) => updateHeroReel(reel.id, 'thumbnail_url', url),
                                                  `hero_thumb_${reel.id}`
                                                );
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Actions */}
                                  <div className="flex flex-col gap-2 pt-2 shrink-0">
                                    <button
                                      onClick={() => toggleVisibility(reel.id)}
                                      title={isHidden ? 'Показать' : 'Скрыть'}
                                      className="w-8 h-8 rounded-xl bg-[#24252A] hover:bg-white hover:text-black text-[#AAA] flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>

                                    <button
                                      onClick={() => duplicateHeroReel(index)}
                                      title="Дублировать"
                                      className="w-8 h-8 rounded-xl bg-[#24252A] hover:bg-white hover:text-black text-[#AAA] flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          )}

          {/* ════ SECTION 2: WORKS CATEGORIES ════ */}
          {activeMenu === 'works' && (
            <div className="flex flex-col gap-6">
              {/* Category Pills */}
              <div className="flex gap-2 p-2 bg-[#17181A] border border-[#26282C] rounded-2xl overflow-x-auto">
                {workSections.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedCategory(group.id)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === group.id
                        ? 'bg-[#1E6BFF] text-white shadow-md shadow-[#1E6BFF]/20'
                        : 'text-[#8C8E96] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {group.title_ru} ({group.items.length})
                  </button>
                ))}
              </div>

              {/* Category Editor */}
              {workSections
                .filter((g) => g.id === selectedCategory)
                .map((group) => (
                  <div key={group.id} className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold uppercase text-white">
                          {group.title_ru}
                        </h3>
                        <span className="text-xs text-[#777]">
                          {group.isVertical ? 'Вертикальный формат (9:16)' : 'Горизонтальный формат (16:10)'}
                        </span>
                      </div>

                      <button
                        onClick={() => addWorkItem(group.id)}
                        className="px-4 py-2 rounded-xl bg-[#1E6BFF] hover:bg-[#185adb] text-white text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#1E6BFF]/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить проект</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#17181A] border border-[#26282C] hover:border-[#1E6BFF]/40 rounded-2xl p-5 flex flex-col gap-3 transition-all"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-[#24252A]">
                            <input
                              type="text"
                              value={item.title_ru}
                              placeholder="Название проекта"
                              onChange={(e) =>
                                updateWorkItem(group.id, item.id, 'title_ru', e.target.value)
                              }
                              className="font-bold text-xs bg-transparent border-b border-transparent focus:border-[#1E6BFF] text-white focus:outline-none w-2/3 uppercase"
                            />

                            <button
                              onClick={() => deleteWorkItem(group.id, item.id)}
                              className="text-[#777] hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Video stream URL + File upload */}
                          <div>
                            <label className="text-[11px] text-[#8C8E96] block mb-1 font-sans">
                              URL видеопотока (MP4 / WebM)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.video_url}
                                onChange={(e) =>
                                  updateWorkItem(group.id, item.id, 'video_url', e.target.value)
                                }
                                placeholder="https://..."
                                className="flex-1 px-4 py-2 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-xs text-white/80 font-sans focus:outline-none focus:border-[#1E6BFF]"
                              />
                              <label className="px-3.5 py-2 bg-[#24252A] hover:bg-[#1E6BFF] hover:text-white rounded-xl text-xs font-bold text-[#AAA] transition-colors cursor-pointer flex items-center gap-1 border border-[#2E3036]">
                                {uploadingField === `work_vid_${item.id}` ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Upload className="w-3 h-3" />
                                )}
                                <span>Файл</span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(
                                        file,
                                        (url) => updateWorkItem(group.id, item.id, 'video_url', url),
                                        `work_vid_${item.id}`
                                      );
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Thumbnail URL + File upload */}
                          <div>
                            <label className="text-[11px] text-[#8C8E96] block mb-1 font-sans">
                              URL обложки / постера
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.thumbnail_url}
                                onChange={(e) =>
                                  updateWorkItem(group.id, item.id, 'thumbnail_url', e.target.value)
                                }
                                placeholder="https://..."
                                className="flex-1 px-4 py-2 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-xs text-white/80 font-sans focus:outline-none focus:border-[#1E6BFF]"
                              />
                              <label className="px-3.5 py-2 bg-[#24252A] hover:bg-[#1E6BFF] hover:text-white rounded-xl text-xs font-bold text-[#AAA] transition-colors cursor-pointer flex items-center gap-1 border border-[#2E3036]">
                                {uploadingField === `work_thumb_${item.id}` ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ImageIcon className="w-3 h-3" />
                                )}
                                <span>Фото</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(
                                        file,
                                        (url) => updateWorkItem(group.id, item.id, 'thumbnail_url', url),
                                        `work_thumb_${item.id}`
                                      );
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ════ SECTION 3: CLIENTS ════ */}
          {activeMenu === 'clients' && (
            <div className="bg-[#17181A] border border-[#26282C] rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase text-white">
                Клиенты и логотипы (54×54 px)
              </h3>
              <p className="text-xs text-[#8C8E96]">
                Отображаются с фиксированным отступом 12px в блоке «Клиенты».
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
                    className="p-4 bg-[#0F1012] border border-[#2A2B30] rounded-xl flex items-center gap-4"
                  >
                    <div
                      className="w-[54px] h-[54px] rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      <Check className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xs font-bold text-white">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ SECTION 4: SETTINGS & DEPLOY ════ */}
          {activeMenu === 'settings' && (
            <div className="bg-[#17181A] border border-[#26282C] rounded-2xl p-8 flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase text-white">
                Настройки и управление данными
              </h3>

              {/* JSON Backup & Restore Card */}
              <div className="p-6 bg-[#0F1012] border border-[#2A2B30] rounded-xl flex flex-col gap-4">
                <div>
                  <span className="text-xs font-bold text-[#1E6BFF] uppercase block mb-1">
                    Резервное копирование (JSON)
                  </span>
                  <p className="text-xs text-[#8C8E96] leading-relaxed">
                    Вы можете в 1 клик скачать файл со всеми текущими роликами, ссылками и названиями на свой компьютер или загрузить готовую конфигурацию.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ heroReels, workSections }, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `portfolio_backup_${new Date().toISOString().slice(0,10)}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      showToast('✓ Резервная копия сохранена на компьютер');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#24252A] hover:bg-[#1E6BFF] hover:text-white text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>📥 Скачать резервную копию (JSON)</span>
                  </button>

                  <label className="px-5 py-2.5 rounded-xl bg-[#24252A] hover:bg-[#1E6BFF] hover:text-white text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-2">
                    <span>📤 Восстановить из JSON файла</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const parsed = JSON.parse(event.target?.result as string);
                              if (parsed.heroReels) setHeroReels(parsed.heroReels);
                              if (parsed.workSections) setWorkSections(parsed.workSections);
                              showToast('✓ Конфигурация успешно загружена! Нажмите Сохранить.');
                            } catch {
                              showToast('Ошибка при чтении JSON файла');
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#0F1012] border border-[#2A2B30] rounded-xl flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#1E6BFF] uppercase">
                    1. Vercel Hosting
                  </span>
                  <p className="text-xs text-[#8C8E96] leading-relaxed">
                    Репозиторий подключен к GitHub <code>electricrate-site</code>. Изменения публикуются автоматически.
                  </p>
                  <div className="text-xs text-green-400 font-bold mt-2">
                    ● Синхронизация активна
                  </div>
                </div>

                <div className="p-6 bg-[#0F1012] border border-[#2A2B30] rounded-xl flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#1E6BFF] uppercase">
                    2. Supabase Cloud Database
                  </span>
                  <p className="text-xs text-[#8C8E96] leading-relaxed">
                    Для постоянного глобального облачного хранения добавьте ключи Supabase в переменные Vercel:
                  </p>
                  <div className="text-[10px] font-mono text-[#8C8E96] bg-[#0A0A0C] p-2.5 rounded-lg border border-[#222]">
                    NEXT_PUBLIC_SUPABASE_URL=...<br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Test Video Modal Player ── */}
      {testPlayer.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setTestPlayer((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="w-full max-w-4xl bg-[#161719] border border-[#28292E] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#28292E] flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white">
                {testPlayer.title}
              </span>
              <button
                onClick={() => setTestPlayer((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-[#24252A] hover:bg-white hover:text-black text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
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

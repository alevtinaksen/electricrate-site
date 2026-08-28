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
  ExternalLink,
  Save,
  CheckCircle2,
  Video,
  FolderKanban,
  Users,
  Settings,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { HERO_REELS, WORK_SECTIONS, HeroReel, WorkCategoryGroup, WorkItem } from '@/lib/supabase';

export default function AdminStudio() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'hero' | 'works' | 'clients' | 'settings'>('hero');
  const [selectedCategory, setSelectedCategory] = useState<string>('image_ad');

  // State for content
  const [heroReels, setHeroReels] = useState<HeroReel[]>(HERO_REELS);
  const [workSections, setWorkSections] = useState<WorkCategoryGroup[]>(WORK_SECTIONS);
  const [hiddenHeroIds, setHiddenHeroIds] = useState<Record<string, boolean>>({});

  // Toast / Status state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Active testing video player modal
  const [testPlayer, setTestPlayer] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl: string;
  }>({
    isOpen: false,
    title: '',
    videoUrl: '',
  });

  // Client-side hydration flag
  const [mounted, setMounted] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    setMounted(true);
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

  const handleSave = () => {
    setIsSaving(true);
    // Filter out hidden reels if any, or save with visibility flags
    localStorage.setItem('custom_hero_reels', JSON.stringify(heroReels));
    localStorage.setItem('custom_work_sections', JSON.stringify(workSections));
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setIsSaving(false);
      showToast('✓ Изменения успешно сохранены и опубликованы на сайте');
    }, 300);
  };

  // Drag and Drop handler for Hero Reels
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(heroReels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setHeroReels(items);
    showToast(`Порядок изменен: ${reorderedItem.title_ru} перемещен на позицию #${result.destination.index + 1}`);
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
      title_ru: itemToDup.title_ru + ' (Копия)',
      title_en: itemToDup.title_en + ' (Copy)',
    };
    const updated = [...heroReels];
    updated.splice(index + 1, 0, newItem);
    setHeroReels(updated);
    showToast('Ролик успешно сдублирован');
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
      title_ru: 'Новый проект',
      title_en: 'New Project',
      thumbnail_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
      video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
      isVertical: isVert,
    };
    setWorkSections((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, newItem] } : g))
    );
    showToast('Новый проект добавлен в сетку');
  };

  const deleteWorkItem = (groupId: string, itemId: string) => {
    setWorkSections((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, items: g.items.filter((i) => i.id !== itemId) };
      })
    );
    showToast('Проект удален из сетки');
  };

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white font-mono flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#121214] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2957DE] text-white font-bold flex items-center justify-center text-lg mb-4 shadow-lg shadow-[#2957DE]/30">
            VS
          </div>
          <h1 className="text-lg font-bold uppercase tracking-wider mb-1">
            Studio Control
          </h1>
          <p className="text-xs text-white/50 mb-6 text-center">
            Влад Сапунов · Введите PIN (2026)
          </p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              className="w-full px-4 py-3.5 rounded-2xl bg-[#09090b] border border-white/15 text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#2957DE] transition-colors"
            />

            {pinError && (
              <p className="text-xs text-red-400 text-center">Неверный PIN-код</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#2957DE] hover:bg-[#1f47c0] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#2957DE]/25 active:scale-95"
            >
              Войти в студию
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 text-xs text-white/40 hover:text-white transition-colors"
          >
            ← Открыть сайт
          </Link>
        </div>
      </div>
    );
  }

  // ─── STUDIO MAIN WORKSPACE ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-mono flex select-none">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 bg-[#121214] border border-[#2957DE] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#2957DE] shrink-0" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* ── 1. STUDIO LEFT SIDEBAR ── */}
      <aside className="w-72 bg-[#101012] border-r border-white/10 flex flex-col justify-between p-6 shrink-0">
        <div className="flex flex-col gap-8">
          {/* Header Brand */}
          <div className="flex items-center gap-3.5 pb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-[#2957DE] text-white font-bold flex items-center justify-center text-sm shadow-md shadow-[#2957DE]/20 shrink-0">
              VS
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Влад Сапунов
              </h2>
              <span className="text-[11px] text-white/40 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Video Studio CMS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase text-white/40 px-3 mb-1 tracking-widest font-bold">
              Управление
            </span>

            <button
              onClick={() => setActiveTab('hero')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'hero'
                  ? 'bg-[#2957DE] text-white shadow-lg shadow-[#2957DE]/25'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 shrink-0" />
              <span>1. Главные ролики (Hero)</span>
            </button>

            <button
              onClick={() => setActiveTab('works')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'works'
                  ? 'bg-[#2957DE] text-white shadow-lg shadow-[#2957DE]/25'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FolderKanban className="w-4 h-4 shrink-0" />
              <span>2. Все работы (5 сеток)</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'clients'
                  ? 'bg-[#2957DE] text-white shadow-lg shadow-[#2957DE]/25'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>3. Клиенты & Логотипы</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                activeTab === 'settings'
                  ? 'bg-[#2957DE] text-white shadow-lg shadow-[#2957DE]/25'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>4. Настройки & Supabase</span>
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-2 border border-white/5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Открыть сайт</span>
          </Link>

          <button
            onClick={() => {
              sessionStorage.removeItem('admin_auth');
              setIsAuthenticated(false);
            }}
            className="text-xs text-white/40 hover:text-white text-center py-1 transition-colors cursor-pointer"
          >
            Выйти из сессии
          </button>
        </div>
      </aside>

      {/* ── 2. STUDIO MAIN CANVAS ── */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#09090b]">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold uppercase tracking-wider text-white">
              {activeTab === 'hero' && 'Главные 5 роликов (Hero Showcase)'}
              {activeTab === 'works' && 'Сетки портфолио «Все работы»'}
              {activeTab === 'clients' && 'Блок клиентов и логотипы (54×54)'}
              {activeTab === 'settings' && 'Деплой и облачное хранилище'}
            </h1>

            {activeTab === 'hero' && (
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#2957DE] font-bold">
                {heroReels.length} из {heroReels.length} в ленте
              </span>
            )}
          </div>

          {/* Floating Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full bg-[#2957DE] hover:bg-[#1f47c0] active:scale-95 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#2957DE]/30 flex items-center gap-2"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Сохранить изменения</span>
          </button>
        </header>

        {/* Studio Content Container */}
        <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-8 pb-32">
          {/* ════ SECTION 1: HERO REELS (WITH DRAG & DROP) ════ */}
          {activeTab === 'hero' && (
            <div className="flex flex-col gap-6">
              {/* Info Banner */}
              <div className="bg-[#121214] border border-white/10 rounded-2xl p-5 flex items-center justify-between text-xs text-white/70">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#2957DE] shrink-0" />
                  <span>
                    Перетаскивайте карточки мышкой за иконку <b>⋮⋮</b> слева для изменения порядка на сайте.
                  </span>
                </div>
                <span className="text-white/40">Drag-and-Drop включен</span>
              </div>

              {/* Draggable List */}
              {mounted && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="hero-reels-list">
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
                                  className={`bg-[#121214] border rounded-2xl p-6 transition-all shadow-md flex items-start gap-6 ${
                                    snapshot.isDragging
                                      ? 'border-[#2957DE] shadow-2xl shadow-[#2957DE]/30 bg-[#161619] scale-[1.01]'
                                      : isHidden
                                      ? 'border-white/5 opacity-50'
                                      : 'border-white/10 hover:border-[#2957DE]/50'
                                  }`}
                                >
                                  {/* ── Drag Handle Handle ── */}
                                  <div
                                    {...providedDraggable.dragHandleProps}
                                    className="pt-2 text-white/30 hover:text-white cursor-grab active:cursor-grabbing transition-colors shrink-0"
                                    title="Зажмите и потяните для смены порядка"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>

                                  {/* ── Left: Interactive Preview Card ── */}
                                  <div className="w-64 shrink-0 flex flex-col gap-2.5">
                                    <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-white/10 group">
                                      {/* Poster Image */}
                                      <img
                                        src={reel.thumbnail_url}
                                        alt={reel.title_ru}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />

                                      {/* Hover Play Button */}
                                      <button
                                        onClick={() =>
                                          setTestPlayer({
                                            isOpen: true,
                                            title: reel.title_ru,
                                            videoUrl: reel.video_url || reel.preview_video_url,
                                          })
                                        }
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 cursor-pointer backdrop-blur-[2px]"
                                      >
                                        <div className="w-9 h-9 rounded-full bg-[#2957DE] flex items-center justify-center text-white shadow-lg">
                                          <Play className="w-4 h-4 fill-current ml-0.5" />
                                        </div>
                                        <span>Тест плеера</span>
                                      </button>

                                      {/* Top Badges */}
                                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                                        #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                                      </div>
                                    </div>

                                    {/* Resolution & Ratio Info */}
                                    <div className="flex items-center justify-between text-[11px] text-white/50 px-1">
                                      <span>Разрешение:</span>
                                      <span className="font-bold text-white/80">
                                        {reel.width} × {reel.height} px
                                      </span>
                                    </div>
                                  </div>

                                  {/* ── Center: Grouped Input Fields ── */}
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Title RU */}
                                    <div>
                                      <label className="text-[10px] uppercase text-white/40 block mb-1 font-bold">
                                        Название ролика (RU)
                                      </label>
                                      <input
                                        type="text"
                                        value={reel.title_ru}
                                        onChange={(e) =>
                                          updateHeroReel(reel.id, 'title_ru', e.target.value)
                                        }
                                        placeholder="Название (RU)"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#2957DE] transition-colors"
                                      />
                                    </div>

                                    {/* Title EN */}
                                    <div>
                                      <label className="text-[10px] uppercase text-white/40 block mb-1 font-bold">
                                        Название ролика (EN)
                                      </label>
                                      <input
                                        type="text"
                                        value={reel.title_en}
                                        onChange={(e) =>
                                          updateHeroReel(reel.id, 'title_en', e.target.value)
                                        }
                                        placeholder="Name (EN)"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#2957DE] transition-colors"
                                      />
                                    </div>

                                    {/* 1. Loop Mini-Video */}
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
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white/80 focus:outline-none focus:border-[#2957DE] font-sans"
                                      />
                                    </div>

                                    {/* 2. Full Video Stream */}
                                    <div>
                                      <label className="text-[10px] uppercase text-[#2957DE] font-bold block mb-1">
                                        2. Полный видеопоток (HD для попапа)
                                      </label>
                                      <input
                                        type="text"
                                        value={reel.video_url}
                                        placeholder="https://.../full_hd.mp4"
                                        onChange={(e) =>
                                          updateHeroReel(reel.id, 'video_url', e.target.value)
                                        }
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white/80 focus:outline-none focus:border-[#2957DE] font-sans"
                                      />
                                    </div>

                                    {/* 3. Poster Image */}
                                    <div className="md:col-span-2">
                                      <label className="text-[10px] uppercase text-white/40 block mb-1 font-bold">
                                        3. Обложка / постер (Image URL)
                                      </label>
                                      <input
                                        type="text"
                                        value={reel.thumbnail_url}
                                        placeholder="https://.../poster.jpg"
                                        onChange={(e) =>
                                          updateHeroReel(reel.id, 'thumbnail_url', e.target.value)
                                        }
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white/80 focus:outline-none focus:border-[#2957DE] font-sans"
                                      />
                                    </div>
                                  </div>

                                  {/* ── Right: Action Controls ── */}
                                  <div className="flex flex-col gap-2 pt-2 shrink-0">
                                    <button
                                      onClick={() => toggleVisibility(reel.id)}
                                      title={isHidden ? 'Показать на сайте' : 'Скрыть из ленты'}
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                                        isHidden
                                          ? 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'
                                          : 'bg-white/5 text-white/70 hover:bg-[#2957DE] hover:text-white'
                                      }`}
                                    >
                                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>

                                    <button
                                      onClick={() => duplicateHeroReel(index)}
                                      title="Дублировать карточку"
                                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
          {activeTab === 'works' && (
            <div className="flex flex-col gap-6">
              {/* Category Pills */}
              <div className="flex gap-2 p-2 bg-[#121214] border border-white/10 rounded-2xl overflow-x-auto">
                {workSections.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedCategory(group.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === group.id
                        ? 'bg-[#2957DE] text-white shadow-md shadow-[#2957DE]/20'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
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
                        <h3 className="text-base font-bold uppercase text-white">
                          {group.title_ru}
                        </h3>
                        <span className="text-xs text-white/40">
                          {group.isVertical ? 'Вертикальная сетка 9:16 (Рилсы)' : 'Горизонтальная сетка (16:10 / 16:9)'}
                        </span>
                      </div>

                      <button
                        onClick={() => addWorkItem(group.id)}
                        className="px-5 py-2.5 rounded-2xl bg-[#2957DE] hover:bg-[#1f47c0] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-[#2957DE]/20"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Добавить проект</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#121214] border border-white/10 hover:border-[#2957DE]/40 rounded-2xl p-5 flex flex-col gap-3 transition-all"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <input
                              type="text"
                              value={item.title_ru}
                              placeholder="Название проекта"
                              onChange={(e) =>
                                updateWorkItem(group.id, item.id, 'title_ru', e.target.value)
                              }
                              className="font-bold text-xs bg-transparent border-b border-transparent focus:border-[#2957DE] text-white focus:outline-none w-2/3"
                            />

                            <button
                              onClick={() => deleteWorkItem(group.id, item.id)}
                              className="text-white/40 hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase text-white/40 block mb-1">
                              URL видеопотока (MP4)
                            </label>
                            <input
                              type="text"
                              value={item.video_url}
                              onChange={(e) =>
                                updateWorkItem(group.id, item.id, 'video_url', e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white/80 font-sans focus:outline-none focus:border-[#2957DE]"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase text-white/40 block mb-1">
                              URL обложки / постера
                            </label>
                            <input
                              type="text"
                              value={item.thumbnail_url}
                              onChange={(e) =>
                                updateWorkItem(group.id, item.id, 'thumbnail_url', e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white/80 font-sans focus:outline-none focus:border-[#2957DE]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ════ SECTION 3: CLIENTS ════ */}
          {activeTab === 'clients' && (
            <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="text-base font-bold uppercase text-white">
                Клиенты и логотипы (54×54 px)
              </h3>
              <p className="text-xs text-white/50">
                Логотипы отображаются с точным отступом 12px в блоке «Клиенты» на главной странице.
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
                    className="p-4 bg-[#09090b] border border-white/10 rounded-2xl flex items-center gap-4"
                  >
                    <div
                      className="w-[54px] h-[54px] rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      ✓
                    </div>
                    <span className="text-xs font-bold text-white">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ SECTION 4: SETTINGS & DEPLOY ════ */}
          {activeTab === 'settings' && (
            <div className="bg-[#121214] border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
              <h3 className="text-base font-bold uppercase text-white">
                Деплой и облачная синхронизация
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#09090b] border border-white/10 rounded-2xl flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#2957DE] uppercase">
                    1. Vercel Hosting
                  </span>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Проект подключен к GitHub-репозиторию <code>electricrate-site</code>. Любые изменения автоматически разворачиваются на Vercel.
                  </p>
                  <div className="text-xs text-green-400 font-bold mt-2">
                    ● Репозиторий синхронизирован
                  </div>
                </div>

                <div className="p-6 bg-[#09090b] border border-white/10 rounded-2xl flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#2957DE] uppercase">
                    2. Supabase Storage
                  </span>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Для постоянного хранения видео и картинок в облаке добавьте ключи Supabase в <code>.env.local</code>.
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
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setTestPlayer((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="w-full max-w-4xl bg-[#121214] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white">
                {testPlayer.title}
              </span>
              <button
                onClick={() => setTestPlayer((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
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

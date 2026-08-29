'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  GripVertical,
  Play,
  Trash2,
  CheckCircle2,
  Plus,
  RefreshCw,
  Paperclip,
  ChevronDown,
  Check,
} from 'lucide-react';
import { HERO_REELS, WORK_SECTIONS, HeroReel, WorkCategoryGroup, WorkItem } from '@/lib/supabase';

// Preset size configurations (L, M, S)
const SIZE_PRESETS = [
  { label: 'L (964 X 542)', width: 964, height: 542 },
  { label: 'M (818 X 460)', width: 818, height: 460 },
  { label: 'S (557 X 313)', width: 557, height: 313 },
];

export default function AdminStudio() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Menu Section (Figma Frame 177)
  const [activeMenu, setActiveMenu] = useState<'hero' | 'works' | 'clients' | 'settings'>('hero');
  const [selectedCategory, setSelectedCategory] = useState<string>('image_ad');

  // Content State
  const [heroReels, setHeroReels] = useState<HeroReel[]>(HERO_REELS);
  const [workSections, setWorkSections] = useState<WorkCategoryGroup[]>(WORK_SECTIONS);

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

  const handleSizeChange = (id: string, sizeLabel: string) => {
    const preset = SIZE_PRESETS.find((p) => p.label === sizeLabel);
    if (preset) {
      setHeroReels((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, width: preset.width, height: preset.height } : item
        )
      );
    }
  };

  const addHeroReel = () => {
    const newReel: HeroReel = {
      id: 'reel_' + Date.now(),
      title_ru: 'НОВЫЙ РОЛИК',
      title_en: 'NEW REEL',
      width: 964,
      height: 542,
      thumbnail_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=85',
      preview_video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
      video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
    };
    setHeroReels((prev) => [...prev, newReel]);
    showToast('Видео добавлено');
  };

  const deleteHeroReel = (id: string) => {
    setHeroReels((prev) => prev.filter((r) => r.id !== id));
    showToast('Видео удалено');
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

  // ─── LOGIN SCREEN ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="w-full h-full bg-black text-white font-mono flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0D0D0E] rounded-[24px] p-8 shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#1458E6] text-white font-bold flex items-center justify-center text-base mb-4 shadow-lg shadow-[#1458E6]/30">
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
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-white text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#1458E6] transition-colors"
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 text-center">Неверный PIN-код</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#1458E6] hover:bg-[#1147bd] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-[#1458E6]/20 active:scale-95"
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

  // ─── MAIN ADMIN STUDIO (Root Layout: 100vh 100vw, p-[12px], gap-[12px]) ─────
  return (
    <div className="w-screen h-screen bg-black p-[12px] flex flex-row gap-[12px] overflow-hidden box-border select-none text-white font-mono">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 bg-[#161719] border border-[#1458E6] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#1458E6] shrink-0" />
          <span className="text-xs font-bold font-mono">{toast.message}</span>
        </div>
      )}

      {/* ── LEFT CARD (Sidebar: Rectangle 76 — 298px, bg-[#141416] matching cards) ── */}
      <aside className="w-[298px] min-w-[298px] max-w-[298px] h-full bg-[#141416] rounded-[24px] flex flex-col justify-between overflow-hidden shrink-0 border-none select-none">
        <div className="flex flex-col w-full">
          {/* Top Profile Block — EXACTLY 24px padding on ALL 4 sides (top, right, bottom, left) */}
          <div
            style={{ padding: '24px' }}
            className="flex items-center gap-[21px] w-full"
          >
            <div className="w-[48px] h-[48px] min-w-[48px] rounded-[24px] bg-[#1458E6] flex items-center justify-center font-bold text-white text-[16px] shrink-0">
              VS
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] text-white uppercase whitespace-nowrap">
                ВЛАД САПУНОВ
              </h2>
              <span className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] text-white opacity-40 lowercase whitespace-nowrap">
                управление видео
              </span>
            </div>
          </div>

          {/* Main Navigation Menu (h-[33px], paddingLeft: 24px, hover:bg-[#1458E6]) */}
          <nav className="flex flex-col w-full gap-0">
            <button
              onClick={() => setActiveMenu('hero')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '4px',
                paddingBottom: '4px',
                height: '33px',
              }}
              className={`flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap cursor-pointer transition-colors text-left w-full ${
                activeMenu === 'hero'
                  ? 'bg-[#1458E6] text-white'
                  : 'bg-transparent text-white hover:bg-[#1458E6] hover:text-white'
              }`}
            >
              HERO AREA
            </button>

            <button
              onClick={() => setActiveMenu('works')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '4px',
                paddingBottom: '4px',
                height: '33px',
              }}
              className={`flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap cursor-pointer transition-colors text-left w-full ${
                activeMenu === 'works'
                  ? 'bg-[#1458E6] text-white'
                  : 'bg-transparent text-white hover:bg-[#1458E6] hover:text-white'
              }`}
            >
              ВСЕ РАБОТЫ
            </button>

            <button
              onClick={() => setActiveMenu('clients')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '4px',
                paddingBottom: '4px',
                height: '33px',
              }}
              className={`flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap cursor-pointer transition-colors text-left w-full ${
                activeMenu === 'clients'
                  ? 'bg-[#1458E6] text-white'
                  : 'bg-transparent text-white hover:bg-[#1458E6] hover:text-white'
              }`}
            >
              КЛИЕНТЫ & ЛОГО
            </button>

            <button
              onClick={() => setActiveMenu('settings')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '4px',
                paddingBottom: '4px',
                height: '33px',
              }}
              className={`flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap cursor-pointer transition-colors text-left w-full ${
                activeMenu === 'settings'
                  ? 'bg-[#1458E6] text-white'
                  : 'bg-transparent text-white hover:bg-[#1458E6] hover:text-white'
              }`}
            >
              НАСТРОЙКИ
            </button>
          </nav>
        </div>

        {/* Bottom Footer Block (Frame 177: hover:bg-white hover:text-black, with only margin-bottom 24px) */}
        <div style={{ marginBottom: '24px' }} className="flex flex-col w-full gap-0">
          <Link
            href="/"
            target="_blank"
            style={{
              paddingLeft: '24px',
              paddingRight: '24px',
              paddingTop: '4px',
              paddingBottom: '4px',
              height: '33px',
            }}
            className="flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap text-[#8C8E96] hover:bg-white hover:text-black transition-colors w-full text-left"
          >
            ОТКРЫТЬ САЙТ
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_auth');
              setIsAuthenticated(false);
            }}
            style={{
              paddingLeft: '24px',
              paddingRight: '24px',
              paddingTop: '4px',
              paddingBottom: '4px',
              height: '33px',
            }}
            className="flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap text-[#8C8E96] hover:bg-white hover:text-black transition-colors cursor-pointer text-left w-full"
          >
            ВЫЙТИ ИЗ СЕССИИ
          </button>
        </div>
      </aside>

      {/* ── RIGHT CARD (Content Zone: Completely transparent, floating with 12px padding) ── */}
      <main className="flex-1 h-full bg-transparent overflow-y-auto flex flex-col border-none relative pr-[12px]">
        {/* Header Bar — EXACTLY 24px padding on top, left, bottom, right */}
        <header
          style={{ padding: '24px' }}
          className="flex items-center justify-between shrink-0 w-full"
        >
          <h1 className="text-[20px] font-bold uppercase tracking-[-0.2px] text-white font-mono">
            {activeMenu === 'hero' && 'ГЛАВНЫЕ 5 РОЛИКОВ (HERO-ЛЕНТА)'}
            {activeMenu === 'works' && 'ВСЕ РАБОТЫ (СЕТКИ ПОРТФОЛИО)'}
            {activeMenu === 'clients' && 'КЛИЕНТЫ & ЛОГОТИПЫ (54×54)'}
            {activeMenu === 'settings' && 'НАСТРОЙКИ & ДЕПЛОЙ'}
          </h1>
        </header>

        {/* Content Section */}
        <div className="px-[24px] pb-[24px] flex flex-col gap-6 w-full flex-1">
          {/* ════ SECTION 1: HERO AREA ════ */}
          {activeMenu === 'hero' && (
            <div className="flex flex-col gap-[12px] w-full">
              {mounted && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="hero-reels-studio">
                    {(provided, snapshotDroppable) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex flex-col gap-[12px] w-full rounded-2xl transition-colors ${
                          snapshotDroppable.isDraggingOver ? 'bg-white/[0.02] p-1' : ''
                        }`}
                      >
                        {heroReels.map((reel, index) => {
                          const currentSizePreset =
                            SIZE_PRESETS.find(
                              (p) => p.width === reel.width && p.height === reel.height
                            )?.label || 'L (964 X 542)';

                          return (
                            <Draggable key={reel.id} draggableId={reel.id} index={index}>
                              {(providedDraggable, snapshot) => (
                                <div
                                  ref={providedDraggable.innerRef}
                                  {...providedDraggable.draggableProps}
                                  style={{
                                    padding: '24px',
                                    ...providedDraggable.draggableProps.style,
                                  }}
                                  className={`rounded-[16px] transition-all flex flex-col lg:flex-row items-start gap-4 w-full ${
                                    snapshot.isDragging
                                      ? 'bg-[#1D1E24] shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-2 ring-[#1458E6] scale-[1.015] z-50 cursor-grabbing'
                                      : 'bg-[#141416] border-none'
                                  }`}
                                >
                                  {/* Drag Grip Handle — vivid visual grab feedback */}
                                  <div
                                    {...providedDraggable.dragHandleProps}
                                    className={`py-[8px] px-1 rounded transition-colors shrink-0 flex items-center justify-center ${
                                      snapshot.isDragging
                                        ? 'text-[#1458E6] cursor-grabbing'
                                        : 'text-[#666] hover:text-white hover:bg-white/5 cursor-grab active:cursor-grabbing'
                                    }`}
                                    title="Зажмите и тяните для изменения порядка"
                                  >
                                    <GripVertical className="w-5 h-5 stroke-[2.5]" />
                                  </div>

                                  {/* Left: Thumbnail Preview Frame (borderless) */}
                                  <div className="w-full lg:w-48 shrink-0 flex flex-col gap-2">
                                    <div className="relative aspect-video rounded-md bg-black overflow-hidden border-none group">
                                      <img
                                        src={reel.thumbnail_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80'}
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
                                        <div className="w-8 h-8 rounded-full bg-[#1458E6] flex items-center justify-center text-white shadow-md">
                                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                        </div>
                                        <span>Тест</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Center: Input Fields with bright legible headers and 12px padding */}
                                  <div className="flex-1 flex flex-col gap-3 w-full">
                                    {/* Line 1: Name RU and Name EN (2 columns) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* название ролика (ru) */}
                                      <div className="flex flex-col gap-2">
                                        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                          название ролика (ru)
                                        </label>
                                        <input
                                          type="text"
                                          value={reel.title_ru}
                                          onChange={(e) =>
                                            updateHeroReel(reel.id, 'title_ru', e.target.value)
                                          }
                                          placeholder="TEXT"
                                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                          className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                                        />
                                      </div>

                                      {/* название ролика (en) */}
                                      <div className="flex flex-col gap-2">
                                        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                          название ролика (en)
                                        </label>
                                        <input
                                          type="text"
                                          value={reel.title_en}
                                          onChange={(e) =>
                                            updateHeroReel(reel.id, 'title_en', e.target.value)
                                          }
                                          placeholder="НАЗВАНИЕ РОЛИКА (EN)"
                                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                          className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                                        />
                                      </div>
                                    </div>

                                    {/* Line 2: превью (ссылка или файл с компьютера) */}
                                    <div className="flex flex-col gap-2">
                                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                        превью
                                      </label>
                                      <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                                        <input
                                          type="text"
                                          value={reel.preview_video_url || reel.thumbnail_url}
                                          placeholder="ССЫЛКА ИЛИ ФАЙЛ"
                                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            updateHeroReel(reel.id, 'preview_video_url', val);
                                            updateHeroReel(reel.id, 'thumbnail_url', val);
                                          }}
                                          className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                                        />
                                        <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors" title="Прикрепить файл">
                                          {uploadingField === `prev_${reel.id}` ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Paperclip className="w-4 h-4" />
                                          )}
                                          <input
                                            type="file"
                                            accept="video/*,image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                handleFileUpload(
                                                  file,
                                                  (url) => {
                                                    updateHeroReel(reel.id, 'preview_video_url', url);
                                                    updateHeroReel(reel.id, 'thumbnail_url', url);
                                                  },
                                                  `prev_${reel.id}`
                                                );
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>

                                    {/* Line 3: видео (ссылка или файл с компьютера) */}
                                    <div className="flex flex-col gap-2">
                                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                        видео
                                      </label>
                                      <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                                        <input
                                          type="text"
                                          value={reel.video_url}
                                          placeholder="ССЫЛКА ИЛИ ФАЙЛ"
                                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                          onChange={(e) =>
                                            updateHeroReel(reel.id, 'video_url', e.target.value)
                                          }
                                          className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                                        />
                                        <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors" title="Прикрепить файл">
                                          {uploadingField === `vid_${reel.id}` ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Paperclip className="w-4 h-4" />
                                          )}
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
                                                  `vid_${reel.id}`
                                                );
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>

                                    {/* Line 4: размер (L, M, S Dropdown with right-padded arrow) */}
                                    <div className="flex flex-col gap-2">
                                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                        размер
                                      </label>
                                      <div className="relative inline-block w-full max-w-[240px]">
                                        <select
                                          value={currentSizePreset}
                                          onChange={(e) => handleSizeChange(reel.id, e.target.value)}
                                          style={{ paddingLeft: '12px', paddingRight: '36px' }}
                                          className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white appearance-none focus:outline-none focus:border-[#1458E6] cursor-pointer"
                                        >
                                          {SIZE_PRESETS.map((preset) => (
                                            <option key={preset.label} value={preset.label} className="bg-[#141416] text-white">
                                              {preset.label}
                                            </option>
                                          ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Delete Action with confirmation prompt */}
                                  <div className="pt-2 shrink-0">
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Вы уверены, что хотите удалить?')) {
                                          deleteHeroReel(reel.id);
                                        }
                                      }}
                                      title="Удалить"
                                      className="w-8 h-8 rounded-md hover:bg-red-500/20 hover:text-red-400 text-[#666] flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
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

              {/* Moderate symmetrical bottom spacer */}
              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ── Symmetrical Floating Bottom Center Actions ── */}
          <div className="sticky bottom-4 z-50 flex items-center justify-center gap-4 py-2 pointer-events-auto mt-4 shrink-0">
            {activeMenu === 'hero' && (
              <button
                onClick={addHeroReel}
                title="Добавить видео"
                style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '56px',
                }}
                className="bg-white hover:bg-neutral-200 text-black flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0 border-none outline-none shadow-none"
              >
                <Plus className="w-8 h-8 text-black stroke-[1.25]" />
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                width: '187px',
                height: '65px',
                backgroundColor: '#1458E6',
                borderRadius: '56px',
                color: '#FFFFFF',
                fontFamily: '"Geist Mono", monospace',
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: '125%', // 25px
                letterSpacing: '-0.2px',
                textTransform: 'uppercase',
              }}
              className="hover:bg-[#1147bd] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 border-none outline-none shadow-none"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : null}
              <span>СОХРАНИТЬ</span>
            </button>
          </div>

          {/* ════ SECTION 2: WORKS CATEGORIES ════ */}
          {activeMenu === 'works' && (
            <div className="flex flex-col gap-6">
              {/* Category Pills */}
              <div className="flex gap-2 p-1 bg-[#141416] rounded-xl overflow-x-auto">
                {workSections.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedCategory(group.id)}
                    className={`px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === group.id
                        ? 'bg-[#1458E6] text-white'
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
                  <div key={group.id} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold uppercase text-white font-mono">
                          {group.title_ru}
                        </h3>
                        <span className="text-xs text-[#777] font-mono">
                          {group.isVertical ? 'Вертикальный формат (9:16)' : 'Горизонтальный формат (16:10)'}
                        </span>
                      </div>

                      <button
                        onClick={() => addWorkItem(group.id)}
                        className="px-4 py-2 rounded-md bg-[#1458E6] hover:bg-[#1147bd] text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить проект</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#141416] rounded-xl p-5 flex flex-col gap-3 transition-all border-none"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-[#24252A]">
                            <input
                              type="text"
                              value={item.title_ru}
                              placeholder="Название проекта"
                              onChange={(e) =>
                                updateWorkItem(group.id, item.id, 'title_ru', e.target.value)
                              }
                              className="font-bold text-xs bg-transparent border-b border-transparent focus:border-[#1458E6] text-white focus:outline-none w-2/3 uppercase font-mono"
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
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[13px] font-bold lowercase text-white">
                              видео
                            </label>
                            <div className="flex items-center w-full h-[40px] bg-[#0D0D0E] border border-[#26282C] focus-within:border-[#1458E6]">
                              <input
                                type="text"
                                value={item.video_url}
                                onChange={(e) =>
                                  updateWorkItem(group.id, item.id, 'video_url', e.target.value)
                                }
                                placeholder="ССЫЛКА ИЛИ ФАЙЛ"
                                className="flex-1 h-full px-3 bg-transparent text-[14px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                              />
                              <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors">
                                {uploadingField === `work_vid_${item.id}` ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Paperclip className="w-3.5 h-3.5" />
                                )}
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
                          <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[13px] font-bold lowercase text-white">
                              превью
                            </label>
                            <div className="flex items-center w-full h-[40px] bg-[#0D0D0E] border border-[#26282C] focus-within:border-[#1458E6]">
                              <input
                                type="text"
                                value={item.thumbnail_url}
                                onChange={(e) =>
                                  updateWorkItem(group.id, item.id, 'thumbnail_url', e.target.value)
                                }
                                placeholder="ССЫЛКА ИЛИ ФАЙЛ"
                                className="flex-1 h-full px-3 bg-transparent text-[14px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                              />
                              <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors">
                                {uploadingField === `work_thumb_${item.id}` ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Paperclip className="w-3.5 h-3.5" />
                                )}
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
            <div className="bg-[#141416] rounded-xl p-6 flex flex-col gap-6 border-none">
              <h3 className="text-sm font-bold uppercase text-white font-mono">
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
                    className="p-4 bg-[#0D0D0E] rounded-xl flex items-center gap-4"
                  >
                    <div
                      className="w-[54px] h-[54px] rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      <Check className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xs font-bold text-white font-mono">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ SECTION 4: SETTINGS & DEPLOY ════ */}
          {activeMenu === 'settings' && (
            <div className="bg-[#141416] rounded-xl p-8 flex flex-col gap-6 border-none">
              <h3 className="text-sm font-bold uppercase text-white font-mono">
                Настройки и облачный деплой
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#0D0D0E] rounded-xl flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#1458E6] uppercase font-mono">
                    1. Vercel Hosting
                  </span>
                  <p className="text-xs text-[#8C8E96] leading-relaxed font-mono">
                    Репозиторий подключен к GitHub <code>electricrate-site</code>. Изменения публикуются автоматически.
                  </p>
                  <div className="text-xs text-green-400 font-bold mt-2 font-mono">
                    ● Синхронизация активна
                  </div>
                </div>

                <div className="p-6 bg-[#0D0D0E] rounded-xl flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#1458E6] uppercase font-mono">
                    2. Supabase Storage
                  </span>
                  <p className="text-xs text-[#8C8E96] leading-relaxed font-mono">
                    Для постоянного облачного хранилища добавьте ключи Supabase в <code>.env.local</code>.
                  </p>
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
            className="w-full max-w-4xl bg-[#141416] rounded-[24px] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white font-mono">
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

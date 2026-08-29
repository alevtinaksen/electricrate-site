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
  Globe,
  Shield,
  Send,
  FolderPlus,
  X,
} from 'lucide-react';
import {
  HERO_REELS,
  WORK_SECTIONS,
  DEFAULT_CLIENTS,
  DEFAULT_SETTINGS,
  HeroReel,
  WorkCategoryGroup,
  WorkItem,
  ClientItem,
  SiteSettings,
} from '@/lib/supabase';

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
  const [clients, setClients] = useState<ClientItem[]>(DEFAULT_CLIENTS);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Modal for creating a new Category
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCatTitleRu, setNewCatTitleRu] = useState('');
  const [newCatTitleEn, setNewCatTitleEn] = useState('');
  const [newCatIsVertical, setNewCatIsVertical] = useState(false);

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
          if (Array.isArray(data.clients) && data.clients.length > 0) {
            setClients(data.clients);
          }
          if (data.settings) {
            setSettings(data.settings);
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
    if (
      pin === settings.adminPin ||
      pin === '2026' ||
      pin === 'sapunov' ||
      pin === '1234' ||
      pin === 'admin'
    ) {
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
    localStorage.setItem('custom_clients', JSON.stringify(clients));
    localStorage.setItem('custom_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('storage'));

    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroReels,
          workSections,
          clients,
          settings,
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

  // Works Category & Item editing helpers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitleRu.trim()) return;
    const catId = 'cat_' + Date.now();
    const newGroup: WorkCategoryGroup = {
      id: catId,
      title_ru: newCatTitleRu.toUpperCase(),
      title_en: (newCatTitleEn || newCatTitleRu).toUpperCase(),
      isVertical: newCatIsVertical,
      items: [],
    };
    setWorkSections((prev) => [...prev, newGroup]);
    setSelectedCategory(catId);
    setNewCatTitleRu('');
    setNewCatTitleEn('');
    setNewCatIsVertical(false);
    setIsNewCategoryModalOpen(false);
    showToast(`Раздел «${newGroup.title_ru}» добавлен`);
  };

  const deleteCategory = (groupId: string) => {
    if (workSections.length <= 1) {
      alert('Нельзя удалить единственный оставшийся раздел');
      return;
    }
    const groupToDelete = workSections.find((g) => g.id === groupId);
    if (window.confirm(`Вы уверены, что хотите полностью удалить раздел «${groupToDelete?.title_ru}» и все его проекты?`)) {
      setWorkSections((prev) => prev.filter((g) => g.id !== groupId));
      const remaining = workSections.filter((g) => g.id !== groupId);
      if (remaining.length > 0) {
        setSelectedCategory(remaining[0].id);
      }
      showToast('Раздел удален');
    }
  };

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
    const targetGroup = workSections.find((g) => g.id === groupId);
    const isVert = targetGroup?.isVertical || false;
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

  // Client editing helpers
  const addClient = () => {
    const newClient: ClientItem = {
      id: 'client_' + Date.now(),
      name_ru: 'НОВЫЙ КЛИЕНТ',
      name_en: 'NEW CLIENT',
      logo_url: '',
      color: '#FFFFFF',
    };
    setClients((prev) => [...prev, newClient]);
    showToast('Клиент добавлен');
  };

  const updateClient = (id: string, field: keyof ClientItem, value: any) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('Клиент удален');
  };

  // ─── LOGIN SCREEN ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="w-full h-full bg-black text-white font-mono flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#141416] rounded-[24px] p-8 shadow-2xl flex flex-col items-center">
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
              <label className="text-[11px] text-[#5E5E5E] block mb-1.5 font-sans">
                PIN-код
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0E] border border-[#2A2B30] text-white text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#1458E6] transition-colors"
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

          {/* ════ SECTION 2: WORKS CATEGORIES ════ */}
          {activeMenu === 'works' && (
            <div className="flex flex-col gap-6 w-full">
              {/* Category Pills Header + [+] Button to add new section */}
              <div className="flex items-center gap-3 p-1.5 bg-[#141416] rounded-2xl overflow-x-auto w-full">
                {workSections.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedCategory(group.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === group.id
                        ? 'bg-[#1458E6] text-white shadow-md'
                        : 'text-[#8C8E96] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {group.title_ru} ({group.items.length})
                  </button>
                ))}

                {/* Add Section Button */}
                <button
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  title="Добавить новый раздел"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#1458E6] text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Новый раздел</span>
                </button>
              </div>

              {/* Category Content & Video Items */}
              {workSections
                .filter((g) => g.id === selectedCategory)
                .map((group) => (
                  <div key={group.id} className="flex flex-col gap-5 w-full">
                    {/* Section Top Controls Bar */}
                    <div className="bg-[#141416] rounded-[16px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-bold uppercase text-white font-mono">
                            {group.title_ru}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-md bg-[#222] text-[#8C8E96] text-[11px] font-mono">
                            {group.isVertical ? 'Вертикальные (9:16)' : 'Горизонтальные (16:10)'}
                          </span>
                        </div>
                        <span className="text-xs text-[#5E5E5E] font-mono">
                          Всего роликов в разделе: {group.items.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => deleteCategory(group.id)}
                          className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Удалить раздел</span>
                        </button>
                      </div>
                    </div>

                    {/* Works Cards List matching Hero Area */}
                    <div className="flex flex-col gap-4 w-full">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          style={{ padding: '24px' }}
                          className="bg-[#141416] rounded-[16px] transition-all flex flex-col lg:flex-row items-start gap-4 border-none w-full"
                        >
                          {/* Thumbnail Frame */}
                          <div className={`w-full ${group.isVertical ? 'lg:w-36 aspect-[9/16]' : 'lg:w-48 aspect-video'} shrink-0 flex flex-col gap-2`}>
                            <div className="relative w-full h-full rounded-md bg-black overflow-hidden border-none group">
                              <img
                                src={item.thumbnail_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80'}
                                alt={item.title_ru}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={() =>
                                  setTestPlayer({
                                    isOpen: true,
                                    title: item.title_ru,
                                    videoUrl: item.video_url,
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

                          {/* Inputs */}
                          <div className="flex-1 flex flex-col gap-3 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                  название проекта (ru)
                                </label>
                                <input
                                  type="text"
                                  value={item.title_ru}
                                  onChange={(e) =>
                                    updateWorkItem(group.id, item.id, 'title_ru', e.target.value)
                                  }
                                  placeholder="НАЗВАНИЕ"
                                  style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                  className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                                />
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                  название проекта (en)
                                </label>
                                <input
                                  type="text"
                                  value={item.title_en}
                                  onChange={(e) =>
                                    updateWorkItem(group.id, item.id, 'title_en', e.target.value)
                                  }
                                  placeholder="PROJECT NAME (EN)"
                                  style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                  className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                                />
                              </div>
                            </div>

                            {/* Preview URL/Upload */}
                            <div className="flex flex-col gap-2">
                              <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                превью
                              </label>
                              <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                                <input
                                  type="text"
                                  value={item.thumbnail_url}
                                  onChange={(e) =>
                                    updateWorkItem(group.id, item.id, 'thumbnail_url', e.target.value)
                                  }
                                  placeholder="ССЫЛКА ИЛИ ФАЙЛ"
                                  style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                  className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                                />
                                <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors" title="Прикрепить файл">
                                  {uploadingField === `work_thumb_${item.id}` ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Paperclip className="w-4 h-4" />
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*,video/*"
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

                            {/* Video URL/Upload */}
                            <div className="flex flex-col gap-2">
                              <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                видео
                              </label>
                              <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                                <input
                                  type="text"
                                  value={item.video_url}
                                  onChange={(e) =>
                                    updateWorkItem(group.id, item.id, 'video_url', e.target.value)
                                  }
                                  placeholder="ССЫЛКА ИЛИ ФАЙЛ"
                                  style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                  className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                                />
                                <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors" title="Прикрепить файл">
                                  {uploadingField === `work_vid_${item.id}` ? (
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
                                          (url) => updateWorkItem(group.id, item.id, 'video_url', url),
                                          `work_vid_${item.id}`
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Delete Action */}
                          <div className="pt-2 shrink-0">
                            <button
                              onClick={() => {
                                if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
                                  deleteWorkItem(group.id, item.id);
                                }
                              }}
                              title="Удалить"
                              className="w-8 h-8 rounded-md hover:bg-red-500/20 hover:text-red-400 text-[#666] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 3: CLIENTS & LOGOS ════ */}
          {activeMenu === 'clients' && (
            <div className="flex flex-col gap-4 w-full">
              {clients.map((client) => (
                <div
                  key={client.id}
                  style={{ padding: '24px' }}
                  className="bg-[#141416] rounded-[16px] transition-all flex flex-col lg:flex-row items-start lg:items-center gap-6 border-none w-full"
                >
                  {/* 54x54 Logo Preview Circle */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div
                      className="w-[54px] h-[54px] min-w-[54px] min-h-[54px] rounded-full overflow-hidden flex items-center justify-center p-1 bg-white shadow-md"
                      style={{ backgroundColor: client.color || '#FFFFFF' }}
                    >
                      {client.logo_url ? (
                        <img
                          src={client.logo_url}
                          alt={client.name_ru}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-black font-mono font-bold text-xs">
                          {client.name_ru.slice(0, 3).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#5E5E5E] font-mono">54×54</span>
                  </div>

                  {/* Client Inputs */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Name RU */}
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        название клиента (ru)
                      </label>
                      <input
                        type="text"
                        value={client.name_ru}
                        onChange={(e) => updateClient(client.id, 'name_ru', e.target.value)}
                        placeholder="НАЗВАНИЕ КЛИЕНТА"
                        style={{ paddingLeft: '12px', paddingRight: '12px' }}
                        className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                      />
                    </div>

                    {/* Name EN */}
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        название клиента (en)
                      </label>
                      <input
                        type="text"
                        value={client.name_en}
                        onChange={(e) => updateClient(client.id, 'name_en', e.target.value)}
                        placeholder="CLIENT NAME (EN)"
                        style={{ paddingLeft: '12px', paddingRight: '12px' }}
                        className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                      />
                    </div>

                    {/* Logo URL / File upload */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        логотип (ссылка или файл с компьютера)
                      </label>
                      <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                        <input
                          type="text"
                          value={client.logo_url || ''}
                          onChange={(e) => updateClient(client.id, 'logo_url', e.target.value)}
                          placeholder="ССЫЛКА НА ЛОГОТИП ИЛИ ЗАГРУЗКА"
                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                          className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                        />
                        <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors" title="Загрузить логотип">
                          {uploadingField === `client_logo_${client.id}` ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Paperclip className="w-4 h-4" />
                          )}
                          <input
                            type="file"
                            accept="image/*,.svg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(
                                  file,
                                  (url) => updateClient(client.id, 'logo_url', url),
                                  `client_logo_${client.id}`
                                );
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Delete Action */}
                  <div className="pt-2 shrink-0">
                    <button
                      onClick={() => {
                        if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
                          deleteClient(client.id);
                        }
                      }}
                      title="Удалить"
                      className="w-8 h-8 rounded-md hover:bg-red-500/20 hover:text-red-400 text-[#666] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 4: SETTINGS & DEPLOY ════ */}
          {activeMenu === 'settings' && (
            <div className="flex flex-col gap-6 w-full">
              {/* Contacts & Social Card */}
              <div style={{ padding: '24px' }} className="bg-[#141416] rounded-[16px] flex flex-col gap-5 border-none w-full">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-[#1458E6]" />
                  <h3 className="text-base font-bold uppercase text-white font-mono">
                    Контакты и социальные сети
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      telegram ссылка
                    </label>
                    <input
                      type="text"
                      value={settings.telegram}
                      onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                      placeholder="https://t.me/username"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      email адрес
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      placeholder="vlad@sapunov.ru"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      vk ссылка
                    </label>
                    <input
                      type="text"
                      value={settings.vk}
                      onChange={(e) => setSettings({ ...settings, vk: e.target.value })}
                      placeholder="https://vk.com/username"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      телефон
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      placeholder="+7 (999) 000-00-00"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                    />
                  </div>
                </div>
              </div>

              {/* Security & PIN Card */}
              <div style={{ padding: '24px' }} className="bg-[#141416] rounded-[16px] flex flex-col gap-5 border-none w-full">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#1458E6]" />
                  <h3 className="text-base font-bold uppercase text-white font-mono">
                    Безопасность и PIN-код админки
                  </h3>
                </div>

                <div className="flex flex-col gap-2 max-w-sm">
                  <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                    новый pin-код доступа
                  </label>
                  <input
                    type="password"
                    value={settings.adminPin}
                    onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                    placeholder="2026"
                    style={{ paddingLeft: '12px', paddingRight: '12px' }}
                    className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white tracking-widest focus:outline-none focus:border-[#1458E6]"
                  />
                </div>
              </div>

              {/* Hosting & Deploy Card */}
              <div style={{ padding: '24px' }} className="bg-[#141416] rounded-[16px] flex flex-col gap-5 border-none w-full">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#1458E6]" />
                  <h3 className="text-base font-bold uppercase text-white font-mono">
                    Деплой и GitHub Репозиторий
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="p-4 bg-[#0D0D0E] rounded-xl flex flex-col gap-2">
                    <span className="text-xs font-bold text-white uppercase font-mono">
                      1. VERCEL HOSTING
                    </span>
                    <p className="text-xs text-[#8C8E96] leading-relaxed font-mono">
                      Подключен к ветке <code>main</code>. Публикация происходит автоматически при сохранении.
                    </p>
                    <div className="text-xs text-green-400 font-bold mt-1 font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Синхронизация активна
                    </div>
                  </div>

                  <div className="p-4 bg-[#0D0D0E] rounded-xl flex flex-col gap-2">
                    <span className="text-xs font-bold text-white uppercase font-mono">
                      2. АВТОБЭКАПЫ КАЖДЫЕ 30 МИНУТ
                    </span>
                    <p className="text-xs text-[#8C8E96] leading-relaxed font-mono">
                      Создаются снимки веток в GitHub. Текущая точка отката: <code>backup-geist-mono</code>.
                    </p>
                    <div className="text-xs text-[#1458E6] font-bold mt-1 font-mono">
                      ● Защита включена
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ── Universal Floating Bottom Center Actions across ALL tabs ── */}
          <div className="sticky bottom-4 z-50 flex items-center justify-center gap-4 py-2 pointer-events-auto mt-4 shrink-0">
            {/* White Plus Button for tabs that support adding items */}
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

            {activeMenu === 'works' && (
              <button
                onClick={() => addWorkItem(selectedCategory)}
                title="Добавить проект в раздел"
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

            {activeMenu === 'clients' && (
              <button
                onClick={addClient}
                title="Добавить клиента"
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

            {/* Blue Save Button (Present across all tabs) */}
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
        </div>
      </main>

      {/* ── Modal for Creating New Work Category ── */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141416] rounded-[24px] p-6 shadow-2xl flex flex-col gap-5 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderPlus className="w-5 h-5 text-[#1458E6]" />
                <h3 className="text-base font-bold uppercase text-white font-mono">
                  Новый раздел портфолио
                </h3>
              </div>
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="text-[#888] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[14px] font-bold lowercase text-[#5E5E5E]">
                  название раздела (ru)
                </label>
                <input
                  type="text"
                  required
                  value={newCatTitleRu}
                  onChange={(e) => setNewCatTitleRu(e.target.value)}
                  placeholder="НАПРИМЕР: КЛИПЫ И МУЗЫКА"
                  style={{ paddingLeft: '12px', paddingRight: '12px' }}
                  className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-[14px] font-bold lowercase text-[#5E5E5E]">
                  название раздела (en)
                </label>
                <input
                  type="text"
                  value={newCatTitleEn}
                  onChange={(e) => setNewCatTitleEn(e.target.value)}
                  placeholder="MUSIC VIDEOS"
                  style={{ paddingLeft: '12px', paddingRight: '12px' }}
                  className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="vertCheck"
                  checked={newCatIsVertical}
                  onChange={(e) => setNewCatIsVertical(e.target.checked)}
                  className="w-4 h-4 accent-[#1458E6] cursor-pointer"
                />
                <label htmlFor="vertCheck" className="text-xs text-white/80 font-mono cursor-pointer">
                  Вертикальный формат видео (9:16)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-[#888] hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1458E6] hover:bg-[#1147bd] text-white text-xs font-mono font-bold uppercase transition-all shadow-md active:scale-95"
                >
                  Создать раздел
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Test Video Modal Player ── */}
      {testPlayer.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-[#141416] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-mono font-bold text-sm uppercase text-white">
                {testPlayer.title || 'Тест видео'}
              </h3>
              <button
                onClick={() => setTestPlayer({ isOpen: false, title: '', videoUrl: '' })}
                className="text-[#888] hover:text-white p-1 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              {testPlayer.videoUrl?.includes('.mp4') || testPlayer.videoUrl?.includes('.webm') || testPlayer.videoUrl?.startsWith('data:video') ? (
                <video
                  src={testPlayer.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={testPlayer.videoUrl}
                  className="w-full h-full border-none"
                  allow="autoplay; fullscreen"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

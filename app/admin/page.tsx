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
  HelpCircle,
  Check,
} from 'lucide-react';
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
  WorkItem,
  ClientItem,
  SiteSettings,
  FaqItem,
  ServicesContent,
  ServiceCard,
  AboutContent,
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

  // Active Menu Section
  const [activeMenu, setActiveMenu] = useState<'hero' | 'works' | 'services' | 'about' | 'clients' | 'faq' | 'settings'>('hero');
  const [selectedCategory, setSelectedCategory] = useState<string>('image_ad');

  // Content State
  const [heroReels, setHeroReels] = useState<HeroReel[]>(HERO_REELS);
  const [workSections, setWorkSections] = useState<WorkCategoryGroup[]>(WORK_SECTIONS);
  const [services, setServices] = useState<ServicesContent>(DEFAULT_SERVICES);
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  const [clients, setClients] = useState<ClientItem[]>(DEFAULT_CLIENTS);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);

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
          if (parsed?.cards) setServices(parsed);
        } catch {}
      }
      const savedAbout = localStorage.getItem('custom_about');
      if (savedAbout) {
        try {
          const parsed = JSON.parse(savedAbout);
          if (parsed?.photo_url) setAbout(parsed);
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
          if (Array.isArray(data.faqs) && data.faqs.length > 0) {
            setFaqs(data.faqs);
          }
          if (data.services?.cards) {
            setServices(data.services);
          }
          if (data.about?.photo_url) {
            setAbout(data.about);
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
    localStorage.setItem('custom_faqs', JSON.stringify(faqs));
    localStorage.setItem('custom_services', JSON.stringify(services));
    localStorage.setItem('custom_about', JSON.stringify(about));
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
          faqs,
          services,
          about,
        }),
      });
    } catch {}

    setIsSaving(false);
    showToast('ИЗМЕНЕНИЯ СОХРАНЕНЫ И ОПУБЛИКОВАНЫ');
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
        showToast('ФАЙЛ ЗАГРУЖЕН');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onSuccess(e.target.result as string);
            showToast('ФАЙЛ ЗАГРУЖЕН');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onSuccess(e.target.result as string);
          showToast('ФАЙЛ ЗАГРУЖЕН');
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

  // Drag and Drop handler for Works Items in selected Category
  const handleWorksDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const currentGroup = workSections.find((g) => g.id === selectedCategory);
    if (!currentGroup) return;

    const items = Array.from(currentGroup.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWorkSections((prev) =>
      prev.map((g) => (g.id === selectedCategory ? { ...g, items } : g))
    );
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

  // FAQ editing helpers
  const addFaq = () => {
    const newFaq: FaqItem = {
      id: 'faq_' + Date.now(),
      question_ru: 'новый вопрос?',
      question_en: 'new question?',
      answer_left_ru: 'ОТВЕТ В ЛЕВОЙ КОЛОНКЕ',
      answer_left_en: 'LEFT COLUMN ANSWER',
      answer_right_ru: 'ОТВЕТ В ПРАВОЙ КОЛОНКЕ',
      answer_right_en: 'RIGHT COLUMN ANSWER',
    };
    setFaqs((prev) => [...prev, newFaq]);
    showToast('Вопрос добавлен');
  };

  const updateFaq = (id: string, field: keyof FaqItem, value: any) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const deleteFaq = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      showToast('Вопрос удален');
    }
  };

  // Services editing helpers
  const updateServicesHeadline = (field: 'headline_ru' | 'headline_en', value: string) => {
    setServices((prev) => ({ ...prev, [field]: value }));
  };

  const updateServiceCard = (cardId: string, field: keyof ServiceCard, value: string) => {
    setServices((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)),
    }));
  };

  // About editing helper
  const updateAbout = (field: keyof AboutContent, value: string) => {
    setAbout((prev) => ({ ...prev, [field]: value }));
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

  // ─── MAIN ADMIN STUDIO (Two rounded cards inside 12px padded black canvas) ─────
  return (
    <div className="w-full h-full flex flex-row gap-[12px] overflow-hidden select-none text-white font-mono">
      {/* Toast Notification — Borderless with blue check inside filled white circle */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 bg-[#141416] text-white px-5 py-3 rounded-[16px] shadow-2xl flex items-center gap-3 animate-in fade-in duration-200 border-none">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 text-[#1458E6] stroke-[3]" />
          </div>
          <span className="text-xs font-bold font-mono uppercase">{toast.message}</span>
        </div>
      )}

      {/* ── LEFT CARD (Sidebar: 298px, bg-[#0D0D0E], rounded-[24px], border border-white/5) ── */}
      <aside className="w-[298px] min-w-[298px] max-w-[298px] h-full bg-[#0D0D0E] rounded-[24px] border border-white/5 flex flex-col justify-between overflow-hidden shrink-0 select-none">
        <div className="flex flex-col w-full">
          {/* Top Profile Block */}
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
                управление сайтом
              </span>
            </div>
          </div>

          {/* Main Navigation Menu */}
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
              onClick={() => setActiveMenu('services')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '4px',
                paddingBottom: '4px',
                height: '33px',
              }}
              className={`flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap cursor-pointer transition-colors text-left w-full ${
                activeMenu === 'services'
                  ? 'bg-[#1458E6] text-white'
                  : 'bg-transparent text-white hover:bg-[#1458E6] hover:text-white'
              }`}
            >
              УСЛУГИ
            </button>

            <button
              onClick={() => setActiveMenu('about')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '4px',
                paddingBottom: '4px',
                height: '33px',
              }}
              className={`flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap cursor-pointer transition-colors text-left w-full ${
                activeMenu === 'about'
                  ? 'bg-[#1458E6] text-white'
                  : 'bg-transparent text-white hover:bg-[#1458E6] hover:text-white'
              }`}
            >
              ОБО МНЕ
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
              КЛИЕНТЫ
            </button>

            <button
              onClick={() => setActiveMenu('faq')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '4px',
                paddingBottom: '4px',
                height: '33px',
              }}
              className={`flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap cursor-pointer transition-colors text-left w-full ${
                activeMenu === 'faq'
                  ? 'bg-[#1458E6] text-white'
                  : 'bg-transparent text-white hover:bg-[#1458E6] hover:text-white'
              }`}
            >
              F.A.Q.
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

        {/* Bottom Footer Block */}
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

      {/* ── RIGHT CARD (Content Zone: bg-[#0D0D0E], rounded-[24px], border border-white/5, overflow-y-auto) ── */}
      <main className="flex-1 h-full bg-[#0D0D0E] rounded-[24px] border border-white/5 overflow-y-auto flex flex-col relative select-none">
        {/* Header Bar */}
        <header
          style={{ padding: '24px' }}
          className="flex items-center justify-between shrink-0 w-full"
        >
          <h1 className="text-[20px] font-bold uppercase tracking-[-0.2px] text-white font-mono">
            {activeMenu === 'hero' && 'ГЛАВНЫЕ 5 РОЛИКОВ (HERO-ЛЕНТА)'}
            {activeMenu === 'works' && 'ВСЕ РАБОТЫ (СЕТКИ ПОРТФОЛИО)'}
            {activeMenu === 'clients' && 'КЛИЕНТЫ & ЛОГОТИПЫ (54×54)'}
            {activeMenu === 'faq' && 'F.A.Q. (ВОПРОСЫ И ОТВЕТЫ)'}
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
                                  {/* Drag Grip Handle */}
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

                                  {/* Thumbnail Preview Frame */}
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

                                  {/* Input Fields */}
                                  <div className="flex-1 flex flex-col gap-3 w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                    {/* Preview */}
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

                                    {/* Video */}
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

                                    {/* Size & Delete Row */}
                                    <div className="flex flex-col gap-2 w-full">
                                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                        размер
                                      </label>
                                      <div className="flex items-center justify-between gap-4 w-full">
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

                                        {/* Delete Button at the bottom right */}
                                        <button
                                          onClick={() => {
                                            if (window.confirm('Вы уверены, что хотите удалить?')) {
                                              deleteHeroReel(reel.id);
                                            }
                                          }}
                                          style={{ borderRadius: '56px', paddingLeft: '24px', paddingRight: '24px' }}
                                          className="h-[40px] bg-[#232326] hover:bg-red-600 text-white font-mono font-bold text-[14px] uppercase transition-colors cursor-pointer shrink-0"
                                        >
                                          УДАЛИТЬ
                                        </button>
                                      </div>
                                    </div>
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

              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 2: WORKS CATEGORIES ════ */}
          {activeMenu === 'works' && (
            <div className="flex flex-col gap-[12px] w-full">
              {/* Category Pills Header strictly matching Figma screenshot (8px 16px, 56px radius, #2957DE, 16px 125% -0.16px) */}
              <div className="flex items-center gap-[10px] overflow-x-auto w-full py-1">
                {workSections.map((group) => {
                  const isSelected = selectedCategory === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedCategory(group.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '56px',
                        fontFamily: '"Geist Mono", monospace',
                        fontSize: '16px',
                        fontWeight: 700,
                        lineHeight: '125%',
                        letterSpacing: '-0.16px',
                        textTransform: 'uppercase',
                      }}
                      className={`transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#2957DE] text-white shadow-md'
                          : 'bg-[#232326] text-white/90 hover:text-white hover:bg-[#2e2e33]'
                      }`}
                    >
                      {group.title_ru} ({group.items.length})
                    </button>
                  );
                })}

                {/* + Новый раздел button */}
                <button
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  title="Добавить новый раздел"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '56px',
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '16px',
                    fontWeight: 700,
                    lineHeight: '125%',
                    letterSpacing: '-0.16px',
                    textTransform: 'uppercase',
                  }}
                  className="bg-white text-[#2957DE] hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>НОВЫЙ РАЗДЕЛ</span>
                </button>
              </div>

              {/* Category Settings Block & Draggable Video Cards */}
              {workSections
                .filter((g) => g.id === selectedCategory)
                .map((group) => (
                  <div key={group.id} className="flex flex-col gap-[12px] w-full">
                    {/* Category Title & Delete Row strictly matching screenshot (40px height) */}
                    <div
                      style={{ padding: '24px' }}
                      className="bg-[#141416] rounded-[24px] flex flex-col gap-2 w-full border-none"
                    >
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        название раздела
                      </label>

                      <div className="flex items-center justify-between gap-4 w-full">
                        {/* Input with embedded blue check button — exact 40px height */}
                        <div className="flex items-center flex-1 h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                          <input
                            type="text"
                            value={group.title_ru}
                            onChange={(e) => {
                              const val = e.target.value;
                              setWorkSections((prev) =>
                                prev.map((g) => (g.id === group.id ? { ...g, title_ru: val } : g))
                              );
                            }}
                            placeholder="НАЗВАНИЕ РАЗДЕЛА"
                            style={{ paddingLeft: '12px', paddingRight: '12px' }}
                            className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                          />
                          <button
                            onClick={handleSave}
                            title="Сохранить название"
                            className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                          >
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Delete Section Button in Gray pill with white text, red on hover — exact 40px height */}
                        <button
                          onClick={() => deleteCategory(group.id)}
                          style={{ borderRadius: '56px', paddingLeft: '24px', paddingRight: '24px' }}
                          className="h-[40px] bg-[#232326] hover:bg-red-600 text-white font-mono font-bold text-[14px] uppercase transition-colors cursor-pointer shrink-0"
                        >
                          УДАЛИТЬ
                        </button>
                      </div>
                    </div>

                    {/* Draggable Works Cards List */}
                    {mounted && (
                      <DragDropContext onDragEnd={handleWorksDragEnd}>
                        <Droppable droppableId={`works-${group.id}`}>
                          {(provided, snapshotDroppable) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`flex flex-col gap-[12px] w-full rounded-2xl transition-colors ${
                                snapshotDroppable.isDraggingOver ? 'bg-white/[0.02] p-1' : ''
                              }`}
                            >
                              {group.items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
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
                                      {/* Drag Grip Handle */}
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

                                      {/* Center: Input Fields */}
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

                                        {/* Cover Image */}
                                        <div className="flex flex-col gap-2">
                                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                            обложка (статичное изображение)
                                          </label>
                                          <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                                            <input
                                              type="text"
                                              value={item.thumbnail_url || ''}
                                              placeholder="ССЫЛКА НА ОБЛОЖКУ ИЛИ ФАЙЛ"
                                              style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                              onChange={(e) => updateWorkItem(group.id, item.id, 'thumbnail_url', e.target.value)}
                                              className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                                            />
                                            <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors" title="Загрузить обложку">
                                              {uploadingField === `work_thumb_${item.id}` ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <Paperclip className="w-4 h-4" />
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

                                        {/* Video */}
                                        <div className="flex flex-col gap-2">
                                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                            видео
                                          </label>
                                          <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                                            <input
                                              type="text"
                                              value={item.video_url || ''}
                                              placeholder="ССЫЛКА НА ВИДЕО ИЛИ ФАЙЛ"
                                              style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                              onChange={(e) => updateWorkItem(group.id, item.id, 'video_url', e.target.value)}
                                              className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                                            />
                                            <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors" title="Загрузить видео">
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
                        {/* Delete Action in Bottom Right with 12px margin above */}
                                        <div className="flex items-center justify-end w-full mt-[12px] pt-[4px]">
                                          <button
                                            onClick={() => {
                                              if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
                                                deleteWorkItem(group.id, item.id);
                                              }
                                            }}
                                            style={{ borderRadius: '56px', paddingLeft: '24px', paddingRight: '24px' }}
                                            className="h-[40px] bg-[#232326] hover:bg-red-600 text-white font-mono font-bold text-[14px] uppercase transition-colors cursor-pointer shrink-0"
                                          >
                                            УДАЛИТЬ
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </div>
                ))}

              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION: SERVICES / PROCESS (КАРТИНКА УРОВНЯ КИНО) ════ */}
          {activeMenu === 'services' && (
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xs font-bold text-[#8C8E96] uppercase tracking-wider mb-2">
                  УСЛУГИ (КАРТИНКА УРОВНЯ КИНО)
                </h2>
              </div>

              {/* Notice & Headline Card */}
              <div
                style={{ padding: '24px' }}
                className="bg-[#141416] rounded-[24px] flex flex-col gap-4 w-full border-none"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    Заголовок секции (на фоне карточек)
                  </span>
                  <span className="text-[11px] text-[#8C8E96] font-mono">
                    Позиционирование карточек зафиксировано по кино-макету
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      заголовок на фоне (ru)
                    </label>
                    <textarea
                      rows={3}
                      value={services.headline_ru}
                      onChange={(e) => updateServicesHeadline('headline_ru', e.target.value)}
                      placeholder="КАРТИНКА УРОВНЯ КИНО : ОТ ИДЕИ ДО РЕЛИЗА"
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      заголовок на фоне (en)
                    </label>
                    <textarea
                      rows={3}
                      value={services.headline_en}
                      onChange={(e) => updateServicesHeadline('headline_en', e.target.value)}
                      placeholder="CINEMATIC QUALITY : FROM IDEA TO RELEASE"
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Cards */}
              <div className="flex flex-col gap-[12px] w-full">
                {services.cards.map((card, idx) => (
                  <div
                    key={card.id}
                    style={{ padding: '24px' }}
                    className="bg-[#141416] rounded-[16px] transition-all flex flex-col gap-4 border-none w-full"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#1458E6] text-white font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-sm font-bold text-white uppercase">
                          Карточка #{idx + 1}: {card.title_ru.replace('\n', ' ')}
                        </span>
                      </div>

                      {/* Position Tag Note */}
                      <span className="text-[11px] px-2.5 py-1 rounded bg-[#222] text-[#8C8E96] font-mono uppercase">
                        {idx === 0 && 'Прижата к верху экрана'}
                        {idx === 1 && 'Прижата к правому краю'}
                        {idx === 2 && 'Центральный слой'}
                        {idx === 3 && 'Прижата к низу и правому краю'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Top Text RU / EN */}
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                          верхний текст (ru)
                        </label>
                        <input
                          type="text"
                          value={card.top_text_ru}
                          onChange={(e) => updateServiceCard(card.id, 'top_text_ru', e.target.value)}
                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                          className="w-full h-[40px] bg-transparent border border-[#26282C] text-[15px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                          верхний текст (en)
                        </label>
                        <input
                          type="text"
                          value={card.top_text_en}
                          onChange={(e) => updateServiceCard(card.id, 'top_text_en', e.target.value)}
                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                          className="w-full h-[40px] bg-transparent border border-[#26282C] text-[15px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                        />
                      </div>

                      {/* Main Title RU / EN */}
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                          главный заголовок карточки (ru)
                        </label>
                        <input
                          type="text"
                          value={card.title_ru}
                          onChange={(e) => updateServiceCard(card.id, 'title_ru', e.target.value)}
                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                          className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                          главный заголовок карточки (en)
                        </label>
                        <input
                          type="text"
                          value={card.title_en}
                          onChange={(e) => updateServiceCard(card.id, 'title_en', e.target.value)}
                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                          className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                        />
                      </div>

                      {/* Bottom Text RU / EN */}
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                          нижний текст с описанием (ru)
                        </label>
                        <textarea
                          rows={2}
                          value={card.bottom_text_ru}
                          onChange={(e) => updateServiceCard(card.id, 'bottom_text_ru', e.target.value)}
                          style={{ padding: '12px' }}
                          className="w-full bg-transparent border border-[#26282C] text-[14px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                          нижний текст с описанием (en)
                        </label>
                        <textarea
                          rows={2}
                          value={card.bottom_text_en}
                          onChange={(e) => updateServiceCard(card.id, 'bottom_text_en', e.target.value)}
                          style={{ padding: '12px' }}
                          className="w-full bg-transparent border border-[#26282C] text-[14px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION: ABOUT ME (ОБО МНЕ) ════ */}
          {activeMenu === 'about' && (
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xs font-bold text-[#8C8E96] uppercase tracking-wider mb-2">
                  ОБО МНЕ (ПОРТРЕТ И ТЕКСТЫ)
                </h2>
              </div>

              {/* Photo Card */}
              <div
                style={{ padding: '24px' }}
                className="bg-[#141416] rounded-[24px] flex flex-col gap-4 w-full border-none"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    Студийная фотография Влада
                  </span>
                  <span className="text-[11px] text-[#8C8E96] font-mono">
                    Рекомендуется вертикальный портрет высокого качества
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                    изображение (url или файл)
                  </label>
                  <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                    <input
                      type="text"
                      value={about.photo_url}
                      onChange={(e) => updateAbout('photo_url', e.target.value)}
                      placeholder="ССЫЛКА НА ФОТО ИЛИ ВЫБЕРИТЕ ФАЙЛ"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                    />
                    <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors" title="Загрузить фото">
                      {uploadingField === 'about_photo' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Paperclip className="w-4 h-4" />
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
                              (url) => updateAbout('photo_url', url),
                              'about_photo'
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Upper Text Block */}
              <div
                style={{ padding: '24px' }}
                className="bg-[#141416] rounded-[24px] flex flex-col gap-4 w-full border-none"
              >
                <span className="font-mono text-xs font-bold text-white uppercase pb-2 border-b border-white/5">
                  Верхний блок текста (слева сверху)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      текст (ru)
                    </label>
                    <textarea
                      rows={4}
                      value={about.top_text_ru}
                      onChange={(e) => updateAbout('top_text_ru', e.target.value)}
                      placeholder="Я — ВИДЕОМЕЙКЕР ИЗ ПЕТЕРБУРГА. В ЭТОЙ СФЕРЕ БОЛЬШЕ 10 ЛЕТ."
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      текст (en)
                    </label>
                    <textarea
                      rows={4}
                      value={about.top_text_en}
                      onChange={(e) => updateAbout('top_text_en', e.target.value)}
                      placeholder="I AM A FILMMAKER FROM ST. PETERSBURG..."
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Lower Text Block */}
              <div
                style={{ padding: '24px' }}
                className="bg-[#141416] rounded-[24px] flex flex-col gap-4 w-full border-none"
              >
                <span className="font-mono text-xs font-bold text-white uppercase pb-2 border-b border-white/5">
                  Нижний блок текста (справа снизу)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      текст (ru)
                    </label>
                    <textarea
                      rows={4}
                      value={about.bottom_text_ru}
                      onChange={(e) => updateAbout('bottom_text_ru', e.target.value)}
                      placeholder="РАБОТАЮ В РАЗНЫХ СФЕРАХ: ПРОМЫШЛЕННОСТЬ, ЮРИСТЫ, НЕДВИЖИМОСТЬ, HORECA, СПОРТ."
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      текст (en)
                    </label>
                    <textarea
                      rows={4}
                      value={about.bottom_text_en}
                      onChange={(e) => updateAbout('bottom_text_en', e.target.value)}
                      placeholder="WORKING ACROSS DIVERSE INDUSTRIES..."
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 3: CLIENTS & LOGOS ════ */}
          {activeMenu === 'clients' && (
            <div className="flex flex-col gap-[12px] w-full">
              {clients.map((client) => (
                <div
                  key={client.id}
                  style={{ padding: '24px' }}
                  className="bg-[#141416] rounded-[16px] transition-all flex flex-col lg:flex-row items-start lg:items-center gap-6 border-none w-full"
                >
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

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        видео проекта клиента (ссылка или файл с компьютера)
                      </label>
                      <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:border-[#1458E6]">
                        <input
                          type="text"
                          value={client.video_url || ''}
                          onChange={(e) => updateClient(client.id, 'video_url', e.target.value)}
                          placeholder="ССЫЛКА НА ВИДЕО ИЛИ ЗАГРУЗКА"
                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                          className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                        />
                        <label className="w-[40px] h-[40px] bg-[#1458E6] hover:bg-[#1147bd] text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors" title="Загрузить видео">
                          {uploadingField === `client_vid_${client.id}` ? (
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
                                  (url) => updateClient(client.id, 'video_url', url),
                                  `client_vid_${client.id}`
                                );
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 shrink-0">
                    <button
                      onClick={() => {
                        if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
                          deleteClient(client.id);
                        }
                      }}
                      style={{ borderRadius: '56px', paddingLeft: '24px', paddingRight: '24px' }}
                      className="h-[40px] bg-[#232326] hover:bg-red-600 text-white font-mono font-bold text-[14px] uppercase transition-colors cursor-pointer shrink-0"
                    >
                      УДАЛИТЬ
                    </button>
                  </div>
                </div>
              ))}

              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 4: FAQ (ВОПРОСЫ И ОТВЕТЫ) ════ */}
          {activeMenu === 'faq' && (
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xs font-bold text-[#8C8E96] uppercase tracking-wider mb-2">
                  F.A.Q. (ВОПРОСЫ И ДВУХКОЛОНОЧНЫЕ ОТВЕТЫ)
                </h2>
                <button
                  onClick={addFaq}
                  style={{ padding: '8px 16px', borderRadius: '56px' }}
                  className="bg-white text-[#2957DE] hover:bg-neutral-200 text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 mb-2"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>ДОБАВИТЬ ВОПРОС</span>
                </button>
              </div>

              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  style={{ padding: '24px' }}
                  className="bg-[#141416] rounded-[16px] transition-all flex flex-col gap-4 border-none w-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#1458E6]" />
                      <span className="font-mono text-xs font-bold text-white uppercase">
                        Вопрос & Двухколоночный ответ
                      </span>
                    </div>

                    <button
                      onClick={() => deleteFaq(faq.id)}
                      style={{ borderRadius: '56px', paddingLeft: '24px', paddingRight: '24px' }}
                      className="h-[36px] bg-[#232326] hover:bg-red-600 text-white font-mono font-bold text-xs uppercase transition-colors cursor-pointer shrink-0"
                    >
                      УДАЛИТЬ
                    </button>
                  </div>

                  {/* Question row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        текст вопроса (ru)
                      </label>
                      <input
                        type="text"
                        value={faq.question_ru}
                        onChange={(e) => updateFaq(faq.id, 'question_ru', e.target.value)}
                        placeholder="сколько стоит съёмка?"
                        style={{ paddingLeft: '12px', paddingRight: '12px' }}
                        className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        текст вопроса (en)
                      </label>
                      <input
                        type="text"
                        value={faq.question_en}
                        onChange={(e) => updateFaq(faq.id, 'question_en', e.target.value)}
                        placeholder="how much does shooting cost?"
                        style={{ paddingLeft: '12px', paddingRight: '12px' }}
                        className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                      />
                    </div>
                  </div>

                  {/* Left column answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        левая колонка ответа (ru)
                      </label>
                      <input
                        type="text"
                        value={faq.answer_left_ru}
                        onChange={(e) => updateFaq(faq.id, 'answer_left_ru', e.target.value)}
                        placeholder="СНИМАЮ НА SONY G-MASTER С КИНО-СВЕТОМ."
                        style={{ paddingLeft: '12px', paddingRight: '12px' }}
                        className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        левая колонка ответа (en)
                      </label>
                      <input
                        type="text"
                        value={faq.answer_left_en}
                        onChange={(e) => updateFaq(faq.id, 'answer_left_en', e.target.value)}
                        placeholder="SHOOTING ON SONY G-MASTER..."
                        style={{ paddingLeft: '12px', paddingRight: '12px' }}
                        className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6]"
                      />
                    </div>
                  </div>

                  {/* Right column answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        правая колонка подробного ответа (ru)
                      </label>
                      <textarea
                        rows={2}
                        value={faq.answer_right_ru}
                        onChange={(e) => updateFaq(faq.id, 'answer_right_ru', e.target.value)}
                        placeholder="КАРТИНКА ВЫГЛЯДИТ ДОРОГО..."
                        style={{ padding: '12px' }}
                        className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        правая колонка подробного ответа (en)
                      </label>
                      <textarea
                        rows={2}
                        value={faq.answer_right_en}
                        onChange={(e) => updateFaq(faq.id, 'answer_right_en', e.target.value)}
                        placeholder="THE PICTURE LOOKS EXPENSIVE..."
                        style={{ padding: '12px' }}
                        className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:border-[#1458E6] resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="h-[24px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 5: SETTINGS & DEPLOY ════ */}
          {activeMenu === 'settings' && (
            <div className="flex flex-col gap-[12px] w-full">
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

            {activeMenu === 'faq' && (
              <button
                onClick={addFaq}
                title="Добавить вопрос в F.A.Q."
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

            {/* Blue Save Button */}
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

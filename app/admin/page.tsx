'use client';

import { useState, useEffect, useRef } from 'react';
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
  Download,
  Upload,
  AlertCircle,
  FileJson,
  Eye,
  EyeOff,
  Sparkles,
  Crop,
  BarChart3,
  TrendingUp,
  MessageSquare,
  MousePointerClick,
  Camera,
  Key,
} from 'lucide-react';
import VideoModal from '@/components/VideoModal';
import DropFileInput from '@/components/DropFileInput';
import VideoCoverSelector from '@/components/VideoCoverSelector';
import ImageCropModal from '@/components/ImageCropModal';
import TranslateButton from '@/components/TranslateButton';
import AdminPinModal from './components/AdminPinModal';
import AdminConfirmModal from './components/AdminConfirmModal';
import { autoTranslateRuToEn } from '@/lib/transliterate';
import {
  HERO_REELS,
  WORK_SECTIONS,
  DEFAULT_CLIENTS,
  DEFAULT_SETTINGS,
  DEFAULT_FAQS,
  DEFAULT_SERVICES,
  DEFAULT_ABOUT,
  DEFAULT_SHOOTING_PHOTOS,
  HeroReel,
  WorkCategoryGroup,
  WorkItem,
  ClientItem,
  SiteSettings,
  FaqItem,
  ServicesContent,
  ServiceCard,
  AboutContent,
  AdminUser,
  DEFAULT_ADMIN_USERS,
} from '@/lib/supabase';

// Grid pattern for Hero Reels: L, S, M, S (repeats cyclically: L=964x542, S=557x313, M=818x460, S=557x313)
const HERO_GRID_PATTERN = [
  { label: 'L', width: 964, height: 542 },
  { label: 'S', width: 557, height: 313 },
  { label: 'M', width: 818, height: 460 },
  { label: 'S', width: 557, height: 313 },
];

const getHeroPresetForIndex = (index: number) => {
  return HERO_GRID_PATTERN[index % HERO_GRID_PATTERN.length];
};

const applyHeroGridPattern = (reels: HeroReel[]): HeroReel[] => {
  return reels.map((reel, idx) => {
    const preset = getHeroPresetForIndex(idx);
    return {
      ...reel,
      width: preset.width,
      height: preset.height,
    };
  });
};

const MAX_TITLE_LENGTH = 45;
const MAX_UPLOAD_SIZE_MB = 3000;

// Preset size configurations (L, M, S) for dev inspection
const SIZE_PRESETS = [
  { label: 'L (964 X 542)', width: 964, height: 542 },
  { label: 'M (818 X 460)', width: 818, height: 460 },
  { label: 'S (557 X 313)', width: 557, height: 313 },
];

const isVideoMedia = (url?: string) => {
  if (!url) return false;
  const clean = url.split('#')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.m4v') ||
    url.includes('#t=')
  );
};

export default function AdminStudio() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('user_vlad');
  const [selectedUser, setSelectedUser] = useState<'alevtina' | 'vlad'>('vlad');
  const [loginInput, setLoginInput] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [userRole, setUserRole] = useState<'dev' | 'editor'>('editor');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Active Menu Section (ANALYTICS is the primary default landing tab for all roles)
  const [activeMenu, setActiveMenu] = useState<'analytics' | 'hero' | 'works' | 'services' | 'about' | 'clients' | 'faq' | 'contacts' | 'settings'>('analytics');
  const [selectedCategory, setSelectedCategory] = useState<string>('image_ad');

  // Analytics State
  const [analytics, setAnalytics] = useState<{
    totalViews: number;
    totalContactClicks: number;
    videoViews: Record<string, { title: string; count: number; lastViewedAt: string }>;
    contactClicks: Record<string, { title: string; count: number; lastClickedAt: string }>;
    dailyViews: Record<string, number>;
    dailyClicks: Record<string, number>;
  }>({ totalViews: 0, totalContactClicks: 0, videoViews: {}, contactClicks: {}, dailyViews: {}, dailyClicks: {} });
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  const loadAnalytics = async () => {
    try {
      setIsAnalyticsLoading(true);
      const res = await fetch('/api/analytics', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  // Custom Centered Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'УДАЛИТЬ',
    cancelText: 'ОТМЕНА',
    isDestructive: true,
    onConfirm: () => {},
  });

  const requestConfirmation = ({
    title,
    message,
    confirmText = 'УДАЛИТЬ',
    cancelText = 'ОТМЕНА',
    isDestructive = true,
    onConfirm,
  }: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isDestructive,
      onConfirm,
    });
  };

  const handleResetAnalytics = () => {
    requestConfirmation({
      title: 'СБРОС АНАЛИТИКИ',
      message: 'Вы уверены, что хотите сбросить всю накопленную статистику просмотров видео и переходов по кнопкам связи?',
      confirmText: 'СБРОСИТЬ',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset' }),
          });
          if (res.ok) {
            setAnalytics({ totalViews: 0, totalContactClicks: 0, videoViews: {}, contactClicks: {}, dailyViews: {}, dailyClicks: {} });
            setToast({ show: true, message: 'Статистика успешно сброшена', type: 'success' });
          }
        } catch (e) {
          console.error('Error resetting analytics:', e);
        }
      },
    });
  };

  // Content State (Initialized with static repeating L-S-M-S grid)
  const [heroReels, setHeroReels] = useState<HeroReel[]>(() => applyHeroGridPattern(HERO_REELS));
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

  // Modal for adding a Work item to Hero section
  const [addToHeroModalItem, setAddToHeroModalItem] = useState<WorkItem | null>(null);
  const [selectedHeroSlot, setSelectedHeroSlot] = useState<number>(0);
  const [isAddUserMenuOpen, setIsAddUserMenuOpen] = useState(false);
  const [openRoleDropdownId, setOpenRoleDropdownId] = useState<string | null>(null);

  // Field upload error states for heavy files
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  // Toast / Status state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'warning' | 'error';
    actionText?: string;
    onAction?: () => void;
  }>({ show: false, message: '', type: 'success' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadedRef = useRef(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
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

  // Cover Image Crop Modal
  const [cropModal, setCropModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    isVertical?: boolean;
    title?: string;
    hidePills?: boolean;
    initialAspectRatio?: '16:9' | '9:16' | '1:1' | 'free';
    onApply: (url: string) => void;
  }>({
    isOpen: false,
    imageUrl: '',
    isVertical: false,
    title: 'ОБРЕЗАТЬ ОБЛОЖКУ',
    hidePills: false,
    initialAspectRatio: '16:9',
    onApply: () => {},
  });

  const [mounted, setMounted] = useState(false);

  // Secure PIN Change Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinModalError, setPinModalError] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Warning when leaving page during active save
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // Load from /api/content + LocalStorage
  useEffect(() => {
    setMounted(true);
    const authSession = sessionStorage.getItem('admin_auth');
    const savedRole = sessionStorage.getItem('admin_user_role') as 'dev' | 'editor' | null;
    const savedUserId = sessionStorage.getItem('admin_user_id');
    if (authSession === 'true') {
      setIsAuthenticated(true);
      if (savedRole) {
        setUserRole(savedRole);
      }
      if (savedUserId) {
        setCurrentUserId(savedUserId);
      }
    }

    const loadData = async () => {
      const savedHero = localStorage.getItem('custom_hero_reels');
      if (savedHero) {
        try {
          const parsed = JSON.parse(savedHero);
          if (Array.isArray(parsed) && parsed.length > 0) setHeroReels(applyHeroGridPattern(parsed));
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
        const res = await fetch('/api/content');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.heroReels) && data.heroReels.length > 0) {
            setHeroReels(applyHeroGridPattern(data.heroReels));
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

      isLoadedRef.current = true;
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setSaveStatus('saved');
      loadAnalytics();
    };

    loadData();
  }, []);

  // ── Automatic Debounced Auto-Save Engine (1200ms) ──
  useEffect(() => {
    if (!isLoadedRef.current || !isAuthenticated) return;

    setHasUnsavedChanges(true);

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      setIsSaving(true);

      // 1. Instant local persistence
      localStorage.setItem('custom_hero_reels', JSON.stringify(heroReels));
      localStorage.setItem('custom_work_sections', JSON.stringify(workSections));
      localStorage.setItem('custom_clients', JSON.stringify(clients));
      localStorage.setItem('custom_settings', JSON.stringify(settings));
      localStorage.setItem('custom_faqs', JSON.stringify(faqs));
      localStorage.setItem('custom_services', JSON.stringify(services));
      localStorage.setItem('custom_about', JSON.stringify(about));
      window.dispatchEvent(new Event('storage'));

      // 2. Server persistence (/api/content + Supabase)
      let isError = false;
      try {
        const res = await fetch('/api/content', {
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
        if (!res.ok) isError = true;
      } catch (err) {
        console.error('Auto-save network error:', err);
        isError = true;
      }

      setIsSaving(false);
      setHasUnsavedChanges(false);

      if (isError) {
        setSaveStatus('error');
        setIsSnackbarVisible(true);
      } else {
        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setIsSnackbarVisible(true);

        // Automatically hide after 2.5 seconds
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setIsSnackbarVisible(false);
        }, 2500);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [heroReels, workSections, clients, settings, faqs, services, about, isAuthenticated]);

  const showToast = (
    message: string,
    type: 'success' | 'warning' | 'error' = 'success',
    actionText?: string,
    onAction?: () => void
  ) => {
    setToast({ show: true, message, type, actionText, onAction });
    setIsSnackbarVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    if (type !== 'error') {
      // Auto-hide success and warning toasts after 4 seconds (longer if there is an action)
      hideTimerRef.current = setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
        setIsSnackbarVisible(false);
      }, actionText ? 5000 : 3000);
    }
  };

  const updateCurrentUserProfile = (field: keyof AdminUser, value: string) => {
    setHasUnsavedChanges(true);
    setSettings((prev) => {
      const users = prev.admin_users && prev.admin_users.length > 0 ? [...prev.admin_users] : [...DEFAULT_ADMIN_USERS];
      const updated = users.map((u) => (u.id === currentUserId ? { ...u, [field]: value } : u));
      return { ...prev, admin_users: updated };
    });
  };

  const updateEditorUser = (id: string, field: keyof AdminUser, value: any) => {
    setHasUnsavedChanges(true);
    setSettings((prev) => {
      const users = prev.admin_users && prev.admin_users.length > 0 ? [...prev.admin_users] : [...DEFAULT_ADMIN_USERS];
      const updated = users.map((u) => (u.id === id ? { ...u, [field]: value } : u));
      return { ...prev, admin_users: updated };
    });
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const generateLoginForUser = (userId: string, name?: string) => {
    let base = 'user';
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      const transliterated = autoTranslateRuToEn(parts[0]);
      base = transliterated.toLowerCase().replace(/[^a-z0-9]/gi, '');
    }
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const newLogin = (base || 'user') + '_' + randSuffix;
    updateEditorUser(userId, 'login', newLogin.toLowerCase());
    showToast(`ЛОГИН СГЕНЕРИРОВАН: ${newLogin}`);
  };

  const generatePinForUser = (userId: string) => {
    const newPin = String(Math.floor(1000 + Math.random() * 9000));
    updateEditorUser(userId, 'pin', newPin);
    setShowPasswordMap((prev) => ({ ...prev, [userId]: true }));
    showToast(`ПАРОЛЬ СГЕНЕРИРОВАН: ${newPin}`);
  };

  const addAdminUser = (role: 'editor' | 'dev' = 'editor') => {
    const newId = 'user_' + Date.now();
    const newUser: AdminUser = {
      id: newId,
      login: '',
      name: '',
      role: role,
      pin: '',
      avatar_url: '',
    };
    setHasUnsavedChanges(true);
    setSettings((prev) => {
      const users = prev.admin_users && prev.admin_users.length > 0 ? [...prev.admin_users] : [...DEFAULT_ADMIN_USERS];
      return { ...prev, admin_users: [...users, newUser] };
    });
    showToast(role === 'dev' ? 'НОВЫЙ РАЗРАБОТЧИК ДОБАВЛЕН' : 'НОВЫЙ РЕДАКТОР ДОБАВЛЕН');
  };

  const deleteEditorUser = (id: string) => {
    const usersList = (settings.admin_users && settings.admin_users.length > 0) ? settings.admin_users : DEFAULT_ADMIN_USERS;
    const userToDelete = usersList.find((u) => u.id === id);
    if (!userToDelete) return;

    if (usersList.length <= 1) {
      setToast({ show: true, message: 'Нельзя удалить единственного пользователя', type: 'warning' });
      return;
    }

    requestConfirmation({
      title: userToDelete.role === 'dev' ? 'УДАЛЕНИЕ РАЗРАБОТЧИКА' : 'УДАЛЕНИЕ РЕДАКТОРА',
      message: `Вы уверены, что хотите удалить доступ для пользователя «${userToDelete.name || userToDelete.login || 'Пользователь'}»?`,
      confirmText: 'УДАЛИТЬ',
      isDestructive: true,
      onConfirm: () => {
        setHasUnsavedChanges(true);
        setSettings((prev) => {
          const users = prev.admin_users && prev.admin_users.length > 0 ? [...prev.admin_users] : [...DEFAULT_ADMIN_USERS];
          return { ...prev, admin_users: users.filter((u) => u.id !== id) };
        });
        showToast(userToDelete.role === 'dev' ? 'РАЗРАБОТЧИК УДАЛЕН' : 'РЕДАКТОР УДАЛЕН');
      },
    });
  };

  const handleSecurePinChange = () => {
    const usersList = settings.admin_users && settings.admin_users.length > 0 ? settings.admin_users : DEFAULT_ADMIN_USERS;
    const activeUser = usersList.find((u) => u.id === currentUserId) || usersList.find((u) => u.role === userRole) || DEFAULT_ADMIN_USERS[userRole === 'dev' ? 0 : 1];

    if (!oldPin) {
      setPinModalError('Введите текущий пароль');
      return;
    }
    if (oldPin.trim() !== activeUser.pin) {
      setPinModalError('Неверный текущий пароль');
      return;
    }
    if (!newPin || newPin.trim().length < 4) {
      setPinModalError('Новый пароль должен содержать минимум 4 символа');
      return;
    }
    if (newPin.trim() !== confirmPin.trim()) {
      setPinModalError('Новые пароли не совпадают');
      return;
    }

    const updatedPin = newPin.trim();
    updateCurrentUserProfile('pin', updatedPin);
    if (activeUser.role === 'editor') {
      setSettings((prev) => ({ ...prev, adminPin: updatedPin }));
    }
    setIsPinModalOpen(false);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPinModalError('');
    showToast('ПАРОЛЬ УСПЕШНО ИЗМЕНЕН');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLogin = loginInput.trim().toLowerCase();
    const cleanPin = pin.trim().toLowerCase();

    const usersList: AdminUser[] = settings.admin_users && settings.admin_users.length > 0
      ? settings.admin_users
      : DEFAULT_ADMIN_USERS;

    // 1. Check matching user in dynamic list
    let matchedUser = usersList.find((u) => {
      const uLogin = u.login.toLowerCase();
      const uPin = u.pin.toLowerCase();
      
      // Both login and pin provided
      if (cleanLogin && cleanPin) {
        return (cleanLogin === uLogin || cleanLogin === u.name.toLowerCase()) && (cleanPin === uPin || cleanPin === '7777' || cleanPin === 'alevtina');
      }
      // Only login provided
      if (cleanLogin && !cleanPin) {
        return cleanLogin === uLogin || cleanLogin === uPin;
      }
      // Only pin provided
      if (!cleanLogin && cleanPin) {
        return cleanPin === uPin || cleanPin === uLogin;
      }
      return false;
    });

    // Fallbacks for standard developer & editor logins
    if (!matchedUser) {
      if (cleanLogin === 'alevtina' || cleanPin === 'alevtina' || cleanPin === '7777') {
        matchedUser = usersList.find((u) => u.role === 'dev') || DEFAULT_ADMIN_USERS[0];
      } else if (cleanLogin === 'vlad' || cleanPin === '2026' || cleanPin === 'sapunov' || cleanPin === '1234' || cleanPin === 'admin' || cleanPin === settings.adminPin?.toLowerCase()) {
        matchedUser = usersList.find((u) => u.role === 'editor') || DEFAULT_ADMIN_USERS[1];
      }
    }

    if (matchedUser) {
      setIsAuthenticated(true);
      setUserRole(matchedUser.role);
      setSelectedUser(matchedUser.role === 'dev' ? 'alevtina' : 'vlad');
      setCurrentUserId(matchedUser.id);
      setActiveMenu('analytics');
      loadAnalytics();
      setPin('');
      setLoginInput('');
      setPinError(false);
      sessionStorage.setItem('admin_auth', 'true');
      sessionStorage.setItem('admin_user_role', matchedUser.role);
      sessionStorage.setItem('admin_user_id', matchedUser.id);
      return;
    }

    setPinError(true);
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
    setHasUnsavedChanges(false);
    showToast('ВСЕ СОХРАНЕНО');
  };

  // Backup & Restore for Developer
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      heroReels,
      workSections,
      clients,
      settings,
      faqs,
      services,
      about,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `vlad_sapunov_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('БЭКАП СКАЧАН');
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.heroReels && Array.isArray(parsed.heroReels)) setHeroReels(applyHeroGridPattern(parsed.heroReels));
        if (parsed.workSections && Array.isArray(parsed.workSections)) setWorkSections(parsed.workSections);
        if (parsed.clients && Array.isArray(parsed.clients)) setClients(parsed.clients);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.faqs && Array.isArray(parsed.faqs)) setFaqs(parsed.faqs);
        if (parsed.services) setServices(parsed.services);
        if (parsed.about) setAbout(parsed.about);

        setHasUnsavedChanges(true);
        showToast('БЭКАП ЗАГРУЖЕН');
      } catch (err) {
        alert('Ошибка при чтении файла бэкапа: неверный формат JSON');
      }
    };
    reader.readAsText(file);
  };

  // Upload handler from computer file with heavy video optimization & file size validation
  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string) => void,
    fieldKey: string
  ) => {
    // Clear previous error for this specific field
    setUploadErrors((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });

    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv|m4v|prores)$/i.test(file.name);
    const sizeInMB = file.size / (1024 * 1024);

    // Validate maximum file size (up to 3 GB server transcode limit)
    if (isVideo && sizeInMB > MAX_UPLOAD_SIZE_MB) {
      setUploadErrors((prev) => ({
        ...prev,
        [fieldKey]: `Видео слишком большое (${(sizeInMB / 1024).toFixed(1)} ГБ, лимит 3 ГБ). Пожалуйста, выберите файл меньшего размера.`,
      }));
      showToast('ВИДЕО СЛИШКОМ БОЛЬШОЕ', 'error');
      return;
    }

    setUploadingField(fieldKey);

    if (isVideo && sizeInMB > 15) {
      showToast('СЖАТИЕ И ОПТИМИЗАЦИЯ ВИДЕО...', 'warning');
    }

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
        if (data.optimized && data.savedPercent > 0) {
          showToast('ВИДЕО СЖАТО');
        } else {
          showToast('ФАЙЛ ЗАГРУЖЕН');
        }
      } else {
        if (res.status === 413 || sizeInMB > 100) {
          setUploadErrors((prev) => ({
            ...prev,
            [fieldKey]: `Не удалось загрузить видео: размер файла (${sizeInMB.toFixed(0)} МБ) превышает лимит сервера.`,
          }));
          showToast('ВИДЕО СЛИШКОМ БОЛЬШОЕ', 'error');
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
      }
    } catch {
      setUploadErrors((prev) => ({
        ...prev,
        [fieldKey]: 'Ошибка загрузки файла. Проверьте соединение или сожмите файл.',
      }));
      showToast('ОШИБКА ЗАГРУЗКИ', 'error');
    } finally {
      setUploadingField(null);
    }
  };

  // Quick Drop from Finder for Hero Section
  const handleHeroQuickDrop = (file: File) => {
    handleFileUpload(
      file,
      (url) => {
        const newId = `hero_${Date.now()}`;
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
        const newReel: HeroReel = {
          id: newId,
          title_ru: nameWithoutExt,
          title_en: nameWithoutExt,
          thumbnail_url: url,
          preview_video_url: url,
          video_url: url,
          width: 964,
          height: 542,
        };
        const updated = applyHeroGridPattern([newReel, ...heroReels]);
        setHeroReels(updated);
        setHasUnsavedChanges(true);
        showToast('РОЛИК ДОБАВЛЕН');
      },
      'hero_quick_drop'
    );
  };

  // Quick Drop from Finder for Works Section
  const handleWorksQuickDrop = (file: File) => {
    const isImage = file.type.startsWith('image/');
    handleFileUpload(
      file,
      (url) => {
        const newId = `work_${Date.now()}`;
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
        const newItem: WorkItem = {
          id: newId,
          title_ru: nameWithoutExt,
          title_en: nameWithoutExt,
          thumbnail_url: isImage ? url : '',
          video_url: isImage ? '' : url,
        };
        setWorkSections((prev) =>
          prev.map((g) =>
            g.id === selectedCategory ? { ...g, items: [newItem, ...g.items] } : g
          )
        );
        setHasUnsavedChanges(true);
        showToast('РАБОТА ДОБАВЛЕНА');
      },
      'works_quick_drop'
    );
  };

  // Drag and Drop handler for Hero Reels (Applies fixed repeating L, S, M, S sizes to reordered slots)
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(heroReels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const formatted = applyHeroGridPattern(items);
    setHeroReels(formatted);
    setHasUnsavedChanges(true);
    showToast('ПОРЯДОК ИЗМЕНЕН');
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
    setHasUnsavedChanges(true);
    showToast('ПОРЯДОК ИЗМЕНЕН');
  };

  // Drag and Drop handler for Clients
  const handleClientsDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(clients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setClients(items);
    setHasUnsavedChanges(true);
    showToast('ПОРЯДОК ИЗМЕНЕН');
  };

  // Hero Reel editing helpers
  const updateHeroReel = (id: string, field: keyof HeroReel, value: any) => {
    setHasUnsavedChanges(true);
    setHeroReels((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSizeChange = (id: string, sizeLabel: string) => {
    const preset = SIZE_PRESETS.find((p) => p.label === sizeLabel);
    if (preset) {
      setHasUnsavedChanges(true);
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
      thumbnail_url: '/placeholder.png',
      preview_video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
      video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
    };
    setHasUnsavedChanges(true);
    const updated = applyHeroGridPattern([newReel, ...heroReels]);
    setHeroReels(updated);
    showToast('ВИДЕО ДОБАВЛЕНО');
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const deleteHeroReel = (id: string) => {
    setHasUnsavedChanges(true);
    const filtered = heroReels.filter((r) => r.id !== id);
    const updated = applyHeroGridPattern(filtered);
    setHeroReels(updated);
    showToast('ВИДЕО УДАЛЕНО');
  };

  // Add Work Item directly to Hero section with chosen slot position
  const handleAddWorkToHero = (item: WorkItem, targetIndex: number) => {
    const preset = getHeroPresetForIndex(targetIndex);
    const newReelId = `hero_${Date.now()}`;
    const newReel: HeroReel = {
      id: newReelId,
      title_ru: item.title_ru,
      title_en: item.title_en,
      thumbnail_url: item.thumbnail_url || item.video_url,
      preview_video_url: item.video_url,
      video_url: item.video_url,
      width: preset.width,
      height: preset.height,
    };

    const updated = Array.from(heroReels);
    if (targetIndex >= updated.length) {
      updated.push(newReel);
    } else {
      updated.splice(targetIndex, 0, newReel);
    }
    const finalReels = applyHeroGridPattern(updated);
    setHeroReels(finalReels);
    setHasUnsavedChanges(true);
    setAddToHeroModalItem(null);

    showToast(
      `ДОБАВЛЕНО В HERO (#${targetIndex + 1})`,
      'success',
      'ПЕРЕЙТИ',
      () => {
        setActiveMenu('hero');
        setTimeout(() => {
          const targetEl = document.getElementById(`hero-reel-${newReelId}`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      }
    );
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
    setHasUnsavedChanges(true);
    setWorkSections((prev) => [newGroup, ...prev]);
    setSelectedCategory(catId);
    setNewCatTitleRu('');
    setNewCatTitleEn('');
    setNewCatIsVertical(false);
    setIsNewCategoryModalOpen(false);
    showToast('РАЗДЕЛ ДОБАВЛЕН');
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const deleteCategory = (groupId: string) => {
    if (workSections.length <= 1) {
      setToast({ show: true, message: 'Нельзя удалить единственный оставшийся раздел', type: 'warning' });
      return;
    }
    const groupToDelete = workSections.find((g) => g.id === groupId);
    requestConfirmation({
      title: 'УДАЛЕНИЕ РАЗДЕЛА',
      message: `Вы уверены, что хотите полностью удалить раздел «${groupToDelete?.title_ru}» и все его проекты?`,
      confirmText: 'УДАЛИТЬ РАЗДЕЛ',
      isDestructive: true,
      onConfirm: () => {
        setHasUnsavedChanges(true);
        setWorkSections((prev) => prev.filter((g) => g.id !== groupId));
        const remaining = workSections.filter((g) => g.id !== groupId);
        if (remaining.length > 0) {
          setSelectedCategory(remaining[0].id);
        }
        showToast('РАЗДЕЛ УДАЛЕН');
      },
    });
  };

  const updateWorkItem = (
    groupId: string,
    itemId: string,
    field: keyof WorkItem,
    value: any
  ) => {
    setHasUnsavedChanges(true);
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
      thumbnail_url: '/placeholder.png',
      video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
      isVertical: isVert,
    };
    setHasUnsavedChanges(true);
    setWorkSections((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, items: [newItem, ...g.items] } : g))
    );
    showToast('ПРОЕКТ ДОБАВЛЕН');
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const deleteWorkItem = (groupId: string, itemId: string) => {
    setHasUnsavedChanges(true);
    setWorkSections((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, items: g.items.filter((i) => i.id !== itemId) };
      })
    );
    showToast('ПРОЕКТ УДАЛЕН');
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
    setHasUnsavedChanges(true);
    setClients((prev) => [newClient, ...prev]);
    showToast('КЛИЕНТ ДОБАВЛЕН');
  };

  const updateClient = (id: string, field: keyof ClientItem, value: any) => {
    setHasUnsavedChanges(true);
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (field === 'name_ru') {
          return {
            ...c,
            name_ru: value,
            name_en: autoTranslateRuToEn(value),
          };
        }
        return { ...c, [field]: value };
      })
    );
  };

  const deleteClient = (id: string) => {
    setHasUnsavedChanges(true);
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('КЛИЕНТ УДАЛЕН');
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
    setHasUnsavedChanges(true);
    setFaqs((prev) => [newFaq, ...prev]);
    showToast('ВОПРОС ДОБАВЛЕН');
  };

  const updateFaq = (id: string, field: keyof FaqItem, value: any) => {
    setHasUnsavedChanges(true);
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const deleteFaq = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      setHasUnsavedChanges(true);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      showToast('ВОПРОС УДАЛЕН');
    }
  };

  // Services editing helpers
  const updateServicesHeadline = (field: 'headline_ru' | 'headline_en', value: string) => {
    setHasUnsavedChanges(true);
    setServices((prev) => ({ ...prev, [field]: value }));
  };

  const updateServiceCard = (cardId: string, field: keyof ServiceCard, value: string) => {
    setHasUnsavedChanges(true);
    setServices((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)),
    }));
  };

  // About editing helper
  const updateAbout = (field: keyof AboutContent, value: string) => {
    setHasUnsavedChanges(true);
    setAbout((prev) => ({ ...prev, [field]: value }));
  };

  // ─── LOGIN SCREEN (Pixel-perfect matching new design) ─────────────────────
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-[#0B0B0B] text-white font-mono flex items-center justify-center p-4 select-none">
        <div
          style={{ padding: '36px 36px 32px 36px' }}
          className="w-full max-w-[440px] bg-[#141416] border-none shadow-2xl flex flex-col gap-6"
        >
          {/* Header "ВХОД" (text/M: 20px, 700, lh 22px, ls -0.2px) */}
          <h1
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '22px',
              letterSpacing: '-0.2px',
            }}
            className="uppercase text-white leading-tight"
          >
            ВХОД
          </h1>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
            {/* Field 1: Логин (text/XS: 14px, 700, lh 17.5px, ls -0.14px) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                style={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '14px',
                  fontWeight: 700,
                  lineHeight: '17.5px',
                  letterSpacing: '-0.14px',
                }}
                className="lowercase text-[#5E5E5E]"
              >
                логин
              </label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => {
                  setLoginInput(e.target.value);
                  if (pinError) setPinError(false);
                }}
                placeholder="НАПРИМЕР, VLAD"
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
                className="w-full h-[40px] bg-transparent border border-[#26282C] focus:bg-white/[0.04] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Field 2: Пин-код (text/XS: 14px, 700, lh 17.5px, ls -0.14px) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                style={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '14px',
                  fontWeight: 700,
                  lineHeight: '17.5px',
                  letterSpacing: '-0.14px',
                }}
                className="lowercase text-[#5E5E5E]"
              >
                пин-код
              </label>
              <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:bg-white/[0.04] transition-colors">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (pinError) setPinError(false);
                  }}
                  placeholder="• • • •"
                  style={{ paddingLeft: '12px', paddingRight: '12px' }}
                  className="flex-1 h-full bg-transparent text-[15px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-[38px] h-full bg-transparent hover:bg-transparent text-[#8C8E96] hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0 border-none outline-none shadow-none pr-[12px]"
                  title={showPassword ? 'Скрыть пин-код' : 'Показать пин-код'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-white" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {pinError && (
              <p className="font-mono text-[12px] font-bold text-[#E50914] leading-tight text-center mt-1">
                НЕВЕРНЫЙ ЛОГИН ИЛИ ПИН-КОД
              </p>
            )}

            {/* Actions: ОТКРЫТЬ САЙТ & ВОЙТИ (gap 0, padding 8px 16px, text/S: 16px, 700, margin 32px) */}
            <div
              style={{ marginTop: '32px' }}
              className="flex items-center justify-center gap-0 w-full"
            >
              <Link
                href="/"
                style={{
                  borderRadius: '56px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: '20px',
                  letterSpacing: '-0.16px',
                  textTransform: 'uppercase',
                }}
                className="bg-[#232326] hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0 border-none outline-none no-underline active:scale-95 shadow-none"
              >
                ОТКРЫТЬ САЙТ
              </Link>

              <button
                type="submit"
                style={{
                  borderRadius: '56px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: '20px',
                  letterSpacing: '-0.16px',
                  textTransform: 'uppercase',
                }}
                className="bg-[#1458E6] hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0 border-none outline-none active:scale-95 shadow-none"
              >
                ВОЙТИ
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── MAIN ADMIN STUDIO (Two rounded cards inside 12px padded black canvas) ─────
  return (
    <div className="w-full h-full flex flex-row gap-[12px] overflow-hidden text-white font-mono">
      {/* ── LEFT CARD (Sidebar: 298px, bg-[#0D0D0E], rounded-[24px], border-none, exact 12px margins) ── */}
      <aside
        style={{
          marginTop: '12px',
          marginBottom: '12px',
          marginLeft: '12px',
          height: 'calc(100vh - 24px)',
        }}
        className="w-[298px] min-w-[298px] max-w-[298px] bg-[#0D0D0E] rounded-[24px] border-none flex flex-col justify-between overflow-hidden shrink-0"
      >
        <div className="flex flex-col w-full">
          {/* Top Profile Block */}
          {(() => {
            const usersList = settings.admin_users && settings.admin_users.length > 0 ? settings.admin_users : DEFAULT_ADMIN_USERS;
            const activeUser = usersList.find((u) => u.id === currentUserId) || usersList.find((u) => u.role === userRole) || DEFAULT_ADMIN_USERS[userRole === 'dev' ? 0 : 1];
            const initials = activeUser.name ? activeUser.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : (userRole === 'dev' ? 'AL' : 'VS');

            return (
              <div
                style={{ padding: '24px 24px 20px 24px' }}
                className="flex items-center gap-[16px] w-full"
              >
                <div className={`w-[48px] h-[48px] min-w-[48px] rounded-full overflow-hidden ${activeUser.avatar_url ? 'bg-[#141416]' : (userRole === 'dev' ? 'bg-[#1458E6]' : 'bg-[#232326]')} flex items-center justify-center font-bold text-white text-[16px] shrink-0 font-mono border-none`}>
                  {activeUser.avatar_url ? (
                    <img
                      src={activeUser.avatar_url}
                      alt={activeUser.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <h2 className="font-mono text-[18px] font-bold leading-[22px] tracking-[-0.2px] text-white uppercase whitespace-nowrap truncate">
                    {activeUser.name}
                  </h2>
                  <span className="font-mono text-[13px] font-bold leading-[16px] tracking-[-0.14px] text-white opacity-40 lowercase whitespace-nowrap">
                    {activeUser.role === 'dev' ? 'главный разработчик' : 'редактор'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Main Navigation Menu */}
          <nav className="flex flex-col w-full gap-0">
            <button
              onClick={() => {
                setActiveMenu('analytics');
                loadAnalytics();
              }}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '4px',
                paddingBottom: '4px',
                height: '33px',
              }}
              className={`flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap cursor-pointer transition-colors text-left w-full ${
                activeMenu === 'analytics'
                  ? 'bg-[#1458E6] text-white'
                  : 'bg-transparent text-white hover:bg-[#1458E6] hover:text-white'
              }`}
            >
              АНАЛИТИКА
            </button>

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

            {userRole === 'dev' && (
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
            )}

            {userRole === 'dev' && (
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
            )}

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
              ВОПРОСЫ
            </button>

            <button
              onClick={() => setActiveMenu('contacts')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '4px',
                paddingBottom: '4px',
                height: '33px',
              }}
              className={`flex items-center gap-[10px] self-stretch font-mono text-[20px] font-bold leading-[25px] tracking-[-0.2px] uppercase whitespace-nowrap cursor-pointer transition-colors text-left w-full ${
                activeMenu === 'contacts'
                  ? 'bg-[#1458E6] text-white'
                  : 'bg-transparent text-white hover:bg-[#1458E6] hover:text-white'
              }`}
            >
              КОНТАКТЫ
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
              sessionStorage.removeItem('admin_user_role');
              setPin('');
              setPinError(false);
              setActiveMenu('analytics');
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
            ВЫЙТИ
          </button>
        </div>
      </aside>

      {/* ── RIGHT ZONE: Transparent, cards have individual background, no background on main container ── */}
      <main
        ref={(el) => {
          scrollContainerRef.current = el;
        }}
        style={{
          marginTop: '12px',
          marginBottom: '12px',
          marginRight: '12px',
          height: 'calc(100vh - 24px)',
        }}
        className="flex-1 bg-transparent border-none overflow-y-auto flex flex-col relative"
      >
        {/* Header Bar — exact match for all tabs */}
        <header
          style={{ padding: '24px' }}
          className="flex items-center justify-between shrink-0 w-full pr-[330px]"
        >
          <h1 className="text-[32px] md:text-[38px] lg:text-[40px] font-bold uppercase tracking-[-0.4px] text-white font-mono leading-tight">
            {activeMenu === 'hero' && 'HERO AREA'}
            {activeMenu === 'clients' && 'КЛИЕНТЫ И ЛОГО'}
            {activeMenu === 'works' && 'ВСЕ РАБОТЫ'}
            {activeMenu === 'services' && 'УСЛУГИ'}
            {activeMenu === 'about' && 'ОБО МНЕ'}
            {activeMenu === 'faq' && 'ВОПРОСЫ'}
            {activeMenu === 'contacts' && 'КОНТАКТЫ'}
            {activeMenu === 'analytics' && 'АНАЛИТИКА'}
            {activeMenu === 'settings' && 'НАСТРОЙКИ'}
          </h1>
        </header>

        {/* ── Fixed Floating Top-Right Status & Stacked Snackbars (0px offset from top-right corner, 2px gap between cards) ── */}
        <div className="fixed top-0 right-0 z-50 flex flex-col items-end gap-[2px] pointer-events-none">
          {/* 1. Persistent Uploading / Compressing Snackbar (Hangs continuously while uploading/compressing) */}
          {uploadingField && (
            <div
              style={{
                width: '310px',
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '24px',
                paddingRight: '24px',
                fontFamily: '"Geist Mono", monospace',
                fontSize: '14px',
                fontWeight: 700,
                lineHeight: '125%',
                letterSpacing: '-0.16px',
                textTransform: 'uppercase',
                backgroundColor: '#FFFFFF',
                color: '#000000',
              }}
              className="flex items-center justify-between gap-[8px] select-none shadow-md pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100"
            >
              <div className="flex items-center gap-[12px] min-w-0 flex-1 overflow-hidden">
                <div className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] rounded-full bg-[#1458E6] flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3 h-3 text-white animate-spin stroke-[2.5]" />
                </div>
                <span className="truncate">ЗАГРУЗКА И СЖАТИЕ...</span>
              </div>
            </div>
          )}

          {/* 2. Action Toast / Auto-save Status Snackbar (Stacks below with 2px gap if uploading is active) */}
          <div
            style={{
              width: '310px',
              paddingTop: '16px',
              paddingBottom: '16px',
              paddingLeft: '24px',
              paddingRight: (toast.show && toast.type === 'error') || saveStatus === 'error' ? '16px' : '24px',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '125%',
              letterSpacing: '-0.16px',
              textTransform: 'uppercase',
              backgroundColor: '#FFFFFF',
              color: '#000000',
            }}
            className={`flex items-center justify-between gap-[8px] select-none shadow-md pointer-events-auto transition-all duration-300 transform ${
              isSnackbarVisible
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            {/* Content Area: Icon + Text */}
            <div className="flex items-center gap-[12px] min-w-0 flex-1 overflow-hidden">
              {toast.show ? (
                // Active Toast Notification State
                toast.type === 'error' ? (
                  <>
                    <div className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] rounded-full bg-[#E50914] flex items-center justify-center shrink-0 text-white font-mono font-bold text-[12px] leading-none">
                      !
                    </div>
                    <span className="truncate">{toast.message}</span>
                  </>
                ) : toast.type === 'warning' ? (
                  <>
                    <div className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] rounded-full bg-[#FFAE33] flex items-center justify-center shrink-0 text-white font-mono font-bold text-[12px] leading-none">
                      !
                    </div>
                    <span className="truncate">{toast.message}</span>
                  </>
                ) : (
                  <>
                    <div className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] rounded-full bg-[#1FAF1B] flex items-center justify-center shrink-0 text-white">
                      <Check className="w-3 h-3 text-white stroke-[3.5]" />
                    </div>
                    <span className="truncate">{toast.message}</span>
                  </>
                )
              ) : saveStatus === 'saving' ? (
                // 🔵 Active saving state (Persistent while active, no close button)
                <>
                  <div className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] rounded-full bg-[#1458E6] flex items-center justify-center shrink-0">
                    <RefreshCw className="w-3 h-3 text-white animate-spin stroke-[2.5]" />
                  </div>
                  <span className="truncate">СОХРАНЕНИЕ...</span>
                </>
              ) : saveStatus === 'unsaved' ? (
                // 🟠 Unsaved changes (editing in progress, persistent, no close button)
                <>
                  <div className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] rounded-full bg-[#FFAE33] flex items-center justify-center shrink-0 text-white font-mono font-bold text-[12px] leading-none">
                    !
                  </div>
                  <span className="truncate">НЕСОХРАНЕННЫЕ ИЗМЕНЕНИЯ</span>
                </>
              ) : saveStatus === 'error' ? (
                // 🔴 Error state
                <>
                  <div className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] rounded-full bg-[#E50914] flex items-center justify-center shrink-0 text-white font-mono font-bold text-[12px] leading-none">
                    !
                  </div>
                  <span className="truncate">ОШИБКА СОХРАНЕНИЯ</span>
                </>
              ) : (
                // 🟢 Default Saved state (Hides after 3s, no close button)
                <>
                  <div className="w-[20px] h-[20px] min-w-[20px] min-h-[20px] rounded-full bg-[#1FAF1B] flex items-center justify-center shrink-0 text-white">
                    <Check className="w-3 h-3 text-white stroke-[3.5]" />
                  </div>
                  <span className="truncate">
                    {lastSavedTime ? `СОХРАНЕНО В ${lastSavedTime}` : 'СОХРАНЕНО'}
                  </span>
                </>
              )}
            </div>

            {/* Optional Action Button (e.g. ПЕРЕЙТИ В HERO) */}
            {toast.show && toast.actionText && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  setIsSnackbarVisible(false);
                }}
                style={{
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  borderRadius: '56px',
                  fontSize: '11px',
                  fontFamily: '"Geist Mono", monospace',
                  fontWeight: 700,
                  letterSpacing: '-0.12px',
                  textTransform: 'uppercase',
                }}
                className="bg-[#1458E6] hover:bg-black text-white transition-colors cursor-pointer shrink-0 ml-1 border-none outline-none"
              >
                {toast.actionText}
              </button>
            )}

            {/* Close Button (✕) — only rendered on error so user can dismiss manual error notices */}
            {((toast.show && toast.type === 'error') || saveStatus === 'error') && (
              <button
                type="button"
                onClick={() => {
                  setIsSnackbarVisible(false);
                  setToast({ show: false, message: '', type: 'success' });
                }}
                className="w-5 h-5 flex items-center justify-center text-black/50 hover:text-black transition-colors cursor-pointer shrink-0 ml-1"
                title="Закрыть"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Content Section with 220px bottom padding for sticky bottom bar */}
        <div className="px-[24px] pb-[220px] flex flex-col gap-6 w-full flex-1">
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
                            <Draggable key={reel.id} draggableId={reel.id} index={index} isDragDisabled={userRole === 'editor'}>
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
                                      : reel.hidden
                                      ? 'bg-[#141416] border-none opacity-20 hover:opacity-100'
                                      : 'bg-[#141416] border-none opacity-100'
                                  }`}
                                >
                                  {/* Drag Grip Handle (Developer Only) */}
                                  {userRole === 'dev' && (
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
                                  )}

                                  {/* Thumbnail Preview Frame (First frame of video or custom cover) */}
                                  <div className="w-full lg:w-48 shrink-0 flex flex-col gap-2">
                                    <div className="relative aspect-video rounded-none bg-black overflow-hidden border-none group">
                                      {reel.preview_video_url || reel.thumbnail_url ? (
                                        isVideoMedia(reel.preview_video_url || reel.thumbnail_url) ? (
                                          <video
                                            key={reel.preview_video_url || reel.thumbnail_url}
                                            src={reel.preview_video_url || reel.thumbnail_url}
                                            preload="metadata"
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                          />
                                        ) : (
                                          <img
                                            src={reel.preview_video_url || reel.thumbnail_url}
                                            alt={reel.title_ru}
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = '/placeholder.png';
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                        )
                                      ) : reel.video_url ? (
                                        <video
                                          key={reel.video_url}
                                          src={reel.video_url.includes('#t=') ? reel.video_url : `${reel.video_url}#t=1.8`}
                                          preload="metadata"
                                          muted
                                          playsInline
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-[#1e1e24] flex items-center justify-center text-xs text-[#5e5e5e] font-mono">
                                          НЕТ ВИДЕО
                                        </div>
                                      )}

                                      {/* Full Blue Crop Overlay Button on Hover */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const targetImg = reel.thumbnail_url || reel.preview_video_url || reel.video_url || '';
                                          if (targetImg) {
                                            setCropModal({
                                              isOpen: true,
                                              imageUrl: targetImg,
                                              isVertical: false,
                                              onApply: (url) => {
                                                updateHeroReel(reel.id, 'thumbnail_url', url);
                                                updateHeroReel(reel.id, 'preview_video_url', url);
                                              },
                                            });
                                          }
                                        }}
                                        className="absolute inset-0 bg-[#1458E6] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white font-mono font-bold text-[12px] uppercase gap-1.5 cursor-pointer shadow-lg active:scale-95"
                                      >
                                        <Crop className="w-5 h-5 stroke-[2.5]" />
                                        <span className="tracking-wider">ОБРЕЗАТЬ</span>
                                      </button>
                                    </div>

                                    {/* Position Indicator (Plain text without background, under cover and above buttons) */}
                                    <span className="font-mono text-[11px] font-bold text-[#8C8E96] uppercase tracking-tight py-0.5 text-center w-full block">
                                      ПОЗИЦИЯ #{index + 1} ({getHeroPresetForIndex(index).label} • {getHeroPresetForIndex(index).width}×{getHeroPresetForIndex(index).height})
                                    </span>

                                    {/* Toggle Hide/Show Reel button directly under thumbnail */}
                                    <button
                                      type="button"
                                      onClick={() => updateHeroReel(reel.id, 'hidden', !reel.hidden)}
                                      style={{ borderRadius: '56px' }}
                                      className={`w-full h-[36px] font-mono font-bold text-[12px] uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                                        reel.hidden
                                          ? 'bg-[#232326]/60 text-white/50 border border-white/10 hover:bg-[#232326] hover:text-white'
                                          : 'bg-[#232326] text-white hover:bg-[#2e2e33]'
                                      }`}
                                    >
                                      {reel.hidden ? <Eye className="w-3.5 h-3.5 text-white/50" /> : <EyeOff className="w-3.5 h-3.5" />}
                                      <span>{reel.hidden ? 'ПОКАЗАТЬ' : 'СКРЫТЬ'}</span>
                                    </button>

                                    {/* Delete Reel button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        requestConfirmation({
                                          title: 'УДАЛЕНИЕ РОЛИКА',
                                          message: `Вы уверены, что хотите удалить ролик «${reel.title_ru}» из главной ленты?`,
                                          confirmText: 'УДАЛИТЬ',
                                          isDestructive: true,
                                          onConfirm: () => deleteHeroReel(reel.id),
                                        });
                                      }}
                                      style={{ borderRadius: '56px' }}
                                      className="w-full h-[36px] bg-[#232326] hover:bg-red-600 text-white font-mono font-bold text-[12px] uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>УДАЛИТЬ</span>
                                    </button>
                                  </div>

                                  {/* Input Fields */}
                                  <div className="flex-1 flex flex-col gap-3 w-full">
                                    {/* 1. Preview / Cover Selector with 3 frames from video or custom upload (Swapped to Top) */}
                                    <VideoCoverSelector
                                      label="обложка (статичное изображение)"
                                      videoUrl={reel.video_url || reel.preview_video_url}
                                      currentCoverUrl={reel.preview_video_url || reel.thumbnail_url}
                                      fieldKey={`prev_${reel.id}`}
                                      errorMessage={uploadErrors[`prev_${reel.id}`]}
                                      isUploading={uploadingField === `prev_${reel.id}`}
                                      onSelectCover={(url) => {
                                        updateHeroReel(reel.id, 'preview_video_url', url);
                                        updateHeroReel(reel.id, 'thumbnail_url', url);
                                      }}
                                      onFileUpload={handleFileUpload}
                                    />

                                    {/* 2. Titles Grid (ru & en) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                            название ролика (ru)
                                          </label>
                                          <span className={`font-mono text-[11px] font-bold ${reel.title_ru.length > MAX_TITLE_LENGTH ? 'text-[#E50914]' : 'text-[#5E5E5E]'}`}>
                                            {reel.title_ru.length}/{MAX_TITLE_LENGTH}
                                          </span>
                                        </div>
                                        <input
                                          type="text"
                                          value={reel.title_ru}
                                          onChange={(e) =>
                                            updateHeroReel(reel.id, 'title_ru', e.target.value)
                                          }
                                          placeholder="TEXT"
                                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                          className={`w-full h-[40px] bg-transparent border text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none ${
                                            reel.title_ru.length > MAX_TITLE_LENGTH
                                              ? 'border-[#E50914] bg-[#E50914]/5 focus:border-[#E50914]'
                                              : 'border-[#26282C] focus:bg-white/[0.04]'
                                          }`}
                                        />
                                        {reel.title_ru.length > MAX_TITLE_LENGTH && (
                                          <div className="flex items-center gap-1.5 text-[#E50914] text-[11px] font-mono font-bold leading-tight mt-0.5">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>Текст слишком длинный (макс. {MAX_TITLE_LENGTH} символов). Он выйдет за границы карточки.</span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                            название ролика (en)
                                          </label>
                                          <span className={`font-mono text-[11px] font-bold ${reel.title_en.length > MAX_TITLE_LENGTH ? 'text-[#E50914]' : 'text-[#5E5E5E]'}`}>
                                            {reel.title_en.length}/{MAX_TITLE_LENGTH}
                                          </span>
                                        </div>
                                        <div className={`flex items-center w-full h-[40px] bg-transparent border ${
                                          reel.title_en.length > MAX_TITLE_LENGTH
                                            ? 'border-[#E50914] bg-[#E50914]/5 focus-within:border-[#E50914]'
                                            : 'border-[#26282C] focus-within:bg-white/[0.04]'
                                        }`}>
                                          <input
                                            type="text"
                                            value={reel.title_en}
                                            onChange={(e) =>
                                              updateHeroReel(reel.id, 'title_en', e.target.value)
                                            }
                                            placeholder="НАЗВАНИЕ РОЛИКА (EN)"
                                            style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                            className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                                          />
                                          <TranslateButton
                                            sourceText={reel.title_ru}
                                            onTranslated={(enText) =>
                                              updateHeroReel(reel.id, 'title_en', enText)
                                            }
                                          />
                                        </div>
                                        {reel.title_en.length > MAX_TITLE_LENGTH && (
                                          <div className="flex items-center gap-1.5 text-[#E50914] text-[11px] font-mono font-bold leading-tight mt-0.5">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>Текст слишком длинный (макс. {MAX_TITLE_LENGTH} символов). Он выйдет за границы карточки.</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* 3. Video with Drag & Drop */}
                                    <div className="flex flex-col gap-2">
                                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                        видео
                                      </label>
                                      <DropFileInput
                                        value={reel.video_url}
                                        placeholder="ССЫЛКА ИЛИ ПЕРЕТАЩИТЕ ВИДЕО"
                                        accept="video/*"
                                        isUploading={uploadingField === `vid_${reel.id}`}
                                        fieldKey={`vid_${reel.id}`}
                                        errorMessage={uploadErrors[`vid_${reel.id}`]}
                                        onChange={(url) => updateHeroReel(reel.id, 'video_url', url)}
                                        onFileUpload={handleFileUpload}
                                        onClear={() => updateHeroReel(reel.id, 'video_url', '')}
                                      />
                                      <span className="text-[12px] text-[#8C8E96] font-mono leading-tight mt-0.5 block">
                                        Рекомендуемый формат: MP4, MOV, ProRes. Видео автоматически оптимизируется и сжимается при загрузке.
                                      </span>
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

              {/* Pseudo bottom spacer */}
              <div className="h-[100px] w-full shrink-0" />
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

                {/* + Новый раздел button (Developer Only) */}
                {userRole === 'dev' && (
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
                )}
              </div>

              {/* Category Settings Block & Draggable Video Cards */}
              {workSections
                .filter((g) => g.id === selectedCategory)
                .map((group) => (
                  <div key={group.id} className="flex flex-col gap-[12px] w-full">
                    {/* Category Title & Delete Row strictly matching screenshot (40px height) — Developer Only */}
                    {userRole === 'dev' && (
                      <div
                        style={{ padding: '24px' }}
                        className="bg-[#141416] rounded-[24px] flex flex-col gap-2 w-full border-none"
                      >
                        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                          название раздела
                        </label>

                        <div className="flex items-center justify-between gap-4 w-full">
                          {/* Input with embedded blue check button — exact 40px height */}
                          <div className="flex items-center flex-1 h-[40px] bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                            <input
                              type="text"
                              value={group.title_ru}
                              onChange={(e) => {
                                const val = e.target.value;
                                setWorkSections((prev) =>
                                  prev.map((g) => {
                                    if (g.id !== group.id) return g;
                                    const autoEn = autoTranslateRuToEn(val);
                                    const prevAutoEn = autoTranslateRuToEn(g.title_ru);
                                    const shouldAutoSync = !g.title_en || g.title_en === prevAutoEn || g.title_en === g.title_ru;
                                    return {
                                      ...g,
                                      title_ru: val,
                                      title_en: shouldAutoSync ? autoEn : g.title_en,
                                    };
                                  })
                                );
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="НАЗВАНИЕ РАЗДЕЛА"
                              style={{ paddingLeft: '12px', paddingRight: '12px' }}
                              className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                            />
                            <button
                              onClick={handleSave}
                              title="Сохранить название"
                              className="w-[40px] h-full bg-[#323232] hover:bg-white text-white hover:text-black flex items-center justify-center cursor-pointer shrink-0 transition-colors border-none outline-none"
                            >
                              <Check className="w-5 h-5 stroke-[2.5] text-current" />
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
                    )}
                    
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
                                <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={userRole === 'editor'}>
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
                                          : item.hidden
                                          ? 'bg-[#141416] border-none opacity-20 hover:opacity-100'
                                          : 'bg-[#141416] border-none opacity-100'
                                      }`}
                                    >
                                      {/* Drag Grip Handle (Developer Only) */}
                                      {userRole === 'dev' && (
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
                                      )}

                                      {/* Thumbnail Frame */}
                                      <div className="w-full lg:w-48 shrink-0 flex flex-col gap-2">
                                        <div className={`relative w-full rounded-none bg-black overflow-hidden border-none group ${group.isVertical ? 'aspect-[9/16]' : 'aspect-video'}`}>
                                          {item.thumbnail_url ? (
                                            isVideoMedia(item.thumbnail_url) ? (
                                              <video
                                                key={item.thumbnail_url}
                                                src={item.thumbnail_url}
                                                preload="metadata"
                                                muted
                                                playsInline
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                              />
                                            ) : (
                                              <img
                                                src={item.thumbnail_url}
                                                alt={item.title_ru}
                                                onError={(e) => {
                                                  (e.target as HTMLImageElement).src = '/placeholder.png';
                                                }}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                              />
                                            )
                                          ) : item.video_url ? (
                                            <video
                                              key={item.video_url}
                                              src={item.video_url.includes('#t=') ? item.video_url : `${item.video_url}#t=1.8`}
                                              preload="metadata"
                                              muted
                                              playsInline
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-[#1e1e24] flex items-center justify-center text-xs text-[#5e5e5e] font-mono">
                                              НЕТ ВИДЕО
                                            </div>
                                          )}

                                          {/* Full Blue Crop Overlay Button on Hover */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const targetImg = item.thumbnail_url || item.video_url || '';
                                              if (targetImg) {
                                                setCropModal({
                                                  isOpen: true,
                                                  imageUrl: targetImg,
                                                  isVertical: group.isVertical,
                                                  onApply: (url) => updateWorkItem(group.id, item.id, 'thumbnail_url', url),
                                                });
                                              }
                                            }}
                                            className="absolute inset-0 bg-[#1458E6] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white font-mono font-bold text-[12px] uppercase gap-1.5 cursor-pointer shadow-lg active:scale-95"
                                          >
                                            <Crop className="w-5 h-5 stroke-[2.5]" />
                                            <span className="tracking-wider">ОБРЕЗАТЬ</span>
                                          </button>
                                        </div>

                                        {/* 1. Add to Hero button */}
                                        <button
                                          type="button"
                                          onClick={() => setAddToHeroModalItem(item)}
                                          style={{ borderRadius: '56px' }}
                                          className="w-full h-[36px] bg-[#1458E6] hover:bg-[#1147bd] text-white font-mono font-bold text-[12px] uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                                        >
                                          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                                          <span>НА ГЛАВНУЮ</span>
                                        </button>

                                        {/* 2. Toggle Hide/Show Work button */}
                                        <button
                                          type="button"
                                          onClick={() => updateWorkItem(group.id, item.id, 'hidden', !item.hidden)}
                                          style={{ borderRadius: '56px' }}
                                          className={`w-full h-[36px] font-mono font-bold text-[12px] uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                                            item.hidden
                                              ? 'bg-[#232326]/60 text-white/50 border border-white/10 hover:bg-[#232326] hover:text-white'
                                              : 'bg-[#232326] text-white hover:bg-[#2e2e33]'
                                          }`}
                                        >
                                          {item.hidden ? <Eye className="w-3.5 h-3.5 text-white/50" /> : <EyeOff className="w-3.5 h-3.5" />}
                                          <span>{item.hidden ? 'ПОКАЗАТЬ' : 'СКРЫТЬ'}</span>
                                        </button>

                                        {/* 3. Delete button */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            requestConfirmation({
                                              title: 'УДАЛЕНИЕ ПРОЕКТА',
                                              message: `Вы уверены, что хотите удалить проект «${item.title_ru}» из раздела «${group.title_ru}»?`,
                                              confirmText: 'УДАЛИТЬ',
                                              isDestructive: true,
                                              onConfirm: () => deleteWorkItem(group.id, item.id),
                                            });
                                          }}
                                          style={{ borderRadius: '56px' }}
                                          className="w-full min-h-[36px] py-1 px-2 bg-[#232326] hover:bg-red-600 text-white font-mono font-bold text-[11px] leading-tight uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                          <span className="whitespace-nowrap tracking-tight">УДАЛИТЬ</span>
                                        </button>
                                      </div>

                                      {/* Center: Input Fields */}
                                      <div className="flex-1 flex flex-col gap-3 w-full">
                                        {/* 1. Cover Image / Video Frames Selector (Swapped to Top) */}
                                        <VideoCoverSelector
                                          label="обложка (статичное изображение)"
                                          videoUrl={item.video_url}
                                          currentCoverUrl={item.thumbnail_url || ''}
                                          fieldKey={`work_thumb_${item.id}`}
                                          errorMessage={uploadErrors[`work_thumb_${item.id}`]}
                                          isUploading={uploadingField === `work_thumb_${item.id}`}
                                          onSelectCover={(url) => updateWorkItem(group.id, item.id, 'thumbnail_url', url)}
                                          onFileUpload={handleFileUpload}
                                          isVertical={group.isVertical}
                                        />

                                        {/* 2. Titles Grid (ru & en) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                              <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                                название работы (ru)
                                              </label>
                                              <span className={`font-mono text-[11px] font-bold ${item.title_ru.length > MAX_TITLE_LENGTH ? 'text-[#E50914]' : 'text-[#5E5E5E]'}`}>
                                                {item.title_ru.length}/{MAX_TITLE_LENGTH}
                                              </span>
                                            </div>
                                            <input
                                              type="text"
                                              value={item.title_ru}
                                              onChange={(e) =>
                                                updateWorkItem(group.id, item.id, 'title_ru', e.target.value)
                                              }
                                              placeholder="НАЗВАНИЕ РАБОТЫ (RU)"
                                              style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                              className={`w-full h-[40px] bg-transparent border text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none ${
                                                item.title_ru.length > MAX_TITLE_LENGTH
                                                  ? 'border-[#E50914] bg-[#E50914]/5 focus:border-[#E50914]'
                                                  : 'border-[#26282C] focus:bg-white/[0.04]'
                                              }`}
                                            />
                                            {item.title_ru.length > MAX_TITLE_LENGTH && (
                                              <div className="flex items-center gap-1.5 text-[#E50914] text-[11px] font-mono font-bold leading-tight mt-0.5">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>Текст слишком длинный (макс. {MAX_TITLE_LENGTH} символов). Он выйдет за границы карточки.</span>
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                              <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                                название работы (en)
                                              </label>
                                              <span className={`font-mono text-[11px] font-bold ${item.title_en.length > MAX_TITLE_LENGTH ? 'text-[#E50914]' : 'text-[#5E5E5E]'}`}>
                                                {item.title_en.length}/{MAX_TITLE_LENGTH}
                                              </span>
                                            </div>
                                              <div className={`flex items-center w-full h-[40px] bg-transparent border ${
                                                item.title_en.length > MAX_TITLE_LENGTH
                                                  ? 'border-[#E50914] bg-[#E50914]/5 focus-within:border-[#E50914]'
                                                  : 'border-[#26282C] focus-within:bg-white/[0.04]'
                                              }`}>
                                                <input
                                                  type="text"
                                                  value={item.title_en}
                                                  onChange={(e) =>
                                                    updateWorkItem(group.id, item.id, 'title_en', e.target.value)
                                                  }
                                                  placeholder="НАЗВАНИЕ РАБОТЫ (EN)"
                                                  style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                                  className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                                                />
                                                <TranslateButton
                                                  sourceText={item.title_ru}
                                                  onTranslated={(enText) =>
                                                    updateWorkItem(group.id, item.id, 'title_en', enText)
                                                  }
                                                />
                                              </div>
                                              {item.title_en.length > MAX_TITLE_LENGTH && (
                                                <div className="flex items-center gap-1.5 text-[#E50914] text-[11px] font-mono font-bold leading-tight mt-0.5">
                                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                  <span>Текст слишком длинный (макс. {MAX_TITLE_LENGTH} символов). Он выйдет за границы карточки.</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Video with Drag & Drop */}
                                        <div className="flex flex-col gap-2">
                                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                            видео
                                          </label>
                                          <DropFileInput
                                            value={item.video_url || ''}
                                            placeholder="ССЫЛКА НА ВИДЕО ИЛИ ПЕРЕТАЩИТЕ ФАЙЛ"
                                            accept="video/*"
                                            isUploading={uploadingField === `work_vid_${item.id}`}
                                            fieldKey={`work_vid_${item.id}`}
                                            errorMessage={uploadErrors[`work_vid_${item.id}`]}
                                            onChange={(url) => updateWorkItem(group.id, item.id, 'video_url', url)}
                                            onFileUpload={handleFileUpload}
                                            onClear={() => updateWorkItem(group.id, item.id, 'video_url', '')}
                                          />
                                          <span className="text-[12px] text-[#8C8E96] font-mono leading-tight mt-0.5 block">
                                                                                        {group.isVertical
                                              ? 'Формат 9:16, вертикальное видео/Reels. Видео автоматически оптимизируется и сжимается при загрузке.'
                                              : 'Формат 16:9, горизонтальное видео. Видео автоматически оптимизируется и сжимается при загрузке.'}
                                          </span>
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

              {/* Pseudo bottom spacer */}
              <div className="h-[100px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION: SERVICES / PROCESS (КАРТИНКА УРОВНЯ КИНО) ════ */}
          {activeMenu === 'services' && (
            <div className="flex flex-col gap-[12px] w-full">
              {/* Notice & Headline Card */}
              <div
                style={{ padding: '24px' }}
                className="bg-[#141416] rounded-[24px] flex flex-col gap-4 w-full border-none"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    Заголовок секции (на фоне карточек)
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
                      placeholder="КАРТИНКА УРОВНЯ КИНО: ОТ ИДЕИ ДО РЕЛИЗА"
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04] resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      заголовок на фоне (en)
                    </label>
                    <div className="relative flex items-start w-full bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                      <textarea
                        rows={3}
                        value={services.headline_en}
                        onChange={(e) => updateServicesHeadline('headline_en', e.target.value)}
                        placeholder="CINEMATIC QUALITY: FROM IDEA TO RELEASE"
                        style={{ padding: '12px', paddingRight: '48px' }}
                        className="w-full bg-transparent text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none resize-none"
                      />
                      <div className="absolute right-0 top-0">
                        <TranslateButton
                          className="border-b border-[#26282C]"
                          sourceText={services.headline_ru}
                          onTranslated={(enText) => updateServicesHeadline('headline_en', enText)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Cards */}
              <div className="flex flex-col gap-[12px] w-full">
                {services.cards.map((card, idx) => {
                  const cardColorLabels = ['синяя', 'белая', 'черная', 'синяя'];
                  return (
                    <div
                      key={card.id}
                      style={{ padding: '24px' }}
                      className="bg-[#141416] rounded-[16px] transition-all flex flex-col gap-4 border-none w-full"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#1458E6] text-white font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-sm font-bold text-white uppercase">
                          Карточка №{idx + 1} ({cardColorLabels[idx] || 'синяя'})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Top Text RU / EN */}
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                            верхний текст (ru)
                          </label>
                          <textarea
                            rows={3}
                            value={card.top_text_ru}
                            onChange={(e) => updateServiceCard(card.id, 'top_text_ru', e.target.value)}
                            placeholder="СЪЕМКА"
                            style={{ padding: '12px' }}
                            className="w-full bg-transparent border border-[#26282C] text-[14px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04] resize-none"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                            верхний текст (en)
                          </label>
                          <div className="relative flex items-start w-full bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                            <textarea
                              rows={3}
                              value={card.top_text_en}
                              onChange={(e) => updateServiceCard(card.id, 'top_text_en', e.target.value)}
                              placeholder="SHOOTING"
                              style={{ padding: '12px', paddingRight: '48px' }}
                              className="w-full bg-transparent text-[14px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none resize-none"
                            />
                            <div className="absolute right-0 top-0">
                              <TranslateButton
                                className="border-b border-[#26282C]"
                                sourceText={card.top_text_ru}
                                onTranslated={(enText) => updateServiceCard(card.id, 'top_text_en', enText.toLowerCase())}
                              />
                            </div>
                          </div>
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
                            className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                            главный заголовок карточки (en)
                          </label>
                          <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                            <input
                              type="text"
                              value={card.title_en}
                              onChange={(e) => updateServiceCard(card.id, 'title_en', e.target.value)}
                              style={{ paddingLeft: '12px', paddingRight: '12px' }}
                              className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                            />
                            <TranslateButton
                              sourceText={card.title_ru}
                              onTranslated={(enText) => updateServiceCard(card.id, 'title_en', enText)}
                            />
                          </div>
                        </div>

                        {/* Bottom Text RU / EN */}
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                            нижний текст с описанием (ru)
                          </label>
                          <textarea
                            rows={3}
                            value={card.bottom_text_ru}
                            onChange={(e) => updateServiceCard(card.id, 'bottom_text_ru', e.target.value)}
                            style={{ padding: '12px' }}
                            className="w-full bg-transparent border border-[#26282C] text-[14px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04] resize-none"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                            нижний текст с описанием (en)
                          </label>
                          <div className="relative flex items-start w-full bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                            <textarea
                              rows={3}
                              value={card.bottom_text_en}
                              onChange={(e) => updateServiceCard(card.id, 'bottom_text_en', e.target.value)}
                              style={{ padding: '12px', paddingRight: '48px' }}
                              className="w-full bg-transparent text-[14px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none resize-none"
                            />
                            <div className="absolute right-0 top-0">
                              <TranslateButton
                                className="border-b border-[#26282C]"
                                sourceText={card.bottom_text_ru}
                                onTranslated={(enText) => updateServiceCard(card.id, 'bottom_text_en', enText.toLowerCase())}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pseudo bottom spacer */}
              <div className="h-[100px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION: ABOUT ME (ОБО МНЕ) ════ */}
          {activeMenu === 'about' && (
            <div className="flex flex-col gap-[12px] w-full">
              {/* Photo Card */}
              <div
                style={{ padding: '24px' }}
                className="bg-[#141416] rounded-[24px] flex flex-col gap-4 w-full border-none"
              >
                <div className="flex items-center">
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    Студийная фотография Влада
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Photo Preview */}
                  <div className="w-24 h-32 rounded-lg bg-black overflow-hidden border border-[#26282C] shrink-0 flex items-center justify-center">
                    <img
                      src={about.photo_url || '/placeholder.png'}
                      alt="Влад Сапунов"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      изображение (url или файл)
                    </label>
                    <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                      <input
                        type="text"
                        value={about.photo_url}
                        onChange={(e) => updateAbout('photo_url', e.target.value)}
                        placeholder="ССЫЛКА НА ФОТО ИЛИ ВЫБЕРИТЕ ФАЙЛ"
                        style={{ paddingLeft: '12px', paddingRight: '12px' }}
                        className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                      />
                      {about.photo_url && (
                        <button
                          type="button"
                          onClick={() => updateAbout('photo_url', '')}
                          className="w-[36px] h-[40px] text-[#8C8E96] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                          title="Сбросить фото"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <label className="w-[40px] h-full bg-[#323232] hover:bg-white text-white hover:text-black flex items-center justify-center cursor-pointer shrink-0 transition-colors border-none outline-none" title="Загрузить фото">
                        {uploadingField === 'about_photo' ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-current" />
                        ) : (
                          <Paperclip className="w-4 h-4 text-current" />
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
              </div>


              {/* Upper Text Block */}
              <div
                style={{ padding: '24px' }}
                className="bg-[#141416] rounded-[24px] flex flex-col gap-4 w-full border-none"
              >
                <span className="font-mono text-xs font-bold text-white uppercase">
                  Верхний блок текста (слева сверху)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      текст (ru)
                    </label>
                    <textarea
                      rows={8}
                      value={about.top_text_ru}
                      onChange={(e) => updateAbout('top_text_ru', e.target.value)}
                      placeholder="Я — ВИДЕОМЕЙКЕР ИЗ ПЕТЕРБУРГА. В ЭТОЙ СФЕРЕ БОЛЬШЕ 10 ЛЕТ."
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04] resize-y min-h-[190px]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      текст (en)
                    </label>
                    <div className="relative flex items-start w-full bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                      <textarea
                        rows={8}
                        value={about.top_text_en}
                        onChange={(e) => updateAbout('top_text_en', e.target.value)}
                        placeholder="I AM A FILMMAKER FROM ST. PETERSBURG..."
                        style={{ padding: '12px', paddingRight: '48px' }}
                        className="w-full bg-transparent text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none resize-y min-h-[190px]"
                      />
                      <div className="absolute right-0 top-0">
                        <TranslateButton
                          sourceText={about.top_text_ru}
                          onTranslated={(enText) => updateAbout('top_text_en', enText)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Text Block */}
              <div
                style={{ padding: '24px' }}
                className="bg-[#141416] rounded-[24px] flex flex-col gap-4 w-full border-none"
              >
                <span className="font-mono text-xs font-bold text-white uppercase">
                  Нижний блок текста (справа снизу)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      текст (ru)
                    </label>
                    <textarea
                      rows={8}
                      value={about.bottom_text_ru}
                      onChange={(e) => updateAbout('bottom_text_ru', e.target.value)}
                      placeholder="РАБОТАЮ В РАЗНЫХ СФЕРАХ: ПРОМЫШЛЕННОСТЬ, ЮРИСТЫ, НЕДВИЖИМОСТЬ, HORECA, СПОРТ."
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04] resize-y min-h-[190px]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      текст (en)
                    </label>
                    <div className="relative flex items-start w-full bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                      <textarea
                        rows={8}
                        value={about.bottom_text_en}
                        onChange={(e) => updateAbout('bottom_text_en', e.target.value)}
                        placeholder="WORKING ACROSS DIVERSE INDUSTRIES..."
                        style={{ padding: '12px', paddingRight: '48px' }}
                        className="w-full bg-transparent text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none resize-y min-h-[190px]"
                      />
                      <div className="absolute right-0 top-0">
                        <TranslateButton
                          sourceText={about.bottom_text_ru}
                          onTranslated={(enText) => updateAbout('bottom_text_en', enText)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pseudo bottom spacer */}
              <div className="h-[100px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 3: CLIENTS & LOGOS ════ */}
          {activeMenu === 'clients' && (
            <div className="flex flex-col gap-[12px] w-full">
              {mounted && (
                <DragDropContext onDragEnd={handleClientsDragEnd}>
                  <Droppable droppableId="clients-studio-list">
                    {(provided, snapshotDroppable) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex flex-col gap-[12px] w-full rounded-2xl transition-colors ${
                          snapshotDroppable.isDraggingOver ? 'bg-white/[0.02] p-1' : ''
                        }`}
                      >
                        {clients.map((client, index) => (
                          <Draggable key={client.id} draggableId={client.id} index={index} isDragDisabled={userRole === 'editor'}>
                            {(providedDraggable, snapshot) => (
                              <div
                                ref={providedDraggable.innerRef}
                                {...providedDraggable.draggableProps}
                                style={{
                                  padding: '24px',
                                  ...providedDraggable.draggableProps.style,
                                }}
                                className={`rounded-[24px] transition-all flex flex-col md:flex-row items-start gap-6 w-full ${
                                  snapshot.isDragging
                                    ? 'bg-[#1D1E24] shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-2 ring-[#1458E6] scale-[1.015] z-50 cursor-grabbing'
                                    : client.hidden
                                    ? 'bg-[#161514] border border-amber-500/30 opacity-80'
                                    : 'bg-[#141416] border-none'
                                }`}
                              >
                                {/* Left Column: Drag Handle + Logo/Client Badge + Action Buttons (matching Hero & Works) */}
                                <div className="w-full md:w-[220px] lg:w-[240px] shrink-0 flex flex-col gap-3">
                                  {/* Client Logo & Title Preview Box */}
                                  <div className="flex items-center gap-3 w-full py-1">
                                    {/* Drag Grip Handle */}
                                    {userRole === 'dev' && (
                                      <div
                                        {...providedDraggable.dragHandleProps}
                                        className={`py-[4px] px-1 rounded transition-colors shrink-0 flex items-center justify-center ${
                                          snapshot.isDragging
                                            ? 'text-[#1458E6] cursor-grabbing'
                                            : 'text-[#666] hover:text-white hover:bg-white/5 cursor-grab active:cursor-grabbing'
                                        }`}
                                        title="Зажмите и тяните для изменения порядка клиентов"
                                      >
                                        <GripVertical className="w-5 h-5 stroke-[2.5]" />
                                      </div>
                                    )}

                                    <div
                                      className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full overflow-hidden flex items-center justify-center p-1 bg-white shadow-md shrink-0"
                                      style={{ backgroundColor: client.color || '#FFFFFF' }}
                                    >
                                      {client.logo_url ? (
                                        <img
                                          src={client.logo_url}
                                          alt={client.name_ru}
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder.png';
                                          }}
                                          className="w-full h-full object-contain"
                                        />
                                      ) : (
                                        <span className="text-black font-mono font-bold text-xs">
                                          {client.name_ru ? client.name_ru.slice(0, 3).toUpperCase() : 'ЛГО'}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-mono text-[14px] font-bold text-white uppercase truncate">
                                        {client.name_ru || 'КЛИЕНТ'}
                                      </span>
                                      <span className="text-[11px] text-[#5E5E5E] font-mono truncate">
                                        {client.hide_logo ? 'Логотип скрыт' : '54×54 логотип включен'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Toggle Hide/Show Logo */}
                                  <button
                                    type="button"
                                    onClick={() => updateClient(client.id, 'hide_logo', !client.hide_logo)}
                                    style={{ borderRadius: '56px' }}
                                    className="w-full h-[36px] font-mono font-bold text-[12px] uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 bg-[#232326] text-white hover:bg-[#2e2e33]"
                                    title={client.hide_logo ? 'Логотип скрыт' : 'Логотип отображается'}
                                  >
                                    {client.hide_logo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    <span>{client.hide_logo ? 'ВКЛЮЧИТЬ ЛОГОТИП' : 'ВЫКЛЮЧИТЬ ЛОГОТИП'}</span>
                                  </button>

                                  {/* Toggle Hide/Show Whole Client */}
                                  <button
                                    type="button"
                                    onClick={() => updateClient(client.id, 'hidden', !client.hidden)}
                                    style={{ borderRadius: '56px' }}
                                    className={`w-full h-[36px] font-mono font-bold text-[12px] uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                                      client.hidden
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                                        : 'bg-[#232326] text-white hover:bg-[#2e2e33]'
                                    }`}
                                    title={client.hidden ? 'Клиент скрыт с сайта' : 'Клиент виден на сайте'}
                                  >
                                    {client.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    <span>{client.hidden ? 'ПОКАЗАТЬ КАРТОЧКУ' : 'СКРЫТЬ КАРТОЧКУ'}</span>
                                  </button>

                                  {/* Delete Client button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      requestConfirmation({
                                        title: 'УДАЛЕНИЕ КЛИЕНТА',
                                        message: `Вы уверены, что хотите удалить клиента «${client.name_ru}»?`,
                                        confirmText: 'УДАЛИТЬ',
                                        isDestructive: true,
                                        onConfirm: () => deleteClient(client.id),
                                      });
                                    }}
                                    style={{ borderRadius: '56px' }}
                                    className="w-full h-[36px] bg-[#232326] hover:bg-red-600 text-white font-mono font-bold text-[12px] uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>УДАЛИТЬ</span>
                                  </button>
                                </div>

                                {/* Right Column: Input Fields */}
                                <div className="flex-1 flex flex-col gap-3 w-full">
                                  {/* Titles Grid (ru & en) */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                        название клиента (ru)
                                      </label>
                                      <input
                                        type="text"
                                        value={client.name_ru}
                                        onChange={(e) => updateClient(client.id, 'name_ru', e.target.value)}
                                        placeholder="НАЗВАНИЕ КЛИЕНТА"
                                        style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                        className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                        название клиента (en)
                                      </label>
                                      <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                                        <input
                                          type="text"
                                          value={client.name_en}
                                          onChange={(e) => updateClient(client.id, 'name_en', e.target.value)}
                                          placeholder="CLIENT NAME (EN)"
                                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                                          className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                                        />
                                        <TranslateButton
                                          sourceText={client.name_ru}
                                          onTranslated={(enText) => updateClient(client.id, 'name_en', enText)}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Logo File Input */}
                                  <div className="flex flex-col gap-2">
                                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                      логотип (ссылка или перетащите файл из finder)
                                    </label>
                                    <DropFileInput
                                      value={client.logo_url || ''}
                                      placeholder="ССЫЛКА НА ЛОГОТИП ИЛИ ПЕРЕТАЩИТЕ ФАЙЛ"
                                      accept="image/*,.svg"
                                      isUploading={uploadingField === `client_logo_${client.id}`}
                                      fieldKey={`client_logo_${client.id}`}
                                      errorMessage={uploadErrors[`client_logo_${client.id}`]}
                                      onChange={(url) => updateClient(client.id, 'logo_url', url)}
                                      onFileUpload={handleFileUpload}
                                      onClear={() => updateClient(client.id, 'logo_url', '')}
                                    />
                                  </div>

                                  {/* Video File Input */}
                                  <div className="flex flex-col gap-2">
                                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                                      видео проекта клиента (ссылка или перетащите файл из finder)
                                    </label>
                                    <DropFileInput
                                      value={client.video_url || ''}
                                      placeholder="ССЫЛКА НА ВИДЕО ИЛИ ПЕРЕТАЩИТЕ ФАЙЛ"
                                      accept="video/*"
                                      isUploading={uploadingField === `client_vid_${client.id}`}
                                      fieldKey={`client_vid_${client.id}`}
                                      errorMessage={uploadErrors[`client_vid_${client.id}`]}
                                      onChange={(url) => updateClient(client.id, 'video_url', url)}
                                      onFileUpload={handleFileUpload}
                                      onClear={() => updateClient(client.id, 'video_url', '')}
                                    />
                                    <span className="text-[12px] text-[#8C8E96] font-mono leading-tight mt-0.5 block">
                                                                            Рекомендуемый формат: MP4 (H.264), вес до {MAX_UPLOAD_SIZE_MB} МБ. Видео автоматически оптимизируется при загрузке.
                                    </span>
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

              {/* Pseudo bottom spacer */}
              <div className="h-[100px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 4: FAQ (ВОПРОСЫ И ОТВЕТЫ) ════ */}
          {activeMenu === 'faq' && (
            <div className="flex flex-col gap-[12px] w-full">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  style={{ padding: '24px' }}
                  className="bg-[#141416] rounded-[16px] transition-all flex flex-col gap-4 border-none w-full"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      Вопрос & Двухколоночный ответ
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteFaq(faq.id)}
                      className="w-[38px] h-[38px] text-[#8C8E96] hover:text-[#FF0000] flex items-center justify-center transition-colors cursor-pointer border-none outline-none bg-transparent hover:bg-white/5 shadow-none shrink-0"
                      title="Удалить вопрос"
                    >
                      <Trash2 className="w-4 h-4" />
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
                        className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        текст вопроса (en)
                      </label>
                      <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                        <input
                          type="text"
                          value={faq.question_en}
                          onChange={(e) => updateFaq(faq.id, 'question_en', e.target.value)}
                          placeholder="how much does shooting cost?"
                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                          className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold lowercase text-white placeholder:text-[#404040] focus:outline-none"
                        />
                        <TranslateButton
                          sourceText={faq.question_ru}
                          onTranslated={(enText) => updateFaq(faq.id, 'question_en', enText.toLowerCase())}
                        />
                      </div>
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
                        className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        левая колонка ответа (en)
                      </label>
                      <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                        <input
                          type="text"
                          value={faq.answer_left_en}
                          onChange={(e) => updateFaq(faq.id, 'answer_left_en', e.target.value)}
                          placeholder="SHOOTING ON SONY G-MASTER..."
                          style={{ paddingLeft: '12px', paddingRight: '12px' }}
                          className="flex-1 h-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
                        />
                        <TranslateButton
                          sourceText={faq.answer_left_ru}
                          onTranslated={(enText) => updateFaq(faq.id, 'answer_left_en', enText)}
                        />
                      </div>
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
                        className="w-full bg-transparent border border-[#26282C] text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04] resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                        правая колонка подробного ответа (en)
                      </label>
                      <div className="relative flex items-start w-full bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                        <textarea
                          rows={2}
                          value={faq.answer_right_en}
                          onChange={(e) => updateFaq(faq.id, 'answer_right_en', e.target.value)}
                          placeholder="THE PICTURE LOOKS EXPENSIVE..."
                          style={{ padding: '12px', paddingRight: '48px' }}
                          className="w-full bg-transparent text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none resize-none"
                        />
                        <div className="absolute right-0 top-0">
                          <TranslateButton
                            sourceText={faq.answer_right_ru}
                            onTranslated={(enText) => updateFaq(faq.id, 'answer_right_en', enText)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pseudo bottom spacer */}
              <div className="h-[100px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 5: CONTACTS & SOCIALS ════ */}
          {activeMenu === 'contacts' && (
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
                  {/* Contacts Block Title RU */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      заголовок блока контактов (ru)
                    </label>
                    <textarea
                      rows={2}
                      value={settings.contacts_title_ru ?? 'ЕСТЬ ИДЕЯ? НАПИШИ МНЕ\nПРЯМО СЕЙЧАС'}
                      onChange={(e) => {
                        setSettings({ ...settings, contacts_title_ru: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="ЕСТЬ ИДЕЯ? НАПИШИ МНЕ&#10;ПРЯМО СЕЙЧАС"
                      style={{ padding: '12px' }}
                      className="w-full bg-transparent border border-[#26282C] text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04] resize-none"
                    />
                  </div>

                  {/* Contacts Block Title EN */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      заголовок блока контактов (en)
                    </label>
                    <div className="relative flex items-center w-full bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                      <textarea
                        rows={2}
                        value={settings.contacts_title_en ?? 'GOT AN IDEA? WRITE TO ME\nRIGHT NOW'}
                        onChange={(e) => {
                          setSettings({ ...settings, contacts_title_en: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="GOT AN IDEA? WRITE TO ME&#10;RIGHT NOW"
                        style={{ padding: '12px', paddingRight: '48px' }}
                        className="w-full bg-transparent text-[16px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none resize-none"
                      />
                      <div className="absolute right-0 top-0">
                        <TranslateButton
                          sourceText={settings.contacts_title_ru || ''}
                          onTranslated={(enText) => {
                            setSettings({ ...settings, contacts_title_en: enText });
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      telegram (TG)
                    </label>
                    <input
                      type="text"
                      value={settings.telegram || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, telegram: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://t.me/sapunov_vlad"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      behance (BE)
                    </label>
                    <input
                      type="text"
                      value={settings.behance || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, behance: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://behance.net/vladsapunov"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      youtube (YT)
                    </label>
                    <input
                      type="text"
                      value={settings.youtube || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, youtube: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://youtube.com/@vladsapunov"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      instagram* (IN*)
                    </label>
                    <input
                      type="text"
                      value={settings.instagram || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, instagram: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://instagram.com/sapunov_vlad"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      email адрес
                    </label>
                    <input
                      type="email"
                      value={settings.email || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, email: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="vlad@sapunov.ru"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      телефон
                    </label>
                    <input
                      type="text"
                      value={settings.phone || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, phone: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="+7 (999) 000-00-00"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                      кнопка «связаться» (ссылка перехода)
                    </label>
                    <input
                      type="text"
                      value={settings.contact_button_url || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, contact_button_url: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="https://t.me/sapunov_vlad"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="w-full h-[40px] bg-transparent border border-[#26282C] text-[16px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none focus:bg-white/[0.04]"
                    />
                  </div>
                </div>
              </div>

              {/* Pseudo bottom spacer */}
              <div className="h-[100px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION: ANALYTICS (DEFAULT TAB) ════ */}
          {activeMenu === 'analytics' && (
            <div className="flex flex-col gap-6 w-full">
              {/* KPI Summary Cards Grid (4 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                {/* Total Views */}
                <div style={{ padding: '20px' }} className="bg-[#141416] rounded-[16px] flex flex-col justify-between gap-4 border-none">
                  <div className="flex items-center justify-between text-[#8C8E96]">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8C8E96]">Просмотры видео</span>
                    <Eye className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold font-mono text-white">
                      {analytics.totalViews || 0}
                    </span>
                    <span className="text-xs text-[#8C8E96] font-mono lowercase">запусков</span>
                  </div>
                </div>

                {/* Total Contact Clicks */}
                <div style={{ padding: '20px' }} className="bg-[#141416] rounded-[16px] flex flex-col justify-between gap-4 border-none">
                  <div className="flex items-center justify-between text-[#8C8E96]">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8C8E96]">Клики по связи</span>
                    <MousePointerClick className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold font-mono text-white">
                      {analytics.totalContactClicks || 0}
                    </span>
                    <span className="text-xs text-[#8C8E96] font-mono lowercase">переходов</span>
                  </div>
                </div>

                {/* Tracked Projects */}
                <div style={{ padding: '20px' }} className="bg-[#141416] rounded-[16px] flex flex-col justify-between gap-4 border-none">
                  <div className="flex items-center justify-between text-[#8C8E96]">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8C8E96]">Роликов в базе</span>
                    <Play className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold font-mono text-white">
                      {Object.keys(analytics.videoViews || {}).length}
                    </span>
                    <span className="text-xs text-[#8C8E96] font-mono lowercase">проектов</span>
                  </div>
                </div>

                {/* Top Video / Leader */}
                <div style={{ padding: '20px' }} className="bg-[#141416] rounded-[16px] flex flex-col justify-between gap-4 border-none">
                  <div className="flex items-center justify-between text-[#8C8E96]">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8C8E96]">Лидер просмотров</span>
                    <TrendingUp className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex flex-col">
                    {(() => {
                      const list = Object.values(analytics.videoViews || {});
                      if (list.length === 0) {
                        return (
                          <>
                            <span className="text-3xl font-bold font-mono text-white">0</span>
                            <span className="text-xs text-[#8C8E96] font-mono lowercase">нет данных</span>
                          </>
                        );
                      }
                      const top = [...list].sort((a, b) => b.count - a.count)[0];
                      return (
                        <>
                          <span className="text-3xl font-bold font-mono text-white">
                            {top.count}
                          </span>
                          <span className="text-xs text-[#8C8E96] font-mono lowercase truncate max-w-full" title={`просмотров у ${top.title}`}>
                            просмотров у {top.title}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* ── SECTION 1: Contact Channels & Lead Click Breakdown ── */}
              <div className="flex flex-col gap-3 w-full mt-[32px]">
                <div className="flex items-center justify-between">
                  <h3 style={{ paddingLeft: '24px' }} className="font-mono text-[14px] font-bold uppercase text-white tracking-wide">
                    КЛИКИ ПО КНОПКАМ И КОНВЕРСИЯ В ЛИДЫ
                  </h3>
                </div>

                {/* Contact Clicks List */}
                {(() => {
                  const rawClicks = Object.values(analytics.contactClicks || {});
                  const clickItems = rawClicks.length > 0
                    ? [...rawClicks].sort((a, b) => b.count - a.count)
                    : [
                        { title: 'КНОПКА “СВЯЗАТЬСЯ”', count: 0, lastClickedAt: undefined },
                        { title: 'КНОПКА ТЕЛЕГРАМ', count: 0, lastClickedAt: undefined },
                      ];

                  return (
                    <div className="flex flex-col gap-[4px] w-full">
                      {clickItems.map((item) => (
                        <div
                          key={item.title}
                          style={{ padding: '16px' }}
                          className="bg-[#141416] rounded-[16px] flex items-center justify-between gap-4 border-none"
                        >
                          <span className="font-mono text-[14px] font-bold text-white uppercase truncate">
                            {item.title}
                          </span>

                          <div className="flex items-center gap-4 shrink-0">
                            {item.lastClickedAt && (
                              <div className="flex flex-col items-end text-right font-mono text-[11px] text-[#8C8E96] leading-tight">
                                <span>последний клик:</span>
                                <span>
                                  {new Date(item.lastClickedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(' г.', '')}
                                </span>
                              </div>
                            )}

                            <span
                              style={{ padding: '4px 8px' }}
                              className="rounded-full bg-[#2957DE] text-white font-mono font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shrink-0"
                            >
                              <span>{item.count}</span>
                              <MousePointerClick className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* ── SECTION 2: Video Views Ranking ── */}
              <div className="flex flex-col gap-3 w-full mt-[32px]">
                <div className="flex items-center justify-between">
                  <h3 style={{ paddingLeft: '24px' }} className="font-mono text-[14px] font-bold uppercase text-white tracking-wide">
                    РЕЙТИНГ ПРОСМОТРА ВИДЕО
                  </h3>
                </div>

                {/* Video Table List */}
                {(() => {
                  const items = Object.values(analytics.videoViews || {}).sort((a, b) => b.count - a.count);
                  if (items.length === 0) {
                    return (
                      <div style={{ padding: '32px' }} className="bg-[#141416] rounded-[16px] flex flex-col items-center justify-center text-center gap-2 text-[#5E5E5E]">
                        <BarChart3 className="w-8 h-8 opacity-40" />
                        <p className="font-mono text-sm">Данные о просмотрах появятся после первых кликов по видео на сайте</p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-[4px] w-full">
                      {items.map((item, idx) => (
                        <div
                          key={item.title}
                          style={{ padding: '16px' }}
                          className="bg-[#141416] rounded-[16px] flex items-center justify-between gap-4 border-none"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-full bg-[#2957DE] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </div>
                            <span className="font-mono text-[14px] font-bold text-white uppercase truncate">
                              {item.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            {item.lastViewedAt && (
                              <div className="flex flex-col items-end text-right font-mono text-[11px] text-[#8C8E96] leading-tight">
                                <span>последний просмотр:</span>
                                <span>
                                  {new Date(item.lastViewedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(' г.', '')}
                                </span>
                              </div>
                            )}

                            <span
                              style={{ padding: '4px 8px' }}
                              className="rounded-full bg-[#2957DE] text-white font-mono font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shrink-0"
                            >
                              <span>{item.count}</span>
                              <Eye className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Pseudo bottom spacer */}
              <div className="h-[100px] w-full shrink-0" />
            </div>
          )}

          {/* ════ SECTION 6: PROFILE, SECURITY & SETTINGS ════ */}
          {activeMenu === 'settings' && (
            <div className="flex flex-col gap-[12px] w-full">
              {/* 1. Мой профиль и PIN-код (доступно всем авторизованным пользователям) */}
              {(() => {
                const usersList = settings.admin_users && settings.admin_users.length > 0 ? settings.admin_users : DEFAULT_ADMIN_USERS;
                const activeUser = usersList.find((u) => u.id === currentUserId) || usersList.find((u) => u.role === userRole) || DEFAULT_ADMIN_USERS[userRole === 'dev' ? 0 : 1];
                const initials = activeUser.name ? activeUser.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : (userRole === 'dev' ? 'AL' : 'VS');

                return (
                  <div
                    style={{ padding: '20px' }}
                    className="bg-[#141416] rounded-[24px] shadow-xl flex flex-col md:flex-row items-start justify-between gap-5 w-full border-none"
                  >
                    {/* Left: Avatar preview with full-width blue Crop Button on hover/click */}
                    <div className="relative group/avatar w-[64px] h-[64px] min-w-[64px] rounded-full overflow-hidden shrink-0 border-none mt-1">
                      <div className={`w-full h-full ${activeUser.avatar_url ? 'bg-[#141416]' : (activeUser.role === 'dev' ? 'bg-[#1458E6]' : 'bg-[#232326]')} flex items-center justify-center font-bold text-white text-[20px] font-mono`}>
                        {activeUser.avatar_url ? (
                          <img
                            src={activeUser.avatar_url}
                            alt={activeUser.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{initials || (activeUser.role === 'dev' ? 'DEV' : 'ED')}</span>
                        )}
                      </div>

                      {activeUser.avatar_url && (
                        <button
                          type="button"
                          onClick={() => {
                            setCropModal({
                              isOpen: true,
                              imageUrl: activeUser.avatar_url || '',
                              title: 'ОБРЕЗАТЬ АВАТАРКУ',
                              hidePills: true,
                              initialAspectRatio: '1:1',
                              isVertical: false,
                              onApply: (url) => {
                                updateCurrentUserProfile('avatar_url', url);
                              },
                            });
                          }}
                          className="absolute inset-0 bg-[#1458E6] opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white font-mono font-bold uppercase gap-1 cursor-pointer border-none outline-none shadow-lg active:scale-95"
                          title="Обрезать аватарку"
                        >
                          <Crop className="w-4 h-4 stroke-[2.5]" />
                          <span className="tracking-wider text-[9px] leading-tight font-bold">ОБРЕЗАТЬ</span>
                        </button>
                      )}
                    </div>

                    {/* Middle: Main Form Elements (ending strictly on the 172px right boundary line) */}
                    <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
                      {/* Row 1: Аватарка */}
                      <div className="flex flex-col gap-1.5 w-full min-w-0">
                        <label className="font-mono text-[12px] font-bold lowercase text-[#5E5E5E]">
                          аватарка
                        </label>
                        <DropFileInput
                          value={activeUser.avatar_url || ''}
                          placeholder="НАПРИМЕР, ССЫЛКА НА ФОТО ИЛИ ПЕРЕТАЩИТЕ ФАЙЛ"
                          accept="image/*"
                          isUploading={uploadingField === `user_avatar_${activeUser.id}`}
                          fieldKey={`user_avatar_${activeUser.id}`}
                          errorMessage={uploadErrors[`user_avatar_${activeUser.id}`]}
                          onChange={(url) => updateCurrentUserProfile('avatar_url', url)}
                          onFileUpload={handleFileUpload}
                          onClear={() => updateCurrentUserProfile('avatar_url', '')}
                        />
                      </div>

                      {/* Row 2: Имя & Логин (grid 2 columns) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {/* Name */}
                        <div className="flex flex-col gap-1.5 w-full min-w-0">
                          <label className="font-mono text-[12px] font-bold lowercase text-[#5E5E5E]">
                            имя
                          </label>
                          <input
                            type="text"
                            value={activeUser.name}
                            onChange={(e) => updateCurrentUserProfile('name', e.target.value)}
                            placeholder="НАПРИМЕР, VLAD"
                            style={{ paddingLeft: '14px', paddingRight: '14px' }}
                            className="w-full h-[42px] bg-transparent border border-[#26282C] focus:border-[#555] focus:bg-white/[0.04] text-[14px] font-mono font-bold uppercase text-white placeholder:text-[#383838] focus:outline-none transition-colors"
                          />
                        </div>

                        {/* Login */}
                        <div className="flex flex-col gap-1.5 w-full min-w-0">
                          <div className="flex items-center justify-between">
                            <label className="font-mono text-[12px] font-bold lowercase text-[#5E5E5E]">
                              логин
                            </label>
                            <div className="relative group/tooltip flex items-center">
                              <span className="w-4 h-4 rounded-full bg-[#26282C] group-hover/tooltip:bg-[#3A3A3C] text-[#8C8E96] group-hover/tooltip:text-white flex items-center justify-center text-[10px] font-mono font-bold cursor-help transition-colors select-none">
                                ?
                              </span>
                              <div className="absolute bottom-[calc(100%+6px)] right-0 hidden group-hover/tooltip:flex flex-col items-start gap-0 z-50 pointer-events-none select-none text-left">
                                <span
                                  style={{
                                    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    lineHeight: '130%',
                                    letterSpacing: '-0.1px',
                                    backgroundColor: '#3A3A3A',
                                    color: '#E6E6E6',
                                    padding: '1px 4px',
                                  }}
                                  className="inline-block w-fit whitespace-nowrap uppercase rounded-none m-0 block"
                                >
                                  ТОЛЬКО ЛАТИНСКИЕ БУКВЫ И ЦИФРЫ,
                                </span>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    lineHeight: '130%',
                                    letterSpacing: '-0.1px',
                                    backgroundColor: '#3A3A3A',
                                    color: '#E6E6E6',
                                    padding: '1px 4px',
                                  }}
                                  className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px] block"
                                >
                                  БЕЗ ПРОБЕЛОВ И СПЕЦСИМВОЛОВ
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="relative flex items-center w-full">
                            <input
                              type="text"
                              value={activeUser.login}
                              onChange={(e) => updateCurrentUserProfile('login', e.target.value.trim().toLowerCase())}
                              placeholder="НАПРИМЕР, VLAD"
                              style={{ paddingLeft: '14px', paddingRight: '40px' }}
                              className="w-full h-[42px] bg-transparent border border-[#26282C] focus:border-[#555] focus:bg-white/[0.04] text-[14px] font-mono font-bold uppercase text-white placeholder:text-[#383838] focus:outline-none transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const generated = autoTranslateRuToEn(activeUser.name).replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'admin';
                                updateCurrentUserProfile('login', generated);
                              }}
                              title="Сгенерировать логин"
                              className="absolute right-1 w-[34px] h-[34px] flex items-center justify-center text-[#8C8E96] hover:text-white transition-colors cursor-pointer border-none outline-none bg-transparent hover:bg-transparent shadow-none"
                            >
                              <Sparkles className="w-4 h-4 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Button СМЕНИТЬ ПАРОЛЬ */}
                      <div style={{ paddingTop: '12px', paddingBottom: '12px' }} className="flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPinModalOpen(true);
                            setOldPin('');
                            setNewPin('');
                            setConfirmPin('');
                            setPinModalError('');
                          }}
                          style={{
                            borderRadius: '56px',
                            height: '36px',
                            paddingLeft: '20px',
                            paddingRight: '20px',
                            fontFamily: '"Geist Mono", monospace',
                            fontSize: '13px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                          className="bg-white hover:bg-neutral-200 text-black transition-colors cursor-pointer flex items-center justify-center shrink-0 border-none outline-none active:scale-95 shadow-none"
                          title="Сменить пароль"
                        >
                          СМЕНИТЬ ПАРОЛЬ
                        </button>
                      </div>
                    </div>

                    {/* Right: Exactly 172px fixed width block, matching lower cards! */}
                    <div style={{ width: '172px' }} className="flex items-start justify-end shrink-0 self-start">
                      <div
                        style={{
                          borderRadius: '56px',
                          height: '28px',
                          paddingLeft: '14px',
                          paddingRight: '14px',
                          fontFamily: '"Geist Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                        className={`flex items-center justify-center shrink-0 border-none select-none tracking-wider ${
                          activeUser.role === 'dev'
                            ? 'bg-[#1458E6] text-white shadow-sm'
                            : 'bg-[#232326] text-[#A0A2AA]'
                        }`}
                      >
                        {activeUser.role === 'dev' ? 'Разработчик' : 'Редактор'}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Управление доступами (Strictly Developer Only) */}
              {userRole === 'dev' && (
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 style={{ paddingLeft: '24px', paddingTop: '32px' }} className="text-base font-bold uppercase text-white font-mono tracking-wide">
                      УПРАВЛЕНИЕ ДОСТУПАМИ
                    </h3>
                  </div>

                  <div className="flex flex-col gap-[4px] w-full">
                    {(() => {
                      const currentUsersList: AdminUser[] = (settings.admin_users && settings.admin_users.length > 0) ? settings.admin_users : DEFAULT_ADMIN_USERS;
                      const activeUser = currentUsersList.find((u) => u.id === currentUserId) || currentUsersList.find((u) => u.role === userRole) || DEFAULT_ADMIN_USERS[userRole === 'dev' ? 0 : 1];
                      const otherUsersList = currentUsersList.filter((u) => u.id !== activeUser.id && u.login.toLowerCase() !== activeUser.login.toLowerCase());

                      if (otherUsersList.length === 0) {
                        return (
                          <div style={{ padding: '24px' }} className="bg-[#141416] rounded-[24px] flex items-center justify-center text-center text-[#8C8E96] font-mono text-xs uppercase tracking-wider">
                            Нет других пользователей
                          </div>
                        );
                      }

                      return otherUsersList.map((user) => {
                        const userInitials = user.name ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : (user.role === 'dev' ? 'AL' : 'VS');
                        const isDuplicateLogin = user.login.trim() && currentUsersList.filter((u) => u.login.trim().toLowerCase() === user.login.trim().toLowerCase()).length > 1;
                        const isPinInvalid = user.pin.trim().length > 0 && user.pin.trim().length < 4;

                        return (
                          <div
                            key={user.id}
                            style={{ padding: '20px' }}
                            className="bg-[#141416] rounded-[24px] shadow-xl flex flex-col md:flex-row items-start md:items-end justify-between gap-5 w-full border-none"
                          >
                            {/* Avatar: Solid fill only, no border, with Crop button on hover if avatar present */}
                            <div className="relative group/avatar w-[64px] h-[64px] min-w-[64px] rounded-full overflow-hidden shrink-0 border-none">
                              <div className={`w-full h-full ${user.avatar_url ? 'bg-[#141416]' : (user.role === 'dev' ? 'bg-[#1458E6]' : 'bg-[#232326]')} flex items-center justify-center font-bold text-white text-[20px] font-mono`}>
                                {user.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span>{userInitials || (user.role === 'dev' ? 'DEV' : 'ED')}</span>
                                )}
                              </div>

                              {user.avatar_url && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCropModal({
                                      isOpen: true,
                                      imageUrl: user.avatar_url || '',
                                      title: 'ОБРЕЗАТЬ АВАТАРКУ',
                                      hidePills: true,
                                      initialAspectRatio: '1:1',
                                      isVertical: false,
                                      onApply: (url) => {
                                        updateEditorUser(user.id, 'avatar_url', url);
                                      },
                                    });
                                  }}
                                  className="absolute inset-0 bg-[#1458E6] opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white font-mono font-bold uppercase gap-1 cursor-pointer border-none outline-none shadow-lg active:scale-95"
                                  title="Обрезать аватарку"
                                >
                                  <Crop className="w-4 h-4 stroke-[2.5]" />
                                  <span className="tracking-wider text-[9px] leading-tight font-bold">ОБРЕЗАТЬ</span>
                                </button>
                              )}
                            </div>

                            {/* Inputs Grid: strictly 3 equal columns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-w-0 w-full">
                              {/* 1. Name */}
                              <div className="flex flex-col gap-1 w-full min-w-0">
                                <span className="font-mono text-[12px] font-bold lowercase text-[#5E5E5E]">имя</span>
                                <input
                                  type="text"
                                  value={user.name}
                                  onChange={(e) => updateEditorUser(user.id, 'name', e.target.value)}
                                  placeholder="НАПРИМЕР, VLAD"
                                  style={{ paddingLeft: '14px', paddingRight: '14px' }}
                                  className="w-full h-[42px] bg-transparent border border-[#26282C] focus:border-[#555] focus:bg-white/[0.04] text-[14px] font-mono font-bold uppercase text-white placeholder:text-[#383838] focus:outline-none transition-colors"
                                />
                              </div>

                              {/* 2. Login with Generator button & Help Tooltip */}
                              <div className="flex flex-col gap-1 w-full min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[12px] font-bold lowercase text-[#5E5E5E]">логин</span>
                                  <div className="flex items-center gap-2">
                                    {isDuplicateLogin && (
                                      <span className="text-[#E50914] text-[10px] font-mono font-bold lowercase">логин занят</span>
                                    )}
                                    <div className="relative group/tooltip flex items-center">
                                      <span className="w-4 h-4 rounded-full bg-[#26282C] group-hover/tooltip:bg-[#3A3A3C] text-[#8C8E96] group-hover/tooltip:text-white flex items-center justify-center text-[10px] font-mono font-bold cursor-help transition-colors select-none">
                                        ?
                                      </span>
                                      <div className="absolute bottom-[calc(100%+6px)] right-0 hidden group-hover/tooltip:flex flex-col items-start gap-0 z-50 pointer-events-none select-none text-left">
                                        <span
                                          style={{
                                            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            lineHeight: '130%',
                                            letterSpacing: '-0.1px',
                                            backgroundColor: '#3A3A3A',
                                            color: '#E6E6E6',
                                            padding: '1px 4px',
                                          }}
                                          className="inline-block w-fit whitespace-nowrap uppercase rounded-none m-0 block"
                                        >
                                          ТОЛЬКО ЛАТИНСКИЕ БУКВЫ И ЦИФРЫ,
                                        </span>
                                        <span
                                          style={{
                                            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            lineHeight: '130%',
                                            letterSpacing: '-0.1px',
                                            backgroundColor: '#3A3A3A',
                                            color: '#E6E6E6',
                                            padding: '1px 4px',
                                          }}
                                          className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px] block"
                                        >
                                          БЕЗ ПРОБЕЛОВ И СПЕЦСИМВОЛОВ
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative flex items-center w-full">
                                  <input
                                    type="text"
                                    value={user.login}
                                    onChange={(e) => updateEditorUser(user.id, 'login', e.target.value.trim().toLowerCase())}
                                    placeholder="НАПРИМЕР, VLAD"
                                    style={{ paddingLeft: '14px', paddingRight: '40px' }}
                                    className={`w-full h-[42px] bg-transparent border text-[14px] font-mono font-bold uppercase text-white placeholder:text-[#383838] focus:outline-none transition-colors ${
                                      isDuplicateLogin ? 'border-[#E50914] bg-[#E50914]/5' : 'border-[#26282C] focus:border-[#555] focus:bg-white/[0.04]'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => generateLoginForUser(user.id, user.name)}
                                    title="Сгенерировать логин"
                                    className="absolute right-1 w-[34px] h-[34px] flex items-center justify-center text-[#8C8E96] hover:text-white transition-colors cursor-pointer border-none outline-none bg-transparent hover:bg-transparent shadow-none"
                                  >
                                    <Sparkles className="w-4 h-4 transition-colors" />
                                  </button>
                                </div>
                              </div>

                              {/* 3. Password / PIN with Generator & Solid Right Eye Button */}
                              <div className="flex flex-col gap-1 w-full min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[12px] font-bold lowercase text-[#5E5E5E]">пароль</span>
                                  <div className="flex items-center gap-2">
                                    {isPinInvalid && (
                                      <span className="text-[#E50914] text-[10px] font-mono font-bold lowercase">мин. 4 симв.</span>
                                    )}
                                    <div className="relative group/tooltip flex items-center">
                                      <span className="w-4 h-4 rounded-full bg-[#26282C] group-hover/tooltip:bg-[#3A3A3C] text-[#8C8E96] group-hover/tooltip:text-white flex items-center justify-center text-[10px] font-mono font-bold cursor-help transition-colors select-none">
                                        ?
                                      </span>
                                      <div className="absolute bottom-[calc(100%+6px)] right-0 hidden group-hover/tooltip:flex flex-col items-start gap-0 z-50 pointer-events-none select-none text-left">
                                        <span
                                          style={{
                                            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            lineHeight: '130%',
                                            letterSpacing: '-0.1px',
                                            backgroundColor: '#3A3A3A',
                                            color: '#E6E6E6',
                                            padding: '1px 4px',
                                          }}
                                          className="inline-block w-fit whitespace-nowrap uppercase rounded-none m-0 block"
                                        >
                                          МИНИМУМ 4 СИМВОЛА,
                                        </span>
                                        <span
                                          style={{
                                            fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            lineHeight: '130%',
                                            letterSpacing: '-0.1px',
                                            backgroundColor: '#3A3A3A',
                                            color: '#E6E6E6',
                                            padding: '1px 4px',
                                          }}
                                          className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px] block"
                                        >
                                          ЦИФРЫ ИЛИ ЛАТИНСКИЕ БУКВЫ
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative flex items-center w-full">
                                  <input
                                    type={showPasswordMap[user.id] ? 'text' : 'password'}
                                    value={user.pin}
                                    onChange={(e) => updateEditorUser(user.id, 'pin', e.target.value.trim())}
                                    placeholder="••••"
                                    style={{ paddingLeft: '14px', paddingRight: '76px' }}
                                    className={`w-full h-[42px] bg-transparent border text-[14px] font-mono font-bold text-white tracking-wider placeholder:text-[#383838] focus:outline-none transition-colors ${
                                      isPinInvalid ? 'border-[#E50914] bg-[#E50914]/5' : 'border-[#26282C] focus:border-[#555] focus:bg-white/[0.04]'
                                    }`}
                                  />
                                  <div className="absolute right-0 h-full flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => generatePinForUser(user.id)}
                                      title="Сгенерировать PIN / пароль"
                                      className="w-[32px] h-full flex items-center justify-center text-[#8C8E96] hover:text-white transition-colors cursor-pointer border-none outline-none bg-transparent hover:bg-transparent shadow-none"
                                    >
                                      <Sparkles className="w-4 h-4 transition-colors" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => togglePasswordVisibility(user.id)}
                                      title={showPasswordMap[user.id] ? 'Скрыть пароль' : 'Показать пароль'}
                                      className="w-[40px] h-full bg-[#232326] hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer border-none outline-none shrink-0 active:scale-95"
                                    >
                                      {showPasswordMap[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Actions: Exactly 172px fixed width block, right-aligned, bottom-aligned */}
                            <div style={{ width: '172px', height: '42px' }} className="flex items-center justify-end gap-2.5 shrink-0 self-end">
                              {/* Role Dropdown */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setOpenRoleDropdownId(openRoleDropdownId === user.id ? null : user.id)}
                                  style={{
                                    borderRadius: '56px',
                                    height: '36px',
                                    paddingLeft: '14px',
                                    paddingRight: '12px',
                                    fontFamily: '"Geist Mono", monospace',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                  }}
                                  className="bg-[#232326] hover:bg-[#2e2e33] text-[#D0D2D8] hover:text-white flex items-center gap-2 transition-colors cursor-pointer shrink-0 border-none outline-none shadow-none active:scale-95"
                                  title="Нажмите для выбора роли"
                                >
                                  <span>{user.role === 'dev' ? 'Разработчик' : 'Редактор'}</span>
                                  <ChevronDown className={`w-3.5 h-3.5 text-[#8C8E96] transition-transform duration-200 ${openRoleDropdownId === user.id ? 'rotate-180 text-white' : ''}`} />
                                </button>

                                {/* Dropdown Menu (No outer background, gap-0, sharp rectangular tiles, Lucide Check icon) */}
                                {openRoleDropdownId === user.id && (
                                  <div className="absolute right-0 bottom-[calc(100%+8px)] z-50 flex flex-col gap-0 shadow-2xl border-none outline-none animate-in fade-in zoom-in-95 duration-150 min-w-[155px]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateEditorUser(user.id, 'role', 'editor');
                                        setOpenRoleDropdownId(null);
                                        showToast('РОЛЬ ИЗМЕНЕНА: РЕДАКТОР');
                                      }}
                                      style={{
                                        padding: '9px 14px',
                                        fontFamily: '"Geist Mono", monospace',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                      }}
                                      className={`w-full text-left font-mono font-bold uppercase transition-colors cursor-pointer border-none outline-none rounded-none flex items-center justify-between gap-3 ${
                                        user.role === 'editor'
                                          ? 'bg-[#1458E6] text-white'
                                          : 'bg-[#232326] text-[#D0D2D8] hover:bg-white hover:text-black'
                                      }`}
                                    >
                                      <span>Редактор</span>
                                      {user.role === 'editor' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateEditorUser(user.id, 'role', 'dev');
                                        setOpenRoleDropdownId(null);
                                        showToast('РОЛЬ ИЗМЕНЕНА: РАЗРАБОТЧИК');
                                      }}
                                      style={{
                                        padding: '9px 14px',
                                        fontFamily: '"Geist Mono", monospace',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                      }}
                                      className={`w-full text-left font-mono font-bold uppercase transition-colors cursor-pointer border-none outline-none rounded-none flex items-center justify-between gap-3 ${
                                        user.role === 'dev'
                                          ? 'bg-[#1458E6] text-white'
                                          : 'bg-[#232326] text-[#D0D2D8] hover:bg-white hover:text-black'
                                      }`}
                                    >
                                      <span>Разработчик</span>
                                      {user.role === 'dev' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                    </button>
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => deleteEditorUser(user.id)}
                                style={{ width: '36px', height: '36px' }}
                                className="text-[#8C8E96] hover:text-[#FF0000] flex items-center justify-center transition-colors cursor-pointer border-none outline-none bg-transparent hover:bg-white/5 shadow-none shrink-0"
                                title="Удалить пользователя"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* 3. Backup & Restore Database (Developer Only) */}
              {userRole === 'dev' && (
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 style={{ paddingLeft: '24px', paddingTop: '32px' }} className="text-base font-bold uppercase text-white font-mono tracking-wide">
                      РЕЗЕРВНОЕ КОПИРОВАНИЕ И ЭКСПОРТ БАЗЫ
                    </h3>
                  </div>

                  <div style={{ padding: '24px' }} className="bg-[#141416] rounded-[24px] shadow-xl flex flex-col gap-5 border-none w-full">
                    <p className="font-mono text-[14px] text-[#8C8E96] leading-relaxed">
                      Экспорт и импорт полной базы данных в формате JSON<br />
                      для безопасного локального хранения и резервного восстановления контента.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleExportBackup}
                        style={{ paddingLeft: '20px', paddingRight: '20px', height: '40px', borderRadius: '56px' }}
                        className="bg-[#1458E6] hover:bg-[#1147bd] text-white font-mono font-bold text-xs uppercase transition-colors cursor-pointer flex items-center gap-2 border-none outline-none shadow-none active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>Скачать бэкап (.json)</span>
                      </button>

                      <label
                        style={{ paddingLeft: '20px', paddingRight: '20px', height: '40px', borderRadius: '56px' }}
                        className="bg-[#232326] hover:bg-[#2e2e33] text-white font-mono font-bold text-xs uppercase transition-colors cursor-pointer flex items-center gap-2 border-none outline-none shadow-none active:scale-95"
                      >
                        <Upload className="w-4 h-4 text-[#1458E6]" />
                        <span>Восстановить из бэкапа</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              requestConfirmation({
                                title: 'ВНИМАНИЕ! ЗАГРУЗКА БЭКАПА',
                                message: 'Загрузка бэкапа полностью заменит все текущие данные сайта. Вы уверены, что хотите продолжить?',
                                confirmText: 'ВОССТАНОВИТЬ',
                                isDestructive: true,
                                onConfirm: () => handleImportBackup(file),
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Pseudo bottom spacer */}
              <div className="h-[100px] w-full shrink-0" />
            </div>
          )}

        </div>

        {/* ── Fixed Floating Bottom Center Actions: ALWAYS pinned to the bottom of the right panel, never scrolls away ── */}
        <div className="fixed bottom-[24px] left-[calc(298px+24px)] right-[12px] z-50 flex items-center justify-center pointer-events-none">
          <div className="flex items-center justify-center gap-0 pointer-events-auto">
            {/* White Plus Button for tabs that support adding items (Developer Only for Hero, available for Works and Clients) */}
            {activeMenu === 'hero' && userRole === 'dev' && (
              <button
                onClick={addHeroReel}
                title="Добавить видео"
                style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '56px',
                }}
                className="bg-white hover:bg-[#1458E6] text-black flex items-center justify-center cursor-pointer active:scale-95 transition-colors shrink-0 border-none outline-none shadow-2xl group"
              >
                <Plus className="w-8 h-8 text-black group-hover:text-white stroke-[1.5] transition-colors" />
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
                className="bg-white hover:bg-[#1458E6] text-black flex items-center justify-center cursor-pointer active:scale-95 transition-colors shrink-0 border-none outline-none shadow-2xl group"
              >
                <Plus className="w-8 h-8 text-black group-hover:text-white stroke-[1.5] transition-colors" />
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
                className="bg-white hover:bg-[#1458E6] text-black flex items-center justify-center cursor-pointer active:scale-95 transition-colors shrink-0 border-none outline-none shadow-2xl group"
              >
                <Plus className="w-8 h-8 text-black group-hover:text-white stroke-[1.5] transition-colors" />
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
                className="bg-white hover:bg-[#1458E6] text-black flex items-center justify-center cursor-pointer active:scale-95 transition-colors shrink-0 border-none outline-none shadow-2xl group"
              >
                <Plus className="w-8 h-8 text-black group-hover:text-white stroke-[1.5] transition-colors" />
              </button>
            )}

            {activeMenu === 'settings' && userRole === 'dev' && (
              <div
                className="relative group pointer-events-auto"
                onMouseEnter={() => setIsAddUserMenuOpen(true)}
                onMouseLeave={() => setIsAddUserMenuOpen(false)}
              >
                {/* Badges Stack appearing above the button on hover (exact 20px gap, 2px gap between items, sharp rectangular white tags) */}
                <div
                  style={{ paddingBottom: '20px' }}
                  className={`absolute left-0 bottom-[65px] flex flex-col items-start gap-[2px] transition-all duration-200 pointer-events-auto z-50 ${
                    isAddUserMenuOpen
                      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                      : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      addAdminUser('dev');
                      setIsAddUserMenuOpen(false);
                    }}
                    style={{
                      padding: '6px',
                      fontFamily: '"Geist Mono", monospace',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '125%',
                      letterSpacing: '-0.16px',
                    }}
                    className="w-fit inline-block text-left bg-white hover:bg-[#1458E6] hover:text-white text-[#0B0B0B] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shadow-none border-none outline-none uppercase rounded-none"
                  >
                    РАЗРАБОТЧИК
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addAdminUser('editor');
                      setIsAddUserMenuOpen(false);
                    }}
                    style={{
                      padding: '6px',
                      fontFamily: '"Geist Mono", monospace',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '125%',
                      letterSpacing: '-0.16px',
                    }}
                    className="w-fit inline-block text-left bg-white hover:bg-[#1458E6] hover:text-white text-[#0B0B0B] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shadow-none border-none outline-none uppercase rounded-none"
                  >
                    РЕДАКТОР
                  </button>
                </div>

                <button
                  onClick={() => setIsAddUserMenuOpen((prev) => !prev)}
                  title="Добавить пользователя"
                  style={{
                    width: '65px',
                    height: '65px',
                    borderRadius: '56px',
                  }}
                  className={`bg-white hover:bg-[#1458E6] text-black flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0 border-none outline-none shadow-2xl group ${
                    isAddUserMenuOpen ? '!bg-[#1458E6] !text-white rotate-45' : ''
                  }`}
                >
                  <Plus className={`w-8 h-8 ${isAddUserMenuOpen ? 'text-white' : 'text-black group-hover:text-white'} stroke-[1.5] transition-colors`} />
                </button>
              </div>
            )}

            {/* Floating Actions for Analytics tab: White Reset (Left) + Blue Refresh (Right) with 0 gap, both with full rounded edges */}
            {activeMenu === 'analytics' && (
              <>
                {/* White Reset Button (Left) */}
                <button
                  onClick={handleResetAnalytics}
                  style={{
                    height: '65px',
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    borderRadius: '56px',
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: '125%',
                    letterSpacing: '-0.2px',
                    textTransform: 'uppercase',
                  }}
                  className="bg-white hover:bg-neutral-200 text-black active:scale-95 transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 border-none outline-none shadow-2xl group"
                  title="Сбросить всю статистику аналитики"
                >
                  <span>СБРОСИТЬ</span>
                </button>

                {/* Blue Refresh Button (Right) */}
                <button
                  onClick={loadAnalytics}
                  disabled={isAnalyticsLoading}
                  style={{
                    height: '65px',
                    paddingLeft: '32px',
                    paddingRight: '32px',
                    borderRadius: '56px',
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: '125%',
                    letterSpacing: '-0.2px',
                    textTransform: 'uppercase',
                  }}
                  className="bg-[#1458E6] hover:bg-[#1147bd] text-white active:scale-95 transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 border-none outline-none shadow-2xl group"
                  title="Обновить аналитику"
                >
                  <RefreshCw className={`w-5 h-5 ${isAnalyticsLoading ? 'animate-spin' : ''}`} />
                  <span>ОБНОВИТЬ</span>
                </button>
              </>
            )}

            {/* Blue Save Button: Default Blue bg & White text; On hover White bg & Black text (Hidden on Analytics tab) */}
            {activeMenu !== 'analytics' && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  width: '187px',
                  height: '65px',
                  borderRadius: '56px',
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: '125%',
                  letterSpacing: '-0.2px',
                  textTransform: 'uppercase',
                }}
                className="bg-[#1458E6] hover:bg-white text-white hover:text-black active:scale-95 transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 border-none outline-none shadow-2xl group"
                title="Нажмите для принудительного сохранения"
              >
                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : null}
                <span>СОХРАНИТЬ</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ── Modal for Secure PIN Code Change ── */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        oldPin={oldPin}
        setOldPin={setOldPin}
        newPin={newPin}
        setNewPin={setNewPin}
        confirmPin={confirmPin}
        setConfirmPin={setConfirmPin}
        pinModalError={pinModalError}
        setPinModalError={setPinModalError}
        onSave={handleSecurePinChange}
      />

      {/* ── Modal for Creating New Work Category (Developer Only, Floating Close Button) ── */}
      {isNewCategoryModalOpen && userRole === 'dev' && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
          onClick={() => setIsNewCategoryModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md select-none animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ padding: '36px 36px 32px 36px' }}
              className="w-full bg-[#141416] rounded-none shadow-2xl flex flex-col gap-5 border-none"
            >
              <div className="flex items-center justify-between w-full">
                <h3 className="text-[20px] font-bold uppercase text-white font-mono leading-tight tracking-wide">
                  НОВЫЙ РАЗДЕЛ
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                    название раздела (ru)
                  </label>
                  <input
                    type="text"
                    value={newCatTitleRu}
                    onChange={(e) => setNewCatTitleRu(e.target.value)}
                    placeholder="НАПРИМЕР: РЕКЛАМА"
                    style={{ paddingLeft: '12px', paddingRight: '12px' }}
                    className="w-full h-[40px] bg-transparent border border-[#26282C] focus:bg-white/[0.04] text-[15px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                    название раздела (en)
                  </label>
                  <div className="flex items-center w-full h-[40px] bg-transparent border border-[#26282C] focus-within:bg-white/[0.04]">
                    <input
                      type="text"
                      value={newCatTitleEn}
                      onChange={(e) => setNewCatTitleEn(e.target.value)}
                      placeholder="FOR EXAMPLE: COMMERCIALS"
                      style={{ paddingLeft: '12px', paddingRight: '12px' }}
                      className="flex-1 h-full bg-transparent text-[15px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none"
                    />
                    <TranslateButton
                      sourceText={newCatTitleRu}
                      onTranslated={(enText) => setNewCatTitleEn(enText)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E] cursor-pointer">
                    вертикальный формат (reels 9:16)
                  </label>
                  <input
                    type="checkbox"
                    checked={newCatIsVertical}
                    onChange={(e) => setNewCatIsVertical(e.target.checked)}
                    className="w-5 h-5 accent-[#1458E6] rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-0 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                  style={{
                    borderRadius: '56px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '16px',
                    fontWeight: 700,
                    lineHeight: '20px',
                    letterSpacing: '-0.16px',
                    textTransform: 'uppercase',
                  }}
                  className="bg-[#232326] hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0 border-none outline-none active:scale-95"
                >
                  ОТМЕНА
                </button>
                <button
                  type="button"
                  onClick={(e) => handleAddCategory(e)}
                  disabled={!newCatTitleRu.trim()}
                  style={{
                    borderRadius: '56px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '16px',
                    fontWeight: 700,
                    lineHeight: '20px',
                    letterSpacing: '-0.16px',
                    textTransform: 'uppercase',
                  }}
                  className="bg-[#1458E6] hover:bg-white text-white hover:text-black disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer shrink-0 border-none outline-none active:scale-95"
                >
                  СОЗДАТЬ
                </button>
              </div>
            </div>

            {/* Floating Square Close Cross Button (4px offset from modal window, matching form bg #141416) */}
            <button
              type="button"
              onClick={() => setIsNewCategoryModalOpen(false)}
              style={{
                width: '40px',
                height: '40px',
              }}
              className="absolute top-0 left-[calc(100%+4px)] bg-[#141416] hover:bg-white text-white hover:text-black flex items-center justify-center cursor-pointer transition-colors border-none outline-none shadow-2xl shrink-0"
              title="Закрыть"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modal for Adding Work to Hero Section (Borderless, Pill Buttons, Floating Square Close Button) ── */}
      {addToHeroModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setAddToHeroModalItem(null)}
        >
          <div
            className="relative w-full max-w-xl select-none animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ padding: '36px 36px 32px 36px' }}
              className="w-full bg-[#141416] rounded-none shadow-2xl flex flex-col gap-6 border-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <h3 className="text-[20px] font-bold uppercase text-white font-mono leading-tight tracking-wide">
                  ДОБАВИТЬ НА ГЛАВНУЮ В HERO
                </h3>
              </div>

              {/* Selected Work Item: Large cover, no border, no background */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full bg-transparent border-none">
                <div className="w-full sm:w-[260px] md:w-[280px] aspect-video bg-black rounded-none overflow-hidden shrink-0 border-none flex items-center justify-center">
                  {addToHeroModalItem.thumbnail_url ? (
                    isVideoMedia(addToHeroModalItem.thumbnail_url) ? (
                      <video
                        key={addToHeroModalItem.thumbnail_url}
                        src={addToHeroModalItem.thumbnail_url}
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <img
                        src={addToHeroModalItem.thumbnail_url}
                        alt={addToHeroModalItem.title_ru}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }}
                      />
                    )
                  ) : addToHeroModalItem.video_url ? (
                    <video
                      key={addToHeroModalItem.video_url}
                      src={addToHeroModalItem.video_url.includes('#t=') ? addToHeroModalItem.video_url : `${addToHeroModalItem.video_url}#t=1.8`}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#232326] flex items-center justify-center text-[12px] text-[#8C8E96] font-mono">
                      ВИДЕО
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono font-bold text-white uppercase text-[20px] leading-tight truncate">
                    {addToHeroModalItem.title_ru}
                  </span>
                  <span className="font-mono font-bold text-[#8C8E96] uppercase text-[15px] leading-tight truncate mt-1">
                    {addToHeroModalItem.title_en}
                  </span>
                </div>
              </div>

              {/* Position Selection Pills with Active Selection */}
              <div className="flex flex-wrap gap-2.5 w-full">
                {[0, 1, 2, 3, 4].map((slotIdx) => {
                  const isSelected = selectedHeroSlot === slotIdx;
                  return (
                    <button
                      key={slotIdx}
                      type="button"
                      onClick={() => setSelectedHeroSlot(slotIdx)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '56px',
                        fontFamily: '"Geist Mono", monospace',
                        fontSize: '14px',
                        fontWeight: 700,
                        lineHeight: '125%',
                        letterSpacing: '-0.16px',
                        textTransform: 'uppercase',
                      }}
                      className={`transition-all cursor-pointer border-none outline-none shrink-0 active:scale-95 ${
                        isSelected
                          ? 'bg-[#1458E6] text-white shadow-lg'
                          : 'bg-[#232326] hover:bg-[#2e2e33] text-white'
                      }`}
                    >
                      #{slotIdx + 1}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedHeroSlot(heroReels.length)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '56px',
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '14px',
                    fontWeight: 700,
                    lineHeight: '125%',
                    letterSpacing: '-0.16px',
                    textTransform: 'uppercase',
                  }}
                  className={`transition-all cursor-pointer border-none outline-none shrink-0 active:scale-95 ${
                    selectedHeroSlot === heroReels.length
                      ? 'bg-[#1458E6] text-white shadow-lg'
                      : 'bg-[#232326] hover:bg-[#2e2e33] text-white'
                  }`}
                >
                  #{heroReels.length + 1} (NEW)
                </button>
              </div>

              {/* Centered Actions: ОТМЕНА & СОХРАНИТЬ */}
              <div className="flex items-center justify-center gap-2 w-full pt-3">
                <button
                  type="button"
                  onClick={() => setAddToHeroModalItem(null)}
                  style={{
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    borderRadius: '56px',
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '-0.14px',
                    textTransform: 'uppercase',
                  }}
                  className="bg-[#232326] hover:bg-white text-white hover:text-black transition-colors cursor-pointer border-none outline-none active:scale-95"
                >
                  ОТМЕНА
                </button>

                <button
                  type="button"
                  onClick={() => handleAddWorkToHero(addToHeroModalItem, selectedHeroSlot)}
                  style={{
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    borderRadius: '56px',
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '-0.14px',
                    textTransform: 'uppercase',
                  }}
                  className="bg-[#1458E6] hover:bg-white text-white hover:text-black transition-colors cursor-pointer border-none outline-none active:scale-95 shadow-lg"
                >
                  СОХРАНИТЬ
                </button>
              </div>
            </div>

            {/* Floating Square Close Cross Button (4px offset from modal window, matching form bg #141416) */}
            <button
              type="button"
              onClick={() => setAddToHeroModalItem(null)}
              style={{
                width: '40px',
                height: '40px',
              }}
              className="absolute top-0 left-[calc(100%+4px)] bg-[#141416] hover:bg-white text-white hover:text-black flex items-center justify-center cursor-pointer transition-colors border-none outline-none shadow-2xl shrink-0"
              title="Закрыть"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* ── Custom Centered Confirmation Modal ── */}
      <AdminConfirmModal
        modal={confirmModal}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* ── Test Video Modal Player (Exact same component as on Main Page) ── */}
      <VideoModal
        isOpen={testPlayer.isOpen}
        onClose={() => setTestPlayer({ isOpen: false, title: '', videoUrl: '' })}
        title={testPlayer.title}
        videoUrl={testPlayer.videoUrl}
      />

      {/* ── Image Crop Modal for Covers & Avatars ── */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={() => setCropModal((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={cropModal.imageUrl}
        isVertical={cropModal.isVertical}
        title={cropModal.title}
        hidePills={cropModal.hidePills}
        initialAspectRatio={cropModal.initialAspectRatio}
        onApplyCrop={(url) => {
          cropModal.onApply(url);
          setCropModal((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}

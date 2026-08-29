import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create Supabase client when credentials are configured
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── 5 Hero Reels ────────────────────────────────────────────────────────────

export interface HeroReel {
  id: string;
  title_ru: string;
  title_en: string;
  width: number;
  height: number;
  thumbnail_url: string;      // Обложка / постер
  preview_video_url: string;  // 1. Мини-видео (превью), которое автоматически всегда крутится в ленте
  video_url: string;          // 2. Полноразмерный видеопоток (открывается в попапе по клику)
}

export const HERO_REELS: HeroReel[] = [
  {
    id: 'morskaya-party',
    title_ru: 'MORSKAYA PARTY',
    title_en: 'MORSKAYA PARTY',
    width: 964,
    height: 542,
    thumbnail_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=85',
    preview_video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
    video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4',
  },
  {
    id: 'runmore',
    title_ru: '#RUNMORE',
    title_en: '#RUNMORE',
    width: 556,
    height: 338,
    thumbnail_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=85',
    preview_video_url: 'https://assets.mixkit.co/videos/42289/42289-720.mp4',
    video_url: 'https://assets.mixkit.co/videos/42289/42289-720.mp4',
  },
  {
    id: 'finntrail-hr',
    title_ru: 'FINNTRAIL HR',
    title_en: 'FINNTRAIL HR',
    width: 818,
    height: 460,
    thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=85',
    preview_video_url: 'https://assets.mixkit.co/videos/42998/42998-720.mp4',
    video_url: 'https://assets.mixkit.co/videos/42998/42998-720.mp4',
  },
  {
    id: 'bar-hearts',
    title_ru: 'БАР РАЗБИТЫХ СЕРДЕЦ',
    title_en: 'BROKEN HEARTS BAR',
    width: 557,
    height: 313,
    thumbnail_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=85',
    preview_video_url: 'https://assets.mixkit.co/videos/42867/42867-720.mp4',
    video_url: 'https://assets.mixkit.co/videos/42867/42867-720.mp4',
  },
  {
    id: 'herzen-rowing',
    title_ru: 'HERZENROWING',
    title_en: 'HERZENROWING',
    width: 964,
    height: 542,
    thumbnail_url: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=1200&q=85',
    preview_video_url: 'https://assets.mixkit.co/videos/42813/42813-720.mp4',
    video_url: 'https://assets.mixkit.co/videos/42813/42813-720.mp4',
  },
];

// ─── Works Section Grouped By Categories ─────────────────────────────────────

export interface WorkItem {
  id: string;
  title_ru: string;
  title_en: string;
  thumbnail_url: string;
  video_url: string;
  isVertical?: boolean;
}

export interface WorkCategoryGroup {
  id: string;
  title_ru: string;
  title_en: string;
  isVertical?: boolean;
  items: WorkItem[];
}

export const WORK_SECTIONS: WorkCategoryGroup[] = [
  {
    id: 'image_ad',
    title_ru: 'ИМИДЖ И РЕКЛАМА',
    title_en: 'IMAGE & ADVERTISING',
    isVertical: false,
    items: [
      { id: 'ad1', title_ru: 'Finntrail AW24', title_en: 'Finntrail AW24', thumbnail_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/42998/42998-720.mp4' },
      { id: 'ad2', title_ru: 'СберСтрахование Авто', title_en: 'Sber Auto Promo', thumbnail_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/41668/41668-720.mp4' },
      { id: 'ad3', title_ru: 'ПНТ Масштаб', title_en: 'PNT Scale', thumbnail_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/41870/41870-720.mp4' },
      { id: 'ad4', title_ru: 'Бар Разбитых Сердец', title_en: 'Broken Hearts Promo', thumbnail_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/42867/42867-720.mp4' },
      { id: 'ad5', title_ru: 'KTK Energy Brand', title_en: 'KTK Energy Brand', thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/42289/42289-720.mp4' },
      { id: 'ad6', title_ru: 'Aura Perfume', title_en: 'Aura Perfume', thumbnail_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/42998/42998-720.mp4' },
      { id: 'ad7', title_ru: 'Porsche Center SPB', title_en: 'Porsche Center SPB', thumbnail_url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/41668/41668-720.mp4' },
      { id: 'ad8', title_ru: 'Finntrail Extreme', title_en: 'Finntrail Extreme', thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/42289/42289-720.mp4' },
    ],
  },
  {
    id: 'sport',
    title_ru: 'СПОРТ',
    title_en: 'SPORT',
    isVertical: false,
    items: [
      { id: 'sp1', title_ru: '#RUNMORE Marathon', title_en: '#RUNMORE Marathon', thumbnail_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/42289/42289-720.mp4' },
      { id: 'sp2', title_ru: 'HerzenRowing Team', title_en: 'HerzenRowing Team', thumbnail_url: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/42813/42813-720.mp4' },
      { id: 'sp3', title_ru: 'Crossfit Battle', title_en: 'Crossfit Battle', thumbnail_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/42289/42289-720.mp4' },
    ],
  },
  {
    id: 'reviews',
    title_ru: 'ОБЗОРЫ И ВЕДУЩИЙ',
    title_en: 'REVIEWS & HOSTING',
    isVertical: false,
    items: [
      { id: 'rev1', title_ru: 'Автообзор BMW M3', title_en: 'BMW M3 Review', thumbnail_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/41668/41668-720.mp4' },
      { id: 'rev2', title_ru: 'Гид по Санкт-Петербургу', title_en: 'Saint Petersburg Guide', thumbnail_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/41870/41870-720.mp4' },
      { id: 'rev3', title_ru: 'Технологии Будущего', title_en: 'Future Tech Show', thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/42998/42998-720.mp4' },
    ],
  },
  {
    id: 'reels_vertical',
    title_ru: 'РИЛСЫ',
    title_en: 'REELS',
    isVertical: true,
    items: [
      { id: 'r1', title_ru: 'Backstage Vibe', title_en: 'Backstage Vibe', thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80', video_url: 'https://assets.mixkit.co/videos/42998/42998-720.mp4', isVertical: true },
      { id: 'r2', title_ru: 'Speed Run Reels', title_en: 'Speed Run Reels', thumbnail_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&q=80', video_url: 'https://assets.mixkit.co/videos/42289/42289-720.mp4', isVertical: true },
      { id: 'r3', title_ru: 'Night Club Reel', title_en: 'Night Club Reel', thumbnail_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80', video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4', isVertical: true },
      { id: 'r4', title_ru: 'Urban Fashion', title_en: 'Urban Fashion', thumbnail_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80', video_url: 'https://assets.mixkit.co/videos/42998/42998-720.mp4', isVertical: true },
      { id: 'r5', title_ru: 'Cocktail Story', title_en: 'Cocktail Story', thumbnail_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80', video_url: 'https://assets.mixkit.co/videos/42867/42867-720.mp4', isVertical: true },
      { id: 'r6', title_ru: 'Rowing Passion', title_en: 'Rowing Passion', thumbnail_url: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=500&q=80', video_url: 'https://assets.mixkit.co/videos/42813/42813-720.mp4', isVertical: true },
    ],
  },
  {
    id: 'events_forums',
    title_ru: 'EVENTS ФОРУМЫ',
    title_en: 'EVENTS & FORUMS',
    isVertical: false,
    items: [
      { id: 'ev1', title_ru: 'ПМЭФ Главная Сцена', title_en: 'SPIEF Main Stage', thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/41982/41982-720.mp4' },
      { id: 'ev2', title_ru: 'KTK Annual Gala', title_en: 'KTK Annual Gala', thumbnail_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4' },
      { id: 'ev3', title_ru: 'Tech Forum SPB', title_en: 'Tech Forum SPB', thumbnail_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/41982/41982-720.mp4' },
      { id: 'ev4', title_ru: 'Конференция Лидеров', title_en: 'Leaders Conference', thumbnail_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/41870/41870-720.mp4' },
      { id: 'ev5', title_ru: 'Afterparty Forum', title_en: 'Afterparty Forum', thumbnail_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', video_url: 'https://assets.mixkit.co/videos/43485/43485-720.mp4' },
    ],
  },
];

// ─── Clients & Logos ─────────────────────────────────────────────────────────

export interface ClientItem {
  id: string;
  name_ru: string;
  name_en: string;
  logo_url?: string;
  color?: string;
}

export const DEFAULT_CLIENTS: ClientItem[] = [
  { id: 'c1', name_ru: 'Петербургский нефтяной терминал (ПНТ)', name_en: 'Petersburg Oil Terminal (PNT)', logo_url: '', color: '#FFFFFF' },
  { id: 'c2', name_ru: 'FINNTRAIL', name_en: 'FINNTRAIL', logo_url: '', color: '#FFFFFF' },
  { id: 'c3', name_ru: 'СБЕРСТРАХОВАНИЕ', name_en: 'SBERINSURANCE', logo_url: '', color: '#FFFFFF' },
  { id: 'c4', name_ru: 'ПМЭФ (Форум)', name_en: 'SPIEF', logo_url: '', color: '#B89758' },
  { id: 'c5', name_ru: 'КТК (Каспийский трубопровод)', name_en: 'KTK', logo_url: '', color: '#001435' },
];

// ─── Site Settings ───────────────────────────────────────────────────────────

export interface SiteSettings {
  telegram: string;
  email: string;
  vk: string;
  phone: string;
  adminPin: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  telegram: 'https://t.me/',
  email: 'vlad@sapunov.ru',
  vk: 'https://vk.com/',
  phone: '+7 (999) 000-00-00',
  adminPin: '2026',
};


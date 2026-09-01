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
  hidden?: boolean;           // Скрыть ролик с сайта
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
  hidden?: boolean;
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
  video_url?: string;
  color?: string;
  hide_logo?: boolean;
  hidden?: boolean;
}

export const DEFAULT_CLIENTS: ClientItem[] = [
  { id: 'c1', name_ru: 'Петербургский нефтяной терминал', name_en: 'Petersburg Oil Terminal', logo_url: '', video_url: 'https://assets.mixkit.co/videos/41870/41870-720.mp4', color: '#FFFFFF' },
  { id: 'c2', name_ru: 'FINNTRAIL', name_en: 'FINNTRAIL', logo_url: '', video_url: 'https://assets.mixkit.co/videos/42998/42998-720.mp4', color: '#FFFFFF' },
  { id: 'c3', name_ru: 'СБЕРСТРАХОВАНИЕ', name_en: 'SBERINSURANCE', logo_url: '', video_url: 'https://assets.mixkit.co/videos/41668/41668-720.mp4', color: '#FFFFFF' },
  { id: 'c4', name_ru: 'ПМЭФ (Форум)', name_en: 'SPIEF', logo_url: '', video_url: 'https://assets.mixkit.co/videos/41982/41982-720.mp4', color: '#B89758' },
  { id: 'c5', name_ru: 'КТК (Каспийский трубопровод)', name_en: 'KTK', logo_url: '', video_url: 'https://assets.mixkit.co/videos/42289/42289-720.mp4', color: '#001435' },
];

// ─── Admin Users & Editors ──────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  login: string;
  name: string;
  role: 'dev' | 'editor';
  pin: string;
  avatar_url?: string;
}

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'user_alevtina',
    login: 'alevtina',
    name: 'АЛЕВТИНА',
    role: 'dev',
    pin: 'alevtina',
    avatar_url: '',
  },
  {
    id: 'user_vlad',
    login: 'vlad',
    name: 'ВЛАД САПУНОВ',
    role: 'editor',
    pin: '2026',
    avatar_url: '',
  },
];

// ─── Site Settings ───────────────────────────────────────────────────────────

export interface SiteSettings {
  telegram: string;
  behance?: string;
  youtube?: string;
  instagram?: string;
  email: string;
  vk?: string;
  phone: string;
  adminPin: string;
  contacts_title_ru?: string;
  contacts_title_en?: string;
  contact_button_url?: string;
  admin_users?: AdminUser[];
  /** List of section IDs to hide: 'about' | 'faq' | 'clients' | 'services' | 'works' | 'contacts' */
  hidden_sections?: string[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  telegram: 'https://t.me/sapunov_vlad',
  behance: 'https://behance.net/vladsapunov',
  youtube: 'https://youtube.com/@vladsapunov',
  instagram: 'https://instagram.com/sapunov_vlad',
  email: 'ELECTICRATE@GMAIL.COM',
  vk: '',
  phone: '+7(950)016-17-51',
  adminPin: '2026',
  contacts_title_ru: 'ЕСТЬ ИДЕЯ? НАПИШИ МНЕ\nПРЯМО СЕЙЧАС',
  contacts_title_en: 'GOT AN IDEA? WRITE TO ME\nRIGHT NOW',
  contact_button_url: 'https://t.me/sapunov_vlad',
  admin_users: DEFAULT_ADMIN_USERS,
  hidden_sections: ['about'],
};

export function formatExternalUrl(url?: string, defaultFallback: string = ''): string {
  if (!url) return defaultFallback;
  let clean = url.trim();
  if (!clean) return defaultFallback;

  // Fix Telegram link formatting if '@' is in the URL path (which makes telegram.org reject it)
  if (clean.startsWith('@')) {
    return `https://t.me/${clean.slice(1)}`;
  }
  if (clean.includes('t.me/@')) {
    clean = clean.replace('t.me/@', 't.me/');
  }
  if (clean.includes('telegram.me/@')) {
    clean = clean.replace('telegram.me/@', 't.me/');
  }

  // Ensure protocol exists
  if (!/^https?:\/\//i.test(clean) && !/^mailto:/i.test(clean) && !/^tel:/i.test(clean)) {
    clean = `https://${clean}`;
  }

  return clean;
}

// ─── FAQ Items ───────────────────────────────────────────────────────────────

export interface FaqItem {
  id: string;
  question_ru: string;
  question_en: string;
  answer_left_ru: string;
  answer_left_en: string;
  answer_right_ru: string;
  answer_right_en: string;
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq1',
    question_ru: 'сколько стоит съёмка или монтаж?',
    question_en: 'how much does shooting or editing cost?',
    answer_left_ru: 'СНИМАЮ НА SONY G-MASTER С КИНО-СВЕТОМ.',
    answer_left_en: 'SHOOTING ON SONY G-MASTER WITH CINEMA LIGHTING.',
    answer_right_ru: 'КАРТИНКА ВЫГЛЯДИТ ДОРОГО — ХОТЬ В СТУДИИ, ХОТЬ В РЕПОРТАЖЕ, ХОТЬ В ГРЯЗИ ПО КОЛЕНО.',
    answer_right_en: 'THE PICTURE LOOKS EXPENSIVE — IN THE STUDIO, IN REPORTAGE, OR IN KNEE-DEEP MUD.',
  },
  {
    id: 'faq2',
    question_ru: 'в каких городах работаете?',
    question_en: 'which cities do you work in?',
    answer_left_ru: 'БАЗИРУЮСЬ В САНКТ-ПЕТЕРБУРГЕ И МОСКВЕ.',
    answer_left_en: 'BASED IN ST. PETERSBURG AND MOSCOW.',
    answer_right_ru: 'ВЫЕЗЖАЮ НА ПРОЕКТЫ ПО ВСЕЙ РОССИИ И МИРУ С ПОЛНЫМ КОМПЛЕКТОМ ОБОРУДОВАНИЯ.',
    answer_right_en: 'TRAVELING FOR PROJECTS ACROSS RUSSIA AND WORLDWIDE WITH FULL GEAR.',
  },
  {
    id: 'faq3',
    question_ru: 'сколько времени занимает монтаж?',
    question_en: 'how long does editing take?',
    answer_left_ru: 'ОТ 3 ДО 10 РАБОЧИХ ДНЕЙ.',
    answer_left_en: 'FROM 3 TO 10 BUSINESS DAYS.',
    answer_right_ru: 'СРОКИ ЗАВИСЯТ ОТ МАСШТАБА: РИЛСЫ — 24 ЧАСА, ПОЛНОЦЕННЫЕ РОЛИКИ И РЕКЛАМА — ПО СОГЛАСОВАННОМУ ГРАФИКУ.',
    answer_right_en: 'TIMELINES DEPEND ON SCOPE: REELS IN 24H, FULL PROMO AND COMMERCIALS ON AGREED SCHEDULE.',
  },
  {
    id: 'faq4',
    question_ru: 'работаете с частными лицами или только с компаниями?',
    question_en: 'do you work with individuals or only companies?',
    answer_left_ru: 'РАБОТАЮ КАК С ЮРЛИЦАМИ, ТАК И С ЧАСТНЫМИ КЛИЕНТАМИ.',
    answer_left_en: 'WORKING WITH BOTH CORPORATE AND PRIVATE CLIENTS.',
    answer_right_ru: 'ОФОРМЛЕНИЕ ПО ДОГОВОРУ, ОПЛАТА ПО БЕЗНАЛИЧНОМУ РАСЧЕТУ ИЛИ САМОЗАНЯТОСТИ С ЧЕКОМ.',
    answer_right_en: 'OFFICIAL CONTRACTS, INVOICE PAYMENTS OR SELF-EMPLOYED RECEIPTS.',
  },
  {
    id: 'faq5',
    question_ru: 'можете взять большой проект с командой?',
    question_en: 'can you take on a large project with a team?',
    answer_left_ru: 'ПОЛНЫЙ ПРОДАКШН ПОД КЛЮЧ.',
    answer_left_en: 'FULL TURNKEY PRODUCTION.',
    answer_right_ru: 'СОБИРАЮ КОМАНДУ: ВТОРОЙ ОПЕРАТОР, ЗВУКОРЕЖИССЕР, ОСВЕТИТЕЛИ, ГРИМЕР И АССИСТЕНТЫ.',
    answer_right_en: 'ASSEMBLING TEAMS: SECOND CAMERA, SOUND ENGINEER, GAFFERS, MAKEUP AND ASSISTANTS.',
  },
  {
    id: 'faq6',
    question_ru: 'как происходит оплата?',
    question_en: 'how does payment work?',
    answer_left_ru: 'ПРЕДОПЛАТА 50% ПЕРЕД СЪЕМКАМИ.',
    answer_left_en: '50% DEPOSIT BEFORE PRODUCTION.',
    answer_right_ru: 'ОСТАЛЬНЫЕ 50% ПОСЛЕ ПРИЕМКИ ФИНАЛЬНОГО МОНТАЖА И ЦВЕТОКОРРЕКЦИИ.',
    answer_right_en: 'REMAINING 50% UPON FINAL EDIT APPROVAL AND COLOR GRADING.',
  },
  {
    id: 'faq7',
    question_ru: 'остаётся ли исходный материал у меня?',
    question_en: 'do i get the raw footage?',
    answer_left_ru: 'ДА, ВСЕ ИСХОДНИКИ ПЕРЕДАЮТСЯ ПО ЗАПРОСУ.',
    answer_left_en: 'YES, ALL RAW FOOTAGE IS DELIVERED UPON REQUEST.',
    answer_right_ru: 'ОТПРАВЛЯЮ В ОБЛАКО ИЛИ ПЕРЕДАЮ НА ВАШЕМ ЖЕСТКОМ ДИСКЕ В МАКСИМАЛЬНОМ КАЧЕСТВЕ.',
    answer_right_en: 'UPLOADED TO CLOUD STORAGE OR TRANSFERRED ON YOUR HARD DRIVE IN MAXIMUM QUALITY.',
  },
];

// ─── Services / Process Section Content ──────────────────────────────────────

export interface ServiceCard {
  id: string;
  top_text_ru: string;
  top_text_en: string;
  title_ru: string;
  title_en: string;
  bottom_text_ru: string;
  bottom_text_en: string;
  bg_color: string;
  text_color: string;
}

export interface ServicesContent {
  headline_ru: string;
  headline_en: string;
  cards: ServiceCard[];
}

export const DEFAULT_SERVICES: ServicesContent = {
  headline_ru: 'КАРТИНКА УРОВНЯ КИНО:\nОТ ИДЕИ ДО РЕЛИЗА',
  headline_en: 'CINEMATIC QUALITY:\nFROM IDEA TO RELEASE',
  cards: [
    {
      id: 'card1',
      top_text_ru: 'снимаю на sony g-master\nс кино-светом.',
      top_text_en: 'shooting on sony g-master\nwith cinema lighting.',
      title_ru: 'СЪЕМКА',
      title_en: 'SHOOTING',
      bottom_text_ru: 'картинка выглядит дорого —\nхоть в студии, хоть в репортаже,\nхоть в грязи по колено.',
      bottom_text_en: 'looks premium everywhere —\nstudio, reportage,\nor knee-deep in mud.',
      bg_color: '#1458E6',
      text_color: '#FFFFFF',
    },
    {
      id: 'card2',
      top_text_ru: 'монтирую и крашу в davinci.',
      top_text_en: 'editing & grading in davinci.',
      title_ru: 'МОНТАЖ И\nЦВЕТ',
      title_en: 'EDITING &\nCOLOR',
      bottom_text_ru: 'авторская цветокоррекция — то,\nчто отличает «снято на телефон»\nот «снято как кино».',
      bottom_text_en: 'signature color grading —\nwhat separates phone videos\nfrom cinematic art.',
      bg_color: '#FFFFFF',
      text_color: '#1458E6',
    },
    {
      id: 'card3',
      top_text_ru: 'от идеи до мастеринга\nведу сам',
      top_text_en: 'from idea to mastering\nled personally',
      title_ru: 'ПОЛНЫЙ\nЦИКЛ ПОД КЛЮЧ',
      title_en: 'FULL CYCLE\nTURNKEY',
      bottom_text_ru: 'без испорченного телефона между\nоператором, монтажёром и колористом.',
      bottom_text_en: 'seamless workflow without lost in translation\nbetween camera, editor, and colorist.',
      bg_color: '#1E1E22',
      text_color: '#FFFFFF',
    },
    {
      id: 'card4',
      top_text_ru: 'для больших проектов\nпривлекаю проверенных\nпрофи',
      top_text_en: 'for large-scale projects\nbringing trusted\npros',
      title_ru: 'КОМАНДА',
      title_en: 'TEAM',
      bottom_text_ru: 'вы общаетесь только со мной,\nа я ручаюсь за результат всей команды.',
      bottom_text_en: 'you only communicate with me,\nand i vouch for the team result.',
      bg_color: '#1458E6',
      text_color: '#FFFFFF',
    },
  ],
};

// ─── About Section Content ───────────────────────────────────────────────────

export const DEFAULT_SHOOTING_PHOTOS = [
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=85',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=85',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=85',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=85',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=85',
];

export interface AboutContent {
  photo_url: string;
  shooting_photos?: string[];
  top_text_ru: string;
  top_text_en: string;
  bottom_text_ru: string;
  bottom_text_en: string;
}

export const DEFAULT_ABOUT: AboutContent = {
  photo_url: '/vlad-portrait.jpg',
  shooting_photos: DEFAULT_SHOOTING_PHOTOS,
  top_text_ru: 'Я —\nВИДЕОМЕЙКЕР\nИЗ\nПЕТЕРБУРГА.\nВ ЭТОЙ\nСФЕРЕ\nБОЛЬШЕ 10\nЛЕТ.',
  top_text_en: 'I AM A\nFILMMAKER\nFROM\nST. PETERSBURG.\nIN THIS\nINDUSTRY\nOVER 10\nYEARS.',
  bottom_text_ru: 'РАБОТАЮ\nВ РАЗНЫХ\nСФЕРАХ :\nПРОМЫШЛЕННОСТЬ,\nЮРИСТЫ,\nНЕДВИЖИМОСТЬ,\nHORECA, СПОРТ.',
  bottom_text_en: 'WORKING\nACROSS\nINDUSTRIES :\nINDUSTRIAL,\nLEGAL,\nREAL ESTATE,\nHORECA, SPORT.',
};



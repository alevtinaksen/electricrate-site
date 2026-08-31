// Intelligent Russian-to-English Auto-translation & Transliteration

const DICTIONARY: Record<string, string> = {
  'имидж и реклама': 'IMAGE & ADVERTISING',
  'музыкальные клипы': 'MUSIC VIDEOS',
  'клипы': 'MUSIC VIDEOS',
  'реклама': 'ADVERTISING',
  'имидж': 'IMAGE',
  'бэкстейдж': 'BACKSTAGE',
  'документальные': 'DOCUMENTARY',
  'шоурил': 'SHOWREEL',
  'промо': 'PROMO',
  'производство': 'PRODUCTION',
  'съемка': 'SHOOTING',
  'монтаж': 'EDITING',
  'графика': 'MOTION DESIGN',
  'цвет': 'COLOR GRADING',
  'звук': 'SOUND DESIGN',
  'бар разбитых сердец': 'BROKEN HEARTS BAR',
  'сбер': 'SBER',
  'авто': 'AUTO',
  'масштаб': 'SCALE',
  'новый проект': 'NEW PROJECT',
  'новый ролик': 'NEW REEL',
  'все работы': 'ALL WORKS',
  'услуги': 'SERVICES',
  'о нас': 'ABOUT',
  'клиенты': 'CLIENTS',
  'контакты': 'CONTACTS',
};

const RU_EN_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'E', Ж: 'ZH',
  З: 'Z', И: 'I', Й: 'Y', К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O',
  П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U', Ф: 'F', Х: 'KH', Ц: 'TS',
  Ч: 'CH', Ш: 'SH', Щ: 'SHCH', Ъ: '', Ы: 'Y', Ь: '', Э: 'E', Ю: 'YU', Я: 'YA',
};

export const autoTranslateRuToEn = (ruText: string): string => {
  if (!ruText) return '';
  const trimmed = ruText.trim().toLowerCase();

  // 1. Direct dictionary match
  if (DICTIONARY[trimmed]) {
    return DICTIONARY[trimmed];
  }

  // 2. Transliteration mapping (Standard GOST / International ISO 9)
  return ruText
    .split('')
    .map((c) => (RU_EN_MAP[c] !== undefined ? RU_EN_MAP[c] : c))
    .join('')
    .toUpperCase();
};

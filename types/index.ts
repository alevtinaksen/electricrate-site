// Types for the videographer portfolio

export interface Video {
  id: string;
  title_ru: string;
  title_en: string;
  client_ru: string;
  client_en: string;
  category: 'corporate' | 'clip' | 'ad' | 'event';
  thumbnail_url: string;
  video_url: string | null;
  order_index: number;
  is_reel: boolean; // shown in hero reel section
  created_at: string;
}

export interface Client {
  id: string;
  name_ru: string;
  name_en: string;
  logo_url: string | null;
  order_index: number;
}

export type Language = 'ru' | 'en';

export type WorkCategory = 'all' | 'corporate' | 'clip' | 'ad' | 'event';

export const CATEGORY_LABELS: Record<WorkCategory, { ru: string; en: string }> = {
  all: { ru: 'Все', en: 'All' },
  corporate: { ru: 'Корп', en: 'Corp' },
  clip: { ru: 'Клипы', en: 'Clips' },
  ad: { ru: 'Реклама', en: 'Ads' },
  event: { ru: 'События', en: 'Events' },
};

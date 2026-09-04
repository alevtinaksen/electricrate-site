import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
  ClientItem,
  SiteSettings,
  FaqItem,
  ServicesContent,
  AboutContent,
} from '@/lib/supabase';

interface StoredContentData {
  heroReels?: HeroReel[];
  workSections?: WorkCategoryGroup[];
  clients?: ClientItem[];
  settings?: SiteSettings;
  faqs?: FaqItem[];
  services?: ServicesContent;
  about?: AboutContent;
  updatedAt?: string;
}

// Default content used when database is empty or unavailable
const DEFAULT_CONTENT: StoredContentData = {
  heroReels: HERO_REELS,
  workSections: WORK_SECTIONS,
  clients: DEFAULT_CLIENTS,
  settings: DEFAULT_SETTINGS,
  faqs: DEFAULT_FAQS,
  services: DEFAULT_SERVICES,
  about: DEFAULT_ABOUT,
};

// In-memory cache to reduce DB reads (refreshed on each POST)
let contentCache: StoredContentData | null = null;

async function readContent(): Promise<StoredContentData> {
  if (contentCache) return contentCache;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('data')
        .eq('id', 'main')
        .single();

      if (!error && data?.data) {
        contentCache = data.data as StoredContentData;
        return contentCache;
      }
    } catch (err) {
      console.error('Supabase read error:', err);
    }
  }

  return DEFAULT_CONTENT;
}

async function writeContent(content: StoredContentData): Promise<boolean> {
  contentCache = content;

  if (supabase) {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          id: 'main',
          data: content,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Supabase write error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase write exception:', err);
      return false;
    }
  }

  console.warn('Supabase not configured — content saved only in memory (will be lost on restart)');
  return true;
}

export async function GET() {
  const content = await readContent();
  return NextResponse.json(content, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const current = await readContent();
    const { heroReels, workSections, clients, settings, faqs, services, about } = body;

    const toSave: StoredContentData = {
      heroReels: Array.isArray(heroReels) ? heroReels : current.heroReels,
      workSections: Array.isArray(workSections) ? workSections : current.workSections,
      clients: Array.isArray(clients) ? clients : current.clients,
      settings: settings && typeof settings === 'object' ? settings : current.settings,
      faqs: Array.isArray(faqs) ? faqs : current.faqs,
      services: services && typeof services === 'object' ? services : current.services,
      about: about && typeof about === 'object' ? about : current.about,
      updatedAt: new Date().toISOString(),
    };

    const success = await writeContent(toSave);

    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to save to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: toSave });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

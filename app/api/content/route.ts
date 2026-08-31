import { NextRequest, NextResponse } from 'next/server';
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
import { promises as fs } from 'fs';
import path from 'path';

// File path for persistent content storage
const dataDir = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'content.json');

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

// In-memory fallback if filesystem is read-only
let memoryStore: StoredContentData = {
  heroReels: HERO_REELS,
  workSections: WORK_SECTIONS,
  clients: DEFAULT_CLIENTS,
  settings: DEFAULT_SETTINGS,
  faqs: DEFAULT_FAQS,
  services: DEFAULT_SERVICES,
  about: DEFAULT_ABOUT,
};

async function readStoredContent(): Promise<StoredContentData> {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    const parsed: StoredContentData = JSON.parse(data);
    if (Array.isArray(parsed.heroReels)) memoryStore.heroReels = parsed.heroReels;
    if (Array.isArray(parsed.workSections)) memoryStore.workSections = parsed.workSections;
    if (Array.isArray(parsed.clients)) memoryStore.clients = parsed.clients;
    if (parsed.settings && typeof parsed.settings === 'object') memoryStore.settings = parsed.settings;
    if (Array.isArray(parsed.faqs)) memoryStore.faqs = parsed.faqs;
    if (parsed.services && typeof parsed.services === 'object') memoryStore.services = parsed.services;
    if (parsed.about && typeof parsed.about === 'object') memoryStore.about = parsed.about;
    return parsed;
  } catch {
    return memoryStore;
  }
}

async function writeStoredContent(content: StoredContentData): Promise<void> {
  memoryStore = { ...memoryStore, ...content };
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(content, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write to local filesystem, using in-memory store:', err);
  }
}

export async function GET() {
  const content = await readStoredContent();
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

    const { heroReels, workSections, clients, settings, faqs, services, about } = body;

    const toSave: StoredContentData = {
      heroReels: Array.isArray(heroReels) ? heroReels : memoryStore.heroReels,
      workSections: Array.isArray(workSections) ? workSections : memoryStore.workSections,
      clients: Array.isArray(clients) ? clients : memoryStore.clients,
      settings: settings && typeof settings === 'object' ? settings : memoryStore.settings,
      faqs: Array.isArray(faqs) ? faqs : memoryStore.faqs,
      services: services && typeof services === 'object' ? services : memoryStore.services,
      about: about && typeof about === 'object' ? about : memoryStore.about,
      updatedAt: new Date().toISOString(),
    };

    await writeStoredContent(toSave);

    return NextResponse.json({ success: true, data: toSave });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

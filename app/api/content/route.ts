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

// In-memory fallback if filesystem is read-only
let memoryStore = {
  heroReels: HERO_REELS,
  workSections: WORK_SECTIONS,
  clients: DEFAULT_CLIENTS,
  settings: DEFAULT_SETTINGS,
  faqs: DEFAULT_FAQS,
  services: DEFAULT_SERVICES,
  about: DEFAULT_ABOUT,
};

async function readStoredContent() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    const parsed = JSON.parse(data);
    if (parsed.heroReels) memoryStore.heroReels = parsed.heroReels;
    if (parsed.workSections) memoryStore.workSections = parsed.workSections;
    if (parsed.clients) memoryStore.clients = parsed.clients;
    if (parsed.settings) memoryStore.settings = parsed.settings;
    if (parsed.faqs) memoryStore.faqs = parsed.faqs;
    if (parsed.services) memoryStore.services = parsed.services;
    if (parsed.about) memoryStore.about = parsed.about;
    return parsed;
  } catch {
    return memoryStore;
  }
}

async function writeStoredContent(content: any) {
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
    const { heroReels, workSections, clients, settings, faqs, services, about } = body;

    const toSave = {
      heroReels: heroReels || memoryStore.heroReels,
      workSections: workSections || memoryStore.workSections,
      clients: clients || memoryStore.clients,
      settings: settings || memoryStore.settings,
      faqs: faqs || memoryStore.faqs,
      services: services || memoryStore.services,
      about: about || memoryStore.about,
      updatedAt: new Date().toISOString(),
    };

    await writeStoredContent(toSave);

    return NextResponse.json({ success: true, data: toSave });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

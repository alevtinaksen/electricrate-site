import { NextRequest, NextResponse } from 'next/server';
import { supabase, HERO_REELS, WORK_SECTIONS } from '@/lib/supabase';
import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'content.json');

// Server memory store
let memoryStore: { heroReels: any[]; workSections: any[]; updatedAt?: string } = {
  heroReels: HERO_REELS,
  workSections: WORK_SECTIONS,
};

async function getStoredContent() {
  // 1. If Supabase is connected, fetch from Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('portfolio_content')
        .select('*')
        .eq('id', 'main')
        .single();

      if (!error && data?.content) {
        return data.content;
      }
    } catch (e) {
      console.warn('Supabase read error:', e);
    }
  }

  // 2. Read from local file
  try {
    const fileData = await fs.readFile(dataFilePath, 'utf8');
    const parsed = JSON.parse(fileData);
    if (parsed.heroReels) memoryStore.heroReels = parsed.heroReels;
    if (parsed.workSections) memoryStore.workSections = parsed.workSections;
    return parsed;
  } catch {
    return memoryStore;
  }
}

async function saveStoredContent(content: any) {
  memoryStore = { ...memoryStore, ...content };

  // 1. If Supabase is connected, save to Supabase
  if (supabase) {
    try {
      await supabase.from('portfolio_content').upsert({
        id: 'main',
        content,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase upsert error:', e);
    }
  }

  // 2. Save to local disk (when running locally)
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(content, null, 2), 'utf8');
  } catch (err) {
    // Expected in Vercel serverless read-only runtime
  }
}

export async function GET() {
  const content = await getStoredContent();
  return NextResponse.json(content, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { heroReels, workSections } = body;

    const toSave = {
      heroReels: heroReels || memoryStore.heroReels,
      workSections: workSections || memoryStore.workSections,
      updatedAt: new Date().toISOString(),
    };

    await saveStoredContent(toSave);

    return NextResponse.json({ success: true, data: toSave });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ошибка сохранения' }, { status: 500 });
  }
}

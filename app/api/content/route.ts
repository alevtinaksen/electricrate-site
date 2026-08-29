import { NextRequest, NextResponse } from 'next/server';
import { HERO_REELS, WORK_SECTIONS } from '@/lib/supabase';
import { promises as fs } from 'fs';
import path from 'path';

// File path for persistent content storage
const dataDir = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'content.json');

// In-memory fallback if filesystem is read-only (e.g. serverless runtime memory)
let memoryStore = {
  heroReels: HERO_REELS,
  workSections: WORK_SECTIONS,
};

async function readStoredContent() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    const parsed = JSON.parse(data);
    if (parsed.heroReels) memoryStore.heroReels = parsed.heroReels;
    if (parsed.workSections) memoryStore.workSections = parsed.workSections;
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
    console.warn('Could not write to local filesystem (likely Vercel read-only runtime), using in-memory store:', err);
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
    const { heroReels, workSections } = body;

    const toSave = {
      heroReels: heroReels || memoryStore.heroReels,
      workSections: workSections || memoryStore.workSections,
      updatedAt: new Date().toISOString(),
    };

    await writeStoredContent(toSave);

    return NextResponse.json({ success: true, data: toSave });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ошибка сохранения' }, { status: 500 });
  }
}

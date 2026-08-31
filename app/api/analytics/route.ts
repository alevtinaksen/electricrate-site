import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'analytics.json');

interface AnalyticsData {
  totalViews: number;
  totalContactClicks: number;
  videoViews: Record<string, { title: string; count: number; lastViewedAt: string }>;
  contactClicks: Record<string, { title: string; count: number; lastClickedAt: string }>;
  dailyViews: Record<string, number>;
  dailyClicks: Record<string, number>;
}

const DEFAULT_ANALYTICS: AnalyticsData = {
  totalViews: 0,
  totalContactClicks: 0,
  videoViews: {},
  contactClicks: {},
  dailyViews: {},
  dailyClicks: {},
};

function readAnalytics(): AnalyticsData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ANALYTICS,
        ...parsed,
        contactClicks: parsed.contactClicks || {},
        totalContactClicks: parsed.totalContactClicks || 0,
      };
    }
  } catch (e) {
    console.error('Error reading analytics.json:', e);
  }
  return DEFAULT_ANALYTICS;
}

function writeAnalytics(data: AnalyticsData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing analytics.json:', e);
  }
}

export async function GET() {
  const data = readAnalytics();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoTitle, contactName, action } = body;

    const data = readAnalytics();

    if (action === 'reset') {
      const resetData: AnalyticsData = {
        totalViews: 0,
        totalContactClicks: 0,
        videoViews: {},
        contactClicks: {},
        dailyViews: {},
        dailyClicks: {},
      };
      writeAnalytics(resetData);
      return NextResponse.json({ success: true, data: resetData });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // 1. Track Contact Button Click
    if (contactName || action === 'contact_click') {
      const key = (contactName || 'СВЯЗАТЬСЯ').trim();
      data.totalContactClicks = (data.totalContactClicks || 0) + 1;
      data.dailyClicks = data.dailyClicks || {};
      data.dailyClicks[today] = (data.dailyClicks[today] || 0) + 1;

      data.contactClicks = data.contactClicks || {};
      if (!data.contactClicks[key]) {
        data.contactClicks[key] = {
          title: key,
          count: 1,
          lastClickedAt: now,
        };
      } else {
        data.contactClicks[key].count += 1;
        data.contactClicks[key].lastClickedAt = now;
      }

      writeAnalytics(data);
      return NextResponse.json({ success: true, data });
    }

    // 2. Track Video View
    if (videoTitle) {
      const rawTitle = String(videoTitle).trim();
      const normalizedKey = rawTitle.toUpperCase();

      data.totalViews = (data.totalViews || 0) + 1;
      data.dailyViews = data.dailyViews || {};
      data.dailyViews[today] = (data.dailyViews[today] || 0) + 1;

      data.videoViews = data.videoViews || {};
      
      // Find existing entry either by normalized key or existing case
      const existingKey = Object.keys(data.videoViews).find(
        (k) => k.toUpperCase() === normalizedKey
      );

      const targetKey = existingKey || normalizedKey;

      if (!data.videoViews[targetKey]) {
        data.videoViews[targetKey] = {
          title: rawTitle.toUpperCase(),
          count: 1,
          lastViewedAt: now,
        };
      } else {
        data.videoViews[targetKey].count += 1;
        data.videoViews[targetKey].lastViewedAt = now;
      }

      writeAnalytics(data);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'videoTitle or contactName required' }, { status: 400 });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Failed to track event';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

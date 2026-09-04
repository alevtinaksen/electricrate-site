import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

// In-memory cache
let analyticsCache: AnalyticsData | null = null;

async function readAnalytics(): Promise<AnalyticsData> {
  if (analyticsCache) return analyticsCache;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_analytics')
        .select('data')
        .eq('id', 'main')
        .single();

      if (!error && data?.data) {
        analyticsCache = {
          ...DEFAULT_ANALYTICS,
          ...(data.data as AnalyticsData),
        };
        return analyticsCache;
      }
    } catch (err) {
      console.error('Supabase analytics read error:', err);
    }
  }

  return DEFAULT_ANALYTICS;
}

async function writeAnalytics(analytics: AnalyticsData): Promise<boolean> {
  analyticsCache = analytics;

  if (supabase) {
    try {
      const { error } = await supabase
        .from('site_analytics')
        .upsert({
          id: 'main',
          data: analytics,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Supabase analytics write error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase analytics write exception:', err);
      return false;
    }
  }

  console.warn('Supabase not configured — analytics saved only in memory');
  return true;
}

export async function GET() {
  const data = await readAnalytics();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoTitle, contactName, action } = body;

    const data = await readAnalytics();

    if (action === 'reset') {
      const resetData: AnalyticsData = { ...DEFAULT_ANALYTICS };
      await writeAnalytics(resetData);
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

      await writeAnalytics(data);
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

      await writeAnalytics(data);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'videoTitle or contactName required' }, { status: 400 });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Failed to track event';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

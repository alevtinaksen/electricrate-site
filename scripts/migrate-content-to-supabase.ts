/**
 * Migration script: Load existing data/content.json and data/analytics.json
 * into Supabase PostgreSQL tables (site_content, site_analytics).
 *
 * Usage: npx tsx scripts/migrate-content-to-supabase.ts
 *
 * Prerequisites:
 * - Supabase tables site_content and site_analytics must exist
 * - .env.local must have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local manually (avoid dotenv dependency)
try {
  const envContent = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('🚀 Starting migration to Supabase PostgreSQL...\n');

  // 1. Migrate content.json
  const contentPath = join(process.cwd(), 'data', 'content.json');
  try {
    const contentRaw = readFileSync(contentPath, 'utf-8');
    const contentData = JSON.parse(contentRaw);
    console.log(`📄 Read content.json (${(contentRaw.length / 1024).toFixed(1)} KB)`);

    const { error } = await supabase
      .from('site_content')
      .upsert({
        id: 'main',
        data: contentData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to migrate content:', error.message);
    } else {
      console.log('✅ Content migrated successfully to site_content table');
    }
  } catch (err) {
    console.warn('⚠️  No content.json found or error reading it:', err);
  }

  // 2. Migrate analytics.json
  const analyticsPath = join(process.cwd(), 'data', 'analytics.json');
  try {
    const analyticsRaw = readFileSync(analyticsPath, 'utf-8');
    const analyticsData = JSON.parse(analyticsRaw);
    console.log(`📊 Read analytics.json (${(analyticsRaw.length / 1024).toFixed(1)} KB)`);

    const { error } = await supabase
      .from('site_analytics')
      .upsert({
        id: 'main',
        data: analyticsData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to migrate analytics:', error.message);
    } else {
      console.log('✅ Analytics migrated successfully to site_analytics table');
    }
  } catch (err) {
    console.warn('⚠️  No analytics.json found or error reading it:', err);
  }

  console.log('\n🎉 Migration complete!');
}

migrate().catch(console.error);

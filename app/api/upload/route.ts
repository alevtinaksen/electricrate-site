import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const maxDuration = 60; // Vercel Hobby plan limit (60s max)

// Find ffmpeg binary path
const getFfmpegPath = async (): Promise<string | null> => {
  const possiblePaths = [
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/usr/bin/ffmpeg',
    'ffmpeg',
  ];

  for (const p of possiblePaths) {
    try {
      await execAsync(`${p} -version`);
      return p;
    } catch {}
  }
  return null;
};

export async function POST(req: NextRequest) {
  let rawTempPath = '';
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    // ── Strict file type validation (whitelist only) ──
    const ALLOWED_EXTENSIONS = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    const ALLOWED_MIME_PREFIXES = ['video/', 'image/'];

    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(fileExt);
    const isAllowedMime = ALLOWED_MIME_PREFIXES.some(prefix => file.type.startsWith(prefix));

    if (!isAllowedExt || !isAllowedMime) {
      return NextResponse.json(
        { error: `Недопустимый тип файла: .${fileExt} (${file.type}). Разрешены только изображения и видео.` },
        { status: 400 }
      );
    }

    const originalSize = file.size;
    const isVideo =
      file.type.startsWith('video/') ||
      /\.(mp4|mov|webm|avi|mkv|m4v|prores|wmv|flv)$/i.test(file.name);

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const baseName = cleanFileName.replace(/\.[^/.]+$/, '');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // ── Heavy Video Optimization (files > 15MB or non-mp4 format like ProRes/MOV) ──
    const isHeavyVideo = isVideo && (originalSize > 15 * 1024 * 1024 || !/\.mp4$/i.test(file.name));
    const ffmpegPath = isHeavyVideo ? await getFfmpegPath() : null;

    if (isHeavyVideo && ffmpegPath) {
      rawTempPath = path.join('/tmp', `raw_${timestamp}_${cleanFileName}`);
      const optimizedFileName = `opt_${timestamp}_${baseName}.mp4`;
      const optimizedFilePath = path.join(uploadsDir, optimizedFileName);

      try {
        // 1. Write raw video stream to temp storage
        await fs.writeFile(rawTempPath, buffer);

        // 2. High-performance transcode with Apple Silicon Neon / libx264 + faststart streaming
        const ffmpegCmd = `"${ffmpegPath}" -y -i "${rawTempPath}" -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -vf "scale='min(1920,iw)':-2" -c:a aac -b:a 128k -movflags +faststart "${optimizedFilePath}"`;

        await execAsync(ffmpegCmd, { maxBuffer: 1024 * 1024 * 50 });

        // 3. Measure optimized size
        const optStats = await fs.stat(optimizedFilePath);
        const optimizedSize = optStats.size;
        const savedPercent = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

        // Clean up raw temp file
        try {
          await fs.unlink(rawTempPath);
        } catch {}

        // Upload to Supabase if configured
        if (supabase) {
          try {
            const optBuffer = await fs.readFile(optimizedFilePath);
            const { data } = await supabase.storage
              .from('media')
              .upload(`uploads/${optimizedFileName}`, optBuffer, {
                contentType: 'video/mp4',
                upsert: true,
              });

            if (data) {
              const { data: publicUrlData } = supabase.storage
                .from('media')
                .getPublicUrl(`uploads/${optimizedFileName}`);

              return NextResponse.json({
                url: publicUrlData.publicUrl,
                optimized: true,
                originalSize,
                optimizedSize,
                savedPercent,
              });
            }
          } catch {}
        }

        return NextResponse.json({
          url: `/uploads/${optimizedFileName}`,
          optimized: true,
          originalSize,
          optimizedSize,
          savedPercent,
        });
      } catch (transcodeErr) {
        console.warn('FFmpeg transcode failed, falling back to direct save:', transcodeErr);
        if (rawTempPath) {
          try {
            await fs.unlink(rawTempPath);
          } catch {}
        }
      }
    }

    // ── Standard upload fallback (images, small files) ──
    const fileName = `${timestamp}_${cleanFileName}`;

    if (supabase) {
      const { data, error } = await supabase.storage
        .from('media')
        .upload(`uploads/${fileName}`, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(`uploads/${fileName}`);

        return NextResponse.json({ url: publicUrlData.publicUrl });
      }
    }

    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error: unknown) {
    if (rawTempPath) {
      try {
        await fs.unlink(rawTempPath);
      } catch {}
    }
    const message = error instanceof Error ? error.message : 'Ошибка при загрузке файла';
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

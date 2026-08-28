import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${cleanFileName}`;

    // 1. If Supabase is configured, upload to Supabase Storage
    if (supabase) {
      const { data, error } = await supabase.storage
        .from('media')
        .upload(`uploads/${fileName}`, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(`uploads/${fileName}`);

        return NextResponse.json({ url: publicUrlData.publicUrl });
      }
    }

    // 2. Local fallback: Save into public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    const localUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: localUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
}

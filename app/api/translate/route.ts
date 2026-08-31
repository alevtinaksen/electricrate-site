import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ translatedText: '' });
    }

    const cleanText = text.trim();
    if (!cleanText) {
      return NextResponse.json({ translatedText: '' });
    }

    // 1. Try Google Translate public GTX endpoint (instant & real full translation)
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(cleanText)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translatedParts = data[0]
            .map((item: any) => item[0])
            .filter(Boolean)
            .join('');
          if (translatedParts) {
            return NextResponse.json({
              translatedText: translatedParts.trim().toUpperCase(),
            });
          }
        }
      }
    } catch {}

    // 2. Fallback to MyMemory translation API
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=ru|en`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.responseData?.translatedText) {
          return NextResponse.json({
            translatedText: data.responseData.translatedText.trim().toUpperCase(),
          });
        }
      }
    } catch {}

    return NextResponse.json({ translatedText: cleanText.toUpperCase() });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}

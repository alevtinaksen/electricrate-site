'use client';

import Image from 'next/image';
import { WorkCategoryGroup } from '@/lib/supabase';
import { Language } from '@/types';

interface WorksSectionProps {
  sections: WorkCategoryGroup[];
  lang: Language;
  onVideoSelect: (title: string, videoUrl: string, posterUrl?: string) => void;
}

export default function WorksSection({ sections, lang, onVideoSelect }: WorksSectionProps) {
  return (
    <section
      id="works"
      className="w-full max-w-[964px] font-mono flex flex-col items-center select-none"
    >
      {/* Main Header "ВСЕ РАБОТЫ" strictly matching Screenshot 5 */}
      <h2
        className="font-mono font-semibold uppercase tracking-[-2.56px] text-white select-none text-center"
        style={{
          color: '#FFFFFF',
          fontFamily: '"Lebowski by Pragmatica", monospace',
          fontSize: 'clamp(64px, 9vw, 128px)',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: '90%', // 115.2px
          letterSpacing: '-2.56px',
          textTransform: 'uppercase',
          margin: 0,
          padding: 0,
        }}
      >
        {lang === 'ru' ? 'ВСЕ' : 'ALL'}
        <br />
        {lang === 'ru' ? 'РАБОТЫ' : 'WORKS'}
      </h2>

      {/* 40px gap between main header and first category block */}
      <div className="h-[40px] w-full shrink-0" />

      {/* Categories stack with 40px gap between blocks */}
      <div className="w-full flex flex-col gap-[40px]">
        {sections.map((group) => {
          const categoryTitle = lang === 'ru' ? group.title_ru : group.title_en;
          const isVertical = group.isVertical;

          return (
            <div key={group.id} className="w-full flex flex-col items-center">
              {/* Category Subheader (20px Geist Mono uppercase) */}
              <h3
                className="uppercase text-center shrink-0"
                style={{
                  color: '#FFFFFF',
                  fontFamily: '"Lebowski by Pragmatica", monospace',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: '125%', // 25px
                  letterSpacing: '-0.2px',
                  textTransform: 'uppercase',
                  margin: 0,
                  padding: 0,
                }}
              >
                {categoryTitle}
              </h3>

              {/* Exact 12px gap between category title and grid */}
              <div className="h-[12px] w-full shrink-0" />

              {/* Grid: 20px padding on left and right, borderless cards, title visible ONLY on hover */}
              <div className="w-full px-[20px]">
                <div className="w-full flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {group.items.map((item) => {
                    const itemTitle = lang === 'ru' ? item.title_ru : item.title_en;

                    return (
                      <div
                        key={item.id}
                        onClick={() => onVideoSelect(itemTitle, item.video_url, item.thumbnail_url)}
                        style={{
                          width: 'calc(25% - 6px)',
                          minWidth: isVertical ? '135px' : '175px',
                        }}
                        className={`relative overflow-hidden bg-[#121212] group cursor-pointer border-none outline-none ${
                          isVertical ? 'aspect-[9/16]' : 'aspect-[16/10]'
                        }`}
                      >
                        {/* Thumbnail Image with zoom effect */}
                        <Image
                          src={item.thumbnail_url}
                          alt={itemTitle}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-108"
                          sizes="240px"
                        />

                        {/* Title overlay — visible ONLY on hover (opacity-0 -> group-hover:opacity-100) */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 text-center">
                          <p className="font-mono text-[12px] uppercase font-bold tracking-tight text-white leading-tight">
                            {itemTitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { WorkCategoryGroup } from '@/lib/supabase';
import { isVideoMedia } from '@/lib/media';
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
      className="w-full font-mono flex flex-col items-center"
    >
      {/* Main Header "ВСЕ РАБОТЫ" (slightly more compact on mobile) */}
      <h2
        className="font-mono font-semibold uppercase tracking-[-2.56px] text-white text-center w-full px-2"
        style={{
          color: '#FFFFFF',
          fontFamily: '"Geist Mono", monospace',
          fontSize: 'clamp(52px, 14vw, 128px)',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: '90%',
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

      {/* 48px gap on mobile, 80px on desktop */}
      <div className="h-[48px] md:h-[80px] w-full shrink-0" />

      {/* Categories stack with 48px gap on mobile, 80px on desktop */}
      <div className="w-full flex flex-col gap-[48px] md:gap-[80px]">
        {sections.map((group) => {
          const categoryTitle = lang === 'ru' ? group.title_ru : group.title_en;
          const isVertical = group.isVertical;
          const isOddCount = group.items.length % 2 !== 0;

          return (
            <div key={group.id} className="w-full flex flex-col items-center">
              {/* Category Subheader (16px on mobile, 20px on desktop) */}
              <h3
                className="uppercase text-center shrink-0 w-full px-2 text-[16px] md:text-[20px]"
                style={{
                  color: '#FFFFFF',
                  fontFamily: '"Geist Mono", monospace',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: '125%',
                  letterSpacing: '-0.2px',
                  textTransform: 'uppercase',
                  margin: 0,
                  padding: 0,
                }}
              >
                {categoryTitle}
              </h3>

              {/* Exact 20px gap between category title and grid */}
              <div className="h-[20px] w-full shrink-0" />

              {/* Grid: 4px padding on mobile, 20px on desktop */}
              <div className="w-full px-[4px] md:px-[20px]">
                <div className="w-full flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {group.items.map((item, itemIdx) => {
                    const itemTitle = lang === 'ru' ? item.title_ru : item.title_en;
                    const coverMedia = item.thumbnail_url || item.video_url;
                    const isVideoCover = isVideoMedia(coverMedia);
                    const isFirstOddOnMobile = isOddCount && itemIdx === 0;

                    return (
                      <div
                        key={item.id}
                        onClick={() => onVideoSelect(itemTitle, item.video_url, item.thumbnail_url)}
                        style={{
                          minWidth: isVertical ? '135px' : '160px',
                        }}
                        className={`relative overflow-hidden bg-[#121212] group cursor-pointer border-none outline-none ${
                          isFirstOddOnMobile
                            ? 'w-full md:w-[calc(25%-6px)]'
                            : 'w-[calc(50%-4px)] md:w-[calc(25%-6px)]'
                        } ${
                          isVertical ? 'aspect-[9/16]' : (isFirstOddOnMobile ? 'aspect-[16/9] md:aspect-[16/10]' : 'aspect-[16/10]')
                        }`}
                      >
                        {/* Thumbnail Image / Video Frame with zoom effect */}
                        {coverMedia ? (
                          isVideoCover ? (
                            <video
                              src={coverMedia.includes('#t=') ? coverMedia : `${coverMedia}#t=1.8`}
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                            />
                          ) : (
                            <img
                              src={coverMedia}
                              alt={itemTitle}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )
                        ) : (
                          <div className="w-full h-full bg-[#1e1e24] flex items-center justify-center text-xs text-[#5e5e5e] font-mono">
                            НЕТ ВИДЕО
                          </div>
                        )}

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

'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { HeroReel } from '@/lib/supabase';
import { Language } from '@/types';

interface ReelsSectionProps {
  reels: HeroReel[];
  lang: Language;
  onVideoSelect: (title: string, videoUrl: string, posterUrl?: string) => void;
}

function ReelCard({
  reel,
  lang,
  priority,
  onSelect,
}: {
  reel: HeroReel;
  lang: Language;
  priority?: boolean;
  onSelect: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const title = lang === 'ru' ? reel.title_ru : reel.title_en;
  // Use preview_video_url for looping in the feed, fallback to video_url
  const feedVideoSrc = reel.preview_video_url || reel.video_url;

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      {/* Video Container — exact fixed dimensions, centered, clickable */}
      <div
        onClick={onSelect}
        className="video-card relative overflow-hidden bg-[#121212] select-none cursor-pointer group shrink-0"
        style={{
          width: `${reel.width}px`,
          maxWidth: '100%',
          height: `${reel.height}px`,
        }}
      >
        {/* Background Poster Image */}
        <Image
          src={reel.thumbnail_url}
          alt={title}
          fill
          unoptimized
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Loop Preview Video Element (autoplay loop muted) */}
        {feedVideoSrc && (
          <video
            ref={videoRef}
            src={feedVideoSrc}
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
      </div>

      {/* Explicit 20px gap above title */}
      <div className="h-[20px] w-full shrink-0" />

      {/* Title strictly in 25px height, Geist Mono 20px 700 uppercase */}
      <h3
        className="font-mono text-center uppercase shrink-0"
        style={{
          color: '#FFFFFF',
          fontFamily: '"Geist Mono", monospace',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '25px', // 125%
          letterSpacing: '-0.2px',
          textTransform: 'uppercase',
          margin: 0,
          padding: 0,
        }}
      >
        {title}
      </h3>

      {/* Explicit 20px gap below title */}
      <div className="h-[20px] w-full shrink-0" />
    </div>
  );
}

export default function ReelsSection({ reels, lang, onVideoSelect }: ReelsSectionProps) {
  return (
    <section
      id="reels"
      className="w-[964px] max-w-[964px] mx-auto flex flex-col items-center pt-2"
    >
      {reels.map((reel, index) => (
        <ReelCard
          key={reel.id}
          reel={reel}
          lang={lang}
          priority={index === 0}
          onSelect={() =>
            onVideoSelect(
              lang === 'ru' ? reel.title_ru : reel.title_en,
              reel.video_url || reel.preview_video_url,
              reel.thumbnail_url
            )
          }
        />
      ))}
    </section>
  );
}

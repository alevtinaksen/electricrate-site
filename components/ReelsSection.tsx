'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { HeroReel } from '@/lib/supabase';
import { isVideoMedia } from '@/lib/media';
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
  const cardRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Smooth cursor follow with springs
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

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
        threshold: 0.15,
        rootMargin: '100px 0px',
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
  const isThumbVideo = isVideoMedia(reel.thumbnail_url);

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      {/* Video Container — unique width per card, responsive on mobile/tablet */}
      <div
        ref={cardRef}
        onClick={onSelect}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="video-card relative overflow-hidden bg-[#121212] select-none cursor-pointer w-full xl:w-auto"
        style={{
          width: `${reel.width || 964}px`,
          maxWidth: '100%',
          aspectRatio: `${reel.width} / ${reel.height}`,
        }}
      >
        {/* Background Poster: Image if image file, or Video poster frame if video file */}
        {reel.thumbnail_url && (
          !isThumbVideo ? (
            <Image
              src={reel.thumbnail_url}
              alt={title}
              fill
              unoptimized
              priority={priority}
              className="object-cover"
            />
          ) : (
            <video
              src={reel.thumbnail_url.includes('#t=') ? reel.thumbnail_url : `${reel.thumbnail_url}#t=0.1`}
              preload="metadata"
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )
        )}

        {/* Loop Preview Video Element (smoothly fades in once loaded, loop muted) */}
        {feedVideoSrc && (
          <video
            ref={videoRef}
            src={feedVideoSrc}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Floating Bubble Button in Brand Blue (#1458E6) with white text */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                left: mouseX,
                top: mouseY,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute pointer-events-none z-30 flex items-center justify-center shadow-none"
            >
              <div
                style={{
                  backgroundColor: '#1458E6',
                  borderRadius: '56px',
                  color: '#FFFFFF',
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '-0.14px',
                  textTransform: 'uppercase',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                }}
                className="flex items-center gap-1.5 whitespace-nowrap shadow-none"
              >
                <span>{lang === 'ru' ? 'СМОТРЕТЬ' : 'PLAY'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gap above title: 8px on mobile, 20px on desktop */}
      <div className="h-[8px] md:h-[20px] w-full shrink-0" />

      {/* Title: 16px on mobile, 20px on desktop */}
      <h3
        className="font-mono text-center uppercase shrink-0 text-[16px] md:text-[20px]"
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
        {title}
      </h3>

      {/* Gap below title: 24px on mobile, 20px on desktop */}
      <div className="h-[24px] md:h-[20px] w-full shrink-0" />
    </div>
  );
}

const HERO_GRID_PATTERN = [
  { label: 'L', width: 964, height: 542 },
  { label: 'S', width: 557, height: 313 },
  { label: 'M', width: 818, height: 460 },
  { label: 'S', width: 557, height: 313 },
];

export default function ReelsSection({ reels, lang, onVideoSelect }: ReelsSectionProps) {
  const visibleReels = reels.filter((r) => !r.hidden);

  return (
    <section
      id="reels"
      className="w-full max-w-[964px] mx-auto flex flex-col items-center pt-2"
    >
      {visibleReels.map((reel, index) => {
        const preset = HERO_GRID_PATTERN[index % HERO_GRID_PATTERN.length];
        const normalizedReel: HeroReel = {
          ...reel,
          width: preset.width,
          height: preset.height,
        };

        return (
          <ReelCard
            key={reel.id}
            reel={normalizedReel}
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
        );
      })}
    </section>
  );
}

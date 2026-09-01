'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export interface PlaylistItem {
  title: string;
  videoUrl: string;
  posterUrl?: string;
  isVertical?: boolean;
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
  posterUrl?: string;
  isVertical?: boolean;
  playlist?: PlaylistItem[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

export default function VideoModal({
  isOpen,
  onClose,
  title,
  videoUrl,
  posterUrl,
  isVertical = false,
  playlist = [],
  currentIndex = -1,
  onNavigate,
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [detectedVertical, setDetectedVertical] = useState(isVertical);

  const hasMultiple = playlist.length > 1;
  const activeIdx = currentIndex >= 0 ? currentIndex : playlist.findIndex((p) => p.videoUrl === videoUrl);

  const handlePrev = useCallback(() => {
    if (!hasMultiple || !onNavigate) return;
    const prevIdx = activeIdx > 0 ? activeIdx - 1 : playlist.length - 1;
    onNavigate(prevIdx);
  }, [hasMultiple, onNavigate, activeIdx, playlist.length]);

  const handleNext = useCallback(() => {
    if (!hasMultiple || !onNavigate) return;
    const nextIdx = activeIdx < playlist.length - 1 ? activeIdx + 1 : 0;
    onNavigate(nextIdx);
  }, [hasMultiple, onNavigate, activeIdx, playlist.length]);

  useEffect(() => {
    setDetectedVertical(isVertical);
  }, [isVertical, videoUrl]);

  // YouTube Keyboard Shortcuts Engine
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const video = videoRef.current;
      if (!video) return;

      // Previous / Next Video via Shift+Arrows, [ / ], or P / N
      if (e.key === '[' || e.key === 'p' || e.key === 'P' || e.key === 'з' || e.key === 'З' || (e.shiftKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        handlePrev();
        return;
      }

      if (e.key === ']' || e.key === 'n' || e.key === 'N' || e.key === 'т' || e.key === 'Т' || (e.shiftKey && e.key === 'ArrowRight')) {
        e.preventDefault();
        handleNext();
        return;
      }

      switch (e.key) {
        // ── 1. Escape: Close Modal ──
        case 'Escape':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            onClose();
          }
          break;

        // ── 2. ArrowUp: Volume Up (+10%) & Unmute ──
        case 'ArrowUp': {
          e.preventDefault();
          video.muted = false;
          video.volume = Math.min(1, Number((video.volume + 0.1).toFixed(2)));
          break;
        }

        // ── 3. ArrowDown: Volume Down (-10%) & Unmute ──
        case 'ArrowDown': {
          e.preventDefault();
          video.muted = false;
          video.volume = Math.max(0, Number((video.volume - 0.1).toFixed(2)));
          break;
        }

        // ── 4. Key 'M' or 'm': Mute / Unmute Toggle ──
        case 'm':
        case 'M':
        case 'ь':
        case 'Ь': {
          e.preventDefault();
          video.muted = !video.muted;
          break;
        }

        // ── 5. Space / 'K': Play / Pause Toggle ──
        case ' ':
        case 'k':
        case 'K':
        case 'л':
        case 'Л': {
          e.preventDefault();
          if (video.paused) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
          break;
        }

        // ── 6. ArrowLeft / 'J': Rewind 5 seconds ──
        case 'ArrowLeft':
        case 'j':
        case 'J':
        case 'о':
        case 'О': {
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        }

        // ── 7. ArrowRight / 'L': Fast-forward 5 seconds ──
        case 'ArrowRight':
        case 'l':
        case 'L':
        case 'д':
        case 'Д': {
          e.preventDefault();
          const maxDur = video.duration || 1000;
          video.currentTime = Math.min(maxDur, video.currentTime + 5);
          break;
        }

        // ── 8. Key 'F': Toggle Fullscreen ──
        case 'f':
        case 'F':
        case 'а':
        case 'А': {
          e.preventDefault();
          if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
        }

        default:
          break;
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen) return null;

  const isVert = detectedVertical || videoUrl.includes('vertical') || videoUrl.includes('reel');

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200 select-none overflow-hidden"
      onClick={onClose}
    >
      {/* Floating Top Header: Snackbar style flush to top-left corner */}
      {title && (
        <div className="fixed top-4 left-4 sm:absolute sm:top-6 sm:left-6 z-50 flex items-center pointer-events-none">
          <div
            style={{
              paddingTop: '8px',
              paddingBottom: '8px',
              paddingLeft: '12px',
              paddingRight: '12px',
            }}
            className="bg-white flex items-center gap-3 shadow-2xl border-none"
          >
            {hasMultiple && activeIdx >= 0 && (
              <span
                style={{
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  borderRadius: '56px',
                  lineHeight: 1,
                }}
                className="bg-[#1458E6] text-white font-mono text-[12px] md:text-[13px] font-bold shrink-0 flex items-center justify-center"
              >
                {activeIdx + 1}/{playlist.length}
              </span>
            )}
            <span className="font-mono text-[13px] md:text-[15px] font-bold text-black uppercase tracking-tight leading-none">
              {title}
            </span>
          </div>
        </div>
      )}

      {/* Floating Square Close Cross Button (top-right, easily clickable on all devices) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть"
        style={{
          width: '44px',
          height: '44px',
        }}
        className="fixed top-4 right-4 sm:absolute sm:top-6 sm:right-6 bg-[#141416] hover:bg-white text-white hover:text-black flex items-center justify-center cursor-pointer transition-colors border-none outline-none shadow-2xl shrink-0 z-50 rounded-none active:scale-95"
        title="Закрыть"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Main Video Frame: Automatically fits video aspect ratio within mobile viewport (82dvh) */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-none overflow-hidden shadow-2xl flex flex-col items-center justify-center border-none transition-all duration-300 w-full max-w-[100vw] sm:max-w-[90vw] md:max-w-[1440px] max-h-[100dvh] sm:max-h-[88dvh] p-2 sm:p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Previous Video Arrow Button */}
        {hasMultiple && onNavigate && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Предыдущее видео"
            title="Предыдущее видео (P или Shift+Left)"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-black/75 hover:bg-[#1458E6] text-white flex items-center justify-center transition-all duration-200 cursor-pointer border-none outline-none backdrop-blur-md shadow-2xl active:scale-95 opacity-80 hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Floating Next Video Arrow Button */}
        {hasMultiple && onNavigate && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Следующее видео"
            title="Следующее видео (N или Shift+Right)"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-black/75 hover:bg-[#1458E6] text-white flex items-center justify-center transition-all duration-200 cursor-pointer border-none outline-none backdrop-blur-md shadow-2xl active:scale-95 opacity-80 hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Video Player Area */}
        <div className="relative w-full max-h-[82dvh] sm:max-h-[88dvh] bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            key={videoUrl}
            src={videoUrl}
            poster={posterUrl}
            controls
            autoPlay
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoHeight > v.videoWidth) {
                setDetectedVertical(true);
              }
            }}
            className="max-w-full max-h-[82dvh] sm:max-h-[88dvh] w-auto h-auto object-contain rounded-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
  posterUrl?: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl, posterUrl }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-[96vw] max-w-[1440px] max-h-[92vh] bg-black rounded-none overflow-hidden shadow-2xl flex flex-col items-center justify-center border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button (✕) top-right */}
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-[#1458E6] text-white flex items-center justify-center transition-colors cursor-pointer border-none outline-none backdrop-blur-sm"
        >
          ✕
        </button>

        {/* Video Player — Full Scale, No Rounded Corners, Autoplay with Muted sound */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            controls
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain rounded-none"
          />
        </div>
      </div>
    </div>
  );
}

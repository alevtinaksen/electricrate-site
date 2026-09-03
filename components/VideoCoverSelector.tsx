'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, Upload, RefreshCw, Film, Image as ImageIcon, X } from 'lucide-react';
import DropFileInput from './DropFileInput';
import ImageCropModal from './ImageCropModal';

interface VideoCoverSelectorProps {
  videoUrl?: string;
  currentCoverUrl: string;
  fieldKey: string;
  isUploading?: boolean;
  onSelectCover: (url: string) => void;
  onFileUpload: (file: File, onSuccess: (url: string) => void, fieldKey: string) => void;
  isVertical?: boolean;
  label?: string;
  errorMessage?: string;
}

export default function VideoCoverSelector({
  videoUrl,
  currentCoverUrl,
  fieldKey,
  isUploading = false,
  onSelectCover,
  onFileUpload,
  isVertical = false,
  label = 'обложка (статичное изображение)',
  errorMessage,
}: VideoCoverSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showScrubber, setShowScrubber] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [frameSetIndex, setFrameSetIndex] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);
  const [scrubTime, setScrubTime] = useState<number>(2.0);

  const scrubberVideoRef = useRef<HTMLVideoElement>(null);

  // Clean base video URL (without existing #t= hash)
  const cleanVideoUrl = videoUrl ? videoUrl.split('#')[0] : '';

  // Parse current frame timestamp if already selected
  useEffect(() => {
    if (currentCoverUrl && currentCoverUrl.includes('#t=')) {
      const parts = currentCoverUrl.split('#t=');
      const t = parseFloat(parts[1]);
      if (!isNaN(t)) {
        const timer = setTimeout(() => setScrubTime(t), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [currentCoverUrl]);

  // Inspect video duration to calculate intelligent timestamps
  useEffect(() => {
    if (!cleanVideoUrl) return;
    const v = document.createElement('video');
    v.src = cleanVideoUrl;
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      if (v.duration && !isNaN(v.duration) && v.duration > 1) {
        setDuration(v.duration);
        setScrubTime((prev) => Math.min(prev, v.duration));
      }
    };
  }, [cleanVideoUrl]);

  // Handle seek updates for scrubber video preview
  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(duration, Number(newTime.toFixed(1))));
    setScrubTime(clamped);
    if (scrubberVideoRef.current) {
      scrubberVideoRef.current.currentTime = clamped;
    }
  };

  // 8 distinct sets of 3 sharp frames = 24 unique cinematic candidate frames
  // Golden safe content zone: between 8% (after opening black/logo) and 76% (strictly before ending fade/credits/white screen)
  const allFrameSets = [
    // Set 1
    [
      { label: 'Кадр 1', pct: 0.12, minSec: 2.0 },
      { label: 'Кадр 2', pct: 0.38, minSec: 4.5 },
      { label: 'Кадр 3', pct: 0.65, minSec: 7.5 },
    ],
    // Set 2
    [
      { label: 'Кадр 1', pct: 0.16, minSec: 2.4 },
      { label: 'Кадр 2', pct: 0.44, minSec: 5.2 },
      { label: 'Кадр 3', pct: 0.72, minSec: 8.4 },
    ],
    // Set 3
    [
      { label: 'Кадр 1', pct: 0.20, minSec: 2.8 },
      { label: 'Кадр 2', pct: 0.50, minSec: 5.8 },
      { label: 'Кадр 3', pct: 0.76, minSec: 8.8 },
    ],
    // Set 4
    [
      { label: 'Кадр 1', pct: 0.14, minSec: 2.2 },
      { label: 'Кадр 2', pct: 0.34, minSec: 4.0 },
      { label: 'Кадр 3', pct: 0.60, minSec: 7.0 },
    ],
    // Set 5
    [
      { label: 'Кадр 1', pct: 0.22, minSec: 3.0 },
      { label: 'Кадр 2', pct: 0.48, minSec: 5.6 },
      { label: 'Кадр 3', pct: 0.70, minSec: 8.2 },
    ],
    // Set 6
    [
      { label: 'Кадр 1', pct: 0.26, minSec: 3.2 },
      { label: 'Кадр 2', pct: 0.54, minSec: 6.2 },
      { label: 'Кадр 3', pct: 0.74, minSec: 8.6 },
    ],
    // Set 7
    [
      { label: 'Кадр 1', pct: 0.10, minSec: 1.8 },
      { label: 'Кадр 2', pct: 0.40, minSec: 4.8 },
      { label: 'Кадр 3', pct: 0.68, minSec: 7.8 },
    ],
    // Set 8
    [
      { label: 'Кадр 1', pct: 0.28, minSec: 3.4 },
      { label: 'Кадр 2', pct: 0.58, minSec: 6.6 },
      { label: 'Кадр 3', pct: 0.75, minSec: 8.7 },
    ],
  ];

  const totalSets = allFrameSets.length;
  const currentConfig = allFrameSets[frameSetIndex % totalSets];

  const currentTimes = currentConfig.map((item, idx) => {
    const d = duration > 2 ? duration : 15;
    // Keep rawTime strictly within [0.08 * d, 0.76 * d] to avoid any end credits / fade-to-white / black intro
    const safeMax = Math.max(1.0, d * 0.76);
    const rawTime = Math.min(safeMax, Math.max(item.minSec, item.pct * d));
    const time = Number(rawTime.toFixed(1));
    return {
      id: idx + 1,
      time,
      label: item.label,
    };
  });

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Top Row: Label on the left, action buttons on the right */}
      <div className="flex items-center justify-between w-full flex-wrap gap-2">
        <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
          {label}
        </label>

        <div className="flex items-center gap-3 flex-wrap">
          {cleanVideoUrl && (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowScrubber(!showScrubber);
                  setShowCustomInput(false);
                }}
                className={`text-[12px] font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                  showScrubber ? 'text-[#1458E6]' : 'text-[#8C8E96] hover:text-white'
                }`}
                title="Открыть таймлайн для покадрового выбора обложки"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{showScrubber ? 'ЗАКРЫТЬ СТОПКАДР' : 'ВЫБРАТЬ СТОПКАДР'}</span>
              </button>

              <button
                type="button"
                onClick={() => setFrameSetIndex((prev) => (prev + 1) % totalSets)}
                className="text-[12px] font-mono font-bold uppercase text-[#8C8E96] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Показать другие стоп-кадры из видео"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ОБНОВИТЬ</span>
              </button>
            </>
          )}

          {cleanVideoUrl && (
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(!showCustomInput);
                setShowScrubber(false);
              }}
              className={`text-[12px] font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                showCustomInput ? 'text-[#1458E6]' : 'text-[#8C8E96] hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{showCustomInput ? 'СКРЫТЬ СВОЮ' : 'ВЫБРАТЬ СВОЮ'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Interactive Video Timeline Scrubber Tool (New Minimal Design) ── */}
      {cleanVideoUrl && showScrubber && (
        <div className="relative w-full rounded-none overflow-hidden bg-[#141416] flex flex-col group/scrubber select-none border border-[#26282C]">
          {/* Main Video Viewport with Overlays */}
          <div
            className={`relative w-full overflow-hidden flex items-center justify-center border-b border-[#26282C] ${
              isVertical ? 'aspect-[9/16] max-h-[380px] mx-auto' : 'aspect-video max-h-[340px]'
            }`}
          >
            {/* Centered Video Wrapper to anchor the 8px offset side pills */}
            <div className="relative inline-flex items-center justify-center h-full max-w-full">
              <video
                ref={scrubberVideoRef}
                src={cleanVideoUrl}
                preload="auto"
                muted
                playsInline
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Left Side: Backward Stepping Pills (aligned to right, exactly 8px margin from video) */}
              <div
                style={{ marginRight: '8px' }}
                className="absolute right-full top-1/2 -translate-y-1/2 flex flex-col items-end gap-1.5 z-20 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => handleSeek(scrubTime - 0.1)}
                  style={{
                    paddingLeft: '6px',
                    paddingRight: '6px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                  }}
                  className="rounded-full bg-[#2E2F35] hover:bg-white text-white hover:text-black font-mono text-[11px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer border-none outline-none shadow-none"
                  title="Назад на 0.1с"
                >
                  -0.1s
                </button>
                <button
                  type="button"
                  onClick={() => handleSeek(scrubTime - 1.0)}
                  style={{
                    paddingLeft: '6px',
                    paddingRight: '6px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                  }}
                  className="rounded-full bg-[#2E2F35] hover:bg-white text-white hover:text-black font-mono text-[11px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer border-none outline-none shadow-none"
                  title="Назад на 1с"
                >
                  -1s
                </button>
              </div>

              {/* Right Side: Forward Stepping Pills (aligned to left, exactly 8px margin from video) */}
              <div
                style={{ marginLeft: '8px' }}
                className="absolute left-full top-1/2 -translate-y-1/2 flex flex-col items-start gap-1.5 z-20 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => handleSeek(scrubTime + 0.1)}
                  style={{
                    paddingLeft: '6px',
                    paddingRight: '6px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                  }}
                  className="rounded-full bg-[#2E2F35] hover:bg-white text-white hover:text-black font-mono text-[11px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer border-none outline-none shadow-none"
                  title="Вперед на 0.1с"
                >
                  +0.1s
                </button>
                <button
                  type="button"
                  onClick={() => handleSeek(scrubTime + 1.0)}
                  style={{
                    paddingLeft: '6px',
                    paddingRight: '6px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                  }}
                  className="rounded-full bg-[#2E2F35] hover:bg-white text-white hover:text-black font-mono text-[11px] font-bold tracking-tight transition-all active:scale-95 cursor-pointer border-none outline-none shadow-none"
                  title="Вперед на 1с"
                >
                  +1s
                </button>
              </div>
            </div>

            {/* Top-Right: Apply Check + Close Cancel Buttons Stack */}
            <div className="absolute top-0 right-0 z-30 flex flex-col shadow-none">
              {/* Blue Check Button */}
              <button
                type="button"
                onClick={() => {
                  const targetUrl = `${cleanVideoUrl}#t=${scrubTime.toFixed(1)}`;
                  onSelectCover(targetUrl);
                  setShowScrubber(false);
                }}
                title="Применить этот стопкадр"
                className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] bg-[#1458E6] hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer border-none outline-none shadow-none"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Dark Close X Button */}
              <button
                type="button"
                onClick={() => setShowScrubber(false)}
                title="Свернуть / закрыть выбор стопкадра"
                className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] bg-[#323232] hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer border-none outline-none shadow-none"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Bottom Timeline Track */}
          <div className="w-full h-[18px] bg-[#3A3A3A] relative flex items-center cursor-pointer select-none">
            {/* Square blue cursor / indicator */}
            <div
              className="absolute top-0 bottom-0 bg-[#1458E6] w-[18px] h-[18px] -ml-[9px] pointer-events-none z-10 rounded-none shadow-none"
              style={{
                left: `${((scrubTime / (duration || 1)) * 100).toFixed(2)}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={duration || 15}
              step={0.05}
              value={scrubTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-full opacity-0 absolute inset-0 cursor-pointer z-20 m-0 p-0"
            />
          </div>
        </div>
      )}

      {/* Custom input placed ABOVE the 3 suggested cover thumbnails */}
      {(!cleanVideoUrl || showCustomInput) && (
        <div className="flex flex-col gap-1 w-full">
          <DropFileInput
            value={currentCoverUrl}
            placeholder="ССЫЛКА НА ОБЛОЖКУ ИЛИ ПЕРЕТАЩИТЕ ФАЙЛ"
            accept="image/*,video/*"
            isUploading={isUploading}
            fieldKey={fieldKey}
            errorMessage={errorMessage}
            onChange={onSelectCover}
            onFileUpload={onFileUpload}
            onClear={() => onSelectCover('')}
          />
        </div>
      )}

      {/* 3 Clean Video Frames */}
      {cleanVideoUrl && (
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {currentTimes.map((item) => {
            const frameUrl = `${cleanVideoUrl}#t=${item.time}`;
            const isSelected = currentCoverUrl === frameUrl;

            return (
              <button
                key={`${frameSetIndex}-${item.time}-${item.id}`}
                type="button"
                onClick={() => {
                  onSelectCover(frameUrl);
                  setShowCustomInput(false);
                  setShowScrubber(false);
                }}
                className={`relative rounded-none overflow-hidden transition-all group cursor-pointer border-2 bg-black ${
                  isVertical ? 'aspect-[9/16]' : 'aspect-video'
                } ${
                  isSelected
                    ? 'border-white ring-2 ring-white/80 scale-[1.02]'
                    : 'border-[#26282C] hover:border-white/50 opacity-80 hover:opacity-100'
                }`}
              >
                <video
                  src={frameUrl}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
                />

                {/* Frame timestamp badge */}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-none bg-black/80 text-[10px] font-mono font-bold text-white uppercase backdrop-blur-[2px] flex items-center gap-1">
                  <Film className="w-2.5 h-2.5 text-[#1458E6]" />
                  <span>{item.time}s</span>
                </div>

                {/* Active Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#1458E6] text-white flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageUrl={currentCoverUrl || (cleanVideoUrl ? `${cleanVideoUrl}#t=${scrubTime.toFixed(1)}` : '')}
        onApplyCrop={(croppedUrl) => {
          onSelectCover(croppedUrl);
          setShowCustomInput(false);
        }}
        isVertical={isVertical}
      />
    </div>
  );
}

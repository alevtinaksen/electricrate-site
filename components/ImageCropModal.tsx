'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Move } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onApplyCrop: (croppedDataUrl: string) => void;
  isVertical?: boolean;
  title?: string;
  hidePills?: boolean;
  initialAspectRatio?: AspectRatio;
}

type AspectRatio = '16:9' | '9:16' | '1:1' | 'free';
type DragHandle = 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | null;

export default function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  onApplyCrop,
  isVertical = false,
  title,
  hidePills = false,
  initialAspectRatio,
}: ImageCropModalProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    initialAspectRatio || (hidePills ? '1:1' : isVertical ? '9:16' : '16:9')
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadedImageSrc, setLoadedImageSrc] = useState<string>('');

  // Crop box in natural image pixels
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  // Display scale (canvas pixel / natural image pixel)
  const [displayScale, setDisplayScale] = useState<number>(1);
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({ w: 540, h: 320 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const dragRef = useRef<{
    handle: DragHandle;
    startX: number;
    startY: number;
    initialCrop: { x: number; y: number; width: number; height: number };
  }>({
    handle: null,
    startX: 0,
    startY: 0,
    initialCrop: { x: 0, y: 0, width: 100, height: 100 },
  });

  // 1. Extract image/frame from video URL if needed
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setAspectRatio(initialAspectRatio || (hidePills ? '1:1' : isVertical ? '9:16' : '16:9'));

    const isVideo =
      imageUrl.includes('#t=') ||
      /\.(mp4|webm|mov|m4v)/i.test(imageUrl) ||
      imageUrl.startsWith('blob:') ||
      imageUrl.includes('/uploads/');

    if (isVideo && !imageUrl.startsWith('data:image')) {
      setIsProcessing(true);
      const parts = imageUrl.split('#t=');
      const cleanUrl = parts[0];
      const time = parts[1] ? parseFloat(parts[1]) : 0;

      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = cleanUrl;
      video.preload = 'auto';
      video.currentTime = time;
      video.muted = true;
      video.playsInline = true;

      video.onseeked = () => {
        try {
          const cvs = document.createElement('canvas');
          cvs.width = video.videoWidth || 1280;
          cvs.height = video.videoHeight || 720;
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, cvs.width, cvs.height);
            const dataUrl = cvs.toDataURL('image/jpeg', 0.95);
            setLoadedImageSrc(dataUrl);
          }
        } catch {
          setLoadedImageSrc(imageUrl);
        } finally {
          setIsProcessing(false);
        }
      };

      video.onerror = () => {
        setLoadedImageSrc(imageUrl);
        setIsProcessing(false);
      };
    } else {
      setLoadedImageSrc(imageUrl);
    }
  }, [isOpen, imageUrl, isVertical]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const initCrop = useCallback((imgWidth: number, imgHeight: number, ratio: AspectRatio) => {
    let targetW = imgWidth * 0.85;
    let targetH = imgHeight * 0.85;

    if (ratio === '16:9') {
      const r = 16 / 9;
      if (targetW / targetH > r) {
        targetW = targetH * r;
      } else {
        targetH = targetW / r;
      }
    } else if (ratio === '9:16') {
      const r = 9 / 16;
      if (targetW / targetH > r) {
        targetW = targetH * r;
      } else {
        targetH = targetW / r;
      }
    } else if (ratio === '1:1') {
      const minDim = Math.min(targetW, targetH);
      targetW = minDim;
      targetH = minDim;
    }

    setCrop({
      x: (imgWidth - targetW) / 2,
      y: (imgHeight - targetH) / 2,
      width: targetW,
      height: targetH,
    });
  }, []);

  // 2. Load image into memory to get natural dimensions
  useEffect(() => {
    if (!loadedImageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      initCrop(img.naturalWidth, img.naturalHeight, aspectRatio);
    };
    img.src = loadedImageSrc;
  }, [loadedImageSrc, aspectRatio, initCrop]);

  // 3. Render canvas preview and compute scale
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const maxCanvasW = 880;
    const maxCanvasH = 480;

    const scale = Math.min(maxCanvasW / img.naturalWidth, maxCanvasH / img.naturalHeight);
    const cw = img.naturalWidth * scale;
    const ch = img.naturalHeight * scale;
    canvas.width = cw;
    canvas.height = ch;
    setDisplayScale(scale);
    setCanvasSize({ w: cw, h: ch });

    ctx.clearRect(0, 0, cw, ch);
    ctx.save();

    // Base dimmed background image
    ctx.drawImage(img, 0, 0, cw, ch);

    // Dim mask outside
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, cw, ch);

    // Clear and draw bright crop area
    const sx = crop.x * scale;
    const sy = crop.y * scale;
    const sw = crop.width * scale;
    const sh = crop.height * scale;

    ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, sx, sy, sw, sh);

    // Rule of thirds grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + sw / 3, sy);
    ctx.lineTo(sx + sw / 3, sy + sh);
    ctx.moveTo(sx + (2 * sw) / 3, sy);
    ctx.lineTo(sx + (2 * sw) / 3, sy + sh);
    ctx.moveTo(sx, sy + sh / 3);
    ctx.lineTo(sx + sw, sy + sh / 3);
    ctx.moveTo(sx, sy + (2 * sh) / 3);
    ctx.lineTo(sx + sw, sy + (2 * sh) / 3);
    ctx.stroke();

    ctx.restore();
  }, [crop, loadedImageSrc]);

  // 4. Interactive Pointer Down for Drag & Resize
  const handlePointerDown = (e: React.PointerEvent, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...crop },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { handle, startX, startY, initialCrop } = dragRef.current;
    if (!handle || !imageRef.current || displayScale <= 0) return;

    const img = imageRef.current;
    const dx = (e.clientX - startX) / displayScale;
    const dy = (e.clientY - startY) / displayScale;

    const minSize = 40;
    let { x, y, width, height } = initialCrop;

    const ratioNum =
      aspectRatio === '16:9' ? 16 / 9 : aspectRatio === '9:16' ? 9 / 16 : aspectRatio === '1:1' ? 1 : null;

    if (handle === 'move') {
      x = Math.max(0, Math.min(img.naturalWidth - width, initialCrop.x + dx));
      y = Math.max(0, Math.min(img.naturalHeight - height, initialCrop.y + dy));
    } else if (handle === 'se') {
      width = Math.max(minSize, Math.min(img.naturalWidth - initialCrop.x, initialCrop.width + dx));
      if (ratioNum) {
        height = width / ratioNum;
        if (initialCrop.y + height > img.naturalHeight) {
          height = img.naturalHeight - initialCrop.y;
          width = height * ratioNum;
        }
      } else {
        height = Math.max(minSize, Math.min(img.naturalHeight - initialCrop.y, initialCrop.height + dy));
      }
    } else if (handle === 'nw') {
      const targetW = Math.max(minSize, initialCrop.width - dx);
      const targetH = ratioNum ? targetW / ratioNum : Math.max(minSize, initialCrop.height - dy);
      const targetX = initialCrop.x + (initialCrop.width - targetW);
      const targetY = initialCrop.y + (initialCrop.height - targetH);

      if (targetX >= 0 && targetY >= 0) {
        x = targetX;
        y = targetY;
        width = targetW;
        height = targetH;
      }
    } else if (handle === 'ne') {
      const targetW = Math.max(minSize, Math.min(img.naturalWidth - initialCrop.x, initialCrop.width + dx));
      const targetH = ratioNum ? targetW / ratioNum : Math.max(minSize, initialCrop.height - dy);
      const targetY = initialCrop.y + (initialCrop.height - targetH);

      if (targetY >= 0) {
        y = targetY;
        width = targetW;
        height = targetH;
      }
    } else if (handle === 'sw') {
      const targetW = Math.max(minSize, initialCrop.width - dx);
      const targetH = ratioNum ? targetW / ratioNum : Math.max(minSize, initialCrop.height + dy);
      const targetX = initialCrop.x + (initialCrop.width - targetW);

      if (targetX >= 0 && initialCrop.y + targetH <= img.naturalHeight) {
        x = targetX;
        width = targetW;
        height = targetH;
      }
    } else if (handle === 'e' && !ratioNum) {
      width = Math.max(minSize, Math.min(img.naturalWidth - initialCrop.x, initialCrop.width + dx));
    } else if (handle === 's' && !ratioNum) {
      height = Math.max(minSize, Math.min(img.naturalHeight - initialCrop.y, initialCrop.height + dy));
    } else if (handle === 'w' && !ratioNum) {
      const targetW = Math.max(minSize, initialCrop.width - dx);
      const targetX = initialCrop.x + (initialCrop.width - targetW);
      if (targetX >= 0) {
        x = targetX;
        width = targetW;
      }
    } else if (handle === 'n' && !ratioNum) {
      const targetH = Math.max(minSize, initialCrop.height - dy);
      const targetY = initialCrop.y + (initialCrop.height - targetH);
      if (targetY >= 0) {
        y = targetY;
        height = targetH;
      }
    }

    setCrop({
      x: Math.max(0, Math.min(img.naturalWidth - width, x)),
      y: Math.max(0, Math.min(img.naturalHeight - height, y)),
      width,
      height,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current.handle = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // 5. Export high-resolution cropped image
  const handleApply = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = Math.max(100, Math.round(crop.width));
    exportCanvas.height = Math.max(100, Math.round(crop.height));
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      img,
      Math.max(0, crop.x),
      Math.max(0, crop.y),
      crop.width,
      crop.height,
      0,
      0,
      exportCanvas.width,
      exportCanvas.height
    );

    const croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.92);
    onApplyCrop(croppedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  // Screen coordinates of crop box on the canvas
  const cropBoxScreen = {
    left: crop.x * displayScale,
    top: crop.y * displayScale,
    width: crop.width * displayScale,
    height: crop.height * displayScale,
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            paddingTop: '24px',
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingBottom: '0px',
          }}
          className="w-full bg-[#141416] rounded-none border-none shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <h3 className="text-[18px] md:text-[20px] font-bold uppercase text-white font-mono leading-tight tracking-wide">
              {title || 'ОБРЕЗАТЬ ОБЛОЖКУ'}
            </h3>
          </div>

          {/* Aspect Ratio Selector Pills (Hidden for avatar crop) */}
          {!hidePills ? (
            <div
              style={{ marginTop: '12px', marginBottom: '16px' }}
              className="flex items-center gap-2.5 overflow-x-auto w-full py-1"
            >
              {(['16:9', '9:16', '1:1', 'free'] as AspectRatio[]).map((r) => {
                const isSelected = aspectRatio === r;
                const label =
                  r === '16:9'
                    ? '16:9 (ГОРИЗОНТ)'
                    : r === '9:16'
                    ? '9:16 (REELS)'
                    : r === '1:1'
                    ? '1:1 (КВАДРАТ)'
                    : 'СВОБОДНЫЙ';
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setAspectRatio(r);
                      if (imageRef.current) {
                        initCrop(imageRef.current.naturalWidth, imageRef.current.naturalHeight, r);
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '56px',
                      fontFamily: '"Geist Mono", monospace',
                      fontSize: '14px',
                      fontWeight: 700,
                      lineHeight: '125%',
                      letterSpacing: '-0.16px',
                      textTransform: 'uppercase',
                    }}
                    className={`transition-all cursor-pointer whitespace-nowrap border-none outline-none ${
                      isSelected
                        ? 'bg-[#1458E6] text-white'
                        : 'bg-[#232326] text-white hover:bg-[#2e2e33]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ height: '16px' }} />
          )}

        {/* Canvas Crop Viewport with Interactive Handles (No border) */}
        <div
          ref={containerRef}
          className="relative w-full min-h-[300px] max-h-[500px] bg-black rounded-none overflow-hidden border-none flex items-center justify-center"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2 text-white/60 font-mono text-xs">
              <span>Извлечение кадра...</span>
            </div>
          ) : (
            <div
              className="relative select-none"
              style={{ width: `${canvasSize.w}px`, height: `${canvasSize.h}px` }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <canvas ref={canvasRef} className="block w-full h-full" />

              {/* Interactive Draggable & Resizable Box */}
              <div
                style={{
                  left: `${cropBoxScreen.left}px`,
                  top: `${cropBoxScreen.top}px`,
                  width: `${cropBoxScreen.width}px`,
                  height: `${cropBoxScreen.height}px`,
                }}
                onPointerDown={(e) => handlePointerDown(e, 'move')}
                className="absolute border-2 border-[#1458E6] cursor-move select-none touch-none"
              >
                {/* Visual Center Move Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                  <Move className="w-5 h-5 text-white drop-shadow" />
                </div>

                {/* 4 Corner Handles */}
                {/* NW */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'nw')}
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-[#1458E6] rounded-sm cursor-nwse-resize shadow z-30 touch-none"
                />
                {/* NE */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'ne')}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-[#1458E6] rounded-sm cursor-nesw-resize shadow z-30 touch-none"
                />
                {/* SW */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'sw')}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-[#1458E6] rounded-sm cursor-nesw-resize shadow z-30 touch-none"
                />
                {/* SE */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'se')}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-[#1458E6] rounded-sm cursor-nwse-resize shadow z-30 touch-none"
                />

                {/* 4 Edge Handles (Available in free mode) */}
                {aspectRatio === 'free' && (
                  <>
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'n')}
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border border-[#1458E6] rounded-sm cursor-ns-resize z-20 touch-none"
                    />
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 's')}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border border-[#1458E6] rounded-sm cursor-ns-resize z-20 touch-none"
                    />
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'w')}
                      className="absolute top-1/2 -translate-y-1/2 -left-1.5 h-6 w-3 bg-white border border-[#1458E6] rounded-sm cursor-ew-resize z-20 touch-none"
                    />
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'e')}
                      className="absolute top-1/2 -translate-y-1/2 -right-1.5 h-6 w-3 bg-white border border-[#1458E6] rounded-sm cursor-ew-resize z-20 touch-none"
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Centered Action Buttons (Gap 0, Padding top & bottom 24px) */}
        <div
          style={{
            paddingTop: '24px',
            paddingBottom: '24px',
          }}
          className="flex items-center justify-center gap-0 w-full"
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              paddingLeft: '24px',
              paddingRight: '24px',
              paddingTop: '10px',
              paddingBottom: '10px',
              borderRadius: '56px',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '-0.14px',
              textTransform: 'uppercase',
            }}
            className="bg-[#232326] hover:bg-[#2e2e33] text-white transition-colors cursor-pointer border-none outline-none"
          >
            ОТМЕНА
          </button>

          <button
            type="button"
            onClick={handleApply}
            style={{
              paddingLeft: '24px',
              paddingRight: '24px',
              paddingTop: '10px',
              paddingBottom: '10px',
              borderRadius: '56px',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '-0.14px',
              textTransform: 'uppercase',
            }}
            className="bg-[#1458E6] hover:bg-[#1147bd] text-white transition-colors cursor-pointer border-none outline-none"
          >
            ПРИМЕНИТЬ
          </button>
        </div>
      </div>

      {/* Floating Square Close Cross Button (4px offset from modal window, matching form bg #141416) */}
      <button
        type="button"
        onClick={onClose}
        style={{
          width: '40px',
          height: '40px',
        }}
        className="absolute top-0 left-[calc(100%+4px)] bg-[#141416] hover:bg-white text-white hover:text-black flex items-center justify-center cursor-pointer transition-colors border-none outline-none shadow-2xl shrink-0"
        title="Закрыть"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  </div>
  );
}

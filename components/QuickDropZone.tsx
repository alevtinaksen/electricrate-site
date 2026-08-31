'use client';

import React, { useState } from 'react';
import { UploadCloud, Film, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface QuickDropZoneProps {
  onFileDrop: (file: File) => void;
  isUploading?: boolean;
  acceptLabel?: string;
  title?: string;
}

export default function QuickDropZone({
  onFileDrop,
  isUploading = false,
  acceptLabel = 'MP4, MOV, WEBM, JPG, PNG',
  title = 'ПЕРЕТАЩИТЕ ВИДЕО ИЛИ ОБЛОЖКУ ИЗ FINDER СЮДА',
}: QuickDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileDrop(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full border-2 border-dashed rounded-lg p-4 sm:p-5 flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
        isDragOver
          ? 'border-[#1458E6] bg-[#1458E6]/20 scale-[1.01] ring-4 ring-[#1458E6]/30'
          : 'border-[#26282C] bg-[#141416]/60 hover:border-[#1458E6]/60 hover:bg-[#141416]'
      }`}
    >
      <input
        type="file"
        accept="video/*,image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileDrop(file);
        }}
      />

      {isUploading ? (
        <div className="flex items-center gap-3 text-[#1458E6] font-mono text-[14px] font-bold uppercase animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>ЗАГРУЗКА ФАЙЛА НА СЕРВЕР...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isDragOver ? 'bg-[#1458E6] text-white' : 'bg-[#1e1e24] text-[#8C8E96]'
              }`}
            >
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[14px] font-bold uppercase text-white tracking-wide">
                {isDragOver ? 'ОТПУСТИТЕ ФАЙЛ ДЛЯ ДОБАВЛЕНИЯ' : title}
              </span>
              <span className="font-mono text-[12px] text-[#8C8E96] flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-[#1458E6]" />
                <ImageIcon className="w-3.5 h-3.5 text-[#00E65A]" />
                <span>{acceptLabel} (Drag & Drop из Finder)</span>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

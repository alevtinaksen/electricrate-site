'use client';

import React, { useState } from 'react';
import { Paperclip, RefreshCw, X, UploadCloud, AlertCircle, Camera, Link2, Check } from 'lucide-react';
import { isVideoMedia } from '@/lib/media';

interface DropFileInputProps {
  value: string;
  placeholder?: string;
  accept?: string;
  isUploading?: boolean;
  fieldKey: string;
  onChange: (value: string) => void;
  onFileUpload: (file: File, onSuccess: (url: string) => void, fieldKey: string) => void;
  onClear?: () => void;
  title?: string;
  helperText?: string;
  errorMessage?: string;
}

function parseFileInfo(url: string) {
  if (!url) return null;
  const isVideo = isVideoMedia(url);

  let rawName = url.split('#')[0].split('?')[0].split('/').pop() || 'файл';
  try {
    rawName = decodeURIComponent(rawName);
  } catch {}

  // Strip timestamp prefixes like 1788101766302_
  const cleanName = rawName.replace(/^\d{10,15}_/, '');

  let ext = cleanName.split('.').pop()?.toUpperCase();
  if (!ext || ext.length > 5) {
    ext = isVideo ? 'MP4' : 'IMG';
  }

  const typeLabel = isVideo ? 'ВИДЕО' : 'ФОТО';

  return {
    cleanName,
    isVideo,
    ext,
    typeLabel,
  };
}

export default function DropFileInput({
  value,
  placeholder = 'ССЫЛКА ИЛИ ПЕРЕТАЩИТЕ ФАЙЛ СЮДА',
  accept = 'video/*,image/*',
  isUploading = false,
  fieldKey,
  onChange,
  onFileUpload,
  onClear,
  title = 'Прикрепить или перетащить файл',
  errorMessage,
}: DropFileInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditingLink, setIsEditingLink] = useState(false);

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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file, (url) => {
        onChange(url);
        setIsEditingLink(false);
      }, fieldKey);
    }
  };

  const fileInfo = value ? parseFileInfo(value) : null;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex items-center w-full min-h-[44px] bg-transparent border transition-all duration-200 ${
          isDragOver
            ? 'border-[#1458E6] bg-[#1458E6]/15 ring-2 ring-[#1458E6]/40'
            : errorMessage
            ? 'border-[#E50914] bg-[#E50914]/5 focus-within:border-[#E50914]'
            : 'border-[#26282C] focus-within:bg-white/[0.04]'
        }`}
      >
        {isDragOver ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-[#1458E6] font-mono text-[13px] font-bold uppercase tracking-wider animate-pulse pointer-events-none py-2">
            <UploadCloud className="w-4 h-4" />
            <span>ОТПУСТИТЕ ФАЙЛ ДЛЯ ЗАГРУЗКИ</span>
          </div>
        ) : value && !isEditingLink && fileInfo ? (
          /* Clean Human-Friendly File Display Badge */
          <div
            style={{ paddingLeft: '8px', paddingRight: '12px' }}
            className="flex-1 h-full flex items-center justify-between py-1.5 gap-3 min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-none bg-[#232326] flex items-center justify-center shrink-0 text-[#8C8E96] border-none">
                {fileInfo.isVideo ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="15" x="2" y="4.5" rx="3.5" />
                    <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="currentColor" />
                  </svg>
                ) : (
                  <Camera className="w-3.5 h-3.5 stroke-[2]" />
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 min-w-0">
                <span className="font-mono text-[14px] font-bold text-white uppercase truncate max-w-[220px] sm:max-w-[320px] lg:max-w-[420px]">
                  {fileInfo.cleanName}
                </span>
                <span className="font-mono text-[11px] text-[#8C8E96] uppercase shrink-0">
                  {fileInfo.ext} • {fileInfo.typeLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-[12px] shrink-0">
              <button
                type="button"
                onClick={() => setIsEditingLink(true)}
                className="text-[#8C8E96] hover:text-white bg-transparent hover:bg-transparent p-0 flex items-center justify-center transition-colors cursor-pointer border-none outline-none shadow-none"
                title="Редактировать ссылку вручную"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[#8C8E96] hover:text-[#FF0000] bg-transparent hover:bg-transparent p-0 flex items-center justify-center transition-colors cursor-pointer border-none outline-none shadow-none"
                  title="Удалить файл"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Text Input Mode */
          <div className="flex-1 h-full flex items-center">
            <input
              type="text"
              value={value}
              placeholder={placeholder}
              style={{ paddingLeft: '12px', paddingRight: '12px' }}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 h-full bg-transparent text-[14px] sm:text-[15px] font-mono font-bold uppercase text-white placeholder:text-[#404040] focus:outline-none"
            />
            {isEditingLink && (
              <button
                type="button"
                onClick={() => setIsEditingLink(false)}
                className="px-2.5 py-1 mr-1 bg-[#232326] hover:bg-[#1458E6] text-white font-mono text-xs font-bold uppercase rounded transition-colors cursor-pointer shrink-0"
                title="Готово"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            {value && onClear && !isDragOver && !isEditingLink && (
              <button
                type="button"
                onClick={onClear}
                className="w-[36px] h-[40px] text-[#8C8E96] hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title="Очистить"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <label
          className={`h-[44px] w-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0 transition-colors border-none outline-none ${
            isDragOver ? 'bg-white text-black shadow-lg' : 'bg-[#323232] hover:bg-white text-white hover:text-black'
          }`}
          title={title}
        >
          {isUploading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-current" />
          ) : isDragOver ? (
            <UploadCloud className="w-4 h-4 text-current" />
          ) : (
            <Paperclip className="w-4 h-4 text-current" />
          )}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileUpload(file, (url) => {
                  onChange(url);
                  setIsEditingLink(false);
                }, fieldKey);
              }
            }}
          />
        </label>
      </div>

      {/* Error message display under input */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-[#E50914] text-[12px] font-mono font-bold leading-tight mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

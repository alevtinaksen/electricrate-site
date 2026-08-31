'use client';

import React, { useState } from 'react';
import { Languages, RefreshCw, Check } from 'lucide-react';

interface TranslateButtonProps {
  sourceText: string;
  onTranslated: (translatedText: string) => void;
  className?: string;
}

export default function TranslateButton({
  sourceText,
  onTranslated,
  className = '',
}: TranslateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!sourceText || !sourceText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          onTranslated(data.translatedText);
          setIsDone(true);
          setTimeout(() => setIsDone(false), 2000);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={isLoading || !sourceText?.trim()}
      title="Перевести на английский язык"
      className={`h-[40px] w-[40px] min-w-[40px] min-h-[40px] aspect-square bg-[#323232] hover:bg-white text-white hover:text-black disabled:bg-[#232326] disabled:text-[#666] flex items-center justify-center cursor-pointer shrink-0 transition-colors border-l border-[#26282C] outline-none ${className}`}
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 animate-spin text-current" />
      ) : isDone ? (
        <Check className="w-4 h-4 text-green-500 stroke-[3]" />
      ) : (
        <Languages className="w-4 h-4 text-current" />
      )}
    </button>
  );
}

'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldPin: string;
  setOldPin: (v: string) => void;
  newPin: string;
  setNewPin: (v: string) => void;
  confirmPin: string;
  setConfirmPin: (v: string) => void;
  pinModalError: string;
  setPinModalError: (v: string) => void;
  onSave: () => void;
}

export default function AdminPinModal({
  isOpen,
  onClose,
  oldPin,
  setOldPin,
  newPin,
  setNewPin,
  confirmPin,
  setConfirmPin,
  pinModalError,
  setPinModalError,
  onSave,
}: AdminPinModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onClick={() => {
        onClose();
        setPinModalError('');
      }}
    >
      <div
        className="relative w-full max-w-md select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{ padding: '36px 36px 32px 36px' }}
          className="w-full bg-[#141416] rounded-none shadow-2xl flex flex-col gap-5 border-none"
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-[20px] font-bold uppercase text-white font-mono leading-tight tracking-wide">
              СМЕНА ПАРОЛЯ
            </h3>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* 1. Текущий пароль */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                текущий пароль
              </label>
              <input
                type="password"
                value={oldPin}
                onChange={(e) => {
                  setOldPin(e.target.value);
                  if (pinModalError) setPinModalError('');
                }}
                placeholder="ВВЕДИТЕ ТЕКУЩИЙ ПАРОЛЬ"
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
                className="w-full h-[40px] bg-transparent border border-[#26282C] focus:bg-white/[0.04] text-[15px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* 2. Новый пароль с вопросиком и подсказкой */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                  новый пароль
                </label>
                <div className="relative group/tooltip flex items-center">
                  <span className="w-4 h-4 rounded-full bg-[#26282C] group-hover/tooltip:bg-[#3A3A3C] text-[#8C8E96] group-hover/tooltip:text-white flex items-center justify-center text-[10px] font-mono font-bold cursor-help transition-colors select-none">
                    ?
                  </span>
                  <div className="absolute bottom-[calc(100%+6px)] right-0 hidden group-hover/tooltip:flex flex-col items-start gap-0 z-50 pointer-events-none select-none text-left">
                    <span
                      style={{
                        fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                        lineHeight: '130%',
                        letterSpacing: '-0.1px',
                        backgroundColor: '#3A3A3A',
                        color: '#E6E6E6',
                        padding: '1px 4px',
                      }}
                      className="inline-block w-fit whitespace-nowrap uppercase rounded-none m-0 block"
                    >
                      МИНИМУМ 4 СИМВОЛА,
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                        lineHeight: '130%',
                        letterSpacing: '-0.1px',
                        backgroundColor: '#3A3A3A',
                        color: '#E6E6E6',
                        padding: '1px 4px',
                      }}
                      className="inline-block w-fit whitespace-nowrap uppercase rounded-none -mt-[1px] block"
                    >
                      ЦИФРЫ ИЛИ ЛАТИНСКИЕ БУКВЫ
                    </span>
                  </div>
                </div>
              </div>
              <input
                type="password"
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value);
                  if (pinModalError) setPinModalError('');
                }}
                placeholder="ВВЕДИТЕ НОВЫЙ ПАРОЛЬ"
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
                className="w-full h-[40px] bg-transparent border border-[#26282C] focus:bg-white/[0.04] text-[15px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none transition-colors"
              />
            </div>

            {/* 3. Повторите новый пароль */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[14px] font-bold leading-[17.5px] tracking-[-0.14px] lowercase text-[#5E5E5E]">
                повторите новый пароль
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  if (pinModalError) setPinModalError('');
                }}
                placeholder="ПОВТОРИТЕ НОВЫЙ ПАРОЛЬ"
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
                className="w-full h-[40px] bg-transparent border border-[#26282C] focus:bg-white/[0.04] text-[15px] font-mono font-bold text-white placeholder:text-[#404040] focus:outline-none transition-colors"
              />
            </div>

            {pinModalError && (
              <div className="flex items-center gap-2 text-[#E50914] text-xs font-mono font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinModalError}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-0 pt-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                setPinModalError('');
              }}
              style={{
                borderRadius: '56px',
                paddingTop: '8px',
                paddingBottom: '8px',
                paddingLeft: '16px',
                paddingRight: '16px',
                fontFamily: '"Geist Mono", monospace',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '20px',
                letterSpacing: '-0.16px',
                textTransform: 'uppercase',
              }}
              className="bg-[#232326] hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0 border-none outline-none active:scale-95"
            >
              ОТМЕНА
            </button>
            <button
              type="button"
              onClick={onSave}
              style={{
                borderRadius: '56px',
                paddingTop: '8px',
                paddingBottom: '8px',
                paddingLeft: '16px',
                paddingRight: '16px',
                fontFamily: '"Geist Mono", monospace',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '20px',
                letterSpacing: '-0.16px',
                textTransform: 'uppercase',
              }}
              className="bg-[#1458E6] hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0 border-none outline-none active:scale-95"
            >
              СОХРАНИТЬ
            </button>
          </div>
        </div>

        {/* Floating Square Close Cross Button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            setPinModalError('');
          }}
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

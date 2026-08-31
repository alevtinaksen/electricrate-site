'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface AdminConfirmModalProps {
  modal: ConfirmModalState;
  onClose: () => void;
}

export default function AdminConfirmModal({ modal, onClose }: AdminConfirmModalProps) {
  if (!modal.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Body Container */}
        <div
          style={{ padding: '36px 36px 32px 36px' }}
          className="w-full bg-[#141416] border-none shadow-2xl flex flex-col items-center text-center"
        >
          {/* Centered Title */}
          <h3
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '22px',
              letterSpacing: '-0.2px',
            }}
            className="uppercase text-white text-center"
          >
            {modal.title}
          </h3>

          {/* Description Message */}
          <p
            style={{
              marginTop: '12px',
              maxWidth: '383px',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '17.5px',
              letterSpacing: '-0.14px',
            }}
            className="text-white opacity-40 text-center lowercase"
          >
            {modal.message}
          </p>

          {/* Action Buttons: ОТМЕНА & ПОДТВЕРДИТЬ */}
          <div
            style={{ marginTop: '32px' }}
            className="flex items-center justify-center gap-0 w-full"
          >
            <button
              type="button"
              onClick={onClose}
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
              className="bg-[#232326] hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0 border-none outline-none active:scale-95 shadow-none"
            >
              {modal.cancelText || 'ОТМЕНА'}
            </button>

            <button
              type="button"
              onClick={() => {
                const action = modal.onConfirm;
                onClose();
                action();
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
              className={`${modal.isDestructive ? 'bg-[#FF0000]' : 'bg-[#1458E6]'} hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0 border-none outline-none active:scale-95 shadow-none`}
            >
              {modal.confirmText || 'ПОДТВЕРДИТЬ'}
            </button>
          </div>
        </div>

        {/* Floating Square Close Cross Button */}
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

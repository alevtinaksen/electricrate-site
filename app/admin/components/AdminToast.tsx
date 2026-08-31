'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface AdminToastProps {
  toast: { message: string; visible: boolean };
}

export default function AdminToast({ toast }: AdminToastProps) {
  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-none"
        >
          <div
            style={{
              borderRadius: '56px',
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '24px',
              paddingRight: '24px',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '17.5px',
              letterSpacing: '-0.14px',
            }}
            className="bg-[#1458E6] text-white shadow-2xl uppercase tracking-wider flex items-center gap-2 border-none"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            <span>{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

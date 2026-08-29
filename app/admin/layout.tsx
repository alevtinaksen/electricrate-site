import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black p-[12px] flex gap-[12px] overflow-hidden box-border z-[999] select-none text-white font-mono">
      {children}
    </div>
  );
}

import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black flex overflow-hidden box-border z-[999] text-white font-mono">
      {children}
    </div>
  );
}

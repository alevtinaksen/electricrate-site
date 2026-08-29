'use client';

import { usePathname } from 'next/navigation';

export default function AmbientGlowOverlay() {
  const pathname = usePathname();

  // Hide PNG masks completely in the admin panel
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none z-20 overflow-hidden select-none"
    >
      {/* Top Glow Mask (_76.png) */}
      <img
        src="/_76.png"
        alt=""
        className="absolute top-0 left-0 w-full h-auto pointer-events-none select-none mix-blend-screen z-20"
      />

      {/* Bottom Glow Mask (_75.png) */}
      <img
        src="/_75.png"
        alt=""
        className="absolute bottom-0 left-0 w-full h-auto pointer-events-none select-none mix-blend-screen z-20"
      />
    </div>
  );
}

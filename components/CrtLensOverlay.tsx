'use client';

import React, { useEffect, useState } from 'react';

export default function CrtLensOverlay() {
  const [dispMapUrl, setDispMapUrl] = useState<string>('');

  useEffect(() => {
    // Generate an accurate spherical barrel / fisheye displacement texture
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Normalized coordinates from -1 to 1
        const nx = (x / (size - 1)) * 2 - 1;
        const ny = (y / (size - 1)) * 2 - 1;
        const r = Math.sqrt(nx * nx + ny * ny);

        let dx = 0;
        let dy = 0;

        if (r < 1.0) {
          // Spherical bulge distortion formula
          const factor = Math.pow(Math.sin((r * Math.PI) / 2), 1.5) / (r || 1);
          const distFactor = (1 - factor) * 1.2;
          dx = nx * distFactor;
          dy = ny * distFactor;
        }

        // Map displacement (-1..1) to color range (0..255), where 128 is neutral (0 offset)
        const rVal = Math.max(0, Math.min(255, Math.round(128 + dx * 127)));
        const gVal = Math.max(0, Math.min(255, Math.round(128 + dy * 127)));

        const idx = (y * size + x) * 4;
        data[idx] = rVal; // Red channel = X displacement
        data[idx + 1] = gVal; // Green channel = Y displacement
        data[idx + 2] = 128; // Blue channel = neutral
        data[idx + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setDispMapUrl(canvas.toDataURL());
  }, []);

  return (
    <>
      {/* ── SVG Filter for Optical CRT Fisheye / Bulge Distortion ── */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="crt-bulge" x="-10%" y="-10%" width="120%" height="120%">
            {dispMapUrl && (
              <feImage
                href={dispMapUrl}
                result="displacementMap"
                preserveAspectRatio="none"
                x="0"
                y="0"
                width="100%"
                height="100%"
              />
            )}
            {dispMapUrl ? (
              <feDisplacementMap
                in="SourceGraphic"
                in2="displacementMap"
                scale="32"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            ) : (
              <feOffset in="SourceGraphic" dx="0" dy="0" />
            )}
          </filter>
        </defs>
      </svg>

      {/* ── CRT Screen Texture Overlays (Lens Vignette & Spherical Highlights) ── */}
      <div className="fixed inset-0 pointer-events-none z-[48] select-none overflow-hidden will-change-transform transform-gpu">
        {/* Spherical Tube Bulge Highlight & Glass Reflections */}
        <div
          className="absolute inset-0 w-full h-full opacity-35"
          style={{
            background:
              'radial-gradient(ellipse 70% 65% at 48% 46%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 80%)',
          }}
        />

        {/* Deep CRT Edge Vignette & Curved Bezel Shadow */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              'radial-gradient(ellipse 75% 75% at center, transparent 55%, rgba(0, 0, 0, 0.35) 80%, rgba(0, 0, 0, 0.85) 100%)',
            boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.75)',
          }}
        />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import AmbientGlowOverlay from "@/components/AmbientGlowOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "Влад Сапунов — Видеооператор",
  description: "Влад Сапунов — профессиональный видеооператор. Корпоративные съёмки, клипы, реклама.",
  openGraph: {
    title: "Влад Сапунов — Видеооператор",
    description: "Профессиональная видеосъёмка: корпоративные проекты, музыкальные клипы, реклама.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={GeistMono.variable}>
      <body className={`${GeistMono.className} antialiased bg-[#0d0d0d] text-white relative`}>
        {/* Ambient Glow Masks at z-20 */}
        <AmbientGlowOverlay />
        {/* Main layout container allowing z-50 buttons & titles to stay strictly ABOVE glow masks */}
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

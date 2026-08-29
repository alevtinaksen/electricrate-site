import type { Metadata } from "next";
import localFont from "next/font/local";
import AmbientGlowOverlay from "@/components/AmbientGlowOverlay";
import "./globals.css";

const lebowski = localFont({
  src: [
    {
      path: "../public/fonts/LebowskiByPragmatica-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/LebowskiByPragmatica-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/LebowskiByPragmatica-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-lebowski",
  display: "swap",
});

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
    <html lang="ru" className={lebowski.variable}>
      <body className={`${lebowski.className} antialiased bg-[#0d0d0d] text-white relative`}>
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

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0d0d0d",
};

export const metadata: Metadata = {
  title: "Влад Сапунов — Режиссер монтажа & Видеооператор | ElectricRate",
  description: "Профессиональный видеомонтаж, съемка рекламы, рилс, промо и клипов уровня кино. Санкт-Петербург, Москва и выезд по всему миру.",
  keywords: [
    "видеомонтаж",
    "режиссер монтажа",
    "видеооператор",
    "съемка рилс",
    "reels",
    "видеопродакшн",
    "съемка рекламы",
    "клипы",
    "цветокоррекция",
    "саунд дизайн",
    "влад сапунов",
    "electricrate",
    "video editor",
    "cinematographer",
    "санкт-петербург",
    "москва"
  ],
  authors: [{ name: "Влад Сапунов", url: "https://t.me/sapunov_vlad" }],
  creator: "Влад Сапунов",
  metadataBase: new URL("https://electricrate.ru"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: '/favicon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon-light.png',
      },
    ],
    shortcut: '/favicon-light.png',
    apple: '/favicon-light.png',
  },
  openGraph: {
    title: "Влад Сапунов — Режиссер монтажа & Видеооператор",
    description: "Профессиональный видеомонтаж, съемка рекламы, рилс и клипов уровня кино. Портфолио проектов.",
    type: "website",
    locale: "ru_RU",
    alternateLocale: ["en_US"],
    siteName: "Влад Сапунов | ElectricRate Portfolio",
    images: [
      {
        url: '/vlad-portrait.jpg',
        width: 1200,
        height: 630,
        alt: 'Влад Сапунов — Режиссер монтажа & Видеооператор',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Влад Сапунов — Режиссер монтажа & Видеооператор",
    description: "Профессиональный видеомонтаж и видеосъемка. Портфолио проектов.",
    images: ['/vlad-portrait.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://electricrate.ru/#person",
      "name": "Влад Сапунов",
      "alternateName": "Vlad Sapunov",
      "jobTitle": "Режиссер монтажа, Видеооператор",
      "description": "Профессиональный видеомейкер полного цикла. Картинка уровня кино — от идеи до мастеринга.",
      "url": "https://electricrate.ru",
      "sameAs": [
        "https://t.me/sapunov_vlad",
        "https://behance.net/vladsapunov",
        "https://youtube.com/@vladsapunov",
        "https://instagram.com/sapunov_vlad"
      ],
      "knowsAbout": ["Video Editing", "Color Grading", "Cinematography", "Sound Design", "Directing", "Reels Production"]
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://electricrate.ru/#service",
      "name": "Влад Сапунов Video Production",
      "url": "https://electricrate.ru",
      "telephone": "+7(950)016-17-51",
      "email": "electricrate@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Санкт-Петербург",
        "addressCountry": "RU"
      },
      "priceRange": "$$",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Услуги видеопроизводства",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Видеомонтаж полного цикла (Full Cycle Video Editing)",
              "description": "Монтаж рекламных роликов, YouTube-шоу, музыкальных клипов и корпоративных фильмов."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Съемка рекламных и имиджевых видео",
              "description": "Кинематографичная видеосъемка на кинокамеры, постановка света, режиссура."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Съемка и монтаж Reels / Shorts",
              "description": "Создание динамичных вертикальных видеороликов с удержанием внимания для брендов и экспертов."
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Цветокоррекция и саунд-дизайн",
              "description": "Грейдинг в DaVinci Resolve, сведение звука, работа со спецэффектами."
            }
          }
        ]
      }
    },
    {
      "@type": "VideoObject",
      "@id": "https://electricrate.ru/#video-morskaya-party",
      "name": "MORSKAYA PARTY — Видеоролик",
      "description": "Имиджевое промо-видео Морская вечеринка. Режиссура и монтаж: Влад Сапунов.",
      "thumbnailUrl": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=85",
      "uploadDate": "2026-01-01T12:00:00+03:00"
    },
    {
      "@type": "VideoObject",
      "@id": "https://electricrate.ru/#video-finntrail-hr",
      "name": "FINNTRAIL HR — Корпоративное промо",
      "description": "Корпоративный фильм для бренда Finntrail. Режиссура и монтаж: Влад Сапунов.",
      "thumbnailUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=85",
      "uploadDate": "2026-01-01T12:00:00+03:00"
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '';

  return (
    <html lang="ru" className={GeistMono.variable}>
      <head>
        <link id="dynamic-favicon" rel="icon" href="/favicon-light.png?v=3" />
        <link rel="icon" href="/favicon-light.png?v=3" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.png?v=3" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/favicon-light.png?v=3" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var matcher = window.matchMedia('(prefers-color-scheme: dark)');
                  function updateIcon(e) {
                    var link = document.getElementById('dynamic-favicon') || document.querySelector('link[rel="icon"]');
                    if (link) {
                      link.href = (e.matches ? '/favicon-dark.png?v=3' : '/favicon-light.png?v=3');
                    }
                  }
                  if (matcher.addEventListener) {
                    matcher.addEventListener('change', updateIcon);
                  }
                  updateIcon(matcher);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${GeistMono.className} antialiased bg-[#0d0d0d] text-white relative`}>
        {/* Main layout container allowing z-50 buttons & titles to stay strictly ABOVE glow masks */}
        <div className="min-h-screen">
          {children}
        </div>

        {/* ── Yandex Metrika Analytics (Asynchronous, no speed impact) ── */}
        {ymId && (
          <Script
            id="yandex-metrika"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                ym(${ymId}, "init", {
                  clickmap:true,
                  trackLinks:true,
                  accurateTrackBounce:true,
                  webvisor:true
                });
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}

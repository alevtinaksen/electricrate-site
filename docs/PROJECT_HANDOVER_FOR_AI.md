# 🚀 ElectricRate Portfolio — Руководство по передаче проекта (Project Handover for AI & Developers)

> **Автор проекта**: Влад Сапунов (Vlad Sapunov) — режиссер монтажа, видеооператор, колорист.  
> **Продакшн / Бренд**: ElectricRate  
> **Сайт в продакшене**: [https://electricrate-site.vercel.app](https://electricrate-site.vercel.app)  
> **Стек технологий**: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Framer Motion, Lenis Scroll, Supabase (PostgreSQL), Geist Mono Font.

---

## 📌 1. Архитектура и Структура проекта

```
electricrate-site/
├── app/
│   ├── layout.tsx         # Root layout: Geist Mono, Ambient Glow, Schema.org JSON-LD, Yandex Metrika, Dynamic Favicons
│   ├── page.tsx           # Главная страница: Layout, Hero лента, Навбар, Мобильное меню, VideoModal
│   ├── globals.css        # Глобальные стили, кастомные утилиты и анимации
│   ├── admin/             # Панель управления контентом и аналитикой (доступ по PIN)
│   ├── api/
│   │   ├── content/       # Синхронизация контента (Supabase + локальный fallback)
│   │   ├── analytics/     # Трекинг просмотров видео и кликов по контактам
│   │   ├── upload/        # Загрузка видео и изображений в Supabase Storage / public/uploads
│   │   └── translate/     # Автоперевод контента RU <-> EN
│   ├── robots.ts          # Генератор robots.txt
│   └── sitemap.ts         # Генератор sitemap.xml
├── components/
│   ├── Sidebar.tsx        # Левая колонка (Десктоп) & Верхний Hero-блок (Мобилка): имя, био, контакты
│   ├── ReelsSection.tsx   # Главная лента из 5 Hero видеороликов (Morskaya Party, Dogma, HerzenRowing и др.)
│   ├── WorksSection.tsx   # Секции портфолио (Имидж и реклама, Спорт, Музыка, YouTube, Интервью)
│   ├── ClientsSection.tsx # Бегущая строка и логотипы брендов/клиентов (KTK, Bereg, Chez Serge и др.)
│   ├── ProcessSection.tsx # Секция услуг и процесса видеопроизводства
│   ├── ContactSection.tsx # Контактный блок, Telegram, телефон, соцсети
│   ├── Footer.tsx         # Нижний футер с копирайтом и ссылками
│   ├── VideoModal.tsx     # Полноэкранный кинотеатральный видеоплеер (горячие клавиши YouTube + мобильные свайпы)
│   ├── Preloader.tsx      # Десктопный кинематографичный прелоадер со счетчиком до 99%
│   ├── TrueGlitchFilter.tsx # SVG CRT/Глитч фильтр
│   ├── AmbientGlowOverlay.tsx # Световые амбиентные маски
│   └── FloatingNavbar.tsx # Плавающий бар (бургер + кнопка «СВЯЗАТЬСЯ»)
├── data/
│   ├── content.json       # Локальная база данных (все тексты, секции, ролики, обложки, клиенты)
│   └── analytics.json     # Локальный лог просмотров и кликов
├── lib/
│   └── supabase.ts        # Клиент Supabase и типизированные структуры данных
├── public/
│   ├── uploads/           # Все локальные медиафайлы (оптимизированные MP4, JPEG-обложки, PNG-логотипы)
│   ├── favicon-light.png  # Фавиконка для светлой темы
│   ├── favicon-dark.png   # Фавиконка для темной темы
│   └── vlad-portrait.jpg  # Фотопортрет для OpenGraph
└── docs/                  # Документация и заметки из Obsidian
```

---

## ⚡ 2. Золотые правила и Конвенции проекта

1. **Строгая изоляция мобильной и десктопной версий**:
   - Десктопная версия зафиксирована как эталон. Любые мобильные изменения изолируются через медиа-запросы Tailwind (`md:hidden` / `hidden md:flex`) или отдельные мобильные компоненты.
   - Смуз-скролл `Lenis` включен **только для десктопа** (`window.innerWidth >= 768`). На смартфонах работает сверхбыстрый нативный скролл страницы на 120Hz.
2. **Типографика и Дизайн-код**:
   - Основной шрифт: `Geist Mono` (`var(--font-geist-mono), monospace`) — плотная швейцарская сетка, заглавные буквы (`uppercase`), отрицательный трекинг (`letter-spacing: -0.2px` до `-3px`).
   - Основные цвета: Фон `#0d0d0d`, Акцентный синий `#1458E6`, Текст `#FFFFFF` / `#0B0B0B`.
3. **Отказоустойчивость базы данных (Fallback First)**:
   - Сайт спроектирован так, что если Supabase не настроен или временно недоступен, он **на 100% автономно** работает на локальном `data/content.json`.
4. **Видеоплеер `VideoModal`**:
   - Поддерживает управление с клавиатуры по стандарту YouTube (Пробел, K, J, L, F, M, Стрелки, `[` / `]`).
   - На мобилках поддерживает свайп вниз для закрытия видео и свайпы влево/вправо для плейлиста.
   - Всегда перекрывает все плавающие бары (`z-[9999]`).

---

## 🔧 3. Установка, Запуск и Деплой

### Локальный запуск:
```bash
# 1. Установка зависимостей
npm install

# 2. Запуск локального сервера разработки (порт 3000)
npm run dev

# 3. Проверка production сборки
npm run build
```

### Переменные окружения (`.env.local`):
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_YANDEX_METRIKA_ID=your-metrika-id
ADMIN_PIN=your-secure-pin
```

---

## 💡 4. Точки роста и План будущих улучшений (Roadmap)

Новый ИИ или разработчик может развить проект по следующим ключевым направлениям (на основе проведенного аудита):

1. **Cloudflare Stream / BunnyCDN HLS**:
   - Перевод видеофайлов из `/uploads/*.mp4` в HLS/DASH стриминг с адаптивным битрейтом (0.2с до старта первого кадра на мобильном 4G).
2. **Telegram Lead Bot**:
   - Настроить Telegram-бота в `/api/analytics`, который при каждом клике на кнопку «СВЯЗАТЬСЯ» или «Telegram» сразу отправляет пуш-уведомление в личные сообщения Владу.
3. **Google Analytics 4**:
   - Добавить GA4 для аналитики англоязычного зарубежного трафика.
4. **Next/Image AVIF & WebP**:
   - Автоматическая оптимизация растровых обложек для экономии до 40% трафика.

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center text-white font-mono">
      <h1
        className="font-bold tracking-[-0.04em] m-0 p-0"
        style={{ fontSize: 'clamp(80px, 15vw, 160px)', lineHeight: 0.85 }}
      >
        404
      </h1>
      <p
        className="uppercase tracking-[0.15em] text-white/80 m-0 mt-0 p-0"
        style={{ fontSize: 'clamp(12px, 1.6vw, 18px)', paddingBottom: '40px' }}
      >
        страница не найдена
      </p>
      <Link
        href="/"
        style={{
          paddingLeft: '20px',
          paddingRight: '20px',
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
          fontSize: '17px',
          fontWeight: 700,
          letterSpacing: '-0.2px',
          textTransform: 'uppercase',
        }}
        className="h-[54px] xl:h-[58px] flex items-center justify-center bg-[#1458E6] hover:bg-white hover:text-[#0B0B0B] text-white rounded-full active:scale-95 transition-all duration-200 cursor-pointer shadow-2xl border-none outline-none focus:outline-none shrink-0 no-underline whitespace-nowrap"
      >
        НА ГЛАВНУЮ
      </Link>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center text-white font-mono">
      <h1
        className="font-bold leading-none tracking-[-0.04em]"
        style={{ fontSize: 'clamp(80px, 15vw, 160px)' }}
      >
        404
      </h1>
      <p
        className="uppercase tracking-[0.15em] text-white/80 mt-1"
        style={{ fontSize: 'clamp(12px, 1.6vw, 18px)' }}
      >
        страница не найдена
      </p>
      <Link
        href="/"
        className="mt-10 px-8 py-3 bg-[#1458E6] text-white uppercase text-sm tracking-[0.15em] rounded-full hover:bg-[#1a6aff] transition-colors duration-200"
        style={{ fontSize: 'clamp(12px, 1.4vw, 16px)' }}
      >
        На главную
      </Link>
    </div>
  );
}

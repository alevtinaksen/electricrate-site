'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center text-white font-mono px-6">
      <h1 className="text-[clamp(80px,15vw,200px)] font-bold leading-none tracking-tighter text-[#1458E6]">
        500
      </h1>
      <p className="text-[clamp(14px,2vw,20px)] uppercase tracking-[0.2em] mt-4 text-gray-400">
        Что-то пошло не так
      </p>
      <button
        onClick={reset}
        className="mt-10 px-8 py-3 border border-white/20 text-white uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
      >
        Попробовать снова
      </button>
    </div>
  );
}

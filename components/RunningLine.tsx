"use client";

export default function RunningLine() {
  const text = "РЕСТОРАНЫ И ПРОЕКТЫ GŌSHT GROUP";
  const items = Array(4).fill(text); 

  return (
    // ИЗМЕНЕНИЯ:
    // bg-black          -> Черный фон
    // border-white/10   -> Тонкая светлая рамка сверху и снизу
    // py-10 md:py-16    -> Оставляем большие отступы, как договаривались
    <div className="w-full bg-[#0D0D0D] border-y border-white/10 py-10 md:py-16 overflow-hidden flex select-none relative z-20">
      
      {/* Лента 1 */}
      <div className="animate-infinite-scroll flex whitespace-nowrap">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mx-4 md:mx-8">
            {/* text-white -> Белый текст */}
            <span className="text-3xl md:text-5xl font-serif text-white uppercase tracking-tight">
              {item}
            </span>
            {/* text-white/30 -> Полупрозрачная белая звездочка */}
            <span className="ml-4 md:ml-8 text-2xl md:text-4xl text-white/30 transform translate-y-[-2px]">
              ✦
            </span>
          </div>
        ))}
      </div>

      {/* Лента 2 (Копия) */}
      <div className="animate-infinite-scroll flex whitespace-nowrap" aria-hidden="true">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mx-4 md:mx-8">
            <span className="text-3xl md:text-5xl font-serif text-white uppercase tracking-tight">
              {item}
            </span>
            <span className="ml-4 md:ml-8 text-2xl md:text-4xl text-white/30 transform translate-y-[-2px]">
              ✦
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
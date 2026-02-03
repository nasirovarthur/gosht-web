import Header from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Header />
      
      {/* Центральный блок */}
      <div className="flex h-screen w-full flex-col items-center justify-center">
        {/* Главный заголовок */}
        <h1 className="text-6xl md:text-9xl font-bold tracking-widest uppercase text-center">
          Gosht
        </h1>
        <p className="mt-6 text-xs md:text-sm tracking-[0.5em] text-gray-500 uppercase">
          Premium Hospitality
        </p>
      </div>
    </main>
  );
}
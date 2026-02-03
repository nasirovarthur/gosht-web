import Header from "@/components/Header";
// Убедись, что импортируешь именно HeroSlider, а не HeroSliderClient!
// Если VS Code автоматически написал HeroSliderClient - исправь на HeroSlider
import HeroSlider from "@/components/HeroSlider"; 
import RunningLine from "@/components/RunningLine";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0c0c0c]">
      <Header />
      
      <HeroSlider />
      
      <RunningLine />

      <div className="h-screen bg-[#131313] flex items-center justify-center text-white/20">
        Здесь будет следующий блок
      </div>
    </main>
  );
}
import HeroSlider from "@/components/HeroSlider"; 
import RunningLine from "@/components/RunningLine";
import { getRunningLine } from "@/lib/getRunningLine";
import Restaurants from "@/components/Restaurants";

export default async function Home() {
  const runningLineData = await getRunningLine();

  return (
    <main className="min-h-screen bg-base">
      <HeroSlider />
      
      <RunningLine text={runningLineData?.text} />

      <Restaurants />
    </main>
  );
}

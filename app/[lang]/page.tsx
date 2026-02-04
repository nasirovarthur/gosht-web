import HeroSlider from "@/components/HeroSlider"; 
import RunningLine from "@/components/RunningLine";
import { getNavigation, getHeaderText } from "@/lib/getNavigation";
import { getRunningLine } from "@/lib/getRunningLine";
import Restaurants from "@/components/Restaurants";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const headerText = await getHeaderText();
  const runningLineData = await getRunningLine();

  return (
    <main className="min-h-screen bg-[#0c0c0c]">
      <HeroSlider />
      
      <RunningLine text={runningLineData?.text} />
      
      <Restaurants />
    </main>
  );
}

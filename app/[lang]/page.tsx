import HeroSlider from "@/components/HeroSlider"; 
import RunningLine from "@/components/RunningLine";
import { getRunningLine } from "@/lib/getRunningLine";
import Restaurants from "@/components/Restaurants";
import GroupStorySection from "@/components/GroupStorySection";
import { getGroupStorySection } from "@/lib/getGroupStorySection";
import EventsSection from "@/components/EventsSection";
import { getHomeEventsSectionData } from "@/lib/getEvents";

export default async function Home() {
  const runningLineData = await getRunningLine();
  const groupStorySectionData = await getGroupStorySection();
  const homeEventsData = await getHomeEventsSectionData();

  return (
    <main className="min-h-screen bg-base">
      <HeroSlider />
      
      <RunningLine text={runningLineData?.text} />

      <Restaurants />

      <GroupStorySection data={groupStorySectionData} />

      <EventsSection
        featuredEvent={homeEventsData.featuredEvent}
        sideEvents={homeEventsData.sideEvents}
        labels={homeEventsData.labels}
      />
    </main>
  );
}

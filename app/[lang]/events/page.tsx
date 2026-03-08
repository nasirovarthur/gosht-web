import EventsListingPage from "@/components/EventsListingPage";
import { getEventsListingPageData } from "@/lib/getEvents";

export default async function EventsPage() {
  const eventsListingData = await getEventsListingPageData();

  return (
    <main className="min-h-screen bg-base pt-[104px] md:pt-[124px]">
      <EventsListingPage
        events={eventsListingData.events}
        labels={eventsListingData.labels}
        initialVisibleCount={eventsListingData.initialVisibleCount}
      />
    </main>
  );
}

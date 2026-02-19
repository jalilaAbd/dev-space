import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";

const events = [
  {
    id: 1,
    title: "title1",
    image: "/images/event1.png",
    slug: "slug1",
    location: "location1",
    date: "date1",
    time: "time1",
  },
  {
    id: 2,
    title: "title2",
    image: "/images/event2.png",
    slug: "slug2",
    location: "location2",
    date: "date2",
    time: "time2",
  },
]; // Placeholder for events data

const Page = () => {
  return (
    <section>
      <h1 className="text-center">Where Tech Minds Unite</h1>
      <p>Hackathons, Meetups, and Conferences, All in One Place</p>
      <ExploreBtn />
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {events &&
            events.length > 0 &&
            events.map((event) => (
              <li key={event.title} className="list-none">
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default Page;

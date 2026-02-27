import { DATA } from "@/data/resume";
import { HackathonCard } from "@/components/hackathon-card";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hackathons</h1>
      <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
        {DATA.hackathons.map((event) => (
          <li key={event.title + event.dates} className="py-4">
            <HackathonCard
              title={event.title}
              description={event.description}
              location={event.location}
              dates={event.dates}
              image={event.image}
              links={event.links}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

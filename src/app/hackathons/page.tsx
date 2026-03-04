import { DATA } from "@/data/resume";
import { HackathonCard } from "@/components/hackathon-card";

function parseDateFromString(s?: string) {
  if (!s) return 0;
  // Try to extract a year and month (e.g., "June 22nd - 23th, 2025" or "June 2025")
  const monthNames: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  const yearMatch = s.match(/(20\d{2}|19\d{2})/);
  const monthMatch = s.match(/(January|February|March|April|May|June|July|August|September|October|November|December)/i);

  const year = yearMatch ? parseInt(yearMatch[0], 10) : NaN;
  const month = monthMatch ? monthNames[monthMatch[0].toLowerCase()] : NaN;

  if (!isNaN(year) && !isNaN(month)) {
    return new Date(year, month, 1).getTime();
  }

  // fallback: try to parse any date
  const parsed = Date.parse(s);
  return isNaN(parsed) ? 0 : parsed;
}

export default function Page() {
  const sorted = [...DATA.hackathons].sort((a, b) => {
    const da = parseDateFromString(a.dates);
    const db = parseDateFromString(b.dates);
    return db - da; // newest first
  });

  return (
    <div className="space-y-6 mt-4 md:mt-0">
      <h1 className="text-3xl font-bold">Hackathons</h1>
      <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
        {sorted.map((event) => (
          <li key={event.title + event.dates} className="py-4">
            <HackathonCard
              title={event.title}
              description={event.description}
              location={event.location}
              dates={event.dates}
              image={event.image}
              links={event.links}
              result={(event as any).result}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

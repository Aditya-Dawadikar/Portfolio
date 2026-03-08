import { DATA } from "@/data/resume";
import { Badge } from "@/components/ui/badge";

const SKILL_CARDS = [
  { keys: ["programmingLanguages"], label: "Languages" },
  { keys: ["frontend"], label: "Frontend" },
  { keys: ["backend"], label: "Backend" },
  { keys: ["database"], label: "Database" },
  { keys: ["testing"], label: "Testing" },
  { keys: ["cicd"], label: "CI / CD" },
  { keys: ["cloud"], label: "Cloud" },
  { keys: ["dataprocessing"], label: "Data" },
  { keys: ["tools"], label: "Tools" },
  { keys: ["genAIskills"], label: "Generative AI" },
  { keys: ["mlResearchSkills"], label: "ML Research" },
  { keys: ["mlBasics"], label: "ML Basics" },
];

export default function Page() {
  return (
    <div className="mt-4 space-y-6 text-zinc-100 md:mt-0">
      <h1 className="text-3xl font-bold text-zinc-100">Skills</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_CARDS.map((card, idx) => {
          const items = card.keys.flatMap((k) => (DATA as any)[k] ?? []);
          if (!items || items.length === 0) return null;
          return (
            <div
              className="rounded-lg border border-white/15 bg-black/45 p-3"
              key={card.label + idx}
            >
              <div className="mb-2 text-sm font-medium text-zinc-300">{card.label}</div>
              <div className="flex flex-wrap gap-1">
                {items.map((it: string) => (
                  <Badge key={it} className="border border-white/20 bg-white/10 text-zinc-100">
                    {it}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

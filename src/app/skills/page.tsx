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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Skills</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SKILL_CARDS.map((card, idx) => {
          const items = card.keys.flatMap((k) => (DATA as any)[k] ?? []);
          if (!items || items.length === 0) return null;
          return (
            <div className="skill-card" key={card.label + idx}>
              <div className="mb-2 text-sm font-medium text-muted-foreground">{card.label}</div>
              <div className="flex flex-wrap gap-1">
                {items.map((it: string) => (
                  <Badge key={it}>{it}</Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

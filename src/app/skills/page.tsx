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
];

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Skills</h1>
      <p className="text-muted-foreground">Click a card to flip for more details.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SKILL_CARDS.map((card, idx) => {
          const items = card.keys.flatMap((k) => (DATA as any)[k] ?? []);
          if (!items || items.length === 0) return null;
          const id = `skills-flip-${idx}`;
          return (
            <div className="flip-card" key={card.label + idx}>
              <input id={id} className="flip-checkbox" type="checkbox" />
              <label htmlFor={id} className="flip-card-inner">
                <div className="skill-card flip-card-front">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">{card.label}</div>
                  <div className="flex flex-wrap gap-1">
                    {items.map((it: string) => (
                      <Badge key={it}>{it}</Badge>
                    ))}
                  </div>
                </div>
                <div className="skill-card flip-card-back">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">About {card.label}</div>
                  <div className="text-sm text-muted-foreground">You can describe experience or proficiency here.</div>
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

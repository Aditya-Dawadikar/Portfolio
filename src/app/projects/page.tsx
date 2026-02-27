import { DATA } from "@/data/resume";
import { ProjectCard } from "@/components/project-card";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Projects</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {DATA.projects
          .slice()
          .sort((a, b) => {
            const parse = (s?: string) => {
              if (!s) return new Date(0);
              const first = s.split("-")[0].trim();
              const d = new Date(first);
              return isNaN(d.getTime()) ? new Date(0) : d;
            };
            return parse(b.dates).getTime() - parse(a.dates).getTime();
          })
          .map((project) => (
            <ProjectCard
              key={project.title}
              href={project.href}
              title={project.title}
              description={project.description}
              dates={project.dates}
              tags={project.technologies}
              image={project.image}
              video={project.video}
              links={project.links}
            />
          ))}
      </div>
    </div>
  );
}

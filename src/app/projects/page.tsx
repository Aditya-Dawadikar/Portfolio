import { DATA } from "@/data/resume";
import { ProjectCard } from "@/components/project-card";

export default function Page() {
  const sortedProjects = DATA.projects
    .slice()
    .sort((a, b) => {
      const parse = (s?: string) => {
        if (!s) return new Date(0);
        const first = s.split("-")[0].trim();
        const d = new Date(first);
        return isNaN(d.getTime()) ? new Date(0) : d;
      };
      return parse(b.dates).getTime() - parse(a.dates).getTime();
    });

  return (
    <div className="space-y-6 mt-4 md:mt-0">
      <h1 className="text-3xl font-bold">Projects</h1>
      <p>I believe the best way to learn engineering is by building things. Most of what I truly understand today came from experimenting, breaking systems, fixing them, and iterating until they worked. That’s why I constantly work on side projects — they give me the freedom to explore ideas, test architectures, and understand technologies beyond theory. I also try not to lock myself into a single tech stack. Programming fundamentals, system thinking, and problem-solving skills transfer across languages and frameworks, so I stay open to learning whatever tool best fits the problem. This page is a collection of projects where I explored different technologies, architectures, and ideas through hands-on experimentation and collaboration.</p>
      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-3">
        {sortedProjects.map((project: any) => (
            <ProjectCard
              key={project.title}
              href={project.href}
              title={project.title}
              description={project.description}
              dates={project.dates}
              tags={project.technologies}
              image={project.image}
              video={project.video}
              embed={project.embed}
              team={project.team}
              hackathonWinner={project.hackathonWinner}
              links={project.links}
              className="mb-4 break-inside-avoid"
            />
        ))}
      </div>
    </div>
  );
}

import { HackathonCard } from "@/components/hackathon-card";
// removed BlurFade animations per request
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import FeatureCard from "@/components/feature-card";
import Marquee from "react-fast-marquee";
import { MyActivity } from "@/components/my-activity";

// blur animation removed
const iconSize = 30;

const SKILL_LOGO_SLUGS: Record<string, string> = {
  Python: "python",
  Javascript: "javascript",
  Typescript: "typescript",
  Java: "openjdk",
  "C++": "cplusplus",
  HTML: "html5",
  CSS: "css3",
  SQL: "sqlite",
  FastAPI: "fastapi",
  ExpressJs: "express",
  SpringBoot: "springboot",
  React: "react",
  Angular: "angular",
  PostgreSQL: "postgresql",
  MongoDB: "mongodb",
  Redis: "redis",
  Docker: "docker",
  Kubernetes: "kubernetes",
  Git: "git",
  AWS: "amazonaws",
  GCP: "googlecloud",
};

function getSkillLogo(skill: string) {
  const slug = SKILL_LOGO_SLUGS[skill];
  return slug
    ? `https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/${slug}.svg`
    : null;
}

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
  const topSkills = DATA.topSkills;
  const rowCount = 1;
  const skillRows = Array.from({ length: rowCount }, () => [] as string[]);
  topSkills.forEach((skill, index) => {
    skillRows[index % rowCount].push(skill);
  });

  return (
    <main className="flex min-h-[100dvh] flex-col space-y-10 overflow-x-hidden text-zinc-100">
      <section id="hero" className="mt-4 md:mt-0">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="gap-2 flex justify-between">
            <div className="flex-col flex flex-1 space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">{`Hi, I'm ${DATA.name.split(" ")[0]} 👋`}</h1>
              <p className="max-w-[600px] text-zinc-300 md:text-xl">{DATA.description}</p>
            </div>
            <Avatar className="size-28 border">
              <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
              <AvatarFallback>{DATA.initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </section>
      <section id="about">
        <h2 className="text-2xl font-bold">About</h2>
        <Markdown className="prose max-w-full text-pretty text-base text-zinc-300 prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-a:text-zinc-100">
          {DATA.summary}
        </Markdown>
        <br />
        <div className="flex items-center gap-4">
          <a href="https://medium.com/@aditya-dawadikar" target="_blank" rel="noopener noreferrer">
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/medium.svg"
              alt="Medium"
              width={iconSize}
              height={iconSize}
              className="brightness-0 invert hover:opacity-80"
            />
          </a>
          <a href="https://linkedin.com/in/aditya-dawadikar" target="_blank" rel="noopener noreferrer">
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg"
              alt="LinkedIn"
              width={iconSize}
              height={iconSize}
              className="brightness-0 invert hover:opacity-80"
            />
          </a>
          <a href="https://github.com/aditya-dawadikar" target="_blank" rel="noopener noreferrer">
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg"
              alt="GitHub"
              width={iconSize}
              height={iconSize}
              className="brightness-0 invert hover:opacity-80"
            />
          </a>
        </div>
      </section>
      <section id="interests">
        <h2 className="text-2xl font-bold">Interests</h2>
        <p className="mt-1 text-base text-zinc-300">
          Areas I am actively exploring and building in.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DATA.interests.map((interest) => (
            <Badge key={interest} variant="secondary" className="px-2.5 py-1 text-xs">
              {interest}
            </Badge>
          ))}
        </div>
      </section>
      {/* <section id="top-skills" className=" min-w-0 overflow-hidden">
        <h2 className="text-xl font-bold">Top Skills</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Core technologies I use the most.
        </p>
        <div className="mt-3 w-full max-w-full min-w-0 space-y-2 overflow-hidden rounded-lg bg-background/40">
          {skillRows.map((row, rowIndex) => {
            if (row.length === 0) return null;

            const maxItemsPerRow = 5;
            const limitedRow = row.slice(0, maxItemsPerRow);
            if (limitedRow.length === 0) return null;

            return (
              <div key={`skill-row-${rowIndex}`} className="relative w-full max-w-full min-w-0 overflow-hidden rounded-md">
                <Marquee
                  // autoFill={true}
                  gradient={false}
                  loop={0}
                  speed={32 + rowIndex * 8}
                  direction={rowIndex % 2 === 1 ? "right" : "left"}
                >
                  {limitedRow.map((skill, index) => {
                    const logo = getSkillLogo(skill);
                    return (
                      <div
                        key={`${skill}-${rowIndex}-${index}`}
                        className="mr-3 flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 whitespace-nowrap"
                      >
                        {logo ? (
                          <img
                            src={logo}
                            alt={`${skill} logo`}
                            width={14}
                            height={14}
                            className="h-3.5 w-3.5"
                            loading="lazy"
                          />
                        ) : (
                          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[8px] leading-none">
                            {skill.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="text-xs font-medium">{skill}</span>
                      </div>
                    );
                  })}
                </Marquee>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
              </div>
            );
          })}
        </div>
      </section> */}
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <h2 className="text-2xl font-bold">Work Experience</h2>
          {DATA.work.map((work) => (
            <ResumeCard
              key={work.company}
              logoUrl={work.logoUrl}
              altText={work.company}
              title={work.company}
              subtitle={work.title}
              href={work.href}
              badges={work.badges}
              period={`${work.start} - ${work.end ?? "Present"}`}
              description={work.description}
            />
          ))}
        </div>
      </section>
      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <h2 className="text-2xl font-bold">Education</h2>
          {DATA.education.map((education) => (
            <ResumeCard
              key={education.school}
              href={education.href}
              logoUrl={education.logoUrl}
              altText={education.school}
              title={education.school}
              subtitle={education.degree}
              period={`${education.start} - ${education.end}`}
            />
          ))}
        </div>
      </section>
      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <h2 className="text-2xl font-bold">My Activity</h2>
          <MyActivity />
        </div>
      </section>
      <section id="explore">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Explore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard title="My Skills" description="All the tech that I even explored" href="/skills" backgroundImage="/geekgod/skilled.png">
            </FeatureCard>

            <FeatureCard title="My Projects" description="Explore projects and demos" href="/projects" backgroundImage="/geekgod/builder.png">
            </FeatureCard>

            <FeatureCard title="My Hackathons" description="View past hackathons and results" href="/hackathons" backgroundImage="/geekgod/winner.png">
            </FeatureCard>

            <FeatureCard title="My Blogs" description="Read featured and recent blog posts" href="/blog" backgroundImage="/geekgod/writer.png">
            </FeatureCard>

            <FeatureCard title="My Research" description="Checkout my research interests" href="/papers" backgroundImage="/geekgod/innovator.png">
            </FeatureCard>

            <FeatureCard title="My Stories" description="Lessons from my work" href="/stories" backgroundImage="/geekgod/teacher.png">
            </FeatureCard>

          </div>
        </div>
      </section>

      <section id="explore">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard title="System Design" description="System Design Interview Preparation Kit" href="/system-design-library" backgroundImage="/geekgod/resources.png">
            </FeatureCard>

            <FeatureCard title="Frontend Engineeing" description="Frontend Engineering Interview Preparation Kit" href="/frontend-resources" backgroundImage="/geekgod/resources.png">
            </FeatureCard>

            <FeatureCard title="AI Engineeing" description="AI Engineering Must Read Papers" href="/ai-engineering" backgroundImage="/geekgod/resources.png">
            </FeatureCard>
          </div>
        </div>
      </section>


      {/* <section id="contact">
        <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                Contact
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get in Touch
              </h2>
            </div>
          </BlurFade>
        </div>
      </section> */}
    </main>
  );
}

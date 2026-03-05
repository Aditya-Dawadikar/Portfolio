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

// blur animation removed
const iconSize = 30;

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
    <main className="flex flex-col min-h-[100dvh] space-y-10">
      <section id="hero" className="mt-4 md:mt-0">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="gap-2 flex justify-between">
            <div className="flex-col flex flex-1 space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">{`Hi, I'm ${DATA.name.split(" ")[0]} 👋`}</h1>
              <p className="max-w-[600px] md:text-xl">{DATA.description}</p>
            </div>
            <Avatar className="size-28 border">
              <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
              <AvatarFallback>{DATA.initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </section>
      <section id="about">
        <h2 className="text-xl font-bold">About</h2>
        <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
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
              className="hover:opacity-80"
            />
          </a>
          <a href="https://linkedin.com/in/aditya-dawadikar" target="_blank" rel="noopener noreferrer">
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg"
              alt="LinkedIn"
              width={iconSize}
              height={iconSize}
              className="hover:opacity-80"
            />
          </a>
          <a href="https://github.com/aditya-dawadikar" target="_blank" rel="noopener noreferrer">
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg"
              alt="GitHub"
              width={iconSize}
              height={iconSize}
              className="hover:opacity-80"
            />
          </a>
        </div>
      </section>
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <h2 className="text-xl font-bold">Work Experience</h2>
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
          <h2 className="text-xl font-bold">Education</h2>
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
      <section id="explore">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4">Explore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard title="My Hackathons" description="View past hackathons and results" href="/hackathons">
            </FeatureCard>

            <FeatureCard title="My Blogs" description="Read featured and recent blog posts" href="/blog">
            </FeatureCard>

            <FeatureCard title="My Projects" description="Explore projects and demos" href="/projects">
            </FeatureCard>

            <FeatureCard title="Resources | System Design" description="System Design Interview Preparation Kit" href="/system-design-library">
            </FeatureCard>

            <FeatureCard title="Resources | Frontend Engineeing" description="Frontend Engineering Interview Preparation Kit" href="/frontend-resources">
            </FeatureCard>

            <FeatureCard title="Resources | AI Engineeing" description="AI Engineering Must Read Papers" href="/ai-engineering">
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

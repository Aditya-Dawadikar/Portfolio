import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BLOG_LINKS from "@/data/blog-links";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import FeatureCard from "@/components/feature-card";
import { MyActivity } from "@/components/my-activity";

const iconSize = 30;

export default function Page() {
  const projectList = DATA.projects;
  const winningHackathons = DATA.hackathons.filter((hackathon) => hackathon.result === "winner");
  const publicationList = DATA.papers;
  const blogList = BLOG_LINKS;

  const dashboardMetrics = [
    {
      label: "Cool Projects",
      value: projectList.length,
      href: "/projects",
    },
    {
      label: "Hackathons Won",
      value: winningHackathons.length,
      href: "/hackathons",
    },
    {
      label: "Publications",
      value: publicationList.length,
      href: "/papers",
    },
    {
      label: "Blogs",
      value: blogList.length,
      href: "/blog",
    },
  ];

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
      <section id="stonks">
        <h2 className="text-2xl font-bold">My Stonks</h2>
        <div className="mx-auto w-full max-w-6xl rounded-[2rem]  p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardMetrics.map((metric) => (
              <Link
                key={metric.label}
                href={metric.href}
                className="group rounded-[1.5rem] p-5 transition-all duration-300 hover:bg-black/45 hover:shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
              >
                <div className="flex min-h-32 flex-col justify-center gap-3 rounded-[1.2rem] bg-gradient-to-br from-white/[0.05] to-transparent p-1">
                  <div className="text-[11px] m-2 uppercase tracking-[0.28em] text-zinc-400">{metric.label}</div>
                  <div className="text-5xl m-2 font-semibold tracking-tight text-white transition-transform duration-300 group-hover:translate-y-[-2px] md:text-6xl">
                    {metric.value}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section id="my-activity">
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

      <section id="explore-2">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard title="System Design" description="System Design Interview Preparation Kit" href="/system-design-library" backgroundImage="/geekgod/resources.png">
            </FeatureCard>

            <FeatureCard title="Frontend Engineeing" description="Frontend Engineering Interview Preparation Kit" href="/frontend-resources" backgroundImage="/geekgod/resources.png">
            </FeatureCard>

            <FeatureCard title="AI Engineeing" description="AI Engineering Must Read Papers" href="/ai-engineering" backgroundImage="/geekgod/resources.png">
            </FeatureCard>

            <FeatureCard title="Computer Networks" description="Computer Networks Practical Interview Preparation Kit" href="/computer-networks-resources" backgroundImage="/geekgod/resources.png">
            </FeatureCard>
          </div>
        </div>
      </section>


    </main>
  );
}

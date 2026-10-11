import { existsSync } from "fs";
import path from "path";
import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { DATA } from "@/data/resume";
import { buildTimeline, projectTarget, shortName, type Commit } from "@/lib/timeline";
import { getBlogPosts } from "@/lib/medium";
import LandingScrollbarStyle from "@/components/landing-scrollbar-style";
import LandingNavbar from "@/components/landing-navbar";
import BlurFade from "@/components/magicui/blur-fade";
import FeatureCard from "@/components/feature-card";
import { MyActivity } from "@/components/my-activity";
import StudyResourcesGate from "@/components/study-resources-gate";
import { TimelineProvider } from "@/components/story/timeline-context";
import { GitGraphRail } from "@/components/story/git-graph-rail";
import { BranchGlow } from "@/components/story/branch-glow";
import { BranchPill } from "@/components/story/branch-pill";
import { Hero } from "@/components/story/hero";
import { AboutSlide } from "@/components/story/about-slide";
import { Slide } from "@/components/story/slide";
import { ChapterHeader } from "@/components/story/chapter-header";
import { CommitLines } from "@/components/story/commit-line";
import { CountUp } from "@/components/story/count-up";
import { TabbedShowcase } from "@/components/story/tabbed-showcase";
import { Spotlight } from "@/components/story/spotlight";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

/** Only use images that actually ship in /public; several data entries point at files that don't exist yet. */
function publicAsset(src?: string) {
  if (!src || !src.startsWith("/")) return null;
  return existsSync(path.join(process.cwd(), "public", src)) ? src : null;
}

function youtubeThumbnail(url?: string) {
  const id = url?.match(/(?:youtu\.be\/|embed\/|[?&]v=)([\w-]{11})/)?.[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

const linkClass =
  "inline-block border-b border-white pb-1 text-sm uppercase tracking-[0.3em] text-white transition-colors hover:border-zinc-300 hover:text-zinc-300";

/** How many of the newest Medium posts fit on their slide; the rest are on /blog. */
const POSTS_ON_SLIDE = 6;

export default async function Page() {
  const blogPosts = await getBlogPosts();
  const timeline = buildTimeline(blogPosts);
  const { branches } = timeline;
  const colorOf = (id: string) => branches.find((b) => b.id === id)!.color;
  const bySha = new Map(timeline.commits.map((c) => [c.sha, c]));
  const commitsFor = (target: string): Commit[] => (timeline.commitsByTarget[target] ?? []).map((sha) => bySha.get(sha)!);
  /** The commit a card stands for in the graph: its oldest one (the "join", the "build", the "begin"). */
  const oldestFor = (target: string): Commit | undefined => commitsFor(target)[commitsFor(target).length - 1];
  const cardSha = (target: string) => oldestFor(target)?.sha;
  const rowOf = (target: string) => oldestFor(target)?.row ?? Infinity;
  const head = bySha.get(timeline.refs.find((r) => r.head)!.sha)!;

  const hackathons = DATA.hackathons
    .map((hackathon, index) => ({ hackathon, id: `hackathon-${index}` }))
    .sort((a, b) => rowOf(a.id) - rowOf(b.id));
  // Only the hand-picked projects get a card here; the rest live on /projects (and still appear in the graph).
  const projects = DATA.projects
    .filter((project) => "featured" in project && project.featured)
    .map((project) => ({ project, id: projectTarget(project.title) }))
    .sort((a, b) => rowOf(a.id) - rowOf(b.id));
  const papers = DATA.papers.map((paper, index) => ({ paper, id: `paper-${index}` })).sort((a, b) => rowOf(a.id) - rowOf(b.id));
  const posts = blogPosts.map((post, index) => ({ post, id: `post-${index}` }))
    .sort((a, b) => rowOf(a.id) - rowOf(b.id))
    .slice(0, POSTS_ON_SLIDE);

  const stats = [
    { label: "Years Building", value: new Date().getFullYear() - 2016, href: "#about" },
    { label: "Projects Built", value: DATA.projects.length, href: "/projects" },
    { label: "Hackathons Won", value: DATA.hackathons.filter((h) => h.result === "winner").length, href: "/hackathons" },
    { label: "Papers Published", value: DATA.papers.length, href: "/papers" },
    { label: "Blogs Written", value: blogPosts.length, href: "/blog" },
  ];

  const socials = [
    { href: DATA.contact.social.GitHub.url, label: "GitHub", Icon: Icons.github },
    { href: DATA.contact.social.LinkedIn.url, label: "LinkedIn", Icon: Icons.linkedin },
    { href: DATA.contact.social.Medium.url, label: "Medium", Icon: Icons.medium },
    { href: `mailto:${DATA.contact.email}`, label: "Email", Icon: Icons.email },
  ];

  const exploreCards = [
    { title: "My Skills", description: "All the tech that I even explored", href: "/skills", image: "/geekgod/skilled.png" },
    { title: "My Projects", description: "Explore projects and demos", href: "/projects", image: "/geekgod/builder.png" },
    { title: "GitHub Atlas", description: "Every repository, charted as a marble world", href: "/atlas", image: "/atlas/atlas-preview.webp" },
    { title: "My Hackathons", description: "View past hackathons and results", href: "/hackathons", image: "/geekgod/winner.png" },
    { title: "My Blogs", description: "Read featured and recent blog posts", href: "/blog", image: "/geekgod/writer.png" },
    { title: "My Research", description: "Checkout my research interests", href: "/papers", image: "/geekgod/innovator.png" },
  ];
  const resourceCards = [
    { title: "System Design", description: "System Design Interview Preparation Kit", href: "/system-design-library" },
    { title: "Frontend Engineering", description: "Frontend Engineering Interview Preparation Kit", href: "/frontend-resources" },
    { title: "AI Engineering", description: "AI Engineering Must Read Papers", href: "/ai-engineering" },
    { title: "Computer Networks", description: "Computer Networks Practical Interview Preparation Kit", href: "/computer-networks-resources" },
  ];

  return (
    <>
      <LandingScrollbarStyle />
      <LandingNavbar />

      <TimelineProvider timeline={timeline}>
        <div className={`relative bg-[#010101] text-white ${cormorant.className}`}>
          <BranchGlow />

          <Hero name={DATA.name} tagline="A Software Developer, Exploring the Craft of Building Software." videoSrc="/geekgod/hero.mp4" />

          <AboutSlide
            summary={DATA.summary}
            avatarUrl={DATA.avatarUrl}
            videoSrc="/geekgod/hero.mp4"
            footer={
              <div className="space-y-5">
                <div className="flex items-center gap-5">
                  {socials.map(({ href, label, Icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-zinc-400 transition-colors hover:text-white">
                      <Icon className="size-6" />
                    </a>
                  ))}
                </div>
                <CommitLines commits={commitsFor("about")} branches={branches} />
              </div>
            }
          />

          <div className="relative z-10 mx-auto flex max-w-[1440px] gap-12 px-4 sm:px-6 lg:px-10">
            <GitGraphRail />

            <main className="min-w-0 flex-1 overflow-x-clip">
              {/* ── Numbers & interests ───────────────────────────────── */}
              <Slide id="achievements">
                <ChapterHeader command="git shortlog --summary --numbered" title="The Numbers So Far" />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {stats.map((stat, i) => (
                    <BlurFade key={stat.label} inView delay={0.08 * i} yOffset={16}>
                      <Spotlight className="h-full rounded-2xl">
                        <Link href={stat.href} className="flex h-full min-h-32 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/25">
                          <span className="text-[11px] uppercase tracking-[0.28em] text-zinc-400">{stat.label}</span>
                          <span className="text-5xl font-semibold tracking-tight text-white md:text-6xl">
                            <CountUp value={stat.value} delay={0.1 * i} />
                          </span>
                        </Link>
                      </Spotlight>
                    </BlurFade>
                  ))}
                </div>
                <p className="mb-3 mt-10 font-mono text-xs text-zinc-500">
                  <span className="text-emerald-400">$</span> git config --get-all user.interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {DATA.interests.map((interest, i) => (
                    <BlurFade key={interest} inView delay={0.5 + 0.04 * i} yOffset={10}>
                      <span className="inline-block rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1 text-base text-zinc-200">{interest}</span>
                    </BlurFade>
                  ))}
                </div>
              </Slide>

              {/* ── Work ──────────────────────────────────────────────── */}
              <Slide id="work" branches="work">
                <ChapterHeader command="git checkout work" title="Where I've Worked" subtitle="Two stretches on the work branch, each merged back into main when it ended." />
                <TabbedShowcase
                  accent={colorOf("work")}
                  items={DATA.work.map((work, i) => {
                    const id = `work-${i}`;
                    const logo = publicAsset(work.logoUrl);
                    return {
                      id,
                      sha: cardSha(id),
                      tab: (
                        <span className="block min-w-44">
                          <span className="block text-lg leading-tight text-zinc-100">{work.title}</span>
                          <span className="block text-sm text-zinc-400">{shortName(work.company)}</span>
                          <span className="mt-0.5 block font-mono text-[11px] text-zinc-500">
                            {work.start} – {work.end}
                          </span>
                        </span>
                      ),
                      panel: (
                        <article className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
                          <div className="flex items-center gap-4">
                            {logo && <img src={logo} alt="" className="size-14 shrink-0 rounded-full border border-white/15 bg-white object-contain p-1" />}
                            <div>
                              <a href={work.href} target="_blank" rel="noopener noreferrer" className="block text-2xl font-semibold leading-tight hover:underline">
                                {work.company}
                              </a>
                              <p className="text-lg text-zinc-300">{work.title}</p>
                            </div>
                          </div>
                          <CommitLines commits={commitsFor(id)} branches={branches} />
                          <p className="text-base leading-relaxed text-zinc-400 sm:text-lg">{work.description}</p>
                        </article>
                      ),
                    };
                  })}
                />
              </Slide>

              {/* ── Education ─────────────────────────────────────────── */}
              <Slide id="education" branches="education">
                <ChapterHeader command="git checkout education" title="Education" subtitle="Each degree branched off main and merged back in on graduation." />
                <div className="grid gap-4 xl:grid-cols-2">
                  {DATA.education.map((education, i) => {
                    const id = `education-${i}`;
                    const logo = publicAsset(education.logoUrl);
                    return (
                      <BlurFade key={id} inView delay={0.1 * i} yOffset={14} className="h-full">
                        <article id={id} data-commit={cardSha(id)} className="story-card flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
                          {logo && <img src={logo} alt="" className="size-14 rounded-full border border-white/15 bg-white object-contain p-1" />}
                          <a href={education.href} target="_blank" rel="noopener noreferrer" className="block text-2xl font-semibold hover:underline">
                            {education.school}
                          </a>
                          <p className="text-lg text-zinc-300">{education.degree}</p>
                          <p className="font-mono text-xs text-zinc-500">
                            {education.start} – {education.end}
                          </p>
                          <CommitLines commits={commitsFor(id)} branches={branches} className="mt-auto" />
                        </article>
                      </BlurFade>
                    );
                  })}
                </div>
              </Slide>

              {/* ── Hackathons ────────────────────────────────────────── */}
              <Slide id="hackathons" branches="hackathons">
                <ChapterHeader command="git checkout hackathons" title="Experiments Under Pressure" subtitle="Forked from projects in 2022, when the pulmonary-disease project won its first hackathon. Still open." />
                <TabbedShowcase
                  accent={colorOf("hackathons")}
                  items={hackathons.map(({ hackathon, id }) => {
                    const image = publicAsset(hackathon.image);
                    const won = hackathon.result === "winner";
                    return {
                      id,
                      sha: cardSha(id),
                      tab: (
                        <span className="flex min-w-44 items-baseline justify-between gap-3">
                          <span className="text-base leading-tight text-zinc-100">
                            {won && <span className="mr-1.5">🏆</span>}
                            {hackathon.event}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-zinc-500">{hackathon.dates.replace(",", "")}</span>
                        </span>
                      ),
                      panel: (
                        <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c]">
                          <div className="relative aspect-[16/7] bg-white/[0.03]">
                            {image ? (
                              <img src={image} alt={hackathon.title} className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_30%,rgba(251,113,133,0.25),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.15),transparent_55%)]">
                                <span className="px-6 text-center text-3xl font-semibold text-white/80">{hackathon.project}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3 p-6">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] ${won ? "bg-amber-300/15 text-amber-200" : "bg-white/10 text-zinc-300"}`}>
                                {won ? "🏆 Winner" : "Participant"}
                              </span>
                              <span className="font-mono text-xs text-zinc-500">{hackathon.location}</span>
                            </div>
                            <h3 className="text-2xl font-semibold leading-tight">{hackathon.project}</h3>
                            <CommitLines commits={commitsFor(id)} branches={branches} />
                            <p className="line-clamp-3 text-base leading-relaxed text-zinc-400">{hackathon.description}</p>
                            <div className="flex flex-wrap gap-4">
                              {hackathon.links.map((link) => (
                                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:text-white">
                                  {link.icon}
                                  {link.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        </article>
                      ),
                    };
                  })}
                />
              </Slide>

              {/* ── Projects ──────────────────────────────────────────── */}
              <Slide id="projects" branches="projects">
                <ChapterHeader command="git checkout projects" title="Things I've Built" subtitle={`A few favourites from ${DATA.projects.length} projects on the branch. Still open.`} />
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {projects.map(({ project, id }, i) => {
                    const media = publicAsset(project.image) ?? youtubeThumbnail(project.video);
                    return (
                      <BlurFade key={id} inView delay={0.1 * i} yOffset={18} className="h-full">
                        <Spotlight className="h-full rounded-2xl">
                          <article id={id} data-commit={cardSha(id)} className="story-card flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]">
                            <a href={project.video || project.href} target="_blank" rel="noopener noreferrer" className="relative block aspect-video overflow-hidden bg-white/[0.03]">
                              {media ? (
                                <img src={media} alt={project.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                              ) : (
                                <span className="flex h-full items-center justify-center text-2xl text-white/60">{project.title}</span>
                              )}
                              {project.active && <span className="absolute left-3 top-3 rounded-full bg-emerald-400/90 px-2 py-0.5 font-mono text-[10px] uppercase text-black">WIP</span>}
                            </a>
                            <div className="flex flex-1 flex-col gap-3 p-5">
                              <div className="flex items-baseline justify-between gap-3">
                                <h3 className="text-xl font-semibold leading-tight">{project.title}</h3>
                                <span className="shrink-0 font-mono text-[11px] text-zinc-500">{project.dates}</span>
                              </div>
                              <CommitLines commits={commitsFor(id).slice(0, 1)} branches={branches} />
                              <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">{project.description}</p>
                            </div>
                          </article>
                        </Spotlight>
                      </BlurFade>
                    );
                  })}
                </div>
                <div className="mt-8">
                  <Link href="/projects" className={linkClass}>
                    View All Projects
                  </Link>
                </div>
              </Slide>

              {/* ── GitHub Atlas ──────────────────────────────────────── */}
              <Slide id="atlas" branches="projects">
                <BlurFade inView yOffset={20}>
                  <div className="relative flex h-[calc(100svh-8rem)] items-end overflow-hidden rounded-3xl border border-white/10 bg-[#070d17] md:items-center">
                    <img
                      src="/atlas/atlas-preview.webp"
                      alt="A marble archipelago of islands, each covered in settlements, forests and mountains, joined by dotted sea routes"
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-[#010101]/70 to-[#010101]/10 md:bg-gradient-to-r md:from-[#010101]/95 md:via-[#010101]/60 md:to-transparent" aria-hidden="true" />
                    <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14">
                      <div className="max-w-xl space-y-6">
                        <p className="font-mono text-xs text-zinc-400">
                          <span className="text-emerald-400">$</span> git remote show atlas
                        </p>
                        <h2 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                          Every Repository,
                          <br /> a Place on the Map
                        </h2>
                        <p className="max-w-lg text-base text-zinc-300 sm:text-lg">
                          All of my public GitHub work, charted as a hand-engraved marble archipelago. Each discipline is an island, landmarks rise for the projects that matter most, live
                          systems glow blue, and old experiments weather into ruins.
                        </p>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                          <Link href="/atlas" className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-sm uppercase tracking-[0.3em] text-white transition-colors hover:border-white hover:bg-white/10">
                            Explore the Atlas
                          </Link>
                          <Link href="/atlas/guide" className={linkClass}>
                            Read the Field Guide
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </BlurFade>
              </Slide>

              {/* ── Papers ────────────────────────────────────────────── */}
              <Slide id="publications" branches="papers,publications">
                <ChapterHeader command="git checkout publications/papers" title="Research" subtitle="Publishing branched off the pulmonary-disease project, and splits into papers and Medium. Both still open." />
                <CommitLines commits={commitsFor("publications")} branches={branches} className="mb-6" />
                <div className="grid gap-4 md:grid-cols-3">
                  {papers.map(({ paper, id }, i) => (
                    <BlurFade key={id} inView delay={0.08 * i} yOffset={14} className="h-full">
                      <Spotlight className="h-full rounded-2xl">
                        <article id={id} data-commit={cardSha(id)} className="story-card flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                          <p className="font-mono text-[11px] text-zinc-500">
                            {paper.venueShort} · {paper.date}
                          </p>
                          <h3 className="text-xl font-semibold leading-snug">{paper.title}</h3>
                          <p className="line-clamp-2 text-sm text-zinc-400">{paper.authors}</p>
                          <div className="mt-auto flex flex-wrap gap-4 pt-2">
                            {paper.links.map((link) => (
                              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-white">
                                {link.icon}
                                Read {link.type}
                              </a>
                            ))}
                          </div>
                        </article>
                      </Spotlight>
                    </BlurFade>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/papers" className={linkClass}>
                    All Publications
                  </Link>
                </div>
              </Slide>

              {/* ── Medium ────────────────────────────────────────────── */}
              <Slide id="medium" branches="medium,publications">
                <ChapterHeader command="git checkout publications/medium" title="Writing" subtitle={`The latest from ${blogPosts.length} posts on Medium.`} />
                <ul className="divide-y divide-white/10 border-y border-white/10">
                  {posts.map(({ post, id }, i) => {
                    const commit = commitsFor(id)[0];
                    return (
                      <li key={id} id={id} data-commit={commit?.sha} className="story-card">
                        <BlurFade inView delay={0.06 * i} yOffset={8}>
                          <a href={post.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-6">
                            <span className="shrink-0 font-mono text-[11px] text-zinc-500 sm:w-40">
                              <span className="text-amber-300/90">{commit?.sha}</span> · {commit?.dateLabel}
                            </span>
                            <span className="text-lg text-zinc-200 transition-colors group-hover:text-white">
                              {post.title}
                              <span className="ml-2 inline-block text-zinc-500 transition-transform group-hover:translate-x-1">↗</span>
                            </span>
                          </a>
                        </BlurFade>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-8">
                  <Link href="/blog" className={linkClass}>
                    All Blogs
                  </Link>
                </div>
              </Slide>

              {/* ── Activity ──────────────────────────────────────────── */}
              <Slide id="activity">
                <ChapterHeader command="git log --since='1 year ago' --oneline" title="Recent Activity" subtitle="Live from GitHub and LeetCode." />
                <BlurFade inView yOffset={16}>
                  <MyActivity />
                </BlurFade>
              </Slide>

              {/* ── Explore ───────────────────────────────────────────── */}
              <Slide id="explore">
                <ChapterHeader command="ls ~/portfolio" title="Keep Exploring" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {exploreCards.map((card, i) => (
                    <BlurFade key={card.href} inView delay={0.06 * i} yOffset={14}>
                      <Spotlight className="rounded-lg">
                        <FeatureCard title={card.title} description={card.description} href={card.href} backgroundImage={card.image} />
                      </Spotlight>
                    </BlurFade>
                  ))}
                  <StudyResourcesGate>
                    {resourceCards.map((card) => (
                      <Spotlight key={card.href} className="rounded-lg">
                        <FeatureCard title={card.title} description={card.description} href={card.href} backgroundImage="/geekgod/resources.png" />
                      </Spotlight>
                    ))}
                  </StudyResourcesGate>
                </div>
              </Slide>
            </main>
          </div>

          {/* ── Contact: the open-to-work HEAD of main ────────────────── */}
          <section
            id="contact"
            data-branches="main"
            data-commit={head.sha}
            className="relative z-10 flex h-[100svh] snap-start snap-always items-center justify-center overflow-hidden"
          >
            <img src="/geekgod/collaborate.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#010101] to-transparent" aria-hidden="true" />
            <div className="relative z-10 flex max-w-4xl flex-col items-center px-6 text-center">
              <ChapterHeader command="git push origin main" title={"Let's Build\nSomething Together"} subtitle="Ready to turn ideas into reality?" className="flex flex-col items-center" />
              <CommitLines commits={[head]} branches={branches} className="mb-8" />
              <div className="flex items-center justify-center gap-6">
                {socials.map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-zinc-300 transition-colors hover:text-white">
                    <Icon className="size-8 sm:size-10" />
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ── Philosophy ────────────────────────────────────────────── */}
          <section className="relative z-10 grid h-[100svh] snap-start snap-always grid-cols-1 md:grid-cols-2">
            <div className="absolute inset-0 md:hidden" style={{ backgroundImage: "url(/geekgod/aristotle.png)", backgroundPosition: "center", backgroundSize: "cover" }}>
              <div className="absolute inset-0 bg-black/75" aria-hidden="true" />
            </div>
            <div className="relative z-10 flex items-center px-6 py-12 sm:px-10 lg:px-16">
              <BlurFade inView yOffset={16} className="max-w-xl space-y-5">
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Philosophy</p>
                <blockquote className="text-3xl font-semibold italic leading-tight sm:text-4xl lg:text-5xl">
                  &quot;We are what we repeatedly do. Excellence, then, is not an act but a habit.&quot;
                </blockquote>
                <p className="text-base text-zinc-300 sm:text-lg">— Aristotle</p>
              </BlurFade>
            </div>
            <div className="hidden md:relative md:flex md:items-center md:justify-center md:overflow-hidden">
              <img src="/geekgod/aristotle.png" alt="Aristotle" loading="lazy" className="max-h-screen w-auto object-contain" />
              <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
              <div className="landing-image-vignette" aria-hidden="true" />
            </div>
          </section>
        </div>

        <BranchPill />
      </TimelineProvider>
    </>
  );
}

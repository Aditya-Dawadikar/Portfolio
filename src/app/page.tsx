import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { Icons } from "@/components/icons";
import { DATA } from "@/data/resume";
import Link from "next/link";
import { CommitPath } from "../components/commit-path";
import LandingScrollbarStyle from "@/components/landing-scrollbar-style";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Landing Page",
  description: "A cinematic black landing page with autoplay background video.",
};

const landingNavLinks = [
  { href: "/home", label: "Home" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/blog", label: "Blogs" },
  { href: "/papers", label: "Publications" },
  { href: "/stories", label: "Stories" }
];

export default function Page() {
  return (
    <>
      <LandingScrollbarStyle />
      <header className={`fixed inset-x-0 top-0 z-[9999] border-b border-white/10 bg-black/35 backdrop-blur-md ${cormorant.className}`}>
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-center gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {landingNavLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-zinc-100 transition-colors hover:border-white/40 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Hero Section */}
      <section className={`relative grid h-screen grid-cols-1 bg-[#010101] pt-14 text-white md:grid-cols-2 snap-start ${cormorant.className}`}>
      <CommitPath side="left" sectionId="hero" />
      <div className="relative flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className={`relative z-10 max-w-xl space-y-5 ${cormorant.className}`}>
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Hello</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            I am Aditya Dawadikar
          </h1>
          <p className="max-w-lg text-base text-zinc-300 sm:text-lg">
            Exploring the Craft of Building Software.
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden">
        <video
          className="max-h-[calc(100vh-4.5rem)] w-auto object-contain"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/geekgod/hero.mp4" type="video/mp4" />
        </video>
        {/* Soft black wash over the video for contrast against hero text. */}
        <div className="landing-video-wash" aria-hidden="true" />
        {/* Inset vignette to blend video edges into the black background. */}
        <div className="landing-video-vignette" aria-hidden="true" />
      </div>

      {/* Bottom fade to merge page content into the black base. */}
      <div className="landing-bottom-fade landing-bottom-fade-tall" aria-hidden="true" />
    </section>

    {/* Skills Section - Image left, Text right */}
    <section className={`relative grid h-screen grid-cols-1 bg-[#010101] text-white md:grid-cols-2 snap-start ${cormorant.className}`}>
      <CommitPath side="right" sectionId="skills" />
      <div className="relative flex items-center justify-center overflow-hidden">
        <img
          src="/geekgod/skilled.png"
          alt="Skills"
          className="max-h-screen w-auto object-contain"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="landing-image-vignette" aria-hidden="true" />
      </div>
      <div className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-xl space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Skills</p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Tools of the Craft
          </h2>
          <p className="max-w-lg text-base text-zinc-300 sm:text-lg">
            Languages, frameworks, and systems that help me turn ideas into working software.
          </p>
          <Link
            href="/skills"
            className="inline-block text-sm uppercase tracking-[0.3em] text-white hover:text-zinc-300 transition-colors border-b border-white hover:border-zinc-300 pb-1"
          >
            View Skills
          </Link>
        </div>
      </div>
    </section>

    {/* Projects Section - Text left, Image right */}
    <section className={`relative grid h-screen grid-cols-1 bg-[#010101] text-white md:grid-cols-2 snap-start ${cormorant.className}`}>
      <CommitPath side="left" sectionId="projects" />
      <div className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-xl space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Projects</p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Things I&apos;ve Built
          </h2>
          <p className="max-w-lg text-base text-zinc-300 sm:text-lg">
            Projects where I experiment with ideas and learn how systems behave in the real world.
          </p>
          <Link
            href="/projects"
            className="inline-block text-sm uppercase tracking-[0.3em] text-white hover:text-zinc-300 transition-colors border-b border-white hover:border-zinc-300 pb-1"
          >
            View Projects
          </Link>
        </div>
      </div>
      <div className="relative flex items-center justify-center overflow-hidden">
        <img
          src="/geekgod/builder.png"
          alt="Projects"
          className="max-h-screen w-auto object-contain"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="landing-image-vignette" aria-hidden="true" />
      </div>
    </section>

    {/* Hackathons Section - Image left, Text right */}
    <section className={`relative grid h-screen grid-cols-1 bg-[#010101] text-white md:grid-cols-2 snap-start ${cormorant.className}`}>
      <CommitPath side="right" sectionId="hackathons" />
      <div className="relative flex items-center justify-center overflow-hidden">
        <img
          src="/geekgod/winner.png"
          alt="Hackathons"
          className="max-h-screen w-auto object-contain"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="landing-image-vignette" aria-hidden="true" />
      </div>
      <div className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-xl space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Hackathons</p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Experiments Under Pressure
          </h2>
          <p className="max-w-lg text-base text-zinc-300 sm:text-lg">
            Short bursts of building where ideas move quickly from concept to prototype.
          </p>
          <Link
            href="/hackathons"
            className="inline-block text-sm uppercase tracking-[0.3em] text-white hover:text-zinc-300 transition-colors border-b border-white hover:border-zinc-300 pb-1"
          >
            View Hackathons
          </Link>
        </div>
      </div>
    </section>

    {/* Blogs Section - Text left, Image right */}
    <section className={`relative grid h-screen grid-cols-1 bg-[#010101] text-white md:grid-cols-2 snap-start ${cormorant.className}`}>
      <CommitPath side="left" sectionId="blogs" />
      <div className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-xl space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Blogs</p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Writing to Understand, <br/> Writing to Share
          </h2>
          <p className="max-w-lg text-base text-zinc-300 sm:text-lg">
            Thoughts and explanations from things I’m learning while building software.
          </p>          <Link
            href="/blog"
            className="inline-block text-sm uppercase tracking-[0.3em] text-white hover:text-zinc-300 transition-colors border-b border-white hover:border-zinc-300 pb-1"
          >
            View Blogs
          </Link>        </div>
      </div>
      <div className="relative flex items-center justify-center overflow-hidden">
        <img
          src="/geekgod/writer.png"
          alt="Blogs"
          className="max-h-screen w-auto object-contain"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="landing-image-vignette" aria-hidden="true" />
      </div>
    </section>

    {/* Publications Section - Image left, Text right */}
    <section className={`relative grid h-screen grid-cols-1 bg-[#010101] text-white md:grid-cols-2 snap-start ${cormorant.className}`}>
      <CommitPath side="right" sectionId="publications" />
      <div className="relative flex items-center justify-center overflow-hidden">
        <img
          src="/geekgod/innovator.png"
          alt="Publications"
          className="max-h-screen w-auto object-contain"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="landing-image-vignette" aria-hidden="true" />
      </div>
      <div className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-xl space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Publications</p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Research
            <br/> and <br/> Deeper Questions
          </h2>
          <p className="max-w-lg text-base text-zinc-300 sm:text-lg">
            Exploring ideas that sit at the intersection of systems, learning, and intelligence.
          </p>
          <Link
            href="/papers"
            className="inline-block text-sm uppercase tracking-[0.3em] text-white hover:text-zinc-300 transition-colors border-b border-white hover:border-zinc-300 pb-1"
          >
            View Publications
          </Link>
        </div>
      </div>
    </section>

    {/* Stories Section - Text left, Image right */}
    <section className={`relative grid h-screen grid-cols-1 bg-[#010101] text-white md:grid-cols-2 snap-start ${cormorant.className}`}>
      <CommitPath side="left" sectionId="stories" />
      <div className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-xl space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Stories</p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Lessons Along the Way
          </h2>
          <p className="max-w-lg text-base text-zinc-300 sm:text-lg">
            Experiences that shaped how I think about engineering and building systems.
          </p>
          <Link
            href="/stories"
            className="inline-block text-sm uppercase tracking-[0.3em] text-white hover:text-zinc-300 transition-colors border-b border-white hover:border-zinc-300 pb-1"
          >
            View Stories
          </Link>
        </div>
      </div>
      <div className="relative flex items-center justify-center overflow-hidden">
        <img
          src="/geekgod/teacher.png"
          alt="Stories"
          className="max-h-screen w-auto object-contain"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="landing-image-vignette" aria-hidden="true" />
      </div>
    </section>

    {/* Collaborate Section - Full width with centered text */}
    <section className={`relative flex h-screen items-center justify-center bg-[#010101] text-white snap-start ${cormorant.className}`}>
      <img
        src="/geekgod/collaborate.png"
        alt="Collaborate"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      
      <div className="relative z-10 max-w-4xl px-6 text-center space-y-6">
        <h2 className="text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
          Let&apos;s Build Something Together
        </h2>
        <p className="text-xl text-zinc-200 sm:text-2xl lg:text-3xl">
          Ready to turn ideas into reality ?
        </p>
        
        <div className="flex items-center justify-center gap-6 pt-4">
          <Link
            href={DATA.contact.social.LinkedIn.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            <Icons.linkedin className="w-8 h-8 sm:w-10 sm:h-10" />
          </Link>
          <Link
            href={DATA.contact.social.GitHub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 hover:text-white transition-colors"
          >
            <Icons.github className="w-8 h-8 sm:w-10 sm:h-10" />
          </Link>
          <a
            href={`mailto:${DATA.contact.email}`}
            className="text-zinc-300 hover:text-white transition-colors"
          >
            <Icons.email className="w-8 h-8 sm:w-10 sm:h-10" />
          </a>
        </div>
      </div>
    </section>

    {/* Aristotle Quote Section - Text left, Image right */}
    <section className={`relative grid h-screen grid-cols-1 bg-[#010101] text-white md:grid-cols-2 snap-start ${cormorant.className}`}>
      <div className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-xl space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Philosophy</p>
          <blockquote className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl italic">
            &quot;We are what we repeatedly do. Excellence, then, is not an act but a habit.&quot;
          </blockquote>
          <p className="text-base text-zinc-300 sm:text-lg">
            — Aristotle
          </p>
        </div>
      </div>
      <div className="relative flex items-center justify-center overflow-hidden">
        <img
          src="/geekgod/aristotle.png"
          alt="Aristotle"
          className="max-h-screen w-auto object-contain"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="landing-image-vignette" aria-hidden="true" />
      </div>
    </section>
    </>
  );
}

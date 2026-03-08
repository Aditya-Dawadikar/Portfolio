"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cormorant_Garamond } from "next/font/google";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import SideNav from "./side-nav";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const imageMap: { [key: string]: string } = {
    "/home": "hero.mp4",
    "/skills": "skilled.png",
    "/projects": "builder.png",
    "/hackathons": "winner.png",
    "/blog": "writer.png",
    "/papers": "innovator.png",
    "/stories": "teacher.png",
    "/system-design-library": "resources.png",
    "/frontend-resources": "resources.png",
    "/ai-engineering": "resources.png",
  };

  const currentMedia = imageMap[pathname] || "skilled.png";
  const isVideo = currentMedia.endsWith(".mp4");

  const navLinks = [
    { href: "/", label: "Landing" },
    { href: "/home", label: "Home" },
    { href: "/skills", label: "Skills" },
    { href: "/projects", label: "Projects" },
    { href: "/hackathons", label: "Hackathons" },
    { href: "/blog", label: "Blogs" },
    { href: "/papers", label: "Research Publication" },
    { href: "/stories", label: "Stories" },
    { href: "/system-design-library", label: "System Design" },
    { href: "/frontend-resources", label: "Frontend Engineering" },
    { href: "/ai-engineering", label: "AI Engineering" },
  ];

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className={`font-consistent relative min-h-screen overflow-hidden bg-[#010101] text-zinc-100 ${cormorant.className}`}>
      <div className="pointer-events-none absolute inset-0 landing-page-glow" aria-hidden="true" />
      {isVideo ? (
        <video
          src={`/geekgod/${currentMedia}`}
          autoPlay
          loop
          muted
          className="pointer-events-none fixed right-0 top-0 h-auto max-h-screen w-auto opacity-60 hidden lg:block"
        />
      ) : (
        <img 
          src={`/geekgod/${currentMedia}`}
          alt="page background" 
          className="pointer-events-none fixed right-0 top-0 h-auto max-h-screen w-auto opacity-60 hidden lg:block"
        />
      )}
      <div className="fixed right-4 top-4 z-50 md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="rounded-full border border-white/20 bg-black/70 p-2 text-zinc-100 backdrop-blur-md transition-colors hover:border-white/40 hover:text-white"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-x-4 top-16 z-50 rounded-2xl border border-white/15 bg-black/90 p-3 backdrop-blur-md md:hidden">
          <nav>
            <ul className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-md sm:p-6 lg:p-8">
          <div className="flex gap-8">
            <SideNav />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}

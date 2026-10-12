"use client";

import { usePathname } from "next/navigation";
import { Cormorant_Garamond } from "next/font/google";
import LandingNavbar from "./landing-navbar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const imageMap: { [key: string]: string } = {
    "/skills": "skilled.png",
    "/projects": "builder.png",
    "/hackathons": "winner.png",
    "/blog": "writer.png",
    "/linkedin": "writer.png",
    "/youtube": "teacher.png",
    "/papers": "innovator.png",
    "/stories": "teacher.png",
    "/system-design-library": "resources.png",
    "/frontend-resources": "resources.png",
    "/ai-engineering": "resources.png",
    "/computer-networks-resources": "resources.png",
  };

  const currentMedia = imageMap[pathname] || "skilled.png";
  const isVideo = currentMedia.endsWith(".mp4");

  // The atlas pages (map and field guide) carry their own full-bleed chrome.
  if (isLandingPage || pathname === "/atlas" || pathname.startsWith("/atlas/")) {
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
      <LandingNavbar />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-md sm:p-6 lg:p-8">
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

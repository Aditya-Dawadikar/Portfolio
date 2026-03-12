"use client";

import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const landingNavLinks = [
  { href: "/home", label: "Home" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/blog", label: "Blogs" },
  { href: "/papers", label: "Publications" },
  { href: "/stories", label: "Stories" },
];

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[9999] border-b border-white/10 bg-black/35 backdrop-blur-md ${cormorant.className}`}
    >
      {/* Desktop nav — pill links centered */}
      <nav className="mx-auto hidden h-14 max-w-7xl items-center justify-center gap-2 px-4 sm:flex sm:px-6 lg:px-8">
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

      {/* Mobile header bar */}
      <div className="flex h-14 items-center justify-between px-4 sm:hidden">
        <span className="text-sm uppercase tracking-[0.25em] text-zinc-300"></span>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded-full border border-white/20 bg-black/60 p-2 text-zinc-100 backdrop-blur-md transition-colors hover:border-white/40 hover:text-white"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="border-t border-white/10 bg-black/90 px-4 pb-4 pt-2 sm:hidden">
          <ul className="flex flex-col gap-1">
            {landingNavLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg border border-transparent px-3 py-2.5 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

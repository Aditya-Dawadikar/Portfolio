"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/blog", label: "Blogs" },
  { href: "/papers", label: "Publications" },
  { href: "/stories", label: "Stories" },
  { href: "/system-design-library", label: "System Design" },
  { href: "/frontend-resources", label: "Frontend Resources" },
  { href: "/ai-engineering", label: "AI Engineering" },
  { href: "/computer-networks-resources", label: "Computer Networks" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Don't show navbar on landing page
  if (pathname === "/") {
    return null;
  }

  const handleNavigation = (href: string) => {
    setIsMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 hidden border-b border-white/10 bg-black/35 backdrop-blur-md md:block ${cormorant.className}`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Link
              href="/"
              className="whitespace-nowrap rounded-full border border-white/20 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-zinc-100 transition-colors hover:border-white/40 hover:text-white"
            >
              Landing
            </Link>
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors",
                  pathname === item.href
                    ? "border-white/50 text-white"
                    : "border-white/15 text-zinc-100 hover:border-white/40 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {Object.entries(DATA.contact.social)
              .filter(([_, social]) => social.navbar)
              .map(([name, social]) => (
                <Link
                  key={name}
                  href={social.url}
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-9 text-zinc-200 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <social.icon className="size-4" />
                </Link>
              ))}
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Navbar */}
      <div
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/45 backdrop-blur-md md:hidden ${cormorant.className}`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-xs uppercase tracking-[0.22em] text-zinc-100">
            {DATA.initials}
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-10 text-zinc-100 hover:bg-white/10"
              )}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="max-h-[calc(100vh-56px)] overflow-y-auto border-t border-white/10 bg-black/85 p-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleNavigation("/")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start rounded-full border border-white/20 text-xs uppercase tracking-[0.18em] text-zinc-100 hover:bg-white/10"
                )}
              >
                Landing
              </button>

              {NAV_LINKS.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-full justify-start rounded-full border text-xs uppercase tracking-[0.18em]",
                    pathname === item.href
                      ? "border-white/50 text-white"
                      : "border-white/20 text-zinc-100 hover:bg-white/10"
                  )}
                >
                  <span>{item.label}</span>
                </button>
              ))}

              <div className="mt-1 flex items-center gap-2 px-1">
                {Object.entries(DATA.contact.social)
                  .filter(([_, social]) => social.navbar)
                  .map(([name, social]) => (
                    <Link
                      key={name}
                      href={social.url}
                      target="_blank"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-9 text-zinc-200 hover:bg-white/10 hover:text-white"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <social.icon className="size-4" />
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

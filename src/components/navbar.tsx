"use client";

import { Dock, DockIcon } from "@/components/magicui/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (href: string) => {
    setIsMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden md:flex pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 origin-bottom h-full max-h-14">
        <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"></div>
        <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] ">
          {DATA.navbar.map((item) => (
            <DockIcon key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12"
                    )}
                  >
                    <item.icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
          <Separator orientation="vertical" className="h-full" />
          {Object.entries(DATA.contact.social)
            .filter(([_, social]) => social.navbar)
            .map(([name, social]) => (
              <DockIcon key={name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={social.url}
                      target="_blank"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12"
                      )}
                    >
                      <social.icon className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
          <Separator orientation="vertical" className="h-full py-2" />
          <DockIcon>
            <Tooltip>
              <TooltipTrigger asChild>
                <ModeToggle />
              </TooltipTrigger>
              <TooltipContent>
                <p>Theme</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border pointer-events-auto">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="font-semibold">
            {DATA.initials}
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-10 pointer-events-auto"
              )}
            >
              {isMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur max-h-[calc(100vh-56px)] overflow-y-auto">
            <div className="flex flex-col space-y-1 p-4">
              {DATA.navbar.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-full justify-start"
                  )}
                >
                  <item.icon className="mr-2 size-4" />
                  <span>{item.label}</span>
                </button>
              ))}
              
              <button
                onClick={() => handleNavigation("/skills")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start"
                )}
              >
                <span>Skills</span>
              </button>
              
              <button
                onClick={() => handleNavigation("/projects")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start"
                )}
              >
                <span>Projects</span>
              </button>
              
              <button
                onClick={() => handleNavigation("/hackathons")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start"
                )}
              >
                <span>Hackathons</span>
              </button>
              
              <button
                onClick={() => handleNavigation("/blog")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start"
                )}
              >
                <span>Blogs</span>
              </button>
              
              <button
                onClick={() => handleNavigation("/papers")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start"
                )}
              >
                <span>Research Publication</span>
              </button>
              
              <button
                onClick={() => handleNavigation("/stories")}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start"
                )}
              >
                <span>Stories</span>
              </button>
              
              <div className="px-3 py-2 mt-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">Resources</div>
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleNavigation("/system-design-library")}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start text-sm"
                    )}
                  >
                    <span>System Design</span>
                  </button>
                  <button
                    onClick={() => handleNavigation("/frontend-resources")}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start text-sm"
                    )}
                  >
                    <span>Frontend Engineering</span>
                  </button>
                </div>
              </div>
              
              <Separator className="my-2" />
              {Object.entries(DATA.contact.social)
                .filter(([_, social]) => social.navbar)
                .map(([name, social]) => (
                  <Link
                    key={name}
                    href={social.url}
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <social.icon className="mr-2 size-4" />
                    <span>{name}</span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile spacing */}
      <div className="md:hidden h-14" />
    </>
  );
}

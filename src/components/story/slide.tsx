import { cn } from "@/lib/utils";

/**
 * One full-viewport screen of the landing page. The page snaps from slide to slide
 * (see `html.landing-scroll` in globals.css), so each one is exactly a viewport tall.
 * `min-h` rather than `h` keeps content reachable on very short screens instead of clipping it.
 */
export function Slide({
  id,
  branches,
  className,
  children,
}: {
  id: string;
  /** Comma-separated branches this slide is about; empty shows the whole graph. */
  branches?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-branches={branches ?? ""}
      className={cn("relative flex min-h-[100svh] snap-start snap-always flex-col justify-center pb-10 pt-20", className)}
    >
      {children}
    </section>
  );
}

import { branchColor, commitHeader } from "@/lib/commit-format";
import type { Branch, Commit } from "@/lib/timeline";
import { cn } from "@/lib/utils";

/** The `git log --oneline` rendering of a card's commits, e.g. `● 7c6b142 feat(hackathons)!: win … · Jun 2026`. */
export function CommitLines({ commits, branches, className }: { commits: Commit[]; branches: Branch[]; className?: string }) {
  if (commits.length === 0) return null;
  return (
    <ul className={cn("space-y-1 font-mono text-[11px] leading-snug sm:text-xs", className)}>
      {commits.map((commit) => (
        <li key={commit.sha} className="flex min-w-0 items-baseline gap-2">
          <span className="mt-1 size-1.5 shrink-0 self-start rounded-full" style={{ backgroundColor: branchColor(branches, commit.branch) }} />
          <span className="shrink-0 text-amber-300/90">{commit.sha}</span>
          <span className="min-w-0 text-zinc-300">
            {commitHeader(commit)}
            <span className="text-zinc-500"> · {commit.dateLabel}</span>
            {commit.tags.map((tag) => (
              <span key={tag} className="ml-1.5 rounded border border-white/15 px-1 text-[10px] text-zinc-300">
                {tag}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

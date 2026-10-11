"use client";

import { AnimatePresence, motion } from "framer-motion";
import { branchColor, commitHeader } from "@/lib/commit-format";
import { useTimeline } from "./timeline-context";

/** Phones have no room for the graph, so they get the current branch and commit as a floating pill. */
export function BranchPill() {
  const { timeline, activeSha, activeBranches } = useTimeline();
  const commit = timeline.commits.find((c) => c.sha === activeSha);
  const branch = commit?.branch ?? activeBranches[0];

  return (
    <AnimatePresence>
      {branch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-2 rounded-full border border-white/15 bg-black/80 px-4 py-2 font-mono text-[11px] text-zinc-300 backdrop-blur-md lg:hidden"
        >
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: branchColor(timeline.branches, branch) }} />
          <span className="shrink-0 text-zinc-100">{branch}</span>
          {commit && (
            <>
              <span className="shrink-0 text-amber-300/90">{commit.sha}</span>
              <span className="truncate text-zinc-400">{commitHeader(commit)}</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

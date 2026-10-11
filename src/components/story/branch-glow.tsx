"use client";

import { useTimeline } from "./timeline-context";

/**
 * Tints the backdrop with the colour of the branch being read. Gradients can't be
 * transitioned, so there is one layer per branch and only their opacity cross-fades.
 */
export function BranchGlow() {
  const { timeline, activeBranches } = useTimeline();
  const active = activeBranches[0];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {timeline.branches.map((branch) => (
        <div
          key={branch.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: branch.id === active ? 1 : 0,
            background: `radial-gradient(55% 45% at 72% 28%, ${branch.color}18 0%, transparent 70%)`,
          }}
        />
      ))}
    </div>
  );
}

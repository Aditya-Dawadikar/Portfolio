"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BranchId, Timeline } from "@/lib/timeline";

type TimelineState = {
  timeline: Timeline;
  /** Commit of the card crossing the middle of the viewport. */
  activeSha: string | null;
  /** Branches of the section crossing the middle of the viewport (empty = show everything). */
  activeBranches: BranchId[];
  hoverSha: string | null;
  setHoverSha: (sha: string | null) => void;
  /** Lets a slide (e.g. the selected tab of a showcase) say which commit is being read. */
  pinCommit: (sha: string) => void;
  scrollToCommit: (sha: string) => void;
};

const TimelineContext = createContext<TimelineState | null>(null);

export function useTimeline() {
  const value = useContext(TimelineContext);
  if (!value) throw new Error("useTimeline must be used inside <TimelineProvider>");
  return value;
}

/**
 * Watches every `[data-commit]` card and `[data-branches]` section and reports which one
 * sits on the horizontal centre line of the viewport, so the graph can follow the reader.
 */
export function TimelineProvider({ timeline, children }: { timeline: Timeline; children: React.ReactNode }) {
  const [activeSha, setActiveSha] = useState<string | null>(null);
  const [activeBranches, setActiveBranches] = useState<BranchId[]>([]);
  const [hoverSha, setHoverSha] = useState<string | null>(null);

  useEffect(() => {
    const centreLine = { rootMargin: "-50% 0px -50% 0px", threshold: 0 };

    const cards = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        el.toggleAttribute("data-active", entry.isIntersecting);
        if (entry.isIntersecting) setActiveSha(el.dataset.commit ?? null);
      }
    }, centreLine);

    const sections = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const list = (entry.target as HTMLElement).dataset.branches ?? "";
        setActiveBranches(list ? (list.split(",") as BranchId[]) : []);
        // Leaving a section of cards for one without any clears the highlighted commit.
        if (!entry.target.querySelector("[data-commit]")) setActiveSha(null);
      }
    }, centreLine);

    // Some cards mount late (the projects gallery swaps layouts after measuring the screen),
    // so pick up new ones as they appear. Observing an element twice is a no-op.
    const scan = () => {
      document.querySelectorAll("[data-commit]").forEach((el) => cards.observe(el));
      document.querySelectorAll("[data-branches]").forEach((el) => sections.observe(el));
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      cards.disconnect();
      sections.disconnect();
    };
  }, []);

  const scrollToCommit = useCallback(
    (sha: string) => {
      const commit = timeline.commits.find((c) => c.sha === sha);
      if (!commit) return;
      // Commits without a card on this page (e.g. projects that aren't featured) land on their branch's slide.
      const card = commit.targets.map((id) => document.getElementById(id)).find(Boolean) ?? document.getElementById(commit.branch);
      if (!card) return;
      // Every slide is one screen, so bring the whole slide into view rather than centring the card.
      (card.closest("section") ?? card).scrollIntoView({ behavior: "smooth", block: "start" });
      // A commit that lives in a showcase tab selects that tab.
      if (card.hasAttribute("data-tab")) card.click();
    },
    [timeline],
  );

  const value = useMemo(
    () => ({ timeline, activeSha, activeBranches, hoverSha, setHoverSha, pinCommit: setActiveSha, scrollToCommit }),
    [timeline, activeSha, activeBranches, hoverSha, scrollToCommit],
  );

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

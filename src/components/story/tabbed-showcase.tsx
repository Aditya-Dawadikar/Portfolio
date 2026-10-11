"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTimeline } from "./timeline-context";

export type ShowcaseItem = {
  /** DOM id the commit graph scrolls to; clicking a commit selects this item. */
  id: string;
  sha?: string;
  tab: React.ReactNode;
  panel: React.ReactNode;
};

/**
 * A list of items beside one detail panel, so a long section still fits a single screen.
 * The selected item drives the highlighted commit in the graph.
 */
export function TabbedShowcase({ items, accent }: { items: ShowcaseItem[]; accent: string }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const { pinCommit } = useTimeline();
  const selected = items[index];

  useEffect(() => {
    if (inView && selected?.sha) pinCommit(selected.sha);
  }, [inView, selected, pinCommit]);

  return (
    <div ref={ref} className="grid min-h-0 gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] md:gap-8">
      <div role="tablist" aria-orientation="vertical" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-0 md:pb-0">
        {items.map((item, i) => (
          <button
            key={item.id}
            id={item.id}
            data-tab
            role="tab"
            type="button"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "shrink-0 rounded-xl border px-4 py-3 text-left transition-colors md:shrink",
              i === index ? "border-white/20 bg-white/[0.06]" : "border-transparent hover:bg-white/[0.03]",
            )}
            style={i === index ? { boxShadow: `inset 3px 0 0 ${accent}` } : undefined}
          >
            {item.tab}
          </button>
        ))}
      </div>

      <div className="relative min-h-0" role="tabpanel">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected.id}
            initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {selected.panel}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

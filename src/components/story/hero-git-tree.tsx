"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { branchColor } from "@/lib/commit-format";
import { graphEdges } from "@/lib/graph-geometry";
import type { Commit } from "@/lib/timeline";
import { useTimeline } from "./timeline-context";

/** Whole layer opacity: faint enough to stay texture behind the name. */
const LAYER_OPACITY = 0.24;
/** Seconds for the history to grow from the root commit to today. */
const GROW_SECONDS = 5;
const PAD_TOP = 72;
const PAD_BOTTOM = 40;
const PAD_X = 0.08;

/**
 * My real git history growing behind the hero text: it starts at the root commit at the
 * bottom, branches fork off and merge back as the years pass, and the branches that are
 * still open keep flowing off the top. It only covers the text half and fades out before
 * the video column, so the video's black edges still melt into the page.
 */
export function HeroGitTree() {
  const { timeline } = useTimeline();
  const { branches, commits, refs } = timeline;
  const reduceMotion = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const laneOf = useMemo(() => new Map(branches.map((b) => [b.id, b.lane])), [branches]);
  const bySha = useMemo(() => new Map(commits.map((c) => [c.sha, c])), [commits]);
  const rowHeight = commits.length > 1 ? Math.max(0, size.h - PAD_TOP - PAD_BOTTOM) / (commits.length - 1) : 0;
  const laneGap = (size.w * (1 - PAD_X * 2)) / Math.max(1, branches.length - 1);
  const position = (c: Commit) => ({ x: size.w * PAD_X + laneOf.get(c.branch)! * laneGap, y: PAD_TOP + c.row * rowHeight });

  const edges = useMemo(
    () => graphEdges(commits, position, rowHeight),
    // position only depends on the measured size and the lane map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commits, rowHeight, laneGap, laneOf, size.w],
  );

  const total = commits.length;
  /** Oldest commits appear first, so the tree grows upward from its root. */
  const delayOf = (row: number) => (reduceMotion ? 0 : ((total - 1 - row) / total) * GROW_SECONDS);
  const grown = reduceMotion ? 0 : GROW_SECONDS + 0.3;

  return (
    <div
      ref={ref}
      aria-hidden
      className="hero-graph-mask pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 md:block"
      style={{ opacity: LAYER_OPACITY }}
    >
      {size.w > 0 && rowHeight > 0 && (
        <svg width={size.w} height={size.h} className="absolute inset-0">
          {/* Open branches never stop: once grown, their tips keep streaming upward. */}
          {refs.map((r) => {
            const tip = position(bySha.get(r.sha)!);
            return (
              <motion.line
                key={`open-${r.branch}`}
                x1={tip.x}
                x2={tip.x}
                y1={tip.y}
                y2={0}
                stroke={branchColor(branches, r.branch)}
                strokeWidth={2}
                strokeDasharray="3 9"
                className={reduceMotion ? undefined : "hero-graph-flow"}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 1, delay: grown }}
              />
            );
          })}

          {edges.map((edge) => (
            <motion.path
              key={edge.id}
              d={edge.d}
              fill="none"
              stroke={branchColor(branches, edge.branch)}
              strokeWidth={2}
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: delayOf(edge.lowerRow), ease: "easeOut" }}
            />
          ))}

          {commits.map((commit) => {
            const { x, y } = position(commit);
            const color = branchColor(branches, commit.branch);
            return (
              <motion.circle
                key={commit.sha}
                cx={x}
                cy={y}
                r={commit.isMerge ? 4.5 : 3.5}
                fill={commit.isMerge ? "#010101" : color}
                stroke={color}
                strokeWidth={commit.isMerge ? 2 : 0}
                initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, delay: delayOf(commit.row) + 0.2 }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            );
          })}

          {/* The tips of open branches pulse once the tree has grown. */}
          {!reduceMotion &&
            refs.map((r) => {
              const tip = position(bySha.get(r.sha)!);
              return (
                <motion.circle
                  key={`pulse-${r.branch}`}
                  cx={tip.x}
                  cy={tip.y}
                  fill="none"
                  stroke={branchColor(branches, r.branch)}
                  strokeWidth={1.5}
                  initial={{ r: 4, opacity: 0 }}
                  animate={{ r: [4, 12], opacity: [0.9, 0] }}
                  transition={{ duration: 2.2, delay: grown, repeat: Infinity, ease: "easeOut" }}
                />
              );
            })}
        </svg>
      )}
    </div>
  );
}

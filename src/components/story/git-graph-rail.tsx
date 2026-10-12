"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { branchColor, commitHeader } from "@/lib/commit-format";
import { graphEdges } from "@/lib/graph-geometry";
import type { BranchId, Commit } from "@/lib/timeline";
import { useTimeline } from "./timeline-context";

const YEAR_COLUMN = 34;
const LANE = 16;
const PAD_Y = 10;
const DRAW_SECONDS = 1.8;

/**
 * The whole life history as one `git log --graph`, pinned beside the content.
 * It replays itself oldest → newest when it first appears, then dims every branch
 * except the one being read and lights up the commit under the reader's eye.
 */
export function GitGraphRail() {
  const { timeline, activeSha, activeBranches, hoverSha, setHoverSha, scrollToCommit } = useTimeline();
  const { branches, commits, refs } = timeline;
  const reduceMotion = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const inView = useInView(boxRef, { once: true, amount: 0.3 });

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const laneOf = useMemo(() => new Map(branches.map((b) => [b.id, b.lane])), [branches]);
  const bySha = useMemo(() => new Map(commits.map((c) => [c.sha, c])), [commits]);
  const lanesWidth = branches.length * LANE;
  const width = YEAR_COLUMN + lanesWidth + 92;
  const rowHeight = commits.length > 1 ? Math.max(0, height - PAD_Y * 2) / (commits.length - 1) : 0;
  const x = (c: Commit) => YEAR_COLUMN + LANE / 2 + laneOf.get(c.branch)! * LANE;
  const y = (c: Commit) => PAD_Y + c.row * rowHeight;

  const edges = useMemo(
    () => graphEdges(commits, (c) => ({ x: x(c), y: y(c) }), rowHeight),
    // x and y only depend on rowHeight and the lane map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commits, rowHeight, laneOf],
  );

  const yearTicks = useMemo(() => {
    const ticks: { year: string; row: number }[] = [];
    commits.forEach((c, i) => {
      const year = c.dateLabel.slice(-4);
      if (i === 0 || commits[i - 1].dateLabel.slice(-4) !== year) ticks.push({ year, row: c.row });
    });
    return ticks;
  }, [commits]);

  const refLabels = useMemo(() => {
    let lastY = -Infinity;
    return refs
      .map((ref) => ({ ...ref, commit: bySha.get(ref.sha)! }))
      .sort((a, b) => a.commit.row - b.commit.row)
      .map((ref) => {
        const labelY = Math.max(PAD_Y + ref.commit.row * rowHeight, lastY + 11);
        lastY = labelY;
        return { ...ref, labelY };
      });
  }, [refs, bySha, rowHeight]);

  const dimmed = (branch: BranchId) => activeBranches.length > 0 && !activeBranches.includes(branch);
  const totalRows = commits.length;
  const delayOf = (row: number) => (reduceMotion ? 0 : ((totalRows - 1 - row) / totalRows) * DRAW_SECONDS);
  const shown = inView || reduceMotion;
  // Once the opening replay has finished, later dims and highlights should react instantly.
  const [replayed, setReplayed] = useState(false);
  useEffect(() => {
    if (!shown || replayed) return;
    const timer = window.setTimeout(() => setReplayed(true), (DRAW_SECONDS + 0.6) * 1000);
    return () => window.clearTimeout(timer);
  }, [shown, replayed]);
  const focus = bySha.get(hoverSha ?? activeSha ?? "") ?? bySha.get(refs.find((r) => r.head)?.sha ?? "") ?? commits[0];

  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col pb-6 pt-20 font-mono lg:flex" aria-label="Commit graph of my career">
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        git log --graph --all
      </div>

      <div ref={boxRef} className="relative min-h-0 flex-1">
        {height > 0 && (
          <svg width={width} height={height} className="overflow-visible" role="img" aria-label={`${totalRows} commits across ${branches.length} branches`}>
            {yearTicks.map((tick) => (
              <g key={tick.year} opacity={shown ? 1 : 0} style={{ transition: "opacity 0.6s ease-out" }}>
                <line x1={YEAR_COLUMN - 2} x2={YEAR_COLUMN + lanesWidth} y1={PAD_Y + tick.row * rowHeight} y2={PAD_Y + tick.row * rowHeight} stroke="white" strokeOpacity={0.06} />
                <text x={0} y={PAD_Y + tick.row * rowHeight + 3} fill="#71717a" fontSize={9}>
                  {tick.year}
                </text>
              </g>
            ))}

            {/* Open branches keep going: a dashed run from their tip to the top. */}
            {refs
              .filter((ref) => !ref.head)
              .map((ref) => {
                const tip = bySha.get(ref.sha)!;
                return (
                  <line
                    key={`open-${ref.branch}`}
                    x1={x(tip)}
                    x2={x(tip)}
                    y1={y(tip)}
                    y2={0}
                    stroke={branchColor(branches, ref.branch)}
                    strokeWidth={1.5}
                    strokeDasharray="2 4"
                    style={{ opacity: shown ? (dimmed(ref.branch) ? 0.1 : 0.45) : 0, transition: `opacity 0.6s ease-out ${shown ? DRAW_SECONDS : 0}s` }}
                  />
                );
              })}

            {edges.map((edge) => (
              <g key={edge.id} style={{ opacity: dimmed(edge.branch) ? 0.14 : 0.9, transition: "opacity 0.45s ease-out" }}>
                <motion.path
                  d={edge.d}
                  fill="none"
                  stroke={branchColor(branches, edge.branch)}
                  strokeWidth={activeBranches.includes(edge.branch) ? 2.2 : 1.6}
                  strokeLinecap="round"
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={shown ? { pathLength: 1, opacity: 1 } : undefined}
                  transition={{ duration: reduceMotion ? 0 : 0.5, delay: delayOf(edge.lowerRow), ease: "easeOut" }}
                />
              </g>
            ))}

            {commits.map((commit) => {
              const color = branchColor(branches, commit.branch);
              const isFocus = commit.sha === focus?.sha && (hoverSha !== null || activeSha !== null);
              return (
                <motion.g
                  key={commit.sha}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: shown ? (dimmed(commit.branch) ? 0.25 : 1) : 0 }}
                  transition={{ duration: 0.3, delay: replayed ? 0 : delayOf(commit.row) }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverSha(commit.sha)}
                  onMouseLeave={() => setHoverSha(null)}
                  onClick={() => scrollToCommit(commit.sha)}
                >
                  {isFocus && (
                    <circle cx={x(commit)} cy={y(commit)} r={7} fill="none" stroke={color} strokeWidth={1}>
                      {!reduceMotion && <animate attributeName="r" values="5;9;5" dur="1.6s" repeatCount="indefinite" />}
                      {!reduceMotion && <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />}
                    </circle>
                  )}
                  <circle
                    cx={x(commit)}
                    cy={y(commit)}
                    r={isFocus ? 4.5 : commit.isMerge ? 3.6 : 3}
                    fill={commit.isMerge ? "#010101" : color}
                    stroke={color}
                    strokeWidth={commit.isMerge ? 1.6 : 0}
                  />
                  {commit.tags.some((t) => t.includes("🏆")) && (
                    <circle cx={x(commit)} cy={y(commit)} r={1.2} fill="#010101" />
                  )}
                  {/* Generous invisible hit area so the dense rows stay easy to point at. */}
                  <circle cx={x(commit)} cy={y(commit)} r={Math.max(5, rowHeight / 2)} fill="transparent" />
                  <title>{`${commit.sha} ${commitHeader(commit)}`}</title>
                </motion.g>
              );
            })}

            {refLabels.map((ref) => (
              <text
                key={`ref-${ref.branch}`}
                x={YEAR_COLUMN + lanesWidth + 8}
                y={ref.labelY + 3}
                fontSize={9}
                fill={branchColor(branches, ref.branch)}
                style={{ opacity: shown ? (dimmed(ref.branch) ? 0.3 : 1) : 0, transition: `opacity 0.5s ease-out ${shown ? DRAW_SECONDS : 0}s` }}
              >
                {ref.head ? `HEAD → ${ref.branch}` : ref.branch}
              </text>
            ))}
          </svg>
        )}
      </div>

      {focus && <CommitPanel commit={focus} />}
    </aside>
  );
}

function CommitPanel({ commit }: { commit: Commit }) {
  const { timeline } = useTimeline();
  const refs = timeline.refs.filter((r) => r.sha === commit.sha);
  const color = branchColor(timeline.branches, commit.branch);

  return (
    // Every row has a fixed height: if the panel grew or shrank with the focused commit, the graph
    // above it would rescale, slide the hovered dot out from under the cursor, and flicker.
    <div className="mt-4 shrink-0 rounded-xl border border-white/10 bg-black/60 p-3 text-[11px] leading-relaxed backdrop-blur-md">
      <div className="flex items-baseline gap-x-1.5 overflow-hidden whitespace-nowrap">
        <span className="shrink-0 text-amber-300">commit {commit.sha}</span>
        {refs.length > 0 && (
          <span className="truncate text-zinc-400">
            (
            {refs.map((r, i) => (
              <span key={r.branch} style={{ color: branchColor(timeline.branches, r.branch) }}>
                {i > 0 && ", "}
                {r.head ? `HEAD → ${r.branch}` : r.branch}
              </span>
            ))}
            )
          </span>
        )}
      </div>
      <div className="text-zinc-500">Date: {commit.dateLabel}</div>
      <div className="mt-1.5 flex gap-2">
        <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="line-clamp-2 h-[3.25em] text-zinc-200" title={commitHeader(commit)}>
          {commitHeader(commit)}
        </span>
      </div>
      <div className="mt-1.5 flex h-5 gap-1 overflow-hidden">
        {commit.tags.map((tag) => (
          <span key={tag} className="h-fit shrink-0 rounded border border-white/15 px-1.5 text-[10px] text-zinc-300">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-white/10 pt-2 text-[10px] text-zinc-500">
        {timeline.branches.map((b) => (
          <span key={b.id} className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: b.color }} />
            {b.id}
            {!b.open && <span className="text-zinc-600">· merged</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

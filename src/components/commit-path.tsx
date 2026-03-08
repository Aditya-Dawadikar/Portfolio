"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface CommitPathProps {
  side: "left" | "right";
  sectionId: string;
}

type GraphNode = {
  id: string;
  pos: number;
  x: number;
  branch: boolean;
};

type GraphSegment = {
  id: string;
  start: number;
  end: number;
  fromX: number;
  toX: number;
  branch: boolean;
};

type LineState = {
  id: number;
  x: number;
  branch: boolean;
  remaining: number;
  mergeTo: number | null;
  cooldown: number;
  age: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(input: string) {
  let h = 2161221412;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function generateGraph(seed: string, width: number) {
  const rand = mulberry32(hashSeed(seed));
  const mainX = width / 2;
  const minX = 8;
  const maxX = width - 8;
  const maxLines = 4;

  const levels: number[] = [0];
  while (levels[levels.length - 1] < 1) {
    const next = clamp(levels[levels.length - 1] + (0.08 + rand() * 0.08), 0, 1);
    if (next === levels[levels.length - 1]) break;
    levels.push(next);
  }
  levels[levels.length - 1] = 1;

  let lineId = 1;
  let active: LineState[] = [
    { id: 0, x: mainX, branch: false, remaining: 999, mergeTo: null, cooldown: 0, age: 999 },
  ];
  const segments: GraphSegment[] = [];
  const nodeMap = new Map<string, GraphNode>();

  const addNode = (pos: number, x: number, branch: boolean) => {
    const key = `${Math.round(pos * 1000)}-${Math.round(x * 10)}`;
    if (!nodeMap.has(key)) {
      nodeMap.set(key, { id: key, pos, x, branch });
    }
  };

  addNode(0, mainX, false);

  for (let i = 0; i < levels.length - 1; i += 1) {
    const start = levels[i];
    const end = levels[i + 1];
    const isLastStep = i === levels.length - 2;
    const stepsAfterThis = levels.length - 2 - i;
    const survivors: LineState[] = [];
    const mergedIntoIds = new Set<number>();

    // Continue active lines, and merge expiring branch lines back into their targets.
    for (const line of active) {
      const canMergeByLifespan = line.remaining <= 1 && line.age >= 1;
      const mustMergeAtEnd = isLastStep && line.age >= 1;
      if (line.branch && (canMergeByLifespan || mustMergeAtEnd)) {
        const target = isLastStep
          ? { id: 0, x: mainX }
          : active.find((candidate) => candidate.id === line.mergeTo) ?? active[0] ?? { id: 0, x: mainX };

        segments.push({
          id: `merge-${line.id}-${i}`,
          start,
          end,
          fromX: line.x,
          toX: target.x,
          branch: true,
        });
        addNode(end, target.x, false);
        mergedIntoIds.add(target.id);
        continue;
      }

      segments.push({
        id: `line-${line.id}-${i}`,
        start,
        end,
        fromX: line.x,
        toX: line.x,
        branch: line.branch,
      });

      const updated = {
        ...line,
        remaining: line.branch ? line.remaining - 1 : line.remaining,
        cooldown: Math.max(0, line.cooldown - 1),
        age: line.branch ? line.age + 1 : line.age,
      };
      survivors.push(updated);
      addNode(end, updated.x, updated.branch);
    }

    // Merge targets get a short cooldown to prevent immediate next-node fanout loops.
    for (let s = 0; s < survivors.length; s += 1) {
      if (mergedIntoIds.has(survivors[s].id)) {
        survivors[s] = { ...survivors[s], cooldown: Math.max(survivors[s].cooldown, 1) };
      }
    }

    // Random fan-out at this node. Source can be main or an existing branch.
    const capacity = maxLines - survivors.length;
    const splitCandidates = survivors.filter((line) => line.cooldown <= 0);
    const hasRoomForGapAndMerge = stepsAfterThis >= 2;
    if (hasRoomForGapAndMerge && capacity > 0 && splitCandidates.length > 0 && rand() < 0.42) {
      const source = splitCandidates[Math.floor(rand() * splitCandidates.length)];
      const branchCountRoll = rand();
      const desiredBranches =
        branchCountRoll < 0.12 ? 4 : branchCountRoll < 0.34 ? 3 : branchCountRoll < 0.72 ? 2 : 1;
      const branchCount = Math.min(capacity, desiredBranches);

      const occupied = survivors.map((line) => line.x);
      const sourceSide = source.x < mainX - 0.5 ? -1 : source.x > mainX + 0.5 ? 1 : 0;
      const laneSpacing = 20;
      const sidePlan: number[] = [];

      if (sourceSide === 0) {
        // Balanced fanout from main line: left/right alternating for even distribution.
        for (let idx = 0; idx < branchCount; idx += 1) {
          sidePlan.push(idx % 2 === 0 ? -1 : 1);
        }
      } else {
        for (let idx = 0; idx < branchCount; idx += 1) {
          sidePlan.push(sourceSide);
        }
      }

      let leftLane = 0;
      let rightLane = 0;

      for (let b = 0; b < branchCount; b += 1) {
        // Child branches inherit direction from non-main parents.
        const side = sidePlan[b];
        const laneIndex = side < 0 ? leftLane++ : rightLane++;
        let newX = clamp(source.x + side * laneSpacing * (laneIndex + 1), minX, maxX);

        let retries = 0;
        while (occupied.some((existingX) => Math.abs(existingX - newX) < 7) && retries < 10) {
          newX = clamp(newX + side * laneSpacing, minX, maxX);
          retries += 1;
        }

        // Keep child on the same side of its parent when parent is already on a side.
        if (sourceSide === -1 && newX >= source.x) {
          newX = clamp(source.x - 6 - b * 2, minX, maxX);
        }
        if (sourceSide === 1 && newX <= source.x) {
          newX = clamp(source.x + 6 + b * 2, minX, maxX);
        }

        occupied.push(newX);

        segments.push({
          id: `split-${source.id}-${lineId}-${i}`,
          start,
          end,
          fromX: source.x,
          toX: newX,
          branch: true,
        });

        const lifespan = 2 + Math.floor(rand() * 3);
        survivors.push({
          id: lineId,
          x: newX,
          branch: true,
          remaining: lifespan,
          mergeTo: source.id,
          cooldown: 1,
          age: 0,
        });

        addNode(end, newX, true);
        lineId += 1;
      }
    }

    active = survivors;
  }

  // Ensure the graph always terminates on a single non-branch node.
  addNode(1, mainX, false);

  return {
    width,
    nodes: Array.from(nodeMap.values()).sort((a, b) => a.pos - b.pos),
    segments,
  };
}

export function CommitPath({ side: _side, sectionId }: CommitPathProps) {
  const pathRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [delayedProgress, setDelayedProgress] = useState(0);
  const [pathLength, setPathLength] = useState(800);
  const [isSectionFocused, setIsSectionFocused] = useState(false);
  const delayTimerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const scrollDelayMs = 1200;
  const graph = useMemo(() => generateGraph(sectionId, 96), [sectionId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!pathRef.current) return;

      const section = pathRef.current.closest("section");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const viewportCenter = windowHeight * 0.5;
      const measuredHeight = section.clientHeight || windowHeight;
      // Container is inset by svgPadding on top and bottom
      setPathLength(measuredHeight - svgPadding * 2);

      // Section is focused when viewport center is inside its bounds.
      setIsSectionFocused(rect.top <= viewportCenter && rect.bottom >= viewportCenter);

      let sectionProgress = 0;
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        sectionProgress = Math.abs(rect.top) / Math.max(1, rect.height - windowHeight);
      } else if (rect.top > 0) {
        sectionProgress = 0;
      } else {
        sectionProgress = 1;
      }

      const validProgress = Math.min(Math.max(sectionProgress, 0), 1);
      setProgress(Number.isNaN(validProgress) ? 0 : validProgress);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (delayTimerRef.current !== null) {
        window.clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    // Upward scroll updates immediately for responsive rewinds.
    if (progress <= delayedProgress) {
      if (delayTimerRef.current !== null) {
        window.clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      setDelayedProgress(progress);
      return;
    }

    // Downward scroll uses fixed delayed steps and does not reset timer each tick.
    if (delayTimerRef.current !== null) {
      return;
    }

    delayTimerRef.current = window.setTimeout(() => {
      delayTimerRef.current = null;
      setDelayedProgress((prev) => {
        const target = progressRef.current;
        return target > prev ? target : prev;
      });
    }, scrollDelayMs);
  }, [progress, delayedProgress]);

  const safeProgress = Number.isNaN(delayedProgress) ? 0 : delayedProgress;
  const svgPadding = 35;

  const toPath = (segment: GraphSegment) => {
    const y1 = segment.start * pathLength;
    const y2 = segment.end * pathLength;

    if (Math.abs(segment.fromX - segment.toX) < 0.001) {
      return `M ${segment.fromX} ${y1} L ${segment.toX} ${y2}`;
    }

    const controlX = (segment.fromX + segment.toX) / 2;
    const controlY = (y1 + y2) / 2;
    return `M ${segment.fromX} ${y1} Q ${controlX} ${controlY} ${segment.toX} ${y2}`;
  };

  return (
    <div
      ref={pathRef}
      className="absolute left-1/2 z-[9999] hidden -translate-x-1/2 items-center pointer-events-none md:flex"
      style={{
        width: `${graph.width}px`,
        top: `${svgPadding}px`,
        bottom: `${svgPadding}px`,
      }}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${graph.width} ${pathLength}`}
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {graph.segments.map((segment) => {
          const d = toPath(segment);
          const segmentProgress = clamp((safeProgress - segment.start) / (segment.end - segment.start), 0, 1);
          const stroke = segment.branch ? "#c4b5fd" : "#ffffff";

          return (
            <g key={segment.id}>
              <path d={d} stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              <path
                d={d}
                stroke={stroke}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="1"
                pathLength={1}
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: 1 - segmentProgress,
                  transition: "stroke-dashoffset 0.1s ease-out",
                }}
              />
            </g>
          );
        })}

        {graph.nodes.map((node) => {
          const y = node.pos * pathLength;
          const isActive = isSectionFocused || safeProgress >= node.pos;
          const stroke = node.branch ? "#a78bfa" : "#ffffff";

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={y}
                r="8"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
                opacity={isActive ? 0.6 : 0.3}
                style={{ transition: "opacity 0.3s ease-out" }}
              />
              <circle
                cx={node.x}
                cy={y}
                r="6"
                fill="none"
                stroke={stroke}
                strokeWidth="2"
                opacity={isActive ? 1 : 0.5}
                style={{ transition: "opacity 0.3s ease-out" }}
              />
              <circle
                cx={node.x}
                cy={y}
                r="3"
                fill={stroke}
                opacity={isActive ? 1 : 0.5}
                style={{ transition: "opacity 0.3s ease-out" }}
              />
              <circle
                cx={node.x}
                cy={y}
                r="9"
                fill="none"
                stroke={stroke}
                strokeWidth="1"
                opacity={isActive ? 0.65 : 0}
                style={{ transition: "opacity 0.2s ease-out" }}
              >
                <animate attributeName="r" values="9;12;9" dur="1.8s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values={isActive ? "0.65;0.2;0.65" : "0;0;0"}
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

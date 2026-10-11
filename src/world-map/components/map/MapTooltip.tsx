"use client";

import { cn } from "@/lib/utils";
import type { RepositoryStatus, ScreenPoint } from "../../types";
import { MarbleBadge, marbleStyles } from "../primitives";

export interface MapTooltipContent {
  title: string;
  kindLabel: string;
  status?: RepositoryStatus;
  description: string;
  cta?: string;
}

export interface MapTooltipProps {
  content: MapTooltipContent | null;
  anchor: ScreenPoint | null;
  containerSize: { width: number; height: number };
  /** Static placement for the gallery. */
  inline?: boolean;
}

const W = 260;
const H_EST = 118;

/** Small hover summary; flips and clamps so it never leaves the map. */
export function MapTooltip({ content, anchor, containerSize, inline }: MapTooltipProps) {
  if (!content || (!anchor && !inline)) return null;
  let style: React.CSSProperties | undefined;
  if (!inline && anchor) {
    const flipX = anchor.x + 16 + W > containerSize.width - 8;
    const flipY = anchor.y + 16 + H_EST > containerSize.height - 8;
    const left = Math.max(8, Math.min(containerSize.width - W - 8, flipX ? anchor.x - W - 16 : anchor.x + 16));
    const top = Math.max(8, Math.min(containerSize.height - H_EST - 8, flipY ? anchor.y - H_EST - 12 : anchor.y + 16));
    style = { left, top, width: W };
  }
  const lit = content.status === "deployed" || content.status === "active";
  return (
    <div
      role="tooltip"
      style={inline ? { width: W } : style}
      className={cn(marbleStyles.panel, marbleStyles.fadeIn, "pointer-events-none z-30 rounded-[4px] px-3 py-2.5", inline ? "relative" : "absolute")}
    >
      <div className="flex items-center gap-1.5">
        {lit && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3d8bff] shadow-[0_0_6px_#3d8bff]" />}
        <span className={cn(marbleStyles.display, "truncate text-[17px] font-semibold leading-tight text-[#f2ede2]")}>{content.title}</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-[0.16em] text-[#c49a5e]">{content.kindLabel}</span>
        {content.status && <MarbleBadge tone={content.status} className="text-[10px]" />}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-[#cfc8ba]">{content.description}</p>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-[#8f887c]">{content.cta ?? "Click to explore"}</p>
    </div>
  );
}

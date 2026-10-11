"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ScoredRepository, Settlement, Territory, TerritoryKind, ViewportSize, ViewportState } from "../../types";
import { relativeZoom, worldToScreen } from "../../canvas/engine/viewport";
import { settlementAriaLabel } from "../../utils/accessibility";
import { marbleStyles } from "../primitives";

export interface RepositoryMarkerLayerProps {
  settlements: Settlement[];
  repositories: Record<string, ScoredRepository>;
  territories: Record<TerritoryKind, Territory>;
  viewport: ViewportState;
  size: ViewportSize;
  dimmed: (id: string) => boolean;
  onFocus: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/**
 * Canvas hit regions aren't keyboard accessible, so each visible settlement gets a
 * focusable (pointer-transparent) button aligned to it. Arrow keys move to the nearest
 * settlement in that direction. Settlement names render here as HTML at near zoom.
 */
export function RepositoryMarkerLayer({ settlements, repositories, territories, viewport, size, dimmed, onFocus, onSelect }: RepositoryMarkerLayerProps) {
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const rel = relativeZoom(viewport);
  const showNames = rel >= 1.9;
  const items = settlements
    .map((s) => ({ s, p: worldToScreen(viewport, size, s.position) }))
    .filter(({ p }) => p.x > -20 && p.y > -20 && p.x < size.width + 20 && p.y < size.height + 20);

  // Greedy name placement, most important settlements first, so dense areas never stack labels.
  const named = new Set<string>();
  if (showNames) {
    const tierRank = { landmark: 0, major: 1, minor: 2 } as const;
    const boxes: { x0: number; y0: number; x1: number; y1: number }[] = [];
    for (const { s, p } of [...items].sort((a, b) => tierRank[a.s.tier] - tierRank[b.s.tier])) {
      const name = repositories[s.repositoryId]?.name ?? "";
      const w = name.length * 7.6 + 6;
      const top = p.y + s.hitRadius * viewport.zoom + 6;
      const box = { x0: p.x - w / 2, y0: top, x1: p.x + w / 2, y1: top + 15 };
      if (boxes.some((o) => box.x0 < o.x1 && box.x1 > o.x0 && box.y0 < o.y1 && box.y1 > o.y0)) continue;
      boxes.push(box);
      named.add(s.repositoryId);
    }
  }

  const move = (from: { x: number; y: number }, dx: number, dy: number, selfId: string) => {
    let best: string | null = null;
    let bestScore = Infinity;
    for (const { s, p } of items) {
      if (s.repositoryId === selfId) continue;
      const vx = p.x - from.x;
      const vy = p.y - from.y;
      const along = vx * dx + vy * dy;
      if (along <= 0) continue;
      const across = Math.abs(vx * dy - vy * dx);
      const score = along + across * 2;
      if (score < bestScore) {
        bestScore = score;
        best = s.repositoryId;
      }
    }
    if (best) refs.current.get(best)?.focus();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20" role="group" aria-label="Settlements">
      {items.map(({ s, p }) => {
        const r = repositories[s.repositoryId];
        if (!r) return null;
        const d = Math.max(28, s.hitRadius * 2 * viewport.zoom);
        return (
          <div key={s.repositoryId} className="absolute" style={{ left: p.x, top: p.y }}>
            <button
              ref={(el) => {
                if (el) refs.current.set(s.repositoryId, el);
                else refs.current.delete(s.repositoryId);
              }}
              type="button"
              aria-label={settlementAriaLabel(r, territories[r.category]) + (dimmed(r.id) ? ", filtered out" : "")}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 focus:outline-none"
              style={{ width: d, height: d }}
              onFocus={() => onFocus(s.repositoryId)}
              onBlur={() => onFocus(null)}
              onClick={() => onSelect(s.repositoryId)}
              onKeyDown={(e) => {
                const dir: Record<string, [number, number]> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
                const v = dir[e.key];
                if (v) {
                  e.preventDefault();
                  e.stopPropagation();
                  move(p, v[0], v[1], s.repositoryId);
                }
              }}
            />
            {named.has(s.repositoryId) && (
              <span
                aria-hidden
                className={cn(
                  marbleStyles.display,
                  marbleStyles.engravedLabel,
                  "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[14px] font-semibold leading-none",
                  dimmed(r.id) && "opacity-40",
                )}
                style={{ top: s.hitRadius * viewport.zoom + 6 }}
              >
                {r.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

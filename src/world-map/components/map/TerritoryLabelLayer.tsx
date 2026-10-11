"use client";

import { cn } from "@/lib/utils";
import type { Territory, TerritoryKind, TerritoryRegion, ViewportSize, ViewportState } from "../../types";
import { relativeZoom, worldToScreen } from "../../canvas/engine/viewport";
import { clamp01 } from "../../utils/geometry";
import { marbleStyles } from "../primitives";

export interface TerritoryLabelLayerProps {
  regions: TerritoryRegion[];
  territories: Record<TerritoryKind, Territory>;
  counts: Record<string, number>;
  /** World-space circles labels should avoid (landmarks, major settlements). */
  obstacles?: { position: { x: number; y: number }; radius: number }[];
  viewport: ViewportState;
  size: ViewportSize;
  selectedId: TerritoryKind | null;
  onSelect: (id: TerritoryKind) => void;
}

/** Engraved HTML territory names at label anchors; fade out at near zoom; greedy overlap culling. */
export function TerritoryLabelLayer({ regions, territories, counts, obstacles = [], viewport, size, selectedId, onSelect }: TerritoryLabelLayerProps) {
  const rel = relativeZoom(viewport);
  const opacity = clamp01(1 - (rel - 1.7) / 0.6);
  if (opacity <= 0.02) return null;
  const fontSize = Math.round(Math.min(26, Math.max(12, 16 * Math.pow(rel, 0.45) * (size.width < 640 ? 0.8 : 1))));

  type Box = { x0: number; y0: number; x1: number; y1: number };
  const placed: Box[] = [];
  const blockers: Box[] = obstacles.map((o) => {
    const c = worldToScreen(viewport, size, o.position);
    const r = o.radius * viewport.zoom + 4;
    return { x0: c.x - r, y0: c.y - r, x1: c.x + r, y1: c.y + r };
  });
  const hit = (b: Box, list: Box[]) => list.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  const labels = [...regions]
    .sort((a, b) => (counts[b.territoryId] ?? 0) - (counts[a.territoryId] ?? 0))
    .map((r) => {
      const t = territories[r.territoryId];
      const anchor = worldToScreen(viewport, size, r.labelAnchor);
      // Small caps + 0.24em tracking ≈ 0.86em per glyph.
      const w = t.name.length * fontSize * 0.86 + 16;
      const h = fontSize * 2.1;
      const offscreen = anchor.x < -w / 2 || anchor.y < -h || anchor.x > size.width + w / 2 || anchor.y > size.height + h;
      // Keep inside the frame, then try nudging up/down before giving up on overlaps.
      const x = Math.min(size.width - w / 2 - 8, Math.max(w / 2 + 8, anchor.x));
      // Prefer spots clear of labels and landmarks; fall back to clear of labels only.
      let p: { x: number; y: number } | null = null;
      for (const avoidLandmarks of [true, false]) {
        for (const dy of [0, -h, h, -1.8 * h, 1.8 * h, -2.6 * h, 2.6 * h]) {
          const box = { x0: x - w / 2, y0: anchor.y + dy - h / 2, x1: x + w / 2, y1: anchor.y + dy + h / 2 };
          if (hit(box, placed) || (avoidLandmarks && hit(box, blockers))) continue;
          placed.push(box);
          p = { x, y: anchor.y + dy };
          break;
        }
        if (p) break;
      }
      return { r, t, p: p ?? anchor, hidden: offscreen || !p };
    });

  return (
    <div className="pointer-events-none absolute inset-0 z-10" style={{ opacity }}>
      {labels.map(({ r, t, p, hidden }) =>
        hidden ? null : (
          <button
            key={r.territoryId}
            type="button"
            onClick={() => onSelect(r.territoryId)}
            aria-label={`${t.name} territory, ${counts[r.territoryId] ?? 0} settlements`}
            aria-pressed={selectedId === r.territoryId}
            className={cn(
              "group absolute -translate-x-1/2 -translate-y-1/2 rounded-sm py-0.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]",
              opacity > 0.3 ? "pointer-events-auto" : "pointer-events-none",
            )}
            style={{ left: p.x, top: p.y }}
          >
            <span
              className={cn(marbleStyles.display, marbleStyles.engravedLabel, "block whitespace-nowrap font-semibold uppercase leading-none transition-colors group-hover:text-[#7b6141]")}
              style={{ fontSize, letterSpacing: "0.24em", color: selectedId === r.territoryId ? "#7b6141" : undefined }}
            >
              {t.name}
            </span>
            <span aria-hidden className="mx-auto mt-1 flex items-center justify-center gap-1.5" style={{ width: "86%" }}>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#a87d45]" />
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d="M4 0 L8 4 L4 8 L0 4 Z" fill="#ebe7df" stroke="#a87d45" />
              </svg>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#a87d45]" />
            </span>
          </button>
        ),
      )}
    </div>
  );
}

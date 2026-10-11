"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DrawContext, MinorSettlementKind } from "../../types";
import { drawActiveGlow, drawLandmark, drawRoad, drawRuins, drawSeaRoute, drawSettlement } from "../../canvas/drawing";
import { KIND_LABEL, KIND_MEANING } from "../../utils/accessibility";
import { StampCanvas } from "../canvas/StampCanvas";
import { MarbleButton, MarbleDivider, MarblePanel, marbleStyles } from "../primitives";

const MINOR: MinorSettlementKind[] = ["village", "outpost", "workshop", "shrine", "archive", "port", "tower"];

const KEY_ROWS: { label: string; bg: "marble" | "sea"; draw: (dc: DrawContext, w: number, h: number) => void }[] = [
  {
    label: "Landmark scale = project impact",
    bg: "marble",
    draw: (dc, w, h) => {
      drawLandmark(dc, { kind: "temple", status: "maintained", position: { x: w * 0.3, y: h / 2 }, scale: 0.35 });
      drawLandmark(dc, { kind: "temple", status: "maintained", position: { x: w * 0.7, y: h / 2 }, scale: 0.6 });
    },
  },
  {
    label: "Blue glow + pennant = active / deployed",
    bg: "marble",
    draw: (dc, w, h) => {
      drawActiveGlow(dc, { position: { x: w / 2, y: h / 2 }, radius: 10, intensity: 1 });
      drawSettlement(dc, { kind: "tower", tier: "minor", status: "deployed", weathering: 0, position: { x: w / 2, y: h / 2 }, scale: 0.75 });
    },
  },
  {
    label: "Ruin = archived",
    bg: "marble",
    draw: (dc, w, h) => drawRuins(dc, { position: { x: w / 2, y: h / 2 }, scale: 0.75, seedKey: "legend" }),
  },
  {
    label: "Dotted sea route = open-source / shared tech",
    bg: "sea",
    draw: (dc, w, h) => drawSeaRoute(dc, { path: [{ x: 3, y: h * 0.7 }, { x: w / 2, y: h * 0.25 }, { x: w - 3, y: h * 0.65 }] }),
  },
  {
    label: "Road = related projects",
    bg: "marble",
    draw: (dc, w, h) => drawRoad(dc, { path: [{ x: 2, y: h * 0.65 }, { x: w / 2, y: h * 0.35 }, { x: w - 2, y: h * 0.6 }], rank: "major" }),
  },
];

/** Explains the map's symbols; every row draws the real stamp. */
export function MapLegend({ defaultCollapsed = false, className }: { defaultCollapsed?: boolean; className?: string }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  if (collapsed) {
    return (
      <MarblePanel tone="translucent" className={cn("inline-flex p-1", className)}>
        <MarbleButton variant="ghost" size="sm" aria-expanded={false} onClick={() => setCollapsed(false)}>
          <HelpCircle className="h-3.5 w-3.5 text-[#c49a5e]" /> Legend
        </MarbleButton>
      </MarblePanel>
    );
  }
  return (
    <MarblePanel tone="translucent" className={cn(marbleStyles.fadeIn, "w-[270px] p-3", className)} role="region" aria-label="Map legend">
      <button
        type="button"
        aria-expanded
        onClick={() => setCollapsed(true)}
        className="mb-2 flex w-full items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
      >
        <h2 className={cn(marbleStyles.display, "text-[15px] uppercase tracking-[0.2em] text-[#f2ede2]")}>Legend</h2>
        <ChevronDown aria-hidden className="h-4 w-4 text-[#c49a5e]" />
      </button>
      <ul className="space-y-1.5">
        {KEY_ROWS.map((row) => (
          <li key={row.label} className="flex items-center gap-2.5">
            <StampCanvas width={44} height={30} zoom={1.4} background={row.bg} seed={row.label} className="shrink-0 rounded-[2px]" draw={(dc, { width, height }) => row.draw(dc, width, height)} />
            <span className="text-[12px] leading-tight text-[#e6dfd1]">{row.label}</span>
          </li>
        ))}
      </ul>
      <MarbleDivider className="my-2.5" />
      <ul className="max-h-[180px] space-y-1 overflow-auto pr-1">
        {MINOR.map((k) => (
          <li key={k} className="flex items-center gap-2.5">
            <StampCanvas width={30} height={30} zoom={1.1} seed={k} className="shrink-0 rounded-[2px]" draw={(dc, { width, height }) => drawSettlement(dc, { kind: k, tier: "minor", status: "maintained", weathering: 0, position: { x: width / 2, y: height / 2 + 1 }, scale: k === "port" ? 0.6 : 0.85 })} />
            <span className="text-[12px] leading-tight text-[#e6dfd1]">
              <span className="font-medium text-[#f2ede2]">{KIND_LABEL[k]}</span> — {KIND_MEANING[k]}
            </span>
          </li>
        ))}
      </ul>
    </MarblePanel>
  );
}

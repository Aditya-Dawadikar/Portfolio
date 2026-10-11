"use client";

import { List, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarbleButton, MarblePanel, marbleStyles } from "../primitives";

/** Shown while the world is being generated. */
export function MapLoadingState({ className }: { className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-[#0a1422]", className)}>
      <svg width="180" height="120" viewBox="0 0 180 120" aria-hidden>
        <path
          pathLength={1}
          className={marbleStyles.drawStroke}
          d="M30 70 C 28 48, 52 30, 74 36 C 92 18, 126 22, 136 42 C 158 46, 160 74, 140 84 C 128 104, 92 100, 78 92 C 56 102, 30 92, 30 70 Z"
          fill="none"
          stroke="#ebe7df"
          strokeWidth="1.4"
        />
        <path
          pathLength={1}
          className={marbleStyles.drawStroke}
          d="M150 26 c 6 -4, 14 0, 12 7 c -2 6, -12 6, -12 -7 Z M18 96 c 5 -3, 11 1, 9 6 c -3 4, -10 3, -9 -6 Z"
          fill="none"
          stroke="#ebe7df"
          strokeWidth="1"
        />
      </svg>
      <p className={cn(marbleStyles.display, "text-[18px] italic tracking-[0.1em] text-[#d9d2c4]")}>Charting the world…</p>
    </div>
  );
}

/** No data at all, or every settlement filtered out (the world stays visible behind it). */
export function MapEmptyState({ reason, onResetFilters, className }: { reason: "no-data" | "all-filtered"; onResetFilters?: () => void; className?: string }) {
  if (reason === "all-filtered") {
    return (
      <MarblePanel tone="translucent" role="status" className={cn(marbleStyles.fadeIn, "flex items-center gap-3 px-4 py-2.5", className)}>
        <span className="text-[13px] text-[#e6dfd1]">No settlements match these filters.</span>
        {onResetFilters && (
          <MarbleButton size="sm" onClick={onResetFilters}>
            <RotateCcw className="h-3 w-3" /> Reset filters
          </MarbleButton>
        )}
      </MarblePanel>
    );
  }
  return (
    <div role="status" className={cn("flex flex-col items-center justify-center gap-3 p-8 text-center", className)}>
      <svg width="120" height="70" viewBox="0 0 120 70" aria-hidden>
        <ellipse cx="60" cy="40" rx="54" ry="22" fill="none" stroke="#6d8bab" strokeOpacity="0.4" strokeDasharray="2 5" />
        <path d="M40 40 c 2 -12, 18 -16, 26 -10 c 10 -2, 16 8, 10 14 c -6 8, -30 8, -36 -4 Z" fill="#ebe7df" stroke="#26221e" />
      </svg>
      <p className={cn(marbleStyles.display, "text-[18px] text-[#e6dfd1]")}>This world is still uncharted.</p>
      <p className="text-[12px] text-[#a59e92]">Add repositories to raise its first settlements.</p>
    </div>
  );
}

export function MapAttribution({ seed, version, onShowList, className }: { seed: string; version: number; onShowList?: () => void; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#f2ede2]/55", className)}>
      <span>
        Seed <span className="normal-case tracking-normal text-[#f2ede2]/75">{seed}</span> · v{version}
      </span>
      {onShowList && (
        <button
          type="button"
          onClick={onShowList}
          className="inline-flex items-center gap-1 rounded-[2px] px-1 text-[#e2c89c]/80 hover:text-[#e2c89c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
        >
          <List className="h-3 w-3" /> View as list
        </button>
      )}
    </div>
  );
}

export function MapAnnouncer({ message }: { message: string }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

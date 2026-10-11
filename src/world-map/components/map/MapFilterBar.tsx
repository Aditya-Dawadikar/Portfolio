"use client";

import { useMemo, useState } from "react";
import { Filter, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapFilters, RepositoryStatus, ScoredRepository, Territory } from "../../types";
import { filtersActive } from "../../hooks/useMapFilters";
import { MarbleBadge, MarbleButton, MarbleDivider, MarbleIconButton, MarblePanel, MarbleSelect, STATUS_LABEL, marbleStyles } from "../primitives";
import { MapSearch } from "./MapSearch";

export interface MapFilterBarProps {
  filters: MapFilters;
  onChange: (f: MapFilters) => void;
  territories: Territory[];
  repositories: ScoredRepository[];
  matchCount: number;
  onSearchSelect: (id: string) => void;
  defaultCollapsed?: boolean;
  className?: string;
}

const STATUSES: RepositoryStatus[] = ["deployed", "active", "maintained", "archived"];

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-[3px] border px-2 py-1 text-[11px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]",
        pressed ? "border-[#c49a5e] bg-[#a87d45]/25 text-[#f2ede2]" : "border-[#f2ede2]/15 text-[#cfc8ba] hover:border-[#f2ede2]/35",
      )}
    >
      {children}
    </button>
  );
}

/** Filters dim non-matching settlements (never remove them). Hosts MapSearch. */
export function MapFilterBar({ filters, onChange, territories, repositories, matchCount, onSearchSelect, defaultCollapsed = false, className }: MapFilterBarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const techOptions = useMemo(() => {
    const counts = new Map<string, number>();
    repositories.forEach((r) => r.technologies.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, label: value, count }));
  }, [repositories]);
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const active = filtersActive(filters);

  if (collapsed) {
    return (
      <MarblePanel tone="translucent" className={cn("inline-flex items-center gap-1 p-1", className)}>
        <MarbleButton variant="ghost" size="sm" onClick={() => setCollapsed(false)} aria-expanded={false}>
          <Filter className="h-3.5 w-3.5 text-[#c49a5e]" /> Filters
          {active && <span className="ml-1 rounded-full bg-[#a87d45] px-1.5 text-[10px] text-[#12141a]">{matchCount}</span>}
        </MarbleButton>
      </MarblePanel>
    );
  }

  return (
    <MarblePanel tone="translucent" className={cn(marbleStyles.fadeIn, "w-[300px] max-w-[calc(100vw-2rem)] space-y-3 p-3", className)} aria-label="Map filters" role="region">
      <div className="flex items-center justify-between">
        <h2 className={cn(marbleStyles.display, "text-[15px] uppercase tracking-[0.2em] text-[#f2ede2]")}>Atlas filters</h2>
        <MarbleIconButton label="Collapse filters" size="sm" tooltipSide="bottom" onClick={() => setCollapsed(true)} aria-expanded>
          <X className="h-4 w-4" />
        </MarbleIconButton>
      </div>
      <MapSearch repositories={repositories} onSelect={onSearchSelect} />
      <MarbleDivider />
      <fieldset>
        <legend className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#a59e92]">Territory</legend>
        <div className="flex flex-wrap gap-1">
          {territories.map((t) => (
            <Chip key={t.id} pressed={filters.territories.includes(t.id)} onClick={() => onChange({ ...filters, territories: toggle(filters.territories, t.id) })}>
              {t.name}
            </Chip>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#a59e92]">Status</legend>
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filters.statuses.includes(s)}
              onClick={() => onChange({ ...filters, statuses: toggle(filters.statuses, s) })}
              className={cn("rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]", filters.statuses.includes(s) ? "ring-1 ring-[#c49a5e]" : "opacity-80 hover:opacity-100")}
            >
              <MarbleBadge tone={s}>{STATUS_LABEL[s]}</MarbleBadge>
            </button>
          ))}
        </div>
      </fieldset>
      <MarbleSelect label="Technology" options={techOptions} value={filters.technologies} onChange={(technologies) => onChange({ ...filters, technologies })} />
      <label className="flex cursor-pointer items-center justify-between gap-2 text-[12px] text-[#e6dfd1]">
        Show only major projects
        <button
          type="button"
          role="switch"
          aria-checked={filters.majorOnly}
          onClick={() => onChange({ ...filters, majorOnly: !filters.majorOnly })}
          className={cn("relative h-5 w-9 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]", filters.majorOnly ? "border-[#c49a5e] bg-[#a87d45]/50" : "border-[#f2ede2]/25 bg-[#0d1016]/60")}
        >
          <span className={cn("absolute left-0 top-0.5 h-3.5 w-3.5 rounded-full bg-[#f2ede2] transition-transform", filters.majorOnly ? "translate-x-[18px]" : "translate-x-0.5")} />
        </button>
      </label>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-[#a59e92]" aria-live="polite">
          {matchCount} of {repositories.length} settlements
        </span>
        <MarbleButton size="sm" variant="ghost" disabled={!active} onClick={() => onChange({ ...filters, territories: [], statuses: [], technologies: [], majorOnly: false })}>
          <RotateCcw className="h-3 w-3" /> Reset
        </MarbleButton>
      </div>
    </MarblePanel>
  );
}

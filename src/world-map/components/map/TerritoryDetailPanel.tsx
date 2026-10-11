"use client";

import { Telescope, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoredRepository, Territory } from "../../types";
import { KIND_LABEL } from "../../utils/accessibility";
import { MarbleBadge, MarbleButton, MarbleDivider, MarbleIconButton, MarblePanel, MarbleSheet, marbleStyles } from "../primitives";

export interface TerritoryDetailPanelProps {
  territory: Territory;
  repositories: ScoredRepository[];
  onSelectRepository: (id: string) => void;
  onExploreAll: () => void;
  onClose: () => void;
  variant: "side" | "sheet" | "inline";
}

function Body({ territory, repositories, onSelectRepository, onExploreAll, onClose }: Omit<TerritoryDetailPanelProps, "variant">) {
  const notable = [...repositories].sort((a, b) => b.importance - a.importance).slice(0, 3);
  const tech = new Map<string, number>();
  repositories.forEach((r) => r.technologies.forEach((t) => tech.set(t, (tech.get(t) ?? 0) + 1)));
  const clusters = Array.from(tech.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const live = repositories.filter((r) => r.status === "deployed" || r.status === "active").length;
  return (
    <div className="space-y-4 p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c49a5e]">Territory</p>
          <h2 className={cn(marbleStyles.display, "mt-0.5 text-[28px] font-semibold uppercase leading-none tracking-[0.06em] text-[#f2ede2]")}>{territory.name}</h2>
        </div>
        <MarbleIconButton label="Close territory" onClick={onClose}>
          <X className="h-4 w-4" />
        </MarbleIconButton>
      </header>
      <p className={cn(marbleStyles.display, "text-[17px] italic leading-snug text-[#ddd6c8]")}>{territory.summary}</p>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Settlements", repositories.length],
          ["Live", live],
          ["Archived", repositories.filter((r) => r.status === "archived").length],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[3px] border border-[#f2ede2]/12 py-2">
            <dd className={cn(marbleStyles.display, "text-[24px] leading-none text-[#f2ede2]")}>{v}</dd>
            <dt className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[#a59e92]">{k}</dt>
          </div>
        ))}
      </dl>
      <MarbleDivider />
      <section>
        <h3 className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#a59e92]">Notable projects</h3>
        <ul className="space-y-1">
          {notable.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelectRepository(r.id)}
                className="flex w-full items-center justify-between gap-2 rounded-[3px] border border-[#f2ede2]/10 px-2 py-1.5 text-left hover:border-[#f2ede2]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
              >
                <span className="text-[13px] text-[#f2ede2]">{r.name}</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#c49a5e]">{KIND_LABEL[r.settlementKind]}</span>
                  <MarbleBadge tone={r.status} className="text-[10px]" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#a59e92]">Technology clusters</h3>
        <div className="flex flex-wrap gap-1">
          {clusters.map(([t, n]) => (
            <MarbleBadge key={t}>
              {t} <span className="text-[#8f887c]">×{n}</span>
            </MarbleBadge>
          ))}
        </div>
      </section>
      <MarbleButton onClick={onExploreAll} className="w-full">
        <Telescope className="h-3.5 w-3.5" /> Explore all settlements
      </MarbleButton>
    </div>
  );
}

/** Territory story and totals. Opens from empty ground or a territory label. */
export function TerritoryDetailPanel(props: TerritoryDetailPanelProps) {
  if (props.variant === "sheet") {
    return (
      <MarbleSheet open onClose={props.onClose} label={`${props.territory.name} territory`}>
        <Body {...props} />
      </MarbleSheet>
    );
  }
  return (
    <MarblePanel
      engraved
      role="complementary"
      aria-label={`${props.territory.name} territory`}
      className={cn(marbleStyles.fadeIn, "w-[360px] overflow-auto", props.variant === "side" && "absolute bottom-4 right-4 top-4 z-30")}
    >
      <Body {...props} />
    </MarblePanel>
  );
}

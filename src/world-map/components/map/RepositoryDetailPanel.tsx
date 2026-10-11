"use client";

import { ExternalLink, Github, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoredRepository, Territory } from "../../types";
import { KIND_LABEL, KIND_MEANING } from "../../utils/accessibility";
import { MarbleBadge, MarbleButton, MarbleDivider, MarbleIconButton, MarblePanel, MarbleSheet, marbleStyles } from "../primitives";

export interface RepositoryDetailPanelProps {
  repository: ScoredRepository;
  territory: Territory | undefined;
  connections: ScoredRepository[];
  onClose: () => void;
  onSelectConnection: (id: string) => void;
  onSelectTerritory?: (id: Territory["id"]) => void;
  variant: "side" | "sheet" | "inline";
}

function TickBar({ label, value }: { label: string; value: number }) {
  const filled = Math.round(value / 10);
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.16em] text-[#a59e92]">
        <span>{label}</span>
        <span className="tabular-nums text-[#e6dfd1]">{value}</span>
      </div>
      <div className="flex gap-[3px]" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={cn("h-2.5 flex-1 border", i < filled ? "border-[#c49a5e] bg-[#a87d45]/60" : "border-[#f2ede2]/15")} />
        ))}
      </div>
    </div>
  );
}

function Body({ repository: r, territory, connections, onClose, onSelectConnection, onSelectTerritory }: Omit<RepositoryDetailPanelProps, "variant">) {
  return (
    <div className="space-y-4 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c49a5e]">{KIND_LABEL[r.settlementKind]}</p>
          <h2 className={cn(marbleStyles.display, "mt-0.5 text-[28px] font-semibold leading-none text-[#f2ede2] [overflow-wrap:anywhere]")}>{r.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <MarbleBadge tone={r.status} />
            {r.isOpenSourceContribution && <MarbleBadge tone="bronze">Open-source contribution</MarbleBadge>}
            {r.stars != null && <MarbleBadge tone="neutral">★ {r.stars}</MarbleBadge>}
          </div>
        </div>
        <MarbleIconButton label="Close details" tooltipSide="left" onClick={onClose}>
          <X className="h-4 w-4" />
        </MarbleIconButton>
      </header>
      <p className="text-[14px] leading-relaxed text-[#ddd6c8]">{r.description}</p>
      <p className="text-[11px] italic text-[#8f887c]">{KIND_MEANING[r.settlementKind]}.</p>
      <div className="grid grid-cols-2 gap-3">
        <TickBar label="Impact" value={r.impactScore} />
        <TickBar label="Activity" value={r.activityScore} />
      </div>
      <MarbleDivider />
      <section>
        <h3 className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#a59e92]">Technologies</h3>
        <div className="flex flex-wrap gap-1">
          {r.technologies.map((t) => (
            <MarbleBadge key={t}>{t}</MarbleBadge>
          ))}
        </div>
      </section>
      {territory && (
        <section>
          <h3 className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#a59e92]">Territory</h3>
          <button
            type="button"
            onClick={() => onSelectTerritory?.(territory.id)}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#e2c89c] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
          >
            <MapPin className="h-3.5 w-3.5" /> {territory.name}
          </button>
        </section>
      )}
      {connections.length > 0 && (
        <section>
          <h3 className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#a59e92]">Connected settlements</h3>
          <ul className="space-y-1">
            {connections.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelectConnection(c.id)}
                  className="flex w-full items-center justify-between rounded-[3px] border border-[#f2ede2]/10 px-2 py-1.5 text-left hover:border-[#f2ede2]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
                >
                  <span className="text-[13px] text-[#f2ede2]">{c.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#c49a5e]">{KIND_LABEL[c.settlementKind]}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <a href={r.githubUrl} target="_blank" rel="noreferrer">
          <MarbleButton tabIndex={-1} className="pointer-events-none">
            <Github className="h-3.5 w-3.5" /> GitHub
          </MarbleButton>
        </a>
        {r.demoUrl && (
          <a href={r.demoUrl} target="_blank" rel="noreferrer">
            <MarbleButton variant="ghost" tabIndex={-1} className="pointer-events-none">
              <ExternalLink className="h-3.5 w-3.5" /> Live demo
            </MarbleButton>
          </a>
        )}
      </div>
    </div>
  );
}

/** Selected-project detail: right side panel on desktop, bottom sheet on mobile. */
export function RepositoryDetailPanel(props: RepositoryDetailPanelProps) {
  if (props.variant === "sheet") {
    return (
      <MarbleSheet open onClose={props.onClose} label={`${props.repository.name} details`}>
        <Body {...props} />
      </MarbleSheet>
    );
  }
  return (
    <MarblePanel
      engraved
      role="complementary"
      aria-label={`${props.repository.name} details`}
      className={cn(
        marbleStyles.fadeIn,
        "w-[360px] overflow-auto",
        props.variant === "side" && "absolute bottom-4 right-4 top-4 z-30",
      )}
    >
      <Body {...props} />
    </MarblePanel>
  );
}

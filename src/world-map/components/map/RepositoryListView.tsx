"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoredRepository, Territory } from "../../types";
import { KIND_LABEL } from "../../utils/accessibility";
import { MarbleBadge, MarbleIconButton, MarblePanel, marbleStyles } from "../primitives";

export interface RepositoryListViewProps {
  territories: Territory[];
  repositories: ScoredRepository[];
  matches: (id: string) => boolean;
  onSelect: (id: string) => void;
  onClose?: () => void;
  className?: string;
}

/** Complete non-map alternative: every settlement grouped by territory, same filters, same detail panel. */
export function RepositoryListView({ territories, repositories, matches, onSelect, onClose, className }: RepositoryListViewProps) {
  return (
    <MarblePanel engraved role="region" aria-label="Repository list" className={cn(marbleStyles.fadeIn, "flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-[#f2ede2]/10 px-5 py-3">
        <h2 className={cn(marbleStyles.display, "text-[20px] uppercase tracking-[0.16em] text-[#f2ede2]")}>Gazetteer</h2>
        {onClose && (
          <MarbleIconButton label="Back to map" onClick={onClose}>
            <X className="h-4 w-4" />
          </MarbleIconButton>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-auto px-5 py-4">
        {territories.map((t) => {
          const rs = repositories.filter((r) => r.category === t.id).sort((a, b) => b.importance - a.importance);
          if (!rs.length) return null;
          return (
            <section key={t.id} aria-labelledby={`gz-${t.id}`}>
              <h3 id={`gz-${t.id}`} className="mb-1.5 text-[11px] uppercase tracking-[0.2em] text-[#c49a5e]">
                {t.name}
              </h3>
              <ul className="divide-y divide-[#f2ede2]/8">
                {rs.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(r.id)}
                      className={cn(
                        "flex w-full items-center gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]",
                        !matches(r.id) && "opacity-40",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] text-[#f2ede2]">{r.name}</span>
                        <span className="block truncate text-[12px] text-[#a59e92]">{r.description}</span>
                      </span>
                      <span className="hidden text-[10px] uppercase tracking-[0.14em] text-[#c49a5e] sm:inline">{KIND_LABEL[r.settlementKind]}</span>
                      <MarbleBadge tone={r.status} className="shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </MarblePanel>
  );
}

"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ScoredRepository } from "../../types";
import { KIND_LABEL } from "../../utils/accessibility";
import { MarbleSearchInput, marbleStyles } from "../primitives";

export interface MapSearchProps {
  repositories: ScoredRepository[];
  onSelect: (id: string) => void;
  placeholder?: string;
}

/** ARIA combobox over repository names and technologies. Selecting flies the camera there. */
export function MapSearch({ repositories, onSelect, placeholder = "Search settlements or tech…" }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return repositories
      .map((r) => {
        const name = r.name.toLowerCase();
        const score = name.startsWith(q) ? 3 : name.includes(q) ? 2 : r.technologies.some((t) => t.toLowerCase().includes(q)) ? 1 : 0;
        return { r, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.r.importance - a.r.importance)
      .slice(0, 8)
      .map((x) => x.r);
  }, [query, repositories]);

  const choose = (r: ScoredRepository) => {
    onSelect(r.id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <MarbleSearchInput
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${id}-opt-${active}` : undefined}
        aria-label="Search repositories"
        placeholder={placeholder}
        value={query}
        data-map-search
        onClear={() => setQuery("")}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(results.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter" && results[active]) {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === "Escape") {
            setQuery("");
            setOpen(false);
          }
        }}
      />
      {open && results.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className={cn(marbleStyles.panel, marbleStyles.fadeIn, "absolute z-30 mt-1 w-full rounded-[3px] p-1")}>
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(r);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn("cursor-pointer rounded-[2px] px-2 py-1.5", i === active && "bg-[#f2ede2]/10")}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] text-[#f2ede2]">{r.name}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#c49a5e]">{KIND_LABEL[r.settlementKind]}</span>
              </div>
              <div className="truncate text-[11px] text-[#8f887c]">{r.technologies.join(" · ")}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

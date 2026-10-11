"use client";

import { useCallback, useMemo, useState } from "react";
import type { MapFilters, ScoredRepository } from "../types";

export const EMPTY_FILTERS: MapFilters = { territories: [], statuses: [], technologies: [], majorOnly: false, query: "" };

export function repositoryMatches(r: ScoredRepository, f: MapFilters): boolean {
  if (f.territories.length && !f.territories.includes(r.category)) return false;
  if (f.statuses.length && !f.statuses.includes(r.status)) return false;
  if (f.technologies.length && !f.technologies.some((t) => r.technologies.includes(t))) return false;
  if (f.majorOnly && !r.isMajor) return false;
  return true;
}

export const filtersActive = (f: MapFilters) =>
  f.territories.length > 0 || f.statuses.length > 0 || f.technologies.length > 0 || f.majorOnly;

export function useMapFilters(repositories: Record<string, ScoredRepository> | undefined) {
  const [filters, setFilters] = useState<MapFilters>(EMPTY_FILTERS);
  const matches = useCallback(
    (id: string) => {
      const r = repositories?.[id];
      return r ? repositoryMatches(r, filters) : false;
    },
    [repositories, filters],
  );
  const matchCount = useMemo(
    () => (repositories ? Object.values(repositories).filter((r) => repositoryMatches(r, filters)).length : 0),
    [repositories, filters],
  );
  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);
  return { filters, setFilters, matches, matchCount, reset, active: filtersActive(filters) };
}

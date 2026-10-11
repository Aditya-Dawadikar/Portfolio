import type { SettlementKind, SettlementTier } from "./map";

export type TerritoryKind =
  | "agents"
  | "backend"
  | "cloud"
  | "research"
  | "open_source"
  | "experiments";

export type RepositoryStatus = "deployed" | "active" | "maintained" | "archived";

/** Raw, user-supplied repository metadata. Never referenced by drawing code. */
export interface Repository {
  id: string;
  name: string;
  description: string;
  category: TerritoryKind;
  technologies: string[];
  githubUrl: string;
  demoUrl?: string;
  status: RepositoryStatus;
  stars?: number;
  /** ISO 8601 date string. */
  lastUpdatedAt?: string;
  /** 0–100. Drives landmark scale. */
  impactScore: number;
  /** 0–100. Drives settlement liveliness (glow eligibility, road rank). */
  activityScore: number;
  isOpenSourceContribution?: boolean;
  /** Ids of related repositories. Used for roads (same territory) and sea routes (cross-territory). */
  linksTo?: string[];
}

/** Output of `scoreRepository` (pipeline step 1 + 8). */
export interface ScoredRepository extends Repository {
  /** Normalised 0–1 importance combining impact, activity, status and stars. */
  importance: number;
  tier: SettlementTier;
  settlementKind: SettlementKind;
  /** Convenience flag for the "Show only major projects" filter. */
  isMajor: boolean;
  /** Links that resolved to a known repository id (unknown ids dropped). */
  resolvedLinks: string[];
}

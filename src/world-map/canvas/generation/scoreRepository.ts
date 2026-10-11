import type {
  LandmarkKind,
  MinorSettlementKind,
  Repository,
  RepositoryStatus,
  ScoredRepository,
  SettlementKind,
  Territory,
} from "../../types";
import { clamp01 } from "../../utils/geometry";
import { hashString } from "../engine/seededRandom";

const STATUS_BONUS: Record<RepositoryStatus, number> = { deployed: 12, active: 6, maintained: 0, archived: -15 };
const SECURITY_TECH = /auth|oauth|oidc|security|rls|crypto|vault/i;
const DOCS_TECH = /markdown|docs|tla\+|mdx|documentation|notes/i;

function computeImportance(r: Repository): number {
  const stars = 0.05 * Math.log10((r.stars ?? 0) + 1) * 20;
  return clamp01((0.55 * r.impactScore + 0.25 * r.activityScore + STATUS_BONUS[r.status] + stars) / 100);
}

function minorKind(r: Repository, importance: number, territory: Territory | undefined): MinorSettlementKind {
  if (r.status === "archived") return "ruin";
  if (r.isOpenSourceContribution) return "port";
  const tech = r.technologies.join(" ") + " " + r.description;
  if ((r.category === "backend" || r.category === "cloud") && SECURITY_TECH.test(tech)) return "tower";
  if (DOCS_TECH.test(r.technologies.join(" "))) return "archive";
  if (r.category === "experiments") return "workshop";
  if (importance < 0.15) return "shrine";
  const allowed = (territory?.landmarkStyle ?? []).filter((k): k is MinorSettlementKind =>
    ["village", "outpost", "workshop", "shrine", "archive", "tower"].includes(k),
  );
  // Deterministic variety: the most important repos take the territory's preferred kind.
  if (allowed.length === 0) return "village";
  return importance >= 0.35 ? allowed[0] : allowed[hashString(r.id) % allowed.length];
}

function landmarkKind(r: Repository, territory: Territory | undefined): LandmarkKind {
  if (DOCS_TECH.test(r.technologies.join(" "))) return "library";
  if (r.category === "experiments" && /hackathon|jam|arena/i.test(r.description)) return "arena";
  return territory?.signatureLandmark ?? "forum";
}

/**
 * Pipeline step 1 + 8: importance, tier and settlement kind.
 * - World flagship (highest-importance own repo, ≥ 0.6) → temple.
 * - Best remaining non-archived repo per territory with importance ≥ 0.35 → signature landmark
 *   (own work first; contributions only as a fallback).
 * - Other repos ≥ 0.45 → major tier (minor kind drawn larger). Everything else minor.
 */
export function scoreRepositories(repositories: Repository[], territories: Territory[]): Record<string, ScoredRepository> {
  const ids = new Set(repositories.map((r) => r.id));
  const territoryById = new Map(territories.map((t) => [t.id, t]));
  const scored = repositories.map((r) => ({ r, importance: computeImportance(r) }));

  const live = scored.filter((s) => s.r.status !== "archived").sort((a, b) => b.importance - a.importance || a.r.id.localeCompare(b.r.id));
  // Own work is preferred for landmarks; a contribution only stands in when nothing else qualifies.
  const own = live.filter((s) => !s.r.isOpenSourceContribution);
  const flagship = own[0] && own[0].importance >= 0.6 ? own[0].r.id : null;

  const landmarkIds = new Set<string>();
  for (const t of territories) {
    const ok = (s: (typeof live)[number]) => s.r.category === t.id && s.r.id !== flagship && s.importance >= 0.35;
    const best = own.find(ok) ?? live.find(ok);
    if (best) landmarkIds.add(best.r.id);
  }

  const out: Record<string, ScoredRepository> = {};
  for (const { r, importance } of scored) {
    const territory = territoryById.get(r.category);
    let kind: SettlementKind;
    let tier: ScoredRepository["tier"];
    if (r.id === flagship) {
      kind = "temple";
      tier = "landmark";
    } else if (landmarkIds.has(r.id)) {
      kind = landmarkKind(r, territory);
      tier = "landmark";
    } else {
      kind = minorKind(r, importance, territory);
      tier = importance >= 0.45 && r.status !== "archived" ? "major" : "minor";
    }
    out[r.id] = {
      ...r,
      importance,
      tier,
      settlementKind: kind,
      isMajor: tier !== "minor",
      resolvedLinks: (r.linksTo ?? []).filter((id) => ids.has(id) && id !== r.id),
    };
  }
  return out;
}

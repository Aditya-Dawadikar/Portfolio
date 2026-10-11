import type { GeneratedWorld, Landmass, MapTarget, Settlement, TerritoryKind, TerritoryRegion, WorldPoint } from "../../types";
import { boundsContains, dist, pointInPolygon } from "../../utils/geometry";

export const powerDistance = (p: WorldPoint, r: Pick<TerritoryRegion, "site" | "weight">) =>
  (p.x - r.site.x) ** 2 + (p.y - r.site.y) ** 2 - r.weight;

/** Which territory owns a world point: continent by power diagram, islands by assignment. */
export function territoryAt(regions: TerritoryRegion[], landmasses: Landmass[], p: WorldPoint): TerritoryKind | null {
  for (const land of landmasses) {
    if (!boundsContains(land.bounds, p) || !pointInPolygon(p, land.polygon)) continue;
    if (land.kind === "continent") {
      let best: TerritoryRegion | null = null;
      let bestD = Infinity;
      for (const r of regions) {
        const d = powerDistance(p, r);
        if (d < bestD) {
          bestD = d;
          best = r;
        }
      }
      return best?.territoryId ?? null;
    }
    const owner = regions.find((r) => r.islandIds.includes(land.id));
    return owner?.territoryId ?? null;
  }
  return null;
}

const TIER_PRIORITY: Record<Settlement["tier"], number> = { landmark: 3, major: 2, minor: 1 };

/** Settlement under a point (with a minimum screen-space touch radius), else territory under it. */
export function hitTest(
  world: GeneratedWorld,
  p: WorldPoint,
  zoom: number,
  isVisible: (s: Settlement) => boolean,
  minScreenRadius = 10,
): MapTarget | null {
  let best: Settlement | null = null;
  let bestScore = -Infinity;
  for (const s of world.settlements) {
    if (!isVisible(s)) continue;
    const r = Math.max(s.hitRadius, minScreenRadius / zoom);
    const d = dist(p, s.position);
    if (d > r) continue;
    const score = TIER_PRIORITY[s.tier] * 1000 - d;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  if (best) return { kind: "settlement", id: best.repositoryId };
  const t = territoryAt(world.regions, world.landmasses, p);
  return t ? { kind: "territory", id: t } : null;
}

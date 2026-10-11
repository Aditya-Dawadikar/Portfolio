import type {
  Decorations,
  ScoredRepository,
  SeededRandom,
  Settlement,
  TerrainLayer,
  WorldPoint,
} from "../../types";
import {
  clamp01,
  dist,
  distToPolyline,
  lerp,
  nearestPointOnPolyline,
  pointInPolygon,
  polygonArea,
  polygonCentroid,
} from "../../utils/geometry";
import { LANDMARK_RADIUS, isLandmarkKind } from "../drawing/landmarks";
import { territoryAt } from "../engine/hitTesting";
import { hashString } from "../engine/seededRandom";
import { type TerrainContext, mainlandOf } from "./generateTerrain";

const MINOR_RADIUS = 13;
/** Radius every structure converges to as sizeContrast → 0. */
const UNIFORM_RADIUS = 20;

function settlementScale(r: ScoredRepository): number {
  if (r.tier === "landmark") return lerp(1.5, 2.4, clamp01(r.impactScore / 100));
  if (r.tier === "major") return 1.25;
  return 0.85 + clamp01(r.impactScore / 100) * 0.3;
}

function hitRadiusFor(r: ScoredRepository, scale: number) {
  if (isLandmarkKind(r.settlementKind)) return LANDMARK_RADIUS * scale * 1.05;
  return MINOR_RADIUS * scale * (r.tier === "major" ? 1.25 : 1);
}

/** Pipeline steps 7–9: statue, signature landmarks, then settlements by Poisson-style rejection sampling. */
export function generateSettlements(
  rng: SeededRandom,
  ctx: TerrainContext,
  terrain: TerrainLayer,
  repos: Record<string, ScoredRepository>,
): { settlements: Settlement[]; decorations: Decorations } {
  const { land, regions } = ctx;
  const onMainland = (p: WorldPoint) => ctx.mainland.some((l) => pointInPolygon(p, l.polygon));
  const placed: Settlement[] = [];
  const density = Math.max(0.3, ctx.options.density ?? 1);
  const spacing = (1 / Math.sqrt(density)) * Math.max(0.2, ctx.options.settlementSpacing ?? 1);

  const coastDistOf = (p: WorldPoint, polygon: WorldPoint[]) => distToPolyline(p, polygon, true);
  const ridgeDist = (p: WorldPoint) => terrain.mountains.reduce((m, r) => Math.min(m, distToPolyline(p, r.ridge)), Infinity);
  const riverDist = (p: WorldPoint) => terrain.rivers.reduce((m, r) => Math.min(m, distToPolyline(p, r.path)), Infinity);
  const inLake = (p: WorldPoint) => terrain.lakes.some((l) => pointInPolygon(p, l.polygon));

  // Keep the statue on the largest land when the world is an archipelago.
  let statuePos: WorldPoint | null = null;
  const statueHome = ctx.mainland.reduce(
    (largest, current) => (polygonArea(current.polygon) > polygonArea(largest.polygon) ? current : largest),
    ctx.mainland[0] ?? land.continent,
  );
  const contCentroid = polygonCentroid(statueHome.polygon);
  for (let i = 0; i < 400 && !statuePos; i++) {
    const a = i * 2.39996;
    const r = 8 * Math.sqrt(i) * 3;
    const p = { x: contCentroid.x + Math.cos(a) * r, y: contCentroid.y + Math.sin(a) * r };
    if (onMainland(p) && ridgeDist(p) > 60 && riverDist(p) > 25 && !inLake(p) && regions.every((rg) => dist(rg.labelAnchor, p) > 90)) {
      statuePos = p;
    }
  }

  const isFree = (p: WorldPoint, radius: number, strict: boolean) => {
    if (inLake(p)) return false;
    if (ridgeDist(p) < radius + (strict ? 30 : 12)) return false;
    if (riverDist(p) < radius * 0.7 + (strict ? 8 : 3)) return false;
    if (statuePos && dist(p, statuePos) < radius + 50) return false;
    for (const s of placed) {
      const gap = (s.tier === "landmark" ? 40 : 22) * spacing;
      if (dist(p, s.position) < radius + s.hitRadius + (strict ? gap : gap * 0.5)) return false;
    }
    if (strict && terrain.forests.some((f) => pointInPolygon(p, f.polygon))) return false;
    return true;
  };

  for (const region of regions) {
    const id = region.territoryId;
    const srng = rng.fork(`settlements:${id}`);
    const own = Object.values(repos)
      .filter((r) => r.category === id)
      .sort((a, b) => b.importance - a.importance || a.id.localeCompare(b.id));
    const home = mainlandOf(ctx, id);
    const coast = home.polygon;
    const islands = land.landmasses.filter((l) => region.islandIds.includes(l.id) && l !== home);

    for (const repo of own) {
      // Blend each structure's natural radius toward a shared one so minor repos aren't reduced to dots.
      const natural = settlementScale(repo);
      const naturalRadius = hitRadiusFor(repo, natural);
      const evenRadius = lerp(UNIFORM_RADIUS, naturalRadius, clamp01(ctx.options.sizeContrast ?? 1));
      const scale = natural * (evenRadius / naturalRadius) * (ctx.options.structureScale ?? 1);
      const radius = hitRadiusFor(repo, scale);
      const isPort = repo.settlementKind === "port" || repo.settlementKind === "bridge_city";
      const linked = placed.filter((s) => repo.resolvedLinks.includes(s.repositoryId) || (repos[s.repositoryId]?.resolvedLinks ?? []).includes(repo.id));
      const target = linked.length
        ? { x: linked.reduce((s, p) => s + p.position.x, 0) / linked.length, y: linked.reduce((s, p) => s + p.position.y, 0) / linked.length }
        : repo.tier === "landmark"
          ? { x: region.labelAnchor.x, y: region.labelAnchor.y + 70 }
          : region.centroid;

      // Dense worlds settle the outlying islands too (keyed by id, so sparse worlds are unaffected).
      const preferIsland = density > 1.2 && islands.length > 0 && repo.tier === "minor" && hashString(repo.id) % 10 < 3;
      let position: WorldPoint | null = null;
      let onIsland: WorldPoint[] | null = null;
      for (const strict of [true, false]) {
        const candidates: { p: WorldPoint; poly: WorldPoint[] }[] = [];
        for (let attempt = 0; attempt < 500 && candidates.length < 14; attempt++) {
          const useIsland = preferIsland || (islands.length > 0 && repo.tier !== "landmark" && srng.chance(0.35));
          let p: WorldPoint;
          let poly: WorldPoint[];
          if (useIsland) {
            const isl = srng.pick(islands);
            poly = isl.polygon;
            p = { x: srng.range(isl.bounds.minX, isl.bounds.maxX), y: srng.range(isl.bounds.minY, isl.bounds.maxY) };
            if (!pointInPolygon(p, poly)) continue;
          } else {
            poly = coast;
            const b = region.bounds;
            p = { x: srng.range(b.minX, b.maxX), y: srng.range(b.minY, b.maxY) };
            if (!pointInPolygon(p, coast) || territoryAt(regions, land.landmasses, p) !== id) continue;
          }
          const cd = coastDistOf(p, poly);
          if (isPort ? cd < radius * 0.6 + 6 || cd > radius + 45 : cd < radius * 0.8 + 10) continue;
          if (!isFree(p, radius, strict)) continue;
          candidates.push({ p, poly });
        }
        if (candidates.length) {
          if (!preferIsland) candidates.sort((a, b) => dist(a.p, target) - dist(b.p, target));
          const pick = candidates[Math.min(candidates.length - 1, srng.int(0, Math.min(2, candidates.length - 1)))];
          position = pick.p;
          onIsland = pick.poly === coast ? null : pick.poly;
          break;
        }
      }
      if (!position) position = { x: region.labelAnchor.x + srng.range(-60, 60), y: region.labelAnchor.y + srng.range(30, 90) };

      let rotation = srng.range(-0.2, 0.2);
      if (repo.settlementKind === "port") {
        const water = nearestPointOnPolyline(position, onIsland ?? coast, true);
        rotation = Math.atan2(water.y - position.y, water.x - position.x);
      }
      const lit = repo.tier === "minor" ? { deployed: 0.5, active: 0, maintained: 0, archived: 0 } : { deployed: 1, active: 0.6, maintained: 0, archived: 0 };
      placed.push({
        repositoryId: repo.id,
        kind: repo.settlementKind,
        tier: repo.tier,
        position,
        scale,
        rotation: isLandmarkKind(repo.settlementKind) ? srng.range(-0.08, 0.08) : rotation,
        activeGlow: lit[repo.status],
        weathering: repo.status === "archived" ? 1 : repo.status === "maintained" ? 0.25 : 0,
        status: repo.status,
        territoryId: id,
        hitRadius: radius,
      });
    }
  }

  // Decorative ruins in sparse, rugged areas.
  const drng = rng.fork("ruins-scatter");
  const ruinsScatter: WorldPoint[] = [];
  for (let i = 0; i < 40 * density && ruinsScatter.length < Math.round(5 * density); i++) {
    const home = drng.pick(ctx.mainland);
    const b = home.bounds;
    const p = { x: drng.range(b.minX, b.maxX), y: drng.range(b.minY, b.maxY) };
    if (pointInPolygon(p, home.polygon) && coastDistOf(p, home.polygon) > 40 && isFree(p, 14, true) && ruinsScatter.every((q) => dist(q, p) > 200 * spacing)) ruinsScatter.push(p);
  }

  const W = ctx.options.width;
  const H = ctx.options.height;
  return {
    settlements: placed,
    decorations: {
      statue: statuePos ? { position: statuePos, variant: "architect" } : null,
      compassRose: { position: { x: W * 0.92, y: H * 0.12 }, scale: 1 },
      ruinsScatter,
      ships: [],
    },
  };
}

import type {
  Bridge,
  Landmass,
  Road,
  ScoredRepository,
  SeaRoute,
  SeaRouteReason,
  SeededRandom,
  Settlement,
  TerrainLayer,
  WorldPoint,
} from "../../types";
import { dist, distToSegment, lerp, pointInPolygon, polygonCentroid, segmentIntersection, smoothPolyline } from "../../utils/geometry";
import { createNoise2D, fbm } from "../../utils/noise";
import type { LandmassResult } from "./generateLandmass";

const MAJOR = new Set(["landmark", "major"]);

function roadPath(a: WorldPoint, b: WorldPoint, noise: (x: number, y: number) => number, phase: number): WorldPoint[] {
  const L = dist(a, b);
  const n = Math.max(3, Math.round(L / 45));
  const nx = -(b.y - a.y) / L;
  const ny = (b.x - a.x) / L;
  const amp = Math.min(30, L * 0.12);
  const pts: WorldPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const off = fbm(noise, phase + t * 2, phase * 0.5, 3) * amp * Math.sin(Math.PI * t);
    pts.push({ x: lerp(a.x, b.x, t) + nx * off, y: lerp(a.y, b.y, t) + ny * off });
  }
  return pts;
}

/** Pipeline steps 10–11: roads (MST + explicit links) with bridges, and capped cross-territory sea routes. */
export function generateConnections(
  rng: SeededRandom,
  land: LandmassResult,
  terrain: TerrainLayer,
  settlements: Settlement[],
  repos: Record<string, ScoredRepository>,
  maxSeaRoutes: number,
  mainland: Landmass[] = [land.continent],
): { roads: Road[]; seaRoutes: SeaRoute[] } {
  const noise = createNoise2D(rng.int(0, 2 ** 31));
  // Roads only join settlements on a territory's home land (continent or its own island).
  const onContinent = settlements.filter((s) => mainland.some((l) => pointInPolygon(s.position, l.polygon)));

  const crossesRidge = (a: WorldPoint, b: WorldPoint) =>
    terrain.mountains.some((m) =>
      m.ridge.some((r) => distToSegment(r, a, b) < 28 && !m.passes.some((pp) => dist(pp, r) < 1)),
    );
  const edgeCost = (a: Settlement, b: Settlement) => dist(a.position, b.position) + (crossesRidge(a.position, b.position) ? 600 : 0);

  const edges = new Map<string, [Settlement, Settlement]>();
  const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const byTerritory = new Map<string, Settlement[]>();
  for (const s of onContinent) byTerritory.set(s.territoryId, [...(byTerritory.get(s.territoryId) ?? []), s]);

  for (const group of Array.from(byTerritory.values())) {
    if (group.length < 2) continue;
    // Prim's MST.
    const inTree = new Set([group[0].repositoryId]);
    while (inTree.size < group.length) {
      let best: [Settlement, Settlement] | null = null;
      let bestCost = Infinity;
      for (const a of group) {
        if (!inTree.has(a.repositoryId)) continue;
        for (const b of group) {
          if (inTree.has(b.repositoryId)) continue;
          const c = edgeCost(a, b);
          if (c < bestCost) {
            bestCost = c;
            best = [a, b];
          }
        }
      }
      if (!best) break;
      inTree.add(best[1].repositoryId);
      edges.set(key(best[0].repositoryId, best[1].repositoryId), best);
    }
    for (const a of group) {
      for (const linkId of repos[a.repositoryId]?.resolvedLinks ?? []) {
        const b = group.find((s) => s.repositoryId === linkId);
        if (b && !crossesRidge(a.position, b.position)) edges.set(key(a.repositoryId, b.repositoryId), [a, b]);
      }
    }
  }

  const riverLines = terrain.rivers.map((r) => ({ river: r, line: smoothPolyline(r.path, 8) }));
  const roads: Road[] = [];
  let idx = 0;
  for (const [k, [a, b]] of Array.from(edges.entries())) {
    const path = roadPath(a.position, b.position, noise, idx++ * 3.7);
    const line = smoothPolyline(path, 6);
    const bridges: Bridge[] = [];
    for (const { river, line: rl } of riverLines) {
      for (let i = 1; i < line.length; i++) {
        for (let j = 1; j < rl.length; j++) {
          const hit = segmentIntersection(line[i - 1], line[i], rl[j - 1], rl[j]);
          if (!hit || bridges.some((br) => dist(br.position, hit) < 12)) continue;
          const width = lerp(river.widthAtSource, river.widthAtMouth, j / (rl.length - 1));
          const span = width * 2 + 12;
          bridges.push({
            position: hit,
            angle: Math.atan2(line[i].y - line[i - 1].y, line[i].x - line[i - 1].x),
            span,
            variant: a.territoryId === "cloud" ? "aqueduct" : span > 22 ? "long_arch" : "stone",
          });
        }
      }
    }
    roads.push({ id: `road-${k}`, fromId: a.repositoryId, toId: b.repositoryId, path, rank: MAJOR.has(a.tier) && MAJOR.has(b.tier) ? "major" : "minor", bridges });
  }

  // Sea routes: only cross-territory links, best first.
  const { center, radiusAt, landmasses } = land;
  const onLand = (p: WorldPoint) => landmasses.some((l) => pointInPolygon(p, l.polygon));
  const pushOutFromWorldCenter = (p: WorldPoint) => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    const len = Math.hypot(dx, dy) || 1;
    let q = { ...p };
    for (let i = 0; i < 200 && onLand(q); i++) q = { x: q.x + (dx / len) * 10, y: q.y + (dy / len) * 10 };
    return { x: q.x + (dx / len) * 30, y: q.y + (dy / len) * 30 };
  };
  const pushOutFromIsland = (p: WorldPoint) => {
    const home = landmasses.find((island) => pointInPolygon(p, island.polygon));
    if (!home) return p;
    const islandCenter = polygonCentroid(home.polygon);
    let dx = p.x - islandCenter.x;
    let dy = p.y - islandCenter.y;
    const len = Math.hypot(dx, dy) || 1;
    if (dx === 0 && dy === 0) dx = 1;
    let q = { ...p };
    for (let i = 0; i < 200 && pointInPolygon(q, home.polygon); i++) q = { x: q.x + (dx / len) * 10, y: q.y + (dy / len) * 10 };
    return { x: q.x + (dx / len) * 30, y: q.y + (dy / len) * 30 };
  };
  const independentIslands = mainland.every((island) => island.kind === "island");
  const bySettlement = new Map(settlements.map((s) => [s.repositoryId, s]));
  const candidates: { a: Settlement; b: Settlement; score: number; reason: SeaRouteReason }[] = [];
  const seen = new Set<string>();
  for (const r of Object.values(repos)) {
    for (const linkId of r.resolvedLinks) {
      const other = repos[linkId];
      if (!other || other.category === r.category) continue;
      const k = key(r.id, linkId);
      if (seen.has(k)) continue;
      seen.add(k);
      const a = bySettlement.get(r.id);
      const b = bySettlement.get(linkId);
      if (!a || !b) continue;
      const os = r.isOpenSourceContribution || other.isOpenSourceContribution;
      const shared = r.technologies.some((t) => other.technologies.includes(t));
      candidates.push({ a, b, score: r.importance + other.importance + (os ? 1 : 0), reason: os ? "open_source" : shared ? "shared_tech" : "remote" });
    }
  }
  candidates.sort((x, y) => y.score - x.score);
  const seaRoutes: SeaRoute[] = candidates.slice(0, maxSeaRoutes).map(({ a, b, reason }) => {
    const pa = independentIslands ? pushOutFromIsland(a.position) : pushOutFromWorldCenter(a.position);
    const pb = independentIslands ? pushOutFromIsland(b.position) : pushOutFromWorldCenter(b.position);
    if (independentIslands) {
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      const bend = Math.min(180, length * 0.16);
      const arcs = [-1, 1].map((side) =>
        Array.from({ length: 7 }, (_, i) => {
          const t = (i + 1) / 8;
          const control = {
            x: (pa.x + pb.x) / 2 + nx * bend * side,
            y: (pa.y + pb.y) / 2 + ny * bend * side,
          };
          return {
            x: (1 - t) ** 2 * pa.x + 2 * (1 - t) * t * control.x + t ** 2 * pb.x,
            y: (1 - t) ** 2 * pa.y + 2 * (1 - t) * t * control.y + t ** 2 * pb.y,
          };
        }),
      );
      const arc = arcs.sort(
        (left, right) =>
          left.filter(onLand).length - right.filter(onLand).length,
      )[0];
      return { id: `route-${a.repositoryId}-${b.repositoryId}`, fromId: a.repositoryId, toId: b.repositoryId, path: [a.position, pa, ...arc, pb, b.position], reason };
    }
    const ta = Math.atan2(pa.y - center.y, pa.x - center.x);
    const tb = Math.atan2(pb.y - center.y, pb.x - center.x);
    let delta = tb - ta;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    const steps = Math.max(3, Math.ceil(Math.abs(delta) / 0.18));
    const arc: WorldPoint[] = [];
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const th = ta + delta * t;
      const r = radiusAt(th) + 70 + Math.sin(Math.PI * t) * 50;
      arc.push({ x: center.x + Math.cos(th) * r, y: center.y + Math.sin(th) * r });
    }
    return { id: `route-${a.repositoryId}-${b.repositoryId}`, fromId: a.repositoryId, toId: b.repositoryId, path: [a.position, pa, ...arc, pb, b.position], reason };
  });

  return { roads, seaRoutes };
}

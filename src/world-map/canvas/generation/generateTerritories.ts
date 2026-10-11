import type { ScoredRepository, SeededRandom, Territory, TerritoryRegion, WorldGenerationOptions, WorldPoint } from "../../types";
import {
  clipPolygonHalfPlane,
  dist,
  distToPolyline,
  lerpPoint,
  pointInPolygon,
  polygonArea,
  polygonBounds,
  polygonCentroid,
  TAU,
} from "../../utils/geometry";
import { powerDistance } from "../engine/hitTesting";
import type { LandmassResult } from "./generateLandmass";

/** Pipeline step 4: weighted power-diagram territories with Lloyd relaxation, plus island ownership. */
export function generateTerritories(
  rng: SeededRandom,
  options: WorldGenerationOptions,
  land: LandmassResult,
  territories: Territory[],
  repos: Record<string, ScoredRepository>,
): TerritoryRegion[] {
  const { continent, center, radiusAt, landmasses } = land;
  const n = territories.length;
  if (n === 0) return [];

  const rawWeight = territories.map((t) => {
    const rs = Object.values(repos).filter((r) => r.category === t.id);
    return rs.reduce((s, r) => s + r.importance, 0) + 0.3 * rs.length + 0.2;
  });
  const maxW = Math.max(...rawWeight);
  const scaleR = Math.min(options.width, options.height) * 0.11;
  const weights = rawWeight.map((w) => (scaleR * (w / maxW)) ** 2);

  // Initial sites around the continent; coast-preferring territories sit further out.
  const order = rng.shuffle(territories.map((_, i) => i));
  const offset = rng.range(0, TAU);
  const sites: WorldPoint[] = new Array(n);
  order.forEach((ti, k) => {
    const a = offset + (k / n) * TAU + rng.range(-0.2, 0.2);
    const f = territories[ti].terrainProfile.preferCoast ? 0.62 : 0.4;
    const r = radiusAt(a) * f;
    sites[ti] = { x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r };
  });

  // Continent sample grid for relaxation, area and label anchors.
  const step = 36;
  const samples: WorldPoint[] = [];
  const b = continent.bounds;
  for (let y = b.minY + step / 2; y < b.maxY; y += step) {
    for (let x = b.minX + step / 2; x < b.maxX; x += step) {
      const p = { x, y };
      if (pointInPolygon(p, continent.polygon)) samples.push(p);
    }
  }
  const owner = (p: WorldPoint) => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      const d = powerDistance(p, { site: sites[i], weight: weights[i] });
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };
  for (let iter = 0; iter < 3; iter++) {
    const sum = sites.map(() => ({ x: 0, y: 0, c: 0 }));
    for (const p of samples) {
      const o = owner(p);
      sum[o].x += p.x;
      sum[o].y += p.y;
      sum[o].c++;
    }
    for (let i = 0; i < n; i++) {
      if (sum[i].c > 0) sites[i] = lerpPoint(sites[i], { x: sum[i].x / sum[i].c, y: sum[i].y / sum[i].c }, 0.6);
    }
  }

  // Convex power cells by half-plane clipping of the world rectangle.
  const cells = sites.map((si, i) => {
    let cell = [
      { x: 0, y: 0 },
      { x: options.width, y: 0 },
      { x: options.width, y: options.height },
      { x: 0, y: options.height },
    ];
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const sj = sites[j];
      const nrm = { x: 2 * (sj.x - si.x), y: 2 * (sj.y - si.y) };
      const c = sj.x * sj.x + sj.y * sj.y - (si.x * si.x + si.y * si.y) - weights[j] + weights[i];
      cell = clipPolygonHalfPlane(cell, nrm, c);
    }
    return cell;
  });

  // Islands go to the nearest coast-preferring territory, favouring fragmented coasts.
  const islandOwners: string[][] = territories.map(() => []);
  for (const island of landmasses.filter((l) => l.kind === "island")) {
    const c = polygonCentroid(island.polygon);
    let best = 0;
    let bestScore = Infinity;
    territories.forEach((t, i) => {
      const p = t.terrainProfile;
      const score = dist(c, sites[i]) / (0.35 + p.coastFragmentation + (p.preferCoast ? 0.4 : 0));
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    });
    islandOwners[best].push(island.id);
  }

  return territories.map((t, i) => {
    const own = samples.filter((p) => owner(p) === i);
    const islands = landmasses.filter((l) => islandOwners[i].includes(l.id));
    const centroid = own.length
      ? { x: own.reduce((s, p) => s + p.x, 0) / own.length, y: own.reduce((s, p) => s + p.y, 0) / own.length }
      : islands[0]
        ? polygonCentroid(islands[0].polygon)
        : sites[i];
    // Label anchor: interior point maximising clearance from coast and cell edges, biased to the centroid.
    let labelAnchor = centroid;
    let bestScore = -Infinity;
    for (const p of own) {
      const clearance = Math.min(distToPolyline(p, continent.polygon, true), distToPolyline(p, cells[i], true));
      const score = clearance - dist(p, centroid) * 0.35;
      if (score > bestScore) {
        bestScore = score;
        labelAnchor = p;
      }
    }
    const area = own.length * step * step + islands.reduce((s, l) => s + polygonArea(l.polygon), 0);
    return {
      territoryId: t.id,
      site: sites[i],
      weight: weights[i],
      cell: cells[i],
      islandIds: islandOwners[i],
      polygons: [cells[i], ...islands.map((l) => l.polygon)],
      bounds: polygonBounds(own.length ? own : cells[i]),
      centroid,
      labelAnchor,
      area,
    };
  });
}

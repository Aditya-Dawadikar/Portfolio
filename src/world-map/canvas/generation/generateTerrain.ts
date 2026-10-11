import type {
  ForestCluster,
  NumOrRange,
  Landmass,
  Lake,
  MountainRange,
  River,
  SeededRandom,
  Territory,
  TerrainLayer,
  TerritoryKind,
  TerritoryRegion,
  WorldGenerationOptions,
  WorldPoint,
} from "../../types";
import {
  clamp01,
  dist,
  distToPolyline,
  nearestPointOnPolyline,
  noisyBlob,
  pointInPolygon,
  polygonBounds,
  polygonCentroid,
  segmentIntersection,
  TAU,
} from "../../utils/geometry";
import { createNoise2D, fbm } from "../../utils/noise";
import { sampleInt, sampleRange } from "../../utils/range";
import { territoryAt } from "../engine/hitTesting";
import type { LandmassResult } from "./generateLandmass";
import { territoryIslandId } from "./generateArchipelago";

export interface TerrainContext {
  options: WorldGenerationOptions;
  land: LandmassResult;
  regions: TerritoryRegion[];
  territories: Record<TerritoryKind, Territory>;
  /** The territories' home land: the continent, or one island per territory in archipelago mode. */
  mainland: Landmass[];
}

/** A territory's home landmass (its own island in archipelago mode, else the continent). */
export const mainlandOf = (ctx: TerrainContext, id: TerritoryKind): Landmass =>
  ctx.mainland.find((l) => l.id === territoryIslandId(id)) ?? ctx.mainland[0];

/** Distance to the nearest mainland coast. */
function mainlandCoastDist(ctx: TerrainContext, p: WorldPoint): number {
  let best = Infinity;
  for (const l of ctx.mainland) {
    const b = l.bounds;
    const dx = Math.max(b.minX - p.x, 0, p.x - b.maxX);
    const dy = Math.max(b.minY - p.y, 0, p.y - b.maxY);
    if (Math.hypot(dx, dy) > best) continue;
    best = Math.min(best, distToPolyline(p, l.polygon, true));
  }
  return best;
}

/** Random continent point inside a territory satisfying a predicate. */
function sampleInTerritory(
  rng: SeededRandom,
  ctx: TerrainContext,
  id: TerritoryKind,
  accept: (p: WorldPoint) => boolean,
  tries = 200,
): WorldPoint | null {
  const region = ctx.regions.find((r) => r.territoryId === id);
  if (!region) return null;
  const b = region.bounds;
  for (let i = 0; i < tries; i++) {
    const p = { x: rng.range(b.minX, b.maxX), y: rng.range(b.minY, b.maxY) };
    if (!pointInPolygon(p, mainlandOf(ctx, id).polygon)) continue;
    if (territoryAt(ctx.regions, ctx.land.landmasses, p) !== id) continue;
    if (accept(p)) return p;
  }
  return null;
}

/** Pipeline steps 5–6: elevation grid, mountain ridges, hills, forests, rivers and lakes. */
export function generateTerrain(rng: SeededRandom, ctx: TerrainContext): TerrainLayer {
  const { options, land, regions, territories } = ctx;
  const coastDist = (p: WorldPoint) => mainlandCoastDist(ctx, p);
  const noise = createNoise2D(rng.int(0, 2 ** 31));
  const density = Math.max(0.3, options.density ?? 1);
  const lakeSizeOpt = options.lakes?.size ?? 1;
  const lakeSize = (r: SeededRandom) => Math.max(0.2, sampleRange(r, lakeSizeOpt));
  // Per-territory multipliers, so islands differ from one another.
  const perTerritory = (label: string, v: NumOrRange | undefined) =>
    Object.fromEntries(regions.map((rg) => [rg.territoryId, Math.max(0, sampleRange(rng.fork(`${label}:${rg.territoryId}`), v ?? 1))])) as Record<TerritoryKind, number>;
  const vegetationBy = perTerritory("vegetation", options.vegetation);
  const mountainsBy = perTerritory("mountains", options.mountains);
  const hillsBy = perTerritory("hills", options.hills);

  // Elevation grid.
  const cellSize = 40;
  const cols = Math.ceil(options.width / cellSize);
  const rows = Math.ceil(options.height / cellSize);
  const values = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = { x: (c + 0.5) * cellSize, y: (r + 0.5) * cellSize };
      const t = territoryAt(regions, land.landmasses, p);
      if (!t) continue;
      const bias = territories[t]?.terrainProfile.elevationBias ?? 0;
      const e = 0.5 + 0.5 * fbm(noise, p.x * 0.0025, p.y * 0.0025, 4) + bias * 0.35;
      values[r * cols + c] = clamp01(e) * clamp01(coastDist(p) / 140);
    }
  }
  const elevationAt = (p: WorldPoint) => {
    const c = Math.min(cols - 1, Math.max(0, Math.floor(p.x / cellSize)));
    const r = Math.min(rows - 1, Math.max(0, Math.floor(p.y / cellSize)));
    return values[r * cols + c];
  };

  // Mountain ridges.
  const mountains: MountainRange[] = [];
  for (const region of regions) {
    const prof = territories[region.territoryId].terrainProfile;
    const mountainMul = mountainsBy[region.territoryId];
    if (prof.mountainDensity * mountainMul < 0.15) continue;
    const mrng = rng.fork(`mountains:${region.territoryId}`);
    const ridgeCount = Math.round(((prof.mountainDensity >= 0.5 ? 2 : 1) + (density >= 1.5 ? 1 : 0)) * mountainMul);
    for (let k = 0; k < ridgeCount; k++) {
      let start: WorldPoint | null = null;
      let bestE = -1;
      for (let t = 0; t < 30; t++) {
        const p = sampleInTerritory(mrng, ctx, region.territoryId, (q) => coastDist(q) > 90 && dist(q, region.labelAnchor) > 110, 40);
        if (p && elevationAt(p) > bestE && mountains.every((m) => distToPolyline(p, m.ridge) > 120)) {
          bestE = elevationAt(p);
          start = p;
        }
      }
      if (!start) continue;
      const ridge: WorldPoint[] = [start];
      let angle = mrng.range(0, TAU);
      const steps = prof.mountainDensity >= 0.5 ? mrng.int(6, 9) : mrng.int(3, 5);
      let cur = start;
      for (let s = 0; s < steps; s++) {
        let placed = false;
        for (let turn = 0; turn < 6 && !placed; turn++) {
          const a = angle + mrng.range(-0.45, 0.45) + (turn === 0 ? 0 : (turn % 2 ? 1 : -1) * Math.ceil(turn / 2) * 0.7);
          const next = { x: cur.x + Math.cos(a) * 46, y: cur.y + Math.sin(a) * 46 };
          if (
            territoryAt(regions, land.landmasses, next) === region.territoryId &&
            coastDist(next) > 60 &&
            dist(next, region.labelAnchor) > 90
          ) {
            ridge.push(next);
            cur = next;
            angle = a;
            placed = true;
          }
        }
        if (!placed) break;
      }
      if (ridge.length < 3) continue;
      const passes = ridge.length >= 5 ? [ridge[Math.floor(ridge.length / 2)]] : [];
      const rug = 0.8 + prof.ruggedness * 0.5;
      mountains.push({
        id: `ridge-${region.territoryId}-${k}`,
        ridge,
        density: 0.75 + prof.mountainDensity * 0.4,
        scaleRange: [0.75 * rug, 1.3 * rug],
        snowcaps: prof.elevationBias > 0.4,
        passes,
      });
    }
  }
  const ridgeDist = (p: WorldPoint) => mountains.reduce((m, r) => Math.min(m, distToPolyline(p, r.ridge)), Infinity);

  // Hills grow in clusters: free-standing groups plus foothills along each mountain range.
  const hills: WorldPoint[] = [];
  for (const region of regions) {
    const prof = territories[region.territoryId].terrainProfile;
    const hrng = rng.fork(`hills:${region.territoryId}`);
    const home = mainlandOf(ctx, region.territoryId).polygon;
    const hillMul = hillsBy[region.territoryId];
    const count = Math.round(prof.ruggedness * 16 * density * hillMul);
    const grow = (center: WorldPoint, size: number, spread: number) => {
      for (let k = 0, placedHere = 0; k < size * 5 && placedHere < size; k++) {
        const a = hrng.range(0, TAU);
        const r = Math.sqrt(hrng.next()) * spread;
        const p = { x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r };
        if (!pointInPolygon(p, home) || coastDist(p) < 28 || ridgeDist(p) < 34 || hills.some((h) => dist(h, p) < 15)) continue;
        hills.push(p);
        placedHere++;
      }
    };
    // Foothills hug the flanks of this territory's ranges.
    if (hillMul > 0) {
      for (const m of mountains.filter((mm) => mm.id.includes(region.territoryId))) {
        for (let f = 0; f < Math.max(1, Math.round(m.ridge.length / 3)); f++) {
          const i = hrng.int(0, m.ridge.length - 1);
          const a = m.ridge[Math.max(0, i - 1)];
          const b = m.ridge[Math.min(m.ridge.length - 1, i + 1)];
          const len = dist(a, b) || 1;
          const side = hrng.chance(0.5) ? 1 : -1;
          const off = hrng.range(55, 75);
          grow({ x: m.ridge[i].x - ((b.y - a.y) / len) * off * side, y: m.ridge[i].y + ((b.x - a.x) / len) * off * side }, hrng.int(3, 5), 38);
        }
      }
    }
    // Free-standing hill clusters.
    const clusters = Math.max(count > 0 ? 1 : 0, Math.round(count / 5));
    for (let c = 0; c < clusters; c++) {
      const center = sampleInTerritory(hrng, ctx, region.territoryId, (q) => coastDist(q) > 60 && ridgeDist(q) > 70 && hills.every((h) => dist(h, q) > 90), 40);
      if (center) grow(center, hrng.int(4, 7), 50);
    }
  }

  // Rivers: descend from ridges/high ground to the nearest coast; joining an earlier river ends it.
  const rivers: River[] = [];
  const lakes: Lake[] = [];
  for (const region of regions) {
    const prof = territories[region.territoryId].terrainProfile;
    const rrng = rng.fork(`rivers:${region.territoryId}`);
    const ownRidges = mountains.filter((m) => m.id.includes(region.territoryId));
    for (let k = 0; k < prof.riverCount + (density >= 1.5 ? 1 : 0) && rivers.length < Math.round(10 * Math.sqrt(density)); k++) {
      let source: WorldPoint | null = null;
      let fromLake = false;
      if (ownRidges.length) {
        const ridge = rrng.pick(ownRidges).ridge;
        const base = ridge[rrng.int(0, ridge.length - 1)];
        source = { x: base.x + rrng.range(-14, 14), y: base.y + 16 };
      } else {
        source = sampleInTerritory(rrng, ctx, region.territoryId, (q) => coastDist(q) > 150 && dist(q, region.labelAnchor) > 80, 80);
        fromLake = rrng.chance(0.5);
      }
      if (!source) continue;
      const mouth = nearestPointOnPolyline(source, mainlandOf(ctx, region.territoryId).polygon, true);
      const len = dist(source, mouth);
      if (len < 90) continue;
      const out = { x: mouth.x - source.x, y: mouth.y - source.y };
      const ol = Math.hypot(out.x, out.y);
      const end = { x: mouth.x + (out.x / ol) * 26, y: mouth.y + (out.y / ol) * 26 };
      const steps = Math.max(5, Math.round(len / 45));
      const nx = -out.y / ol;
      const ny = out.x / ol;
      const phase = rrng.range(0, 100);
      let path: WorldPoint[] = [];
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const m = fbm(noise, phase + t * 2.4, phase, 3) * len * 0.22 * Math.sin(Math.PI * t);
        path.push({ x: source.x + out.x * t + nx * m, y: source.y + out.y * t + ny * m });
      }
      path.push(end);
      // Stop at the first crossing with an existing river (becomes a tributary visually).
      for (let s = 1; s < path.length; s++) {
        let hit: WorldPoint | null = null;
        for (const other of rivers) {
          for (let o = 1; o < other.path.length && !hit; o++) {
            hit = segmentIntersection(path[s - 1], path[s], other.path[o - 1], other.path[o]);
          }
          if (hit) break;
        }
        if (hit) {
          path = [...path.slice(0, s), hit];
          break;
        }
      }
      if (path.length < 3) continue;
      const joined = dist(path[path.length - 1], end) > 1;
      rivers.push({
        id: `river-${region.territoryId}-${k}`,
        path,
        widthAtSource: 1.4,
        widthAtMouth: joined ? 3.2 : Math.min(9, 4 + len / 160),
        tributaries: [],
      });
      if (fromLake) {
        lakes.push({ id: `lake-${region.territoryId}-${k}`, polygon: noisyBlob(source, rrng.range(16, 28) * lakeSize(rrng), 14, 0.3, rrng.next) });
      }
    }
  }
  const riverDist = (p: WorldPoint) => rivers.reduce((m, r) => Math.min(m, distToPolyline(p, r.path)), Infinity);

  // Standalone lakes, kept clear of coasts, ridges, rivers and each other.
  const lakeCenters = lakes.map((l) => {
    const b = polygonBounds(l.polygon);
    return { c: polygonCentroid(l.polygon), r: Math.max(b.maxX - b.minX, b.maxY - b.minY) / 2 };
  });
  for (const region of regions) {
    const lrng = rng.fork(`lakes:${region.territoryId}`);
    const lakeCount = sampleInt(lrng, options.lakes?.count ?? 0);
    for (let k = 0; k < lakeCount; k++) {
      const r = lrng.range(16, 34) * lakeSize(lrng);
      const c = sampleInTerritory(
        lrng,
        ctx,
        region.territoryId,
        (q) =>
          coastDist(q) > r * 1.6 + 30 &&
          ridgeDist(q) > r + 35 &&
          riverDist(q) > r + 12 &&
          dist(q, region.labelAnchor) > r + 60 &&
          lakeCenters.every((o) => dist(o.c, q) > o.r + r + 30),
        60,
      );
      if (!c) continue;
      lakes.push({ id: `pond-${region.territoryId}-${k}`, polygon: noisyBlob(c, r, 16, 0.38, lrng.next) });
      lakeCenters.push({ c, r });
    }
  }
  const nearLake = (q: WorldPoint, pad: number) => lakeCenters.some((o) => dist(o.c, q) < o.r * 1.3 + pad);

  // Forest clusters.
  const forests: ForestCluster[] = [];
  for (const region of regions) {
    const prof = territories[region.territoryId].terrainProfile;
    const frng = rng.fork(`forests:${region.territoryId}`);
    const vegetation = vegetationBy[region.territoryId];
    const count = Math.round((prof.forestDensity * 7 + 1) * density * vegetation);
    for (let i = 0; i < count; i++) {
      const home = mainlandOf(ctx, region.territoryId).polygon;
      const c = sampleInTerritory(
        frng,
        ctx,
        region.territoryId,
        (q) => coastDist(q) > 70 && ridgeDist(q) > 70 && dist(q, region.labelAnchor) > 90 && riverDist(q) > 20 && !nearLake(q, 40),
        40,
      );
      if (!c) continue;
      let radius = frng.range(40, 90);
      let poly = noisyBlob(c, radius, 16, 0.35, frng.next);
      for (let shrink = 0; shrink < 4; shrink++) {
        const ok = poly.every((v) => pointInPolygon(v, home) && ridgeDist(v) > 30);
        if (ok) break;
        radius *= 0.7;
        poly = noisyBlob(c, radius, 16, 0.35, frng.next);
      }
      if (!poly.every((v) => pointInPolygon(v, home))) continue;
      forests.push({ id: `forest-${region.territoryId}-${i}`, polygon: poly, density: Math.min(1, (0.4 + prof.forestDensity * 0.6) * Math.sqrt(Math.max(0.25, vegetation))), treeType: prof.treeType });
    }
  }

  return { elevation: { cols, rows, cellSize, values }, mountains, hills, forests, rivers, lakes, beaches: [] };
}

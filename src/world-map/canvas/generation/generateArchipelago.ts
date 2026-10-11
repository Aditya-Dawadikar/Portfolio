import type { Landmass, SeededRandom, TerritoryRegion, WorldBounds, WorldPoint } from "../../types";
import { chaikin, dist, pointInPolygon, polygonArea, polygonBounds, polygonCentroid, TAU } from "../../utils/geometry";
import { createNoise2D, fbm } from "../../utils/noise";
import type { LandmassResult } from "./generateLandmass";

export const territoryIslandId = (territoryId: string) => `territory-${territoryId}`;

/** How far the world may grow (per side, as a multiple of the requested size) to fit the islands. */
const MAX_WORLD_GROWTH = 3;

/** Island outline around the origin at radius 1; placement scales and translates it. */
function unitIslandShape(shapeRng: SeededRandom, roughness: number): WorldPoint[] {
  const noise = createNoise2D(shapeRng.int(0, 2 ** 31));
  const ox = shapeRng.range(0, 100);
  const oy = shapeRng.range(0, 100);
  const aspect = shapeRng.range(0.75, 1.35);
  const rotation = shapeRng.range(0, TAU);
  const noiseAmount = Math.min(0.6, Math.max(0, roughness / 350));
  const points: WorldPoint[] = [];
  const vertexCount = 96;
  for (let i = 0; i < vertexCount; i++) {
    const angle = (i / vertexCount) * TAU;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const broad = fbm(noise, x * 1.4 + ox, y * 1.4 + oy, 3);
    const medium = fbm(noise, x * 4.5 + ox + 31, y * 4.5 + oy + 31, 3);
    const fine = fbm(noise, x * 9 + ox + 67, y * 9 + oy + 67, 2);
    const radial = 1 + noiseAmount * (broad * 0.45 + medium * 0.3 + fine * 0.12);
    const lx = x * radial * aspect;
    const ly = (y * radial) / aspect;
    points.push({ x: lx * Math.cos(rotation) - ly * Math.sin(rotation), y: lx * Math.sin(rotation) + ly * Math.cos(rotation) });
  }
  return chaikin(points, 1, true);
}

/**
 * Generates a separate, independently shaped island for every territory.
 * With `radius`, an average territory's island has that radius (world units) and larger
 * territories scale up by sqrt(area); without it, territory areas set the size directly.
 * Islands are spaced by their real outlines. If they don't fit, the world grows around
 * them (centred); only once the growth limit is reached are they shrunk.
 */
export function generateArchipelago(
  rng: SeededRandom,
  land: LandmassResult,
  regions: TerritoryRegion[],
  { gap, spread, roughness = 42, size = 1, radius: baseRadius }: { gap: number; spread: number; roughness?: number; size?: number; radius?: number },
  bounds: WorldBounds,
): { land: LandmassResult; regions: TerritoryRegion[]; mainland: Landmass[]; bounds: WorldBounds } {
  const dimensions = Math.min(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  const meanArea = regions.reduce((s, r) => s + Math.max(r.area, 1), 0) / Math.max(1, regions.length);
  const specs = regions.map((region) => {
    const sizeRng = rng.fork(`size:${region.territoryId}`);
    let radius: number;
    if (baseRadius != null) {
      const relative = Math.min(1.45, Math.max(0.7, Math.sqrt(Math.max(region.area, 1) / meanArea)));
      radius = baseRadius * relative * sizeRng.range(0.92, 1.08) * size;
    } else {
      const areaRadius = Math.max(
        dimensions * 0.045,
        Math.sqrt(Math.max(region.area, 1) / Math.PI) * sizeRng.range(0.7, 0.82) - gap * 0.12,
      );
      radius = Math.min(dimensions * 0.15, areaRadius * size);
    }
    const shape = unitIslandShape(rng.fork(`shape:${region.territoryId}`), roughness);
    // Farthest coast point from the centre, as a multiple of radius.
    const reach = shape.reduce((m, p) => Math.max(m, Math.hypot(p.x, p.y)), 0);
    return { region, radius, shape, reach };
  });
  const placementOrder = specs.slice().sort((a, b) => b.radius - a.radius || a.region.territoryId.localeCompare(b.region.territoryId));
  type Placed = (typeof specs)[number] & { center: WorldPoint; scale: number };

  const tryPlace = (area: WorldBounds, scale: number, key: string): Placed[] | null => {
    const attemptRng = rng.fork(`placement:${key}`);
    const attempt: Placed[] = [];
    for (const spec of placementOrder) {
      const extent = spec.radius * scale * spec.reach;
      const edge = extent + 40;
      if (area.maxX - area.minX <= edge * 2 || area.maxY - area.minY <= edge * 2) return null;
      let center: WorldPoint | null = null;
      for (let i = 0; i < 2500; i++) {
        const candidate = {
          x: attemptRng.range(area.minX + edge, area.maxX - edge),
          y: attemptRng.range(area.minY + edge, area.maxY - edge),
        };
        const clear = attempt.every(
          (other) => dist(candidate, other.center) >= extent + other.radius * other.scale * other.reach + gap + spread * 0.2,
        );
        if (clear) {
          center = candidate;
          break;
        }
      }
      if (!center) return null;
      attempt.push({ ...spec, center, scale });
    }
    return attempt;
  };

  // Grow the world in 10% steps (keeping its aspect) before giving up any island size.
  const w0 = bounds.maxX - bounds.minX;
  const h0 = bounds.maxY - bounds.minY;
  let outBounds = bounds;
  let placed: Placed[] | null = null;
  for (let step = 0; step <= (MAX_WORLD_GROWTH - 1) * 10 && !placed; step++) {
    const grow = 1 + step / 10;
    outBounds = { minX: 0, minY: 0, maxX: Math.round(w0 * grow), maxY: Math.round(h0 * grow) };
    placed = tryPlace(outBounds, 1, step === 0 ? "10" : `grow:${step}`);
  }
  for (let s = 9; s >= 3 && !placed; s--) placed = tryPlace(outBounds, s / 10, `${s}`);
  if (!placed) {
    throw new Error(`Unable to place ${regions.length} territory islands within the world bounds.`);
  }

  // Satellite islands were generated for the original bounds; keep them centred in the grown world.
  const dx = (outBounds.maxX - w0) / 2;
  const dy = (outBounds.maxY - h0) / 2;
  const shifted = (l: Landmass): Landmass => {
    if (dx === 0 && dy === 0) return l;
    const polygon = l.polygon.map((p) => ({ x: p.x + dx, y: p.y + dy }));
    return { ...l, polygon, bounds: polygonBounds(polygon) };
  };
  land = { ...land, landmasses: land.landmasses.map(shifted) };

  const generated = placed.map(({ region, radius, scale, shape, center }) => {
    const r = radius * scale;
    const polygon = shape.map((p) => ({ x: center.x + p.x * r, y: center.y + p.y * r }));
    return {
      region,
      center,
      island: {
        id: territoryIslandId(region.territoryId),
        kind: "island" as const,
        polygon,
        bounds: polygonBounds(polygon),
      },
    };
  });
  const mainland = generated.map(({ island }) => island);

  const satellites = land.landmasses.filter(
    (island) =>
      island.kind === "island" &&
      !mainland.some((home) => {
        const center = polygonCentroid(island.polygon);
        const homeCenter = polygonCentroid(home.polygon);
        const radius = Math.max(island.bounds.maxX - island.bounds.minX, island.bounds.maxY - island.bounds.minY) / 2;
        const homeRadius = Math.max(home.bounds.maxX - home.bounds.minX, home.bounds.maxY - home.bounds.minY) / 2;
        return pointInPolygon(center, home.polygon) || dist(center, homeCenter) < radius + homeRadius + gap;
      }),
  );
  const retainedSatelliteIds = new Set(satellites.map((island) => island.id));
  const outRegions = generated.map(({ region, island, center }) => {
    const satelliteIds = region.islandIds.filter((id) => retainedSatelliteIds.has(id));
    const area = polygonArea(island.polygon);
    return {
      ...region,
      site: center,
      cell: island.polygon,
      islandIds: [island.id, ...satelliteIds],
      polygons: [island.polygon, ...satellites.filter((satellite) => satelliteIds.includes(satellite.id)).map((satellite) => satellite.polygon)],
      bounds: island.bounds,
      centroid: center,
      labelAnchor: center,
      area,
    };
  });

  return {
    land: { ...land, landmasses: [...mainland, ...satellites] },
    regions: outRegions,
    mainland,
    bounds: outBounds,
  };
}

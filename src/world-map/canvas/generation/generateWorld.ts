import type { GeneratedWorld, HitRegion, Territory, TerritoryKind, WorldGenerationOptions, WorldMapData } from "../../types";
import { polygonBounds } from "../../utils/geometry";
import { createRandom } from "../engine/seededRandom";
import { generateBeaches, generateCoastalIslets, generateShips } from "./generateCoast";
import { generateConnections } from "./generateConnections";
import { generateLandmass } from "./generateLandmass";
import { generateSettlements } from "./generateSettlements";
import { generateTerrain } from "./generateTerrain";
import { generateTerritories } from "./generateTerritories";
import { scoreRepositories } from "./scoreRepository";
import { generateArchipelago } from "./generateArchipelago";
import { rangeMax } from "../../utils/range";

const DEFAULT_WORLD_OPTIONS: WorldGenerationOptions = {
  width: 3200,
  height: 2400,
  islandCount: 7,
  coastRoughness: 0.55,
  detail: "high",
  maxSeaRoutes: 4,
  density: 1,
};

const TIER_PRIORITY = { landmark: 3, major: 2, minor: 1 } as const;

/** Pure, deterministic: same data + seed → identical world. */
export function generateWorld(data: WorldMapData): GeneratedWorld {
  let options: WorldGenerationOptions = { ...DEFAULT_WORLD_OPTIONS, ...data.options };
  const rng = createRandom(`${data.seed.value}:${data.seed.version}`);
  const territories = Object.fromEntries(data.territories.map((t) => [t.id, t])) as Record<TerritoryKind, Territory>;
  const repositories = scoreRepositories(data.repositories, data.territories);

  let land = generateLandmass(rng.fork("land"), options);
  let regions = generateTerritories(rng.fork("territories"), options, land, data.territories, repositories);
  let mainland = [land.continent];
  if (options.archipelago) {
    const bounds = { minX: 0, minY: 0, maxX: options.width, maxY: options.height };
    const result = generateArchipelago(rng.fork("archipelago"), land, regions, options.archipelago, bounds);
    ({ land, regions, mainland } = result);
    // Large islands grow the world rather than shrinking to fit; later steps use the grown size.
    options = { ...options, width: result.bounds.maxX, height: result.bounds.maxY };
  }
  if (options.coastalIslets && rangeMax(options.coastalIslets.clusters) > 0 && rangeMax(options.coastalIslets.perCluster) > 0) {
    const bounds = { minX: 0, minY: 0, maxX: options.width, maxY: options.height };
    const islets = generateCoastalIslets(rng.fork("islets"), mainland, land.landmasses, options.coastalIslets, bounds);
    land = { ...land, landmasses: [...land.landmasses, ...islets] };
  }
  const ctx = { options, land, regions, territories, mainland };
  const terrain = generateTerrain(rng.fork("terrain"), ctx);
  if (options.beaches && options.beaches.amount > 0) terrain.beaches = generateBeaches(rng.fork("beaches"), land.landmasses, options.beaches);
  const { settlements, decorations } = generateSettlements(rng.fork("settlements"), ctx, terrain, repositories);
  if (options.ships) {
    const bounds = { minX: 0, minY: 0, maxX: options.width, maxY: options.height };
    decorations.ships = generateShips(rng.fork("ships"), land.landmasses, mainland, options.ships, bounds);
  }
  const { roads, seaRoutes } = generateConnections(rng.fork("connections"), land, terrain, settlements, repositories, options.maxSeaRoutes, mainland);

  const hitRegions: HitRegion[] = [
    ...settlements.map((s) => ({ kind: "settlement" as const, id: s.repositoryId, center: s.position, radius: s.hitRadius, priority: TIER_PRIORITY[s.tier] })),
    ...regions.map((r) => ({ kind: "territory" as const, id: r.territoryId, polygons: r.polygons, bounds: polygonBounds(r.polygons.flat()) })),
  ];

  return {
    seed: data.seed,
    options,
    bounds: { minX: 0, minY: 0, maxX: options.width, maxY: options.height },
    repositories,
    territories,
    landmasses: land.landmasses,
    regions,
    terrain,
    settlements,
    roads,
    seaRoutes,
    decorations,
    hitRegions,
  };
}

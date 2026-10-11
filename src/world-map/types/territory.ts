import type { LandmarkKind, SettlementKind, WorldBounds, WorldPoint, WorldPolygon } from "./map";
import type { TerritoryKind } from "./repository";

export type TreeType = "cypress" | "olive" | "pine";

export type TerrainFeature =
  | "waterways"
  | "plains"
  | "walls"
  | "mountains"
  | "forest"
  | "hills"
  | "cliffs"
  | "islands"
  | "coast"
  | "marsh";

/** Generation knobs for a territory. All values 0–1 unless noted. */
export interface TerrainProfile {
  features: TerrainFeature[];
  /** Raises or lowers the territory's base elevation (-1–1). */
  elevationBias: number;
  ruggedness: number;
  mountainDensity: number;
  forestDensity: number;
  treeType: TreeType;
  /** Number of river sources to seed (integer). */
  riverCount: number;
  /** How broken-up the coast is; high values spawn islets. */
  coastFragmentation: number;
  /** Bias Voronoi seeding towards the coast (ports, research cliffs). */
  preferCoast: boolean;
}

/** Authored territory definition (input data). */
export interface Territory {
  id: TerritoryKind;
  name: string;
  summary: string;
  /** CSS colour; used for borders/labels only, never as a fill. Should be a bronze/ivory variant. */
  colorAccent: string;
  /** Allowed settlement kinds for minor settlements, in preference order. */
  landmarkStyle: SettlementKind[];
  /** The one major landmark this territory builds around. */
  signatureLandmark: LandmarkKind;
  terrainProfile: TerrainProfile;
  repositoryIds: string[];
}

/** Generated geometry for a territory (output of generateTerritories). */
export interface TerritoryRegion {
  territoryId: TerritoryKind;
  /** Power-diagram site and weight; continent membership is the argmin of |p - site|² - weight. */
  site: WorldPoint;
  weight: number;
  /** Unclipped convex power cell. Clip against land when drawing. */
  cell: WorldPolygon;
  /** Satellite islands owned by this territory. */
  islandIds: string[];
  /** Cell plus owned island polygons (debug drawing). */
  polygons: WorldPolygon[];
  bounds: WorldBounds;
  centroid: WorldPoint;
  /** Best label position (pole of inaccessibility), not necessarily the centroid. */
  labelAnchor: WorldPoint;
  /** World-unit² area, used to weight settlement density. */
  area: number;
}

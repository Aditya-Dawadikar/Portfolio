import type { RepositoryStatus, ScoredRepository, Repository, TerritoryKind } from "./repository";
import type { Territory, TerritoryRegion, TreeType } from "./territory";

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

/** A fixed value, or a range each instance draws from with the seeded RNG. */
export type NumOrRange = number | { min: number; max: number };

export interface WorldPoint {
  x: number;
  y: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export type WorldPolygon = WorldPoint[];
export type WorldPolyline = WorldPoint[];

export interface WorldBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/* ------------------------------------------------------------------ */
/* Seeds & randomness                                                  */
/* ------------------------------------------------------------------ */

export interface WorldMapSeed {
  value: string;
  /** Bump when the generator changes so cached worlds are invalidated. */
  version: number;
}

/** Deterministic PRNG. `fork` derives an independent stream so adding a step never reshuffles others. */
export interface SeededRandom {
  next(): number;
  range(min: number, max: number): number;
  int(min: number, maxInclusive: number): number;
  chance(probability: number): boolean;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
  fork(label: string): SeededRandom;
}

/* ------------------------------------------------------------------ */
/* Settlements & landmarks                                             */
/* ------------------------------------------------------------------ */

export type MinorSettlementKind =
  | "village"
  | "outpost"
  | "workshop"
  | "shrine"
  | "archive"
  | "port"
  | "ruin"
  | "tower";

export type LandmarkKind =
  | "observatory"
  | "citadel"
  | "aqueduct"
  | "academy"
  | "bridge_city"
  | "forum"
  | "arena"
  | "library"
  | "temple";

export type SettlementKind = MinorSettlementKind | LandmarkKind;

export type SettlementTier = "landmark" | "major" | "minor";

export interface Settlement {
  repositoryId: string;
  kind: SettlementKind;
  tier: SettlementTier;
  position: WorldPoint;
  /** Multiplier on the stamp's base size; derived from impactScore. */
  scale: number;
  /** Radians. Small jitter only; buildings stay roughly upright on the page. */
  rotation: number;
  /** 0–1. Zero for maintained/archived. */
  activeGlow: number;
  /** 0–1. Visual wear; 1 for archived. */
  weathering: number;
  status: RepositoryStatus;
  territoryId: TerritoryKind;
  /** World-unit radius for hit-testing. */
  hitRadius: number;
}

/** Per-frame visual state passed to settlement/landmark drawing. */
export interface SettlementVisualState {
  hovered: boolean;
  selected: boolean;
  focused: boolean;
  /** Filtered out: draw at low contrast, still hit-testable. */
  dimmed: boolean;
  /** 0–1 progress of a search/selection pulse, or null. */
  pulse: number | null;
}

/* ------------------------------------------------------------------ */
/* Terrain                                                             */
/* ------------------------------------------------------------------ */

export interface Landmass {
  id: string;
  kind: "continent" | "island";
  polygon: WorldPolygon;
  bounds: WorldBounds;
}

export interface MountainRange {
  id: string;
  ridge: WorldPolyline;
  density: number;
  scaleRange: [min: number, max: number];
  snowcaps: boolean;
  /** Points along the ridge where roads may cross. */
  passes: WorldPoint[];
}

export interface ForestCluster {
  id: string;
  polygon: WorldPolygon;
  density: number;
  treeType: TreeType;
}

export interface River {
  id: string;
  path: WorldPolyline;
  widthAtSource: number;
  widthAtMouth: number;
  tributaries: River[];
}

export interface Lake {
  id: string;
  polygon: WorldPolygon;
}

export type BeachKind = "sandy" | "rocky";

export interface Beach {
  id: string;
  landmassId: string;
  kind: BeachKind;
  /** Coast points the beach follows. */
  path: WorldPolyline;
  /** Unit vectors pointing inland, one per path point. */
  inland: WorldPoint[];
  /** Band width (sandy) or boulder scatter depth (rocky), in world units. */
  width: number;
}

export interface TerrainLayer {
  /** Coarse elevation grid (row-major), sampled for road costs. */
  elevation: { cols: number; rows: number; cellSize: number; values: Float32Array };
  mountains: MountainRange[];
  hills: WorldPoint[];
  forests: ForestCluster[];
  rivers: River[];
  lakes: Lake[];
  beaches: Beach[];
}

/* ------------------------------------------------------------------ */
/* Connections                                                         */
/* ------------------------------------------------------------------ */

export type BridgeVariant = "stone" | "aqueduct" | "long_arch";

export interface Bridge {
  position: WorldPoint;
  /** Radians, aligned with the road. */
  angle: number;
  span: number;
  variant: BridgeVariant;
}

export interface Road {
  id: string;
  fromId: string;
  toId: string;
  path: WorldPolyline;
  rank: "major" | "minor";
  bridges: Bridge[];
}

export type SeaRouteReason = "open_source" | "shared_tech" | "remote";

export interface SeaRoute {
  id: string;
  fromId: string;
  toId: string;
  path: WorldPolyline;
  reason: SeaRouteReason;
}

/* ------------------------------------------------------------------ */
/* Decorations                                                         */
/* ------------------------------------------------------------------ */

export type StatueVariant = "architect" | "scroll" | "compass" | "atlas";

export type ShipKind = "galley" | "sailboat" | "rowboat";

export interface Ship {
  id: string;
  kind: ShipKind;
  position: WorldPoint;
  /** Radians; the bow points along this angle. */
  heading: number;
  scale: number;
}

export interface Decorations {
  /** At most one in V1. Doubles as the navigation reset point. */
  statue: { position: WorldPoint; variant: StatueVariant } | null;
  compassRose: { position: WorldPoint; scale: number };
  ruinsScatter: WorldPoint[];
  ships: Ship[];
}

/* ------------------------------------------------------------------ */
/* Hit testing                                                         */
/* ------------------------------------------------------------------ */

export type HitRegion =
  | { kind: "settlement"; id: string; center: WorldPoint; radius: number; priority: number }
  | { kind: "territory"; id: TerritoryKind; polygons: WorldPolygon[]; bounds: WorldBounds };

/* ------------------------------------------------------------------ */
/* World input / output                                                */
/* ------------------------------------------------------------------ */

export type DetailLevel = "low" | "medium" | "high";

export interface WorldGenerationOptions {
  /** World size in world units. */
  width: number;
  height: number;
  /** Outlying islands (count). */
  islandCount: NumOrRange;
  /** 0–1 */
  coastRoughness: number;
  detail: DetailLevel;
  /** Cap on cross-territory sea routes. */
  maxSeaRoutes: number;
  /** Visual density multiplier (1 = default). Scales forests, hills, ridges, ruins and tightens settlement spacing. */
  density: number;
  /**
   * Generate an independently shaped island per territory. `radius` is an average territory's
   * island radius in world units (bigger territories get bigger islands); without it, size comes
   * from territory area. `size` multiplies either. The world grows to fit the islands.
   */
  archipelago?: { gap: number; spread: number; roughness?: number; size?: number; radius?: number };
  /** Multiplier on every settlement and landmark size (1 = default). */
  structureScale?: number;
  /** How strongly importance drives size: 1 = full hierarchy, 0 = every structure the same size. */
  sizeContrast?: number;
  /** Beaches along every coast. amount: share of coastline (0–1); rocky: share that is rocky (0–1). */
  beaches?: { amount: number; rocky: number; width: NumOrRange };
  /** Clusters of small islands just off each territory's coast. */
  /** Standalone lakes per territory, and each lake's size multiplier. */
  lakes?: { count: NumOrRange; size: NumOrRange };
  /** Per mainland: clusters; per cluster: islets, distance, spread; per islet: radius. */
  /** Decorative shipping: open-sea ships (total), boats off each territory coast, and size multiplier. */
  ships?: { ocean: NumOrRange; coastal: NumOrRange; size: NumOrRange };
  coastalIslets?: { clusters: NumOrRange; perCluster: NumOrRange; size: NumOrRange; distance: NumOrRange; spread: NumOrRange };
  /** Multipliers (1 = default), drawn per territory: forest count/thickness, mountain ridges, hills. */
  vegetation?: NumOrRange;
  mountains?: NumOrRange;
  hills?: NumOrRange;
  settlementSpacing?: number;
}

export interface WorldMapData {
  seed: WorldMapSeed;
  repositories: Repository[];
  territories: Territory[];
  options?: Partial<WorldGenerationOptions>;
}

export interface GeneratedWorld {
  seed: WorldMapSeed;
  options: WorldGenerationOptions;
  bounds: WorldBounds;
  repositories: Record<string, ScoredRepository>;
  territories: Record<TerritoryKind, Territory>;
  landmasses: Landmass[];
  regions: TerritoryRegion[];
  terrain: TerrainLayer;
  settlements: Settlement[];
  roads: Road[];
  seaRoutes: SeaRoute[];
  decorations: Decorations;
  hitRegions: HitRegion[];
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

export interface MapPalette {
  sea: string;
  seaDeep: string;
  wave: string;
  shallows: string;
  marble: string;
  marbleWarm: string;
  marbleShadow: string;
  vein: string;
  ink: string;
  inkSoft: string;
  bronze: string;
  bronzeDim: string;
  ivory: string;
  activeBlue: string;
  activeBlueGlow: string;
  fog: string;
}

export interface LineStyle {
  width: number;
  color: string;
  alpha: number;
  dash?: number[];
  cap?: CanvasLineCap;
  join?: CanvasLineJoin;
}

export interface MapLineStyles {
  coast: LineStyle;
  shallowRing: LineStyle;
  contour: LineStyle;
  hatch: LineStyle;
  territoryBorder: LineStyle;
  roadMinor: LineStyle;
  roadMajor: LineStyle;
  river: LineStyle;
  seaRoute: LineStyle;
  selection: LineStyle;
}

export interface MapTheme {
  name: string;
  palette: MapPalette;
  lines: MapLineStyles;
  texture: { veinAlpha: number; crackAlpha: number; stippleDensity: number; hatchAlpha: number };
  glow: { radius: number; alpha: number; pulseDurationMs: number };
  /** CSS font stacks for HTML overlays (Canvas never draws meaningful text). */
  fonts: { display: string; label: string; body: string };
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

export type LodLevel = "far" | "mid" | "near";

export type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** Passed to every drawing function. ctx is already transformed into world units. */
export interface DrawContext {
  ctx: Ctx2D;
  theme: MapTheme;
  rng: SeededRandom;
  zoom: number;
  lod: LodLevel;
  reducedMotion: boolean;
  /** Milliseconds; drives animated effects. */
  time: number;
  /** Visible world rect; stamps outside it may be skipped. */
  cull?: WorldBounds;
}

/** Common options for positioned stamps. */
export interface StampOptions {
  position: WorldPoint;
  scale: number;
  rotation?: number;
}

/* ------------------------------------------------------------------ */
/* Viewport & interaction                                              */
/* ------------------------------------------------------------------ */

export interface ViewportState {
  /** World coordinate at the centre of the screen. */
  x: number;
  y: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  /** The fitted "home" zoom; level of detail is measured relative to it. */
  baseZoom?: number;
}

export interface ViewportSize {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export type Easing = (t: number) => number;

export interface CameraAnimation {
  from: ViewportState;
  to: ViewportState;
  startedAt: number;
  durationMs: number;
  easing: Easing;
}

export type MapTarget =
  | { kind: "settlement"; id: string }
  | { kind: "territory"; id: TerritoryKind };

export interface MapFilters {
  territories: TerritoryKind[];
  statuses: RepositoryStatus[];
  technologies: string[];
  majorOnly: boolean;
  query: string;
}


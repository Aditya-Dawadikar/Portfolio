import type {
  Ctx2D,
  DrawContext,
  GeneratedWorld,
  MapTheme,
  Settlement,
  SettlementVisualState,
  ViewportSize,
  ViewportState,
  WorldBounds,
} from "../../types";
import {
  drawBridge,
  drawClassicalStatue,
  drawCloudsAndFog,
  drawCoastline,
  drawCompassRose,
  drawConnectionThread,
  drawForestCluster,
  drawHills,
  drawLake,
  drawLandFill,
  drawMarbleTexture,
  drawMountainRange,
  drawRiver,
  drawRockyBeach,
  drawRoad,
  drawRuins,
  drawSea,
  drawSeaRoute,
  drawSettlementWithEffects,
  drawSandyBeach,
  drawShips,
  drawShallowRings,
  drawTerritoryBorders,
  drawWaves,
  landPath,
} from "../drawing";
import { createRandom } from "./seededRandom";
import { stampAsset } from "../drawing/sprites";
import { COMPASS_ASSET_ID, COMPASS_REF } from "../assets/assetIds";
import { lodFor, visibleBounds } from "./viewport";

export function makeDrawContext(
  ctx: Ctx2D,
  theme: MapTheme,
  seed: string,
  zoom: number,
  extra: Partial<Pick<DrawContext, "lod" | "reducedMotion" | "time" | "cull">> = {},
): DrawContext {
  return { ctx, theme, rng: createRandom(seed), zoom, lod: extra.lod ?? "near", reducedMotion: extra.reducedMotion ?? false, time: extra.time ?? 0, cull: extra.cull };
}

const drawSeed = (world: GeneratedWorld) => `${world.seed.value}:${world.seed.version}:draw`;

/** Static layers 1–10. `ctx` must already map world units to pixels. */
export function drawStaticLayers(dc: DrawContext, world: GeneratedWorld) {
  const { landmasses, terrain } = world;
  drawSea(dc, { bounds: world.bounds, landmasses });
  for (const l of landmasses) drawShallowRings(dc, { polygon: l.polygon });
  drawWaves(dc, { bounds: world.bounds, landmasses, spacing: world.options.detail === "low" ? 110 : 70 });
  drawLandFill(dc, { landmasses });
  drawMarbleTexture(dc, { clip: landPath(landmasses), bounds: world.bounds, intensity: world.options.detail === "low" ? 0.5 : 1 });
  for (const b of terrain.beaches) if (b.kind === "sandy") drawSandyBeach(dc, b);
  for (const l of landmasses) drawCoastline(dc, { polygon: l.polygon, id: l.id });
  for (const b of terrain.beaches) if (b.kind === "rocky") drawRockyBeach(dc, b);
  drawShips(dc, world.decorations.ships ?? []);
  drawTerritoryBorders(dc, { regions: world.regions, landmasses });
  drawHills(dc, { points: terrain.hills });
  for (const lake of terrain.lakes) drawLake(dc, { polygon: lake.polygon });
  for (const river of terrain.rivers) drawRiver(dc, river);
  terrain.forests.forEach((f) => drawForestCluster(dc, { polygon: f.polygon, density: f.density, treeType: f.treeType, rng: dc.rng.fork(f.id) }));
  terrain.mountains.forEach((m) => drawMountainRange(dc, { ...m, rng: dc.rng.fork(m.id) }));
  for (const road of world.roads) drawRoad(dc, road);
  for (const road of world.roads) for (const b of road.bridges) drawBridge(dc, b);
  world.decorations.ruinsScatter.forEach((p, i) => drawRuins(dc, { position: p, scale: 0.75, weathering: 1, seedKey: `scatter:${i}` }));
  if (world.decorations.statue) drawClassicalStatue(dc, { position: world.decorations.statue.position, scale: 1.6, variant: world.decorations.statue.variant });
}

type CacheCanvas = HTMLCanvasElement | OffscreenCanvas;

function createCanvas(w: number, h: number): CacheCanvas {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export interface StaticTier {
  factor: number;
  canvas: CacheCanvas;
}

/** Renders the full static world at `factor` pixels per world unit. */
export function buildStaticTier(world: GeneratedWorld, theme: MapTheme, factor: number): StaticTier {
  const w = Math.ceil((world.bounds.maxX - world.bounds.minX) * factor);
  const h = Math.ceil((world.bounds.maxY - world.bounds.minY) * factor);
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d") as Ctx2D;
  ctx.scale(factor, factor);
  drawStaticLayers(makeDrawContext(ctx, theme, drawSeed(world), factor), world);
  return { factor, canvas };
}

export interface CrispFrame {
  key: string;
  canvas: CacheCanvas;
}

export const viewportKey = (v: ViewportState, size: ViewportSize) =>
  `${v.x.toFixed(2)}:${v.y.toFixed(2)}:${v.zoom.toFixed(5)}:${size.width}:${size.height}:${size.devicePixelRatio}`;

/** Sharp re-render of only the visible region at exact zoom (used when the camera is idle). */
export function buildCrispFrame(world: GeneratedWorld, theme: MapTheme, v: ViewportState, size: ViewportSize): CrispFrame {
  const dpr = size.devicePixelRatio;
  const canvas = createCanvas(Math.ceil(size.width * dpr), Math.ceil(size.height * dpr));
  const ctx = canvas.getContext("2d") as Ctx2D;
  ctx.setTransform(dpr * v.zoom, 0, 0, dpr * v.zoom, dpr * (size.width / 2 - v.x * v.zoom), dpr * (size.height / 2 - v.y * v.zoom));
  drawStaticLayers(makeDrawContext(ctx, theme, drawSeed(world), v.zoom, { cull: visibleBounds(v, size, 80) }), world);
  return { key: viewportKey(v, size), canvas };
}

interface FrameState {
  world: GeneratedWorld;
  theme: MapTheme;
  viewport: ViewportState;
  size: ViewportSize;
  tiers: StaticTier[];
  crisp: CrispFrame | null;
  time: number;
  reducedMotion: boolean;
  isSettlementVisible: (s: Settlement) => boolean;
  stateFor: (s: Settlement) => Partial<SettlementVisualState>;
  highlightedIds: Set<string>;
  selectedId: string | null;
  showFog: boolean;
}

/** Composites one frame: cached static terrain, then dynamic routes, settlements, effects, fog, compass. */
export function renderFrame(ctx: CanvasRenderingContext2D, f: FrameState) {
  const { viewport: v, size, world, theme } = f;
  const dpr = size.devicePixelRatio;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = theme.palette.seaDeep;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const worldTransform = () =>
    ctx.setTransform(dpr * v.zoom, 0, 0, dpr * v.zoom, dpr * (size.width / 2 - v.x * v.zoom), dpr * (size.height / 2 - v.y * v.zoom));

  if (f.crisp && f.crisp.key === viewportKey(v, size)) {
    ctx.drawImage(f.crisp.canvas as CanvasImageSource, 0, 0);
  } else if (f.tiers.length) {
    const needed = v.zoom * dpr;
    const tier = f.tiers.find((t) => t.factor >= needed) ?? f.tiers[f.tiers.length - 1];
    worldTransform();
    const b = world.bounds;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(tier.canvas as CanvasImageSource, b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
  }

  worldTransform();
  const cull: WorldBounds = visibleBounds(v, size, 120);
  const dc = makeDrawContext(ctx, theme, `${world.seed.value}:dynamic`, v.zoom, { lod: lodFor(v), reducedMotion: f.reducedMotion, time: f.time, cull });

  for (const route of world.seaRoutes) {
    const highlighted = f.highlightedIds.has(route.fromId) || f.highlightedIds.has(route.toId);
    drawSeaRoute(dc, { path: route.path, highlighted });
  }
  if (f.selectedId) {
    for (const road of world.roads) {
      if (road.fromId === f.selectedId || road.toId === f.selectedId) drawConnectionThread(dc, { path: road.path });
    }
  }

  const visible = world.settlements
    .filter((s) => f.isSettlementVisible(s))
    .filter((s) => !(s.position.x + s.hitRadius * 2 < cull.minX || s.position.x - s.hitRadius * 2 > cull.maxX || s.position.y + s.hitRadius * 2 < cull.minY || s.position.y - s.hitRadius * 2 > cull.maxY))
    .sort((a, b) => a.position.y - b.position.y);
  const states = new Map(visible.map((s) => [s.repositoryId, f.stateFor(s)]));
  // Dimmed first so matching settlements always sit on top.
  for (const s of visible) if (states.get(s.repositoryId)?.dimmed) drawSettlementWithEffects(dc, s, states.get(s.repositoryId));
  for (const s of visible) if (!states.get(s.repositoryId)?.dimmed) drawSettlementWithEffects(dc, s, states.get(s.repositoryId));

  if (f.showFog) {
    const exclusion = world.settlements.filter((s) => f.highlightedIds.has(s.repositoryId)).map((s) => s.position);
    drawCloudsAndFog(dc, { bounds: world.bounds, exclusion });
  }

  // Screen-space compass rose (top-right).
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sdc = makeDrawContext(ctx, theme, "compass", 1);
  const s = size.width < 640 ? 0.55 : 0.8;
  stampAsset(sdc, { id: COMPASS_ASSET_ID, scale: s / COMPASS_REF }, `compass|${s}`, { ox: 48 * s, oy: 48 * s, w: 96 * s, h: 96 * s }, { x: size.width - 60 * s - 20, y: 60 * s + 20 }, (c) =>
    drawCompassRose(c, { position: { x: 0, y: 0 }, scale: s }),
  );
}

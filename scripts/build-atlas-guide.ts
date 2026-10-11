/**
 * Renders the illustration plates for the atlas field guide (src/world-map/README.md,
 * shown at /atlas/guide) with the real drawing functions.
 *
 *   pnpm atlas:guide
 *
 * Output: public/atlas/guide/*.png. Rerun after changing any drawing function or the theme.
 */
import fs from "fs";
import path from "path";
import { Canvas, Path2D, createCanvas } from "@napi-rs/canvas";

// Browser canvas globals the drawing code expects.
(globalThis as unknown as { Path2D: typeof Path2D }).Path2D = Path2D;
// Sprite and glow caches need an offscreen canvas. Native canvases can't be subclassed, so
// `new OffscreenCanvas()` returns a plain node canvas (the sprite cache then keeps it as is).
(globalThis as unknown as { OffscreenCanvas: unknown }).OffscreenCanvas = function NodeOffscreenCanvas(w: number, h: number) {
  return createCanvas(w, h);
};

import {
  type SettlementLike,
  LANDMARK_RADIUS,
  drawActiveGlow,
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
  drawRoad,
  drawRockyBeach,
  drawSandyBeach,
  drawSea,
  drawSeaRoute,
  drawSettlementWithEffects,
  drawShallowRings,
  drawShips,
  drawTerritoryBorders,
  drawWaves,
  landPath,
  landmassFromPolygon,
} from "../src/world-map/canvas/drawing";
import { drawStaticLayers, makeDrawContext } from "../src/world-map/canvas/engine/mapRenderer";
import { createRandom } from "../src/world-map/canvas/engine/seededRandom";
import { generateBeaches } from "../src/world-map/canvas/generation/generateCoast";
import { generateWorld } from "../src/world-map/canvas/generation/generateWorld";
import { midnightMarbleTheme as theme } from "../src/world-map/canvas/styles/mapTheme";
import { DEMO_WORLD } from "../src/world-map/data/demoWorld";
import type {
  Ctx2D,
  DrawContext,
  Landmass,
  LandmarkKind,
  MapPalette,
  MinorSettlementKind,
  RepositoryStatus,
  SettlementTier,
  SettlementVisualState,
  ShipKind,
  StatueVariant,
  TerritoryRegion,
  TreeType,
  WorldPoint,
} from "../src/world-map/types";
import { expandBounds, lerp, noisyBlob, polygonBounds } from "../src/world-map/utils/geometry";

const OUT = path.join(process.cwd(), "public", "atlas", "guide");
const DPR = 2;

type Background = "marble" | "sea" | "none";

/** One plate: `width`×`height` CSS px, `zoom` CSS px per world unit, saved at DPR 2. */
function plate(name: string, width: number, height: number, zoom: number, background: Background, draw: (dc: DrawContext, w: number, h: number) => void, time = 0) {
  const canvas = createCanvas(width * DPR, height * DPR);
  const ctx = canvas.getContext("2d") as unknown as Ctx2D;
  ctx.setTransform(DPR * zoom, 0, 0, DPR * zoom, 0, 0);
  const ww = width / zoom;
  const wh = height / zoom;
  const dc = () => makeDrawContext(ctx, theme, name, zoom, { time });
  if (background === "sea") {
    ctx.fillStyle = theme.palette.sea;
    ctx.fillRect(0, 0, ww, wh);
  } else if (background === "marble") {
    const rect = [{ x: -2, y: -2 }, { x: ww + 2, y: -2 }, { x: ww + 2, y: wh + 2 }, { x: -2, y: wh + 2 }];
    const land = [landmassFromPolygon("bg", rect)];
    drawLandFill(dc(), { landmasses: land });
    drawMarbleTexture(dc(), { clip: landPath(land), bounds: { minX: 0, minY: 0, maxX: ww, maxY: wh }, intensity: 0.6 });
  }
  draw(dc(), ww, wh);
  fs.writeFileSync(path.join(OUT, `${name}.png`), (canvas as unknown as Canvas).toBuffer("image/png"));
}

const island = (c: WorldPoint, r: number, seed: string, kind: Landmass["kind"] = "continent") =>
  landmassFromPolygon(seed, noisyBlob(c, r, 30, 0.32, createRandom(seed).next), kind);

function seaScene(dc: DrawContext, w: number, h: number, isl: Landmass[], spacing = 26) {
  const bounds = { minX: 0, minY: 0, maxX: w, maxY: h };
  drawSea(dc, { bounds, landmasses: isl });
  isl.forEach((l) => drawShallowRings(dc, { polygon: l.polygon }));
  drawWaves(dc, { bounds, landmasses: isl, spacing });
  drawLandFill(dc, { landmasses: isl });
  drawMarbleTexture(dc, { clip: landPath(isl), bounds, intensity: 1 });
  isl.forEach((l) => drawCoastline(dc, { polygon: l.polygon, id: l.id }));
}

const MINOR: MinorSettlementKind[] = ["village", "outpost", "workshop", "shrine", "archive", "port", "tower", "ruin"];

function settlement(kind: SettlementLike["kind"], pos: WorldPoint, opts: Partial<SettlementLike> = {}): SettlementLike {
  const isLm = !MINOR.includes(kind as MinorSettlementKind);
  const tier: SettlementTier = opts.tier ?? (isLm ? "landmark" : "minor");
  const scale = opts.scale ?? 1;
  return {
    kind,
    tier,
    position: pos,
    scale,
    rotation: 0,
    activeGlow: 0,
    weathering: kind === "ruin" ? 1 : 0,
    status: kind === "ruin" ? "archived" : "maintained",
    hitRadius: isLm ? LANDMARK_RADIUS * scale * 1.05 : 13 * scale * (tier === "major" ? 1.25 : 1),
    repositoryId: `guide-${kind}-${tier}`,
    ...opts,
  };
}

function frontispiece() {
  const world = generateWorld({
    ...DEMO_WORLD,
    options: { ...DEMO_WORLD.options, archipelago: { gap: 90, spread: 170, radius: 330 }, beaches: { amount: 0.5, rocky: 0.4, width: { min: 8, max: 22 } }, ships: { ocean: 10, coastal: 3, size: 1 }, structureScale: 1.4, maxSeaRoutes: 6 },
  });
  const land = expandBounds(polygonBounds(world.landmasses.flatMap((l) => l.polygon)), 80);
  const W = 1440;
  const H = 860;
  const zoom = Math.min(W / (land.maxX - land.minX), H / (land.maxY - land.minY));
  const cx = (land.minX + land.maxX) / 2;
  const cy = (land.minY + land.maxY) / 2;
  const canvas = createCanvas(W * DPR, H * DPR);
  const ctx = canvas.getContext("2d") as unknown as Ctx2D;
  ctx.fillStyle = theme.palette.seaDeep;
  ctx.fillRect(0, 0, W * DPR, H * DPR);
  ctx.setTransform(DPR * zoom, 0, 0, DPR * zoom, DPR * (W / 2 - cx * zoom), DPR * (H / 2 - cy * zoom));
  const dc = makeDrawContext(ctx, theme, "frontispiece", zoom);
  drawStaticLayers(dc, world);
  for (const r of world.seaRoutes) drawSeaRoute(dc, { path: r.path });
  for (const s of [...world.settlements].sort((a, b) => a.position.y - b.position.y)) drawSettlementWithEffects(dc, s);
  drawCloudsAndFog(dc, { bounds: world.bounds, exclusion: [] });
  fs.writeFileSync(path.join(OUT, "frontispiece.png"), (canvas as unknown as Canvas).toBuffer("image/png"));
  // A light copy for the landing page's atlas section.
  fs.writeFileSync(path.join(OUT, "..", "atlas-preview.webp"), (canvas as unknown as Canvas).toBuffer("image/webp", 82));
}

function palette() {
  const keys: (keyof MapPalette)[] = ["seaDeep", "sea", "wave", "shallows", "marble", "marbleWarm", "marbleShadow", "vein", "ink", "inkSoft", "bronze", "bronzeDim", "ivory", "activeBlue", "fog"];
  for (const k of keys) {
    const c = createCanvas(56 * DPR, 56 * DPR);
    const ctx = c.getContext("2d");
    ctx.scale(DPR, DPR);
    ctx.beginPath();
    ctx.arc(28, 28, 24, 0, Math.PI * 2);
    ctx.fillStyle = theme.palette[k];
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(242,237,226,0.35)";
    ctx.stroke();
    fs.writeFileSync(path.join(OUT, `swatch-${k}.png`), c.toBuffer("image/png"));
  }
}

function seaAndCoast() {
  plate("sea", 420, 240, 1, "none", (dc, w, h) => {
    const bounds = { minX: 0, minY: 0, maxX: w, maxY: h };
    const l = island({ x: w * 0.5, y: h * 0.5 }, 26, "sea-isle");
    drawSea(dc, { bounds, landmasses: [l] });
    drawWaves(dc, { bounds, landmasses: [l], spacing: 24 });
  });
  plate("coast", 420, 240, 1, "none", (dc, w, h) => seaScene(dc, w, h, [island({ x: w / 2, y: h / 2 }, 78, "coast-a")]));
  plate("beaches", 420, 240, 1.3, "none", (dc, w, h) => {
    const l = island({ x: w / 2, y: h / 2 }, 62, "beach-isle");
    const bounds = { minX: 0, minY: 0, maxX: w, maxY: h };
    drawSea(dc, { bounds, landmasses: [l] });
    drawShallowRings(dc, { polygon: l.polygon });
    drawWaves(dc, { bounds, landmasses: [l], spacing: 24 });
    drawLandFill(dc, { landmasses: [l] });
    drawMarbleTexture(dc, { clip: landPath([l]), bounds, intensity: 1 });
    const beaches = generateBeaches(createRandom("beaches"), [l], { amount: 0.85, rocky: 0.45, width: 9 });
    beaches.filter((b) => b.kind === "sandy").forEach((b) => drawSandyBeach(dc, b));
    drawCoastline(dc, { polygon: l.polygon, id: l.id });
    beaches.filter((b) => b.kind === "rocky").forEach((b) => drawRockyBeach(dc, b));
  });
  plate("islets", 420, 240, 0.8, "none", (dc, w, h) =>
    seaScene(dc, w, h, [
      island({ x: w * 0.3, y: h * 0.48 }, 70, "arch-a"),
      island({ x: w * 0.74, y: h * 0.28 }, 34, "arch-b", "island"),
      island({ x: w * 0.72, y: h * 0.74 }, 24, "arch-c", "island"),
      island({ x: w * 0.88, y: h * 0.52 }, 12, "arch-d", "island"),
    ]),
  );
  const kinds: ShipKind[] = ["galley", "sailboat", "rowboat"];
  plate("ships", 420, 200, 1.6, "sea", (dc, w, h) => {
    drawWaves(dc, { bounds: { minX: 0, minY: 0, maxX: w, maxY: h }, spacing: 22 });
    drawShips(dc, kinds.map((kind, i) => ({ id: kind, kind, position: { x: w * (0.22 + i * 0.3), y: h * 0.62 }, heading: i === 1 ? Math.PI : 0, scale: 1 })));
  });
}

function land() {
  plate("marble", 420, 240, 1.4, "marble", () => {});
  plate("mountains", 420, 240, 1.3, "marble", (dc, w, h) => {
    const ridge = [{ x: 18, y: h * 0.62 }, { x: w * 0.35, y: h * 0.5 }, { x: w * 0.6, y: h * 0.6 }, { x: w - 18, y: h * 0.45 }];
    drawRoad(dc, { path: [{ x: w * 0.47, y: h + 4 }, { x: w * 0.49, y: h * 0.55 }, { x: w * 0.47, y: -4 }], rank: "minor" });
    drawMountainRange(dc, { ridge, density: 1, scaleRange: [0.7, 1.1], snowcaps: false, passes: [{ x: w * 0.48, y: h * 0.55 }], rng: createRandom("ridge") });
  });
  plate("snowcaps", 420, 240, 1.3, "marble", (dc, w, h) =>
    drawMountainRange(dc, { ridge: [{ x: 16, y: h * 0.55 }, { x: w * 0.5, y: h * 0.68 }, { x: w - 16, y: h * 0.5 }], density: 1.1, scaleRange: [0.85, 1.3], snowcaps: true, passes: [], rng: createRandom("snow") }),
  );
  plate("hills", 420, 240, 1.8, "marble", (dc, w, h) => {
    const r = createRandom("hills");
    drawHills(dc, { points: Array.from({ length: 16 }, () => ({ x: r.range(12, w - 12), y: r.range(14, h - 6) })) });
  });
  const trees: TreeType[] = ["cypress", "olive", "pine"];
  for (const t of trees) {
    plate(`forest-${t}`, 300, 200, 1.7, "marble", (dc, w, h) =>
      drawForestCluster(dc, { polygon: noisyBlob({ x: w / 2, y: h / 2 + 4 }, Math.min(w, h) * 0.42, 18, 0.35, createRandom(t).next), density: 0.8, treeType: t, rng: createRandom(`f-${t}`) }),
    );
  }
  plate("rivers", 420, 240, 1.2, "marble", (dc, w, h) => {
    drawRiver(dc, {
      path: [{ x: w * 0.3, y: h * 0.3 }, { x: w * 0.45, y: h * 0.45 }, { x: w * 0.62, y: h * 0.55 }, { x: w * 0.8, y: h * 0.75 }, { x: w + 4, y: h * 0.86 }],
      widthAtSource: 1.4,
      widthAtMouth: 9,
      tributaries: [{ id: "t", path: [{ x: w * 0.72, y: 8 }, { x: w * 0.7, y: h * 0.3 }, { x: w * 0.65, y: h * 0.56 }], widthAtSource: 1, widthAtMouth: 3, tributaries: [] }],
    });
    drawLake(dc, { polygon: noisyBlob({ x: w * 0.27, y: h * 0.27 }, 30, 14, 0.3, createRandom("lk").next) });
    drawRiver(dc, {
      path: [{ x: w * 0.27, y: h * 0.27 }, { x: w * 0.45, y: h * 0.45 }],
      widthAtSource: 1.4,
      widthAtMouth: 2,
      tributaries: [],
    });
  });
  plate("borders", 420, 240, 1, "none", (dc, w, h) => {
    const l = island({ x: w / 2, y: h / 2 }, 96, "border-land");
    seaScene(dc, w, h, [l]);
    const cellA = [{ x: 0, y: 0 }, { x: w * 0.55, y: 0 }, { x: w * 0.42, y: h }, { x: 0, y: h }];
    const cellB = [{ x: w * 0.55, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: w * 0.42, y: h }];
    const region = (cell: WorldPoint[], id: TerritoryRegion["territoryId"]): TerritoryRegion => ({ territoryId: id, site: cell[0], weight: 0, cell, islandIds: [], polygons: [cell], bounds: { minX: 0, minY: 0, maxX: w, maxY: h }, centroid: cell[0], labelAnchor: cell[0], area: 1 });
    drawTerritoryBorders(dc, { regions: [region(cellA, "agents"), region(cellB, "backend")], landmasses: [l] });
  });
}

function settlements() {
  for (const k of MINOR) {
    plate(`settlement-${k}`, 320, 150, 3.4, "marble", (dc, w, h) => {
      if (k === "ruin") {
        [0, 0.5, 1].forEach((weathering, i) =>
          drawSettlementWithEffects(dc, settlement(k, { x: w * (0.2 + i * 0.3), y: h / 2 + 1 }, { weathering, repositoryId: `ruin-${i}` })),
        );
        return;
      }
      (["minor", "major"] as const).forEach((tier, i) =>
        drawSettlementWithEffects(dc, settlement(k, { x: w * (i ? 0.7 : 0.28) - (k === "port" ? 6 : 0), y: h / 2 + 1 }, { tier })),
      );
    });
  }
  const landmarks: LandmarkKind[] = ["observatory", "citadel", "aqueduct", "academy", "bridge_city", "forum", "arena", "library", "temple"];
  for (const k of landmarks) {
    plate(`landmark-${k}`, 280, 210, 2.2, "marble", (dc, w, h) => drawSettlementWithEffects(dc, settlement(k, { x: w / 2, y: h / 2 + 2 }, { scale: 1.75 })));
  }
  plate("landmark-scale", 720, 200, 1.25, "marble", (dc, w, h) => {
    [40, 70, 100].forEach((impact, i) =>
      drawSettlementWithEffects(dc, settlement("temple", { x: w * (0.18 + i * 0.32), y: h / 2 + 4 }, { scale: lerp(1.5, 2.4, impact / 100) })),
    );
  });
  plate("hierarchy", 720, 200, 1.5, "marble", (dc, w, h) => {
    const row: [SettlementLike["kind"], SettlementTier, number][] = [["temple", "landmark", 2.2], ["observatory", "landmark", 1.7], ["tower", "major", 1.25], ["village", "minor", 1]];
    row.forEach(([kind, tier, scale], i) => drawSettlementWithEffects(dc, settlement(kind, { x: w * (0.13 + i * 0.25), y: h / 2 + 2 }, { tier, scale })));
  });
}

function states() {
  const statuses: { status: RepositoryStatus; kind: SettlementLike["kind"]; tier: SettlementTier; glow: number; scale: number }[] = [
    { status: "deployed", kind: "observatory", tier: "landmark", glow: 1, scale: 1.3 },
    { status: "active", kind: "tower", tier: "major", glow: 0.6, scale: 1.25 },
    { status: "maintained", kind: "archive", tier: "major", glow: 0, scale: 1.25 },
    { status: "archived", kind: "ruin", tier: "minor", glow: 0, scale: 1.4 },
  ];
  for (const s of statuses) {
    plate(`status-${s.status}`, 160, 130, 1.5, "marble", (dc, w, h) =>
      drawSettlementWithEffects(dc, settlement(s.kind, { x: w / 2, y: h / 2 + 2 }, { tier: s.tier, status: s.status, activeGlow: s.glow, scale: s.scale })),
    );
  }
  const looks: [string, Partial<SettlementVisualState>][] = [
    ["base", {}],
    ["hover", { hovered: true }],
    ["selected", { selected: true }],
    ["focused", { focused: true }],
    ["dimmed", { dimmed: true }],
    ["pulse", { selected: true, pulse: 0.45 }],
  ];
  for (const [name, state] of looks) {
    plate(`state-${name}`, 160, 130, 1.5, "marble", (dc, w, h) =>
      drawSettlementWithEffects(dc, settlement("tower", { x: w / 2, y: h / 2 + 2 }, { tier: "major", status: "active", activeGlow: 0.6, scale: 1.25 }), state),
    );
  }
}

function connections() {
  plate("roads", 420, 220, 1.3, "marble", (dc, w, h) => {
    drawRoad(dc, { path: [{ x: -4, y: h * 0.3 }, { x: w * 0.3, y: h * 0.22 }, { x: w * 0.65, y: h * 0.35 }, { x: w + 4, y: h * 0.25 }], rank: "minor" });
    drawRoad(dc, { path: [{ x: -4, y: h * 0.75 }, { x: w * 0.35, y: h * 0.62 }, { x: w * 0.7, y: h * 0.8 }, { x: w + 4, y: h * 0.7 }], rank: "major" });
  });
  for (const variant of ["stone", "aqueduct", "long_arch"] as const) {
    plate(`bridge-${variant}`, 280, 180, 2, "marble", (dc, w, h) => {
      const width = variant === "long_arch" ? 12 : variant === "aqueduct" ? 7 : 5;
      drawRiver(dc, { path: [{ x: w * 0.42, y: -4 }, { x: w * 0.5, y: h * 0.5 }, { x: w * 0.56, y: h + 4 }], widthAtSource: width * 0.8, widthAtMouth: width, tributaries: [] });
      drawRoad(dc, { path: [{ x: -4, y: h * 0.55 }, { x: w * 0.3, y: h * 0.5 }, { x: w * 0.7, y: h * 0.48 }, { x: w + 4, y: h * 0.42 }], rank: variant === "stone" ? "minor" : "major" });
      drawBridge(dc, { position: { x: w * 0.5, y: h * 0.49 }, angle: -0.04, span: width * 2 + 12, variant });
    });
  }
  const routePath = (w: number, h: number) => [{ x: w * 0.2, y: h * 0.55 }, { x: w * 0.35, y: h * 0.18 }, { x: w * 0.62, y: h * 0.16 }, { x: w * 0.8, y: h * 0.5 }];
  const routeIsles = (w: number, h: number) => [island({ x: w * 0.14, y: h * 0.62 }, 34, "ri-a"), island({ x: w * 0.86, y: h * 0.62 }, 30, "ri-b", "island")];
  plate("route-idle", 420, 240, 1.2, "none", (dc, w, h) => {
    seaScene(dc, w, h, routeIsles(w, h));
    drawSeaRoute(dc, { path: routePath(w, h) });
  });
  plate(
    "route-lit",
    420,
    240,
    1.2,
    "none",
    (dc, w, h) => {
      seaScene(dc, w, h, routeIsles(w, h));
      drawSeaRoute(dc, { path: routePath(w, h), highlighted: true });
    },
    1400,
  );
  plate("thread", 420, 220, 1.5, "marble", (dc, w, h) => {
    const p = [{ x: w * 0.2, y: h * 0.6 }, { x: w * 0.5, y: h * 0.4 }, { x: w * 0.8, y: h * 0.55 }];
    drawRoad(dc, { path: p, rank: "major" });
    drawConnectionThread(dc, { path: p });
    drawSettlementWithEffects(dc, settlement("tower", p[0], { status: "active", tier: "minor" }), { selected: true });
    drawSettlementWithEffects(dc, settlement("village", p[2], { tier: "minor" }));
  });
}

function ornaments() {
  plate("compass", 240, 240, 1, "sea", (dc, w, h) => drawCompassRose(dc, { position: { x: w / 2, y: h / 2 }, scale: 2.1 }));
  const statues: StatueVariant[] = ["architect", "scroll", "compass", "atlas"];
  for (const v of statues) plate(`statue-${v}`, 180, 150, 3.2, "marble", (dc, w, h) => drawClassicalStatue(dc, { position: { x: w / 2, y: h / 2 }, scale: 1, variant: v }));
  plate("fog", 420, 240, 0.7, "none", (dc, w, h) => {
    seaScene(dc, w, h, [island({ x: w / 2, y: h / 2 }, 150, "fog-land")], 40);
    drawCloudsAndFog(dc, { bounds: { minX: 0, minY: 0, maxX: w, maxY: h }, count: 10 });
  });
  plate("glow", 420, 200, 2.6, "marble", (dc, w, h) => {
    [0, 0.6, 1].forEach((g, i) => {
      const p = { x: w * (0.2 + i * 0.3), y: h / 2 };
      drawActiveGlow(dc, { position: p, radius: 16, intensity: g });
      drawSettlementWithEffects(dc, settlement("outpost", p, { status: g === 1 ? "deployed" : g > 0 ? "active" : "maintained", tier: "major" }));
    });
  });
}

const t0 = Date.now();
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
frontispiece();
palette();
seaAndCoast();
land();
settlements();
states();
connections();
ornaments();
const files = fs.readdirSync(OUT);
const bytes = files.reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`Rendered ${files.length} guide plates (${(bytes / 1024 / 1024).toFixed(2)} MB) in ${((Date.now() - t0) / 1000).toFixed(1)} s → ${path.relative(process.cwd(), OUT)}`);

import type { DrawContext, Landmass, WorldBounds } from "../../types";
import { mix } from "../../utils/color";
import { boundsContains, clamp, distToPolyline, pointInPolygon, polygonArea, tracePath } from "../../utils/geometry";
import { createNoise2D } from "../../utils/noise";
import { isCulled, px } from "./common";
import { WAVE_REF, waveAssetId } from "../assets/assetIds";
import { q, stampAsset } from "./sprites";

export interface SeaOptions {
  bounds: WorldBounds;
  landmasses?: Landmass[];
}

/** Layer 1: flat midnight base with stepped (engraved, not gradient) depth bands near the coast. */
export function drawSea(dc: DrawContext, { bounds, landmasses = [] }: SeaOptions) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  ctx.save();
  ctx.fillStyle = p.seaDeep;
  ctx.fillRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  ctx.lineJoin = "round";
  const bands = [
    { width: 340, t: 0.4 },
    { width: 200, t: 0.7 },
    { width: 96, t: 1 },
  ];
  for (const band of bands) {
    const color = mix(p.seaDeep, p.sea, band.t);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    for (const land of landmasses) {
      const scale = clamp(Math.sqrt(polygonArea(land.polygon)) / 1400, 0.3, 1);
      ctx.lineWidth = band.width * scale;
      ctx.beginPath();
      tracePath(ctx, land.polygon, true);
      ctx.stroke();
      ctx.fill();
    }
  }
  ctx.restore();
}

export interface WaveOptions {
  bounds: WorldBounds;
  landmasses?: Landmass[];
  /** Approximate spacing between wave marks in world units. */
  spacing?: number;
}

/** Layer 2: sparse hand-drawn "∼" marks following a noise flow field, kept off the coast. */
export function drawWaves(dc: DrawContext, { bounds, landmasses = [], spacing = 64 }: WaveOptions) {
  const { ctx, theme } = dc;
  const rng = dc.rng.fork("waves");
  const flow = createNoise2D(rng.int(0, 1e9));
  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  const count = Math.round((w * h) / (spacing * spacing));
  ctx.save();
  ctx.strokeStyle = theme.palette.wave;
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const x = bounds.minX + rng.next() * w;
    const y = bounds.minY + rng.next() * h;
    const s = rng.range(0.7, 1.25);
    const doubled = rng.chance(0.3);
    const alpha = rng.range(0.18, 0.4);
    const p = { x, y };
    if (isCulled(dc, p, 20)) continue;
    let blocked = false;
    for (const land of landmasses) {
      if (!boundsContains(land.bounds, p, 34)) continue;
      if (pointInPolygon(p, land.polygon) || distToPolyline(p, land.polygon, true) < 34) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;
    const angle = flow(x * 0.0015, y * 0.0015) * 0.6;
    const b = q(s, 0.1);
    stampAsset(
      dc,
      { id: waveAssetId(doubled), scale: b / WAVE_REF },
      `wave|${doubled ? 1 : 0}|${b}`,
      { ox: 8 * b + 1, oy: 4 * b + 1, w: 16 * b + 2, h: 10 * b + 2 },
      p,
      (sdc) => drawWaveGlyph(sdc, b, doubled),
      { rotation: angle, alpha },
    );
  }
  ctx.restore();
}

/** One "∼" wave mark (optionally with a second, shorter stroke) at the origin. */
export function drawWaveGlyph(dc: DrawContext, b: number, doubled: boolean) {
  const c = dc.ctx;
  c.save();
  c.scale(b, b);
  c.strokeStyle = dc.theme.palette.wave;
  c.lineCap = "round";
  c.lineWidth = Math.max(px(dc, 0.9), 0.7) / b;
  c.beginPath();
  c.moveTo(-7, 0);
  c.quadraticCurveTo(-3.5, -3, 0, 0);
  c.quadraticCurveTo(3.5, 3, 7, 0);
  if (doubled) {
    c.moveTo(-3, 4.5);
    c.quadraticCurveTo(0.5, 1.5, 4, 4.5);
  }
  c.stroke();
  c.restore();
}

import type { DrawContext, SeededRandom, WorldPoint, WorldPolyline } from "../../types";
import { dist, pointAlong, polylineLength, smoothPolyline } from "../../utils/geometry";
import { createRandom } from "../engine/seededRandom";
import { isCulled, px } from "./common";
import { HILL_ASSET_ID, HILL_REF, MOUNTAIN_REF, mountainAssetId } from "../assets/assetIds";
import { q, stampAsset } from "./sprites";

export interface MountainOptions {
  position: WorldPoint;
  scale: number;
  snowcap?: boolean;
  rng: SeededRandom;
}

/** A single hand-drawn mountain: lit west face, hatched east face, optional snow line. */
export function drawMountain(dc: DrawContext, { position, scale, snowcap = false, rng }: MountainOptions) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const s = 20 * scale;
  const { x, y } = position;
  const skew = rng.range(-0.25, 0.25) * s;
  const peak = { x: x + skew, y: y - s * 1.15 };
  const left = { x: x - s * 0.95, y };
  const right = { x: x + s * 0.95, y };
  const lw = Math.max(px(dc, 1.1), 0.9);

  const shape = new Path2D();
  shape.moveTo(left.x, left.y);
  shape.quadraticCurveTo(x - s * 0.45 + skew * 0.5, y - s * 0.62, peak.x, peak.y);
  shape.quadraticCurveTo(x + s * 0.5 + skew * 0.5, y - s * 0.5, right.x, right.y);
  shape.closePath();

  ctx.save();
  // Ground shadow to the east.
  ctx.fillStyle = p.marbleShadow;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(x + s * 0.35, y + 1, s * 0.9, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = p.marble;
  ctx.fill(shape);

  // East-face hatching.
  ctx.save();
  ctx.clip(shape);
  ctx.strokeStyle = p.inkSoft;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = lw * 0.7;
  ctx.beginPath();
  const lines = Math.max(3, Math.round(4 + scale * 2));
  for (let i = 1; i <= lines; i++) {
    const t = i / (lines + 1);
    const sx = peak.x + (right.x - peak.x) * t;
    const sy = peak.y + (right.y - peak.y) * t - s * 0.08;
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - s * 0.18, y);
  }
  ctx.stroke();
  ctx.restore();

  // Outline: slopes only, no base line.
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.quadraticCurveTo(x - s * 0.45 + skew * 0.5, y - s * 0.62, peak.x, peak.y);
  ctx.quadraticCurveTo(x + s * 0.5 + skew * 0.5, y - s * 0.5, right.x, right.y);
  ctx.stroke();

  // Spur line from the peak.
  ctx.lineWidth = lw * 0.7;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(peak.x, peak.y);
  ctx.quadraticCurveTo(peak.x + s * 0.08, y - s * 0.45, x + skew * 0.3 + s * 0.12, y - s * 0.05);
  ctx.stroke();

  if (snowcap) {
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = lw * 0.8;
    ctx.beginPath();
    const a = { x: peak.x + (left.x - peak.x) * 0.3, y: peak.y + (left.y - peak.y) * 0.3 };
    const b = { x: peak.x + (right.x - peak.x) * 0.3, y: peak.y + (right.y - peak.y) * 0.3 };
    ctx.moveTo(a.x, a.y);
    const zig = 4;
    for (let i = 1; i <= zig; i++) {
      const t = i / zig;
      ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t + (i % 2 === 0 ? -s * 0.06 : s * 0.08));
    }
    ctx.stroke();
  }
  ctx.restore();
}

export interface MountainRangeOptions {
  ridge: WorldPolyline;
  density: number;
  scaleRange: [number, number];
  snowcaps: boolean;
  passes: WorldPoint[];
  rng: SeededRandom;
}

/** Layer 6: mountains stamped along a ridge with jitter, a back row, and gaps at passes. */
export function drawMountainRange(dc: DrawContext, { ridge, density, scaleRange, snowcaps, passes, rng }: MountainRangeOptions) {
  const line = smoothPolyline(ridge, 8);
  const total = polylineLength(line);
  const stamps: { x: number; y: number; s: number; snow: boolean }[] = [];
  let d = 0;
  while (d < total) {
    const s = rng.range(scaleRange[0], scaleRange[1]);
    const { point, angle } = pointAlong(line, d / total);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const inPass = passes.some((pp) => dist(pp, point) < 30 * s);
    if (!inPass) {
      const j = rng.range(-9, 9) * s;
      stamps.push({ x: point.x + nx * j, y: point.y + ny * j, s, snow: snowcaps && s > (scaleRange[0] + scaleRange[1]) / 2 });
      // Massif: every peak gets a back-row shoulder, and often a smaller front-row spur.
      const j2 = rng.range(12, 20) * s;
      stamps.push({ x: point.x - nx * j2 + rng.range(-6, 6), y: point.y - ny * j2 - 6, s: s * rng.range(0.6, 0.85), snow: false });
      if (rng.chance(0.5)) {
        const j3 = rng.range(14, 22) * s;
        stamps.push({ x: point.x + nx * j3 + rng.range(-6, 6), y: point.y + ny * j3 + 4, s: s * rng.range(0.5, 0.7), snow: false });
      }
    }
    d += (15 * s) / Math.max(0.3, density);
  }
  stamps.sort((a, b) => a.y - b.y);
  for (const st of stamps) {
    if (isCulled(dc, st, 40 * st.s)) continue;
    stampMountain(dc, st, st.s, st.snow, Math.abs(Math.round(st.x * 7 + st.y * 13)) % MOUNTAIN_VARIANTS);
  }
}

export const MOUNTAIN_VARIANTS = 8;

/** One mountain from the sprite cache; `variant` picks one of a few pre-jittered shapes. */
function stampMountain(dc: DrawContext, at: WorldPoint, scale: number, snowcap: boolean, variant: number) {
  const b = q(scale);
  const s = 20 * b;
  stampAsset(dc, { id: mountainAssetId(variant, snowcap), scale: b / MOUNTAIN_REF }, `mtn|${variant}|${b}|${snowcap ? 1 : 0}`, { ox: 1.4 * s + 2, oy: 1.35 * s + 2, w: 2.9 * s + 4, h: 1.8 * s + 4 }, at, (sdc) =>
    drawMountain(sdc, { position: { x: 0, y: 0 }, scale: b, snowcap, rng: createRandom(`mtn-variant:${variant}`) }),
  );
}

/** Low rounded hills with short east-side hatch ticks (stamped from the sprite cache). */
export function drawHills(dc: DrawContext, { points, scale = 1 }: { points: WorldPoint[]; scale?: number }) {
  const s = 9 * scale;
  for (const pt of [...points].sort((a, b) => a.y - b.y)) {
    if (isCulled(dc, pt, 20)) continue;
    stampAsset(dc, { id: HILL_ASSET_ID, scale: scale / HILL_REF }, `hill|${q(scale)}`, { ox: s + 2, oy: 0.8 * s + 2, w: 2 * s + 4, h: s + 4 }, pt, (sdc) => drawHill(sdc, s));
  }
}

/** A single hill at the origin. */
export function drawHill(dc: DrawContext, s: number) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const lw = Math.max(px(dc, 1), 0.8);
  const pt = { x: 0, y: 0 };
  ctx.save();
  ctx.lineCap = "round";
  {
    ctx.beginPath();
    ctx.moveTo(pt.x - s, pt.y);
    ctx.bezierCurveTo(pt.x - s * 0.6, pt.y - s * 0.75, pt.x + s * 0.5, pt.y - s * 0.8, pt.x + s, pt.y);
    ctx.fillStyle = p.marble;
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.strokeStyle = p.ink;
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = lw * 0.7;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const hx = pt.x + s * (0.25 + i * 0.22);
      ctx.moveTo(hx, pt.y - s * 0.45 + i * s * 0.12);
      ctx.lineTo(hx - s * 0.12, pt.y - 0.5);
    }
    ctx.stroke();
  }
  ctx.restore();
}

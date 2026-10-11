import type { DrawContext, WorldBounds, WorldPoint } from "../../types";
import { clamp01, dist } from "../../utils/geometry";
import { drawDisc, gradientDisc } from "./sprites";
import { px } from "./common";

interface Cloud {
  x: number;
  y: number;
  puffs: { dx: number; dy: number; r: number }[];
  speed: number;
  outlined: boolean;
}

const cloudCache = new Map<string, Cloud[]>();

function cloudsFor(dc: DrawContext, bounds: WorldBounds, count: number): Cloud[] {
  const key = `${bounds.minX},${bounds.minY},${bounds.maxX},${bounds.maxY},${count}`;
  const cached = cloudCache.get(key);
  if (cached) return cached;
  const rng = dc.rng.fork(`clouds:${key}`);
  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  const clouds: Cloud[] = [];
  for (let i = 0; i < count; i++) {
    const edge = rng.chance(0.75);
    let x = bounds.minX + rng.next() * w;
    let y = bounds.minY + rng.next() * h;
    if (edge) {
      if (rng.chance(0.5)) y = rng.chance(0.5) ? bounds.minY + rng.next() * h * 0.14 : bounds.maxY - rng.next() * h * 0.14;
      else x = rng.chance(0.5) ? bounds.minX + rng.next() * w * 0.12 : bounds.maxX - rng.next() * w * 0.12;
    }
    const size = Math.min(w, h) * rng.range(0.05, 0.11);
    const puffs = Array.from({ length: rng.int(5, 9) }, () => ({
      dx: rng.range(-1.4, 1.4) * size,
      dy: rng.range(-0.35, 0.35) * size,
      r: rng.range(0.45, 0.85) * size,
    }));
    clouds.push({ x, y, puffs, speed: rng.range(0.6, 1.4), outlined: rng.chance(0.5) });
  }
  if (cloudCache.size > 32) cloudCache.clear();
  cloudCache.set(key, clouds);
  return clouds;
}

export interface FogOptions {
  bounds: WorldBounds;
  /** Selected/focused positions that fog must never hide. */
  exclusion?: WorldPoint[];
  count?: number;
}

/** Layer 14: slow-drifting low-alpha cloud banks, mostly over the margins. */
export function drawCloudsAndFog(dc: DrawContext, { bounds, exclusion = [], count = 18 }: FogOptions) {
  const { ctx, theme } = dc;
  const w = bounds.maxX - bounds.minX;
  const clouds = cloudsFor(dc, bounds, count);
  const drift = dc.reducedMotion ? 0 : dc.time * 0.005;
  const puff = gradientDisc(theme.palette.fog, [
    [0, 1],
    [0.6, 0.45],
    [1, 0],
  ]);
  ctx.save();
  for (const c of clouds) {
    let x = c.x + drift * c.speed;
    x = bounds.minX + ((((x - bounds.minX) % w) + w) % w);
    const center = { x, y: c.y };
    let fade = 1;
    for (const e of exclusion) fade = Math.min(fade, clamp01((dist(e, center) - 120) / 260));
    if (fade <= 0) continue;
    for (const p of c.puffs) {
      const px0 = x + p.dx;
      const py0 = c.y + p.dy;
      if (puff) drawDisc(ctx, puff, px0, py0, p.r, 0.11 * fade);
    }
    if (c.outlined) {
      ctx.strokeStyle = theme.palette.ivory;
      ctx.globalAlpha = 0.12 * fade;
      ctx.lineWidth = px(dc, 1);
      ctx.beginPath();
      for (const p of c.puffs) {
        if (p.dy > 0) continue;
        ctx.moveTo(x + p.dx + p.r * 0.7, c.y + p.dy - p.r * 0.7);
        ctx.arc(x + p.dx, c.y + p.dy, p.r, -Math.PI * 0.25, -Math.PI * 0.85, true);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

import type { DrawContext, WorldBounds } from "../../types";
import { createNoise2D } from "../../utils/noise";
import { hatchRect, isCulled, px } from "./common";

export interface MarbleTextureOptions {
  clip: Path2D;
  bounds: WorldBounds;
  intensity?: number;
}

/** Layer 5: veins, cracks, hatch patches and stipple, clipped to land and kept under 15% contrast. */
export function drawMarbleTexture(dc: DrawContext, { clip, bounds, intensity = 1 }: MarbleTextureOptions) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const t = theme.texture;
  const rng = dc.rng.fork("marble");
  const noise = createNoise2D(rng.int(0, 1e9));
  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  const area = w * h;
  const rx = () => bounds.minX + rng.next() * w;
  const ry = () => bounds.minY + rng.next() * h;

  ctx.save();
  ctx.clip(clip);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Veins: wandering, branching polylines.
  ctx.strokeStyle = p.vein;
  const veinCount = Math.max(2, Math.round((area / 70000) * intensity));
  const walk = (vr: typeof rng, x: number, y: number, angle: number, steps: number, width: number, alpha: number, depth: number) => {
    const pts: [number, number][] = [[x, y]];
    for (let s = 0; s < steps; s++) {
      angle += noise(x * 0.004, y * 0.004) * 0.35 + vr.range(-0.18, 0.18);
      x += Math.cos(angle) * 7;
      y += Math.sin(angle) * 7;
      pts.push([x, y]);
      if (depth < 1 && vr.chance(0.025)) {
        walk(vr, x, y, angle + vr.range(-1, 1), vr.int(6, 20), width * 0.6, alpha * 0.8, depth + 1);
      }
    }
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.beginPath();
    pts.forEach(([px0, py0], i) => (i === 0 ? ctx.moveTo(px0, py0) : ctx.lineTo(px0, py0)));
    ctx.stroke();
  };
  for (let i = 0; i < veinCount; i++) {
    const x = rx();
    const y = ry();
    const steps = rng.int(20, 60);
    const width = rng.range(0.4, 1.1);
    const alpha = t.veinAlpha * rng.range(0.4, 1) * intensity;
    const angle = rng.range(0, Math.PI * 2);
    if (isCulled(dc, { x, y }, steps * 7)) continue;
    walk(rng.fork(`vein:${i}`), x, y, angle, steps, width, alpha, 0);
  }

  // Cracks: short jagged lines.
  ctx.strokeStyle = p.ink;
  const crackCount = Math.round((area / 45000) * intensity);
  for (let i = 0; i < crackCount; i++) {
    let x = rx();
    let y = ry();
    const cr = rng.fork(`crack:${i}`);
    const segs = cr.int(3, 6);
    const alpha = t.crackAlpha * cr.range(0.5, 1);
    if (isCulled(dc, { x, y }, 40)) continue;
    let a = cr.range(0, Math.PI * 2);
    ctx.globalAlpha = alpha;
    ctx.lineWidth = Math.max(px(dc, 0.6), 0.4);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < segs; s++) {
      a += cr.range(-0.9, 0.9);
      x += Math.cos(a) * cr.range(2.5, 7);
      y += Math.sin(a) * cr.range(2.5, 7);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Engraved hatch patches.
  ctx.strokeStyle = p.inkSoft;
  const patches = Math.round((area / 220000) * intensity);
  for (let i = 0; i < patches; i++) {
    const cx = rx();
    const cy = ry();
    const r = rng.range(25, 70);
    const rot = rng.range(0, Math.PI);
    if (isCulled(dc, { x: cx, y: cy }, r)) continue;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.6, rot, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = t.hatchAlpha;
    ctx.lineWidth = Math.max(px(dc, 0.6), 0.4);
    hatchRect(ctx, cx - r, cy - r, r * 2, r * 2, 4);
    ctx.restore();
  }

  // Sparse stipple.
  ctx.fillStyle = p.inkSoft;
  const dots = Math.round((area / 900) * t.stippleDensity * intensity);
  for (let i = 0; i < dots; i++) {
    const x = rx();
    const y = ry();
    const s = rng.range(0.5, 1.1);
    const a = rng.range(0.06, 0.16);
    if (dc.cull && isCulled(dc, { x, y }, 2)) continue;
    ctx.globalAlpha = a;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

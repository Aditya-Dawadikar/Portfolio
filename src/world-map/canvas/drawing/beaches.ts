import type { Beach, DrawContext } from "../../types";
import { mix } from "../../utils/color";
import { polygonBounds } from "../../utils/geometry";
import { createRandom } from "../engine/seededRandom";
import { isCulled, px } from "./common";
import { ROCK_REF, rockAssetId } from "../assets/assetIds";
import { patternTile, q, stampAsset } from "./sprites";

function culled(dc: DrawContext, beach: Beach) {
  if (!dc.cull) return false;
  const b = polygonBounds(beach.path);
  const r = Math.max(b.maxX - b.minX, b.maxY - b.minY) / 2 + beach.width;
  return isCulled(dc, { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 }, r);
}

/** Sandy beach: tapered tan band inside the coast, stippled, with a dashed tide line offshore. Draw before the coast ink. */
export function drawSandyBeach(dc: DrawContext, beach: Beach) {
  if (culled(dc, beach)) return;
  const { ctx, theme } = dc;
  const p = theme.palette;
  const n = beach.path.length;
  const widthAt = (i: number) => beach.width * Math.pow(Math.sin(Math.PI * ((i + 0.5) / n)), 0.6);
  const inner = beach.path.map((pt, i) => ({ x: pt.x + beach.inland[i].x * widthAt(i), y: pt.y + beach.inland[i].y * widthAt(i) }));

  ctx.save();
  ctx.beginPath();
  beach.path.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(inner[i].x, inner[i].y);
  ctx.closePath();
  ctx.fillStyle = mix(p.marbleWarm, p.bronze, 0.45);
  ctx.globalAlpha = 0.85;
  ctx.fill();

  // Stipple: one cached sand tile filled across the band (no per-grain draw calls).
  const tile = patternTile(`sand|${theme.name}`, (c, size) => {
    const r = createRandom("sand-tile");
    c.fillStyle = p.inkSoft;
    for (let k = 0; k < size * 3; k++) {
      c.globalAlpha = r.range(0.2, 0.45);
      const s = r.range(0.5, 0.9);
      c.fillRect(r.range(0, size), r.range(0, size), s, s);
    }
  });
  const pattern = tile ? ctx.createPattern(tile as CanvasImageSource, "repeat") : null;
  if (pattern) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = pattern;
    ctx.fill();
  }

  // Tide line just offshore.
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = p.shallows;
  ctx.lineWidth = Math.max(px(dc, 0.8), 0.5);
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  beach.path.forEach((pt, i) => {
    const x = pt.x - beach.inland[i].x * 4;
    const y = pt.y - beach.inland[i].y * 4;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();
}

export const ROCK_VARIANTS = 12;

/** One boulder at the origin; `variant` fixes its outline and tone. */
export function drawRock(dc: DrawContext, size: number, variant: number) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const r0 = createRandom(`rock:${variant}`);
  const verts = r0.int(5, 7);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let v = 0; v < verts; v++) {
    const ang = (v / verts) * Math.PI * 2;
    const r = size * r0.range(0.65, 1.1);
    const x = Math.cos(ang) * r;
    const y = Math.sin(ang) * r * 0.8;
    if (v === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = mix(p.marbleShadow, p.marble, r0.range(0.2, 0.6));
  ctx.fill();
  ctx.strokeStyle = p.ink;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = Math.max(px(dc, 0.8), 0.5);
  ctx.stroke();
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(size * 0.15, -size * 0.35);
  ctx.lineTo(size * 0.45, size * 0.2);
  ctx.stroke();
  ctx.restore();
}

/** Rocky beach: irregular boulders straddling the coastline. Draw after the coast ink. */
export function drawRockyBeach(dc: DrawContext, beach: Beach) {
  if (culled(dc, beach)) return;
  const { ctx, theme } = dc;
  const p = theme.palette;
  const rng = createRandom(beach.id);
  const lw = Math.max(px(dc, 0.8), 0.5);
  const scale = beach.width / 10;
  ctx.save();
  ctx.lineJoin = "round";
  let carry = 0;
  for (let i = 1; i < beach.path.length; i++) {
    const a = beach.path[i - 1];
    const b = beach.path[i];
    carry += Math.hypot(b.x - a.x, b.y - a.y);
    if (carry < 5 * scale) continue;
    carry = 0;
    const count = rng.int(1, 2);
    for (let k = 0; k < count; k++) {
      const depth = rng.range(-0.35, 0.45) * beach.width;
      const along = rng.range(-2, 2);
      const cx = b.x + beach.inland[i].x * depth - beach.inland[i].y * along;
      const cy = b.y + beach.inland[i].y * depth + beach.inland[i].x * along;
      const size = q(rng.range(2, 5.5) * scale, 0.5);
      const variant = rng.int(0, ROCK_VARIANTS - 1);
      const rot = rng.range(0, Math.PI * 2);
      stampAsset(dc, { id: rockAssetId(variant), scale: size / ROCK_REF }, `rock|${variant}|${size}`, { ox: size * 1.2 + 1, oy: size * 1.2 + 1, w: size * 2.4 + 2, h: size * 2.4 + 2 }, { x: cx, y: cy }, (sdc) => drawRock(sdc, size, variant), {
        rotation: rot,
      });
    }
  }
  ctx.restore();
}

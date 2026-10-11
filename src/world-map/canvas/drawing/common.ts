import type { Ctx2D, DrawContext, WorldPoint } from "../../types";

/** Converts a screen-pixel width into world units at the current zoom. */
export const px = (dc: DrawContext, screenPx: number) => screenPx / dc.zoom;

export function isCulled(dc: DrawContext, p: WorldPoint, radius: number): boolean {
  const b = dc.cull;
  if (!b) return false;
  return p.x + radius < b.minX || p.x - radius > b.maxX || p.y + radius < b.minY || p.y - radius > b.maxY;
}

/** Diagonal hatching inside the current clip region. */
export function hatchRect(ctx: Ctx2D, x: number, y: number, w: number, h: number, spacing: number, angle = Math.PI / 4) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.hypot(w, h) / 2;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  ctx.beginPath();
  for (let o = -r; o <= r; o += spacing) {
    const px0 = cx - dy * o;
    const py0 = cy + dx * o;
    ctx.moveTo(px0 - dx * r, py0 - dy * r);
    ctx.lineTo(px0 + dx * r, py0 + dy * r);
  }
  ctx.stroke();
}

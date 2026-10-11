import type { DrawContext, MapTheme, River, WorldPoint, WorldPolygon, WorldPolyline } from "../../types";
import { mix } from "../../utils/color";
import { chaikin, lerp, smoothPolyline, tracePath } from "../../utils/geometry";
import { px } from "./common";

export const riverColor = (theme: MapTheme) => mix(theme.palette.sea, theme.palette.activeBlue, 0.2);

/** Variable-width ribbon polygon around a polyline. */
function ribbon(line: WorldPolyline, w0: number, w1: number): WorldPolygon {
  const left: WorldPoint[] = [];
  const right: WorldPoint[] = [];
  for (let i = 0; i < line.length; i++) {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const w = lerp(w0, w1, i / (line.length - 1)) / 2;
    const nx = -Math.sin(ang) * w;
    const ny = Math.cos(ang) * w;
    left.push({ x: line[i].x + nx, y: line[i].y + ny });
    right.push({ x: line[i].x - nx, y: line[i].y - ny });
  }
  return [...left, ...right.reverse()];
}

/**
 * Layer 7: tapering blue-ink river; tributaries drawn first. No inked banks, so rivers
 * merge seamlessly with lakes and with each other where they overlap.
 */
export function drawRiver(dc: DrawContext, river: Pick<River, "path" | "widthAtSource" | "widthAtMouth" | "tributaries">) {
  const { ctx, theme } = dc;
  for (const t of river.tributaries) drawRiver(dc, t);
  const line = smoothPolyline(river.path, 8);
  const poly = ribbon(line, river.widthAtSource, river.widthAtMouth);
  ctx.save();
  ctx.beginPath();
  tracePath(ctx, poly, true);
  ctx.fillStyle = riverColor(theme);
  ctx.fill();
  if (river.widthAtMouth > 4) {
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = theme.palette.shallows;
    ctx.setLineDash([6, 8]);
    ctx.lineWidth = Math.max(px(dc, 0.6), 0.4);
    ctx.beginPath();
    tracePath(ctx, line.slice(Math.floor(line.length * 0.4)), false);
    ctx.stroke();
  }
  ctx.restore();
}

/** A lake with a pale inner shallows ring and ink edge. */
export function drawLake(dc: DrawContext, { polygon }: { polygon: WorldPolygon }) {
  const { ctx, theme } = dc;
  const smooth = chaikin(polygon, 1, true);
  const path = new Path2D();
  tracePath(path, smooth, true);
  ctx.save();
  ctx.fillStyle = riverColor(theme);
  ctx.fill(path);
  ctx.clip(path);
  ctx.strokeStyle = theme.palette.shallows;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 5;
  ctx.stroke(path);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = theme.palette.ink;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = Math.max(px(dc, 1), 0.7);
  ctx.stroke(path);
  ctx.restore();
}

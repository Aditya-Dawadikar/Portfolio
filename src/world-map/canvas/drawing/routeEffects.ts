import type { DrawContext, WorldPolyline } from "../../types";
import { withAlpha } from "../../utils/color";
import { pointAlong, smoothPolyline, tracePath } from "../../utils/geometry";
import { px } from "./common";

export interface SeaRouteDrawOptions {
  path: WorldPolyline;
  highlighted?: boolean;
}

function drawShip(dc: DrawContext, x: number, y: number, angle: number) {
  const { ctx, theme } = dc;
  const s = px(dc, 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(s, s);
  ctx.fillStyle = theme.palette.ivory;
  ctx.strokeStyle = theme.palette.ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-7, -2.5);
  ctx.lineTo(5, -2.5);
  ctx.lineTo(8, 0);
  ctx.lineTo(5, 2.5);
  ctx.lineTo(-7, 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = theme.palette.activeBlue;
  ctx.beginPath();
  ctx.moveTo(-1, -2.5);
  ctx.lineTo(2, -8);
  ctx.lineTo(3, -2.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Layer 13: dotted ivory sea route; dim blue with a moving ship while highlighted. */
export function drawSeaRoute(dc: DrawContext, { path, highlighted = false }: SeaRouteDrawOptions) {
  const { ctx, theme } = dc;
  const line = smoothPolyline(path, 8);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  tracePath(ctx, line, false);
  if (highlighted) {
    ctx.strokeStyle = withAlpha(theme.palette.activeBlue, 0.18);
    ctx.lineWidth = px(dc, 7);
    ctx.stroke();
    ctx.strokeStyle = theme.palette.activeBlue;
    ctx.globalAlpha = 0.9;
  } else {
    ctx.strokeStyle = theme.palette.ivory;
    ctx.globalAlpha = 0.55;
  }
  ctx.lineWidth = px(dc, 1.8);
  ctx.setLineDash([px(dc, 0.5), px(dc, 6)]);
  ctx.lineDashOffset = highlighted && !dc.reducedMotion ? -dc.time * 0.004 * (1 / dc.zoom) : 0;
  ctx.stroke();
  ctx.restore();
  if (highlighted) {
    const t = dc.reducedMotion ? 0.5 : (dc.time / 7000) % 1;
    const { point, angle } = pointAlong(line, t);
    drawShip(dc, point.x, point.y, angle);
  }
}

/** Faint blue thread over a road connected to the selection. */
export function drawConnectionThread(dc: DrawContext, { path }: { path: WorldPolyline }) {
  const { ctx, theme } = dc;
  const line = smoothPolyline(path, 6);
  ctx.save();
  ctx.beginPath();
  tracePath(ctx, line, false);
  ctx.strokeStyle = theme.palette.activeBlue;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = px(dc, 6);
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = px(dc, 1.3);
  ctx.stroke();
  ctx.restore();
}

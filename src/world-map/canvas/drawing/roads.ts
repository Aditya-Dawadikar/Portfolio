import type { Bridge, DrawContext, Road } from "../../types";
import { mix } from "../../utils/color";
import { pointAlong, polylineLength, smoothPolyline, tracePath } from "../../utils/geometry";
import { px } from "./common";

/** Layer 9: dashed footpath (minor) or double-lined road with milestones (major). */
export function drawRoad(dc: DrawContext, { path, rank }: Pick<Road, "path" | "rank">) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const line = smoothPolyline(path, 6);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  tracePath(ctx, line, false);
  if (rank === "major") {
    ctx.strokeStyle = mix(p.ink, p.bronze, 0.35);
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 4.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = p.marbleWarm;
    ctx.lineWidth = 2.6;
    ctx.stroke();
    // Milestones.
    const len = polylineLength(line);
    ctx.strokeStyle = p.ink;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = Math.max(px(dc, 0.8), 0.6);
    ctx.beginPath();
    for (let d = 40; d < len - 20; d += 80) {
      const { point, angle } = pointAlong(line, d / len);
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);
      ctx.moveTo(point.x + nx * 3.2, point.y + ny * 3.2);
      ctx.lineTo(point.x + nx * 6, point.y + ny * 6);
    }
    ctx.stroke();
  } else {
    ctx.strokeStyle = mix(p.ink, p.bronze, 0.45);
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.3;
    ctx.setLineDash([6, 3.5]);
    ctx.stroke();
  }
  ctx.restore();
}

/** Stone, aqueduct and long-arch bridges, drawn over the river at a road crossing. */
export function drawBridge(dc: DrawContext, { position, angle, span, variant }: Bridge) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const L = span / 2;
  const lw = Math.max(px(dc, 1), 0.7);
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(angle);
  ctx.lineWidth = lw;
  ctx.strokeStyle = p.ink;
  ctx.fillStyle = p.marble;
  ctx.lineCap = "round";

  if (variant === "stone") {
    ctx.fillRect(-L, -3, span, 6);
    ctx.beginPath();
    ctx.moveTo(-L - 2, -4.5);
    ctx.lineTo(-L, -3);
    ctx.lineTo(L, -3);
    ctx.lineTo(L + 2, -4.5);
    ctx.moveTo(-L - 2, 4.5);
    ctx.lineTo(-L, 3);
    ctx.lineTo(L, 3);
    ctx.lineTo(L + 2, 4.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -3, 2.2, Math.PI, 0);
    ctx.moveTo(2.2, 3);
    ctx.arc(0, 3, 2.2, 0, Math.PI);
    ctx.globalAlpha = 0.7;
    ctx.stroke();
  } else if (variant === "aqueduct") {
    ctx.fillRect(-L, -2.6, span, 5.2);
    ctx.strokeRect(-L, -2.6, span, 5.2);
    const piers = Math.max(2, Math.round(span / 7));
    for (let i = 0; i <= piers; i++) {
      const x = -L + (span * i) / piers;
      ctx.fillRect(x - 1.4, -4.4, 2.8, 8.8);
      ctx.strokeRect(x - 1.4, -4.4, 2.8, 8.8);
      if (i < piers) {
        ctx.beginPath();
        ctx.arc(x + span / piers / 2, 4.4, Math.max(0.6, span / piers / 2 - 1.4), 0, Math.PI);
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    ctx.beginPath();
    ctx.moveTo(-L, 0);
    ctx.lineTo(L, 0);
    ctx.strokeStyle = mix(p.sea, p.activeBlue, 0.2);
    ctx.stroke();
  } else {
    ctx.fillRect(-L, -4, span, 8);
    ctx.beginPath();
    ctx.moveTo(-L, -4);
    ctx.lineTo(L, -4);
    ctx.moveTo(-L, 4);
    ctx.lineTo(L, 4);
    ctx.stroke();
    const piers = Math.max(2, Math.round(span / 10));
    for (let i = 1; i < piers; i++) {
      const x = -L + (span * i) / piers;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(x, side * 5.6, 1.8, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < piers; i++) {
      const x = -L + (span * (i + 0.5)) / piers;
      const r = Math.max(0.6, span / piers / 2 - 1.8);
      ctx.beginPath();
      ctx.arc(x, 4, r, 0, Math.PI);
      ctx.moveTo(x + r, -4);
      ctx.arc(x, -4, r, 0, Math.PI, true);
      ctx.stroke();
    }
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(-L, 0);
    ctx.lineTo(L, 0);
    ctx.stroke();
  }
  ctx.restore();
}

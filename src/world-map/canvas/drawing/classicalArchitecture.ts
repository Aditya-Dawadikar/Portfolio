import type { Ctx2D } from "../../types";
import { hatchRect } from "./common";

/**
 * Shared top-down architectural parts. All functions draw in the caller's local
 * stamp space and take an ArchStyle so line weight stays constant on screen.
 */
export interface ArchStyle {
  ink: string;
  fill: string;
  shade: string;
  bronze: string;
  water: string;
  /** Line width in local units. */
  lw: number;
}

export function building(
  ctx: Ctx2D,
  st: ArchStyle,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { hatch?: boolean; ridge?: boolean; rotation?: number } = {},
) {
  const { hatch = true, ridge = true, rotation = 0 } = opts;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rotation);
  ctx.fillStyle = st.fill;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  if (hatch) {
    ctx.save();
    ctx.beginPath();
    if (w >= h) ctx.rect(-w / 2, 0, w, h / 2);
    else ctx.rect(0, -h / 2, w / 2, h);
    ctx.clip();
    ctx.strokeStyle = st.shade;
    ctx.lineWidth = st.lw * 0.6;
    hatchRect(ctx, -w / 2, -h / 2, w, h, Math.max(1.1, st.lw * 2.4));
    ctx.restore();
  }
  ctx.strokeStyle = st.ink;
  ctx.lineWidth = st.lw;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  if (ridge) {
    ctx.beginPath();
    if (w >= h) {
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(w / 2, 0);
    } else {
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(0, h / 2);
    }
    ctx.lineWidth = st.lw * 0.7;
    ctx.stroke();
  }
  ctx.restore();
}

export function column(ctx: Ctx2D, st: ArchStyle, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = st.fill;
  ctx.fill();
  ctx.strokeStyle = st.ink;
  ctx.lineWidth = st.lw * 0.8;
  ctx.stroke();
}

export function colonnade(ctx: Ctx2D, st: ArchStyle, x1: number, y1: number, x2: number, y2: number, n: number, r: number) {
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    column(ctx, st, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, r);
  }
}

/** Columns around the perimeter of a rectangle. */
export function peristyle(ctx: Ctx2D, st: ArchStyle, x: number, y: number, w: number, h: number, spacing: number, r: number) {
  const nx = Math.max(2, Math.round(w / spacing) + 1);
  const ny = Math.max(2, Math.round(h / spacing) + 1);
  colonnade(ctx, st, x, y, x + w, y, nx, r);
  colonnade(ctx, st, x, y + h, x + w, y + h, nx, r);
  for (let i = 1; i < ny - 1; i++) {
    const t = i / (ny - 1);
    column(ctx, st, x, y + h * t, r);
    column(ctx, st, x + w, y + h * t, r);
  }
}

export function dashedCircle(ctx: Ctx2D, st: ArchStyle, x: number, y: number, r: number, alpha = 0.6) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = st.ink;
  ctx.globalAlpha *= alpha;
  ctx.lineWidth = st.lw * 0.7;
  ctx.setLineDash([st.lw * 3, st.lw * 2.5]);
  ctx.stroke();
  ctx.restore();
}

/** Closed wall polygon drawn as a double line with fill between. */
export function wall(ctx: Ctx2D, st: ArchStyle, pts: { x: number; y: number }[], thickness: number) {
  ctx.save();
  ctx.lineJoin = "miter";
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.strokeStyle = st.ink;
  ctx.lineWidth = thickness + st.lw * 2;
  ctx.stroke();
  ctx.strokeStyle = st.fill;
  ctx.lineWidth = thickness;
  ctx.stroke();
  ctx.restore();
}

export function crenellatedRing(ctx: Ctx2D, st: ArchStyle, x: number, y: number, r: number, crenels: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = st.fill;
  ctx.fill();
  ctx.strokeStyle = st.ink;
  ctx.lineWidth = st.lw;
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < crenels; i++) {
    const a = (i / crenels) * Math.PI * 2;
    ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(a) * (r + st.lw * 2.2), y + Math.sin(a) * (r + st.lw * 2.2));
  }
  ctx.stroke();
  ctx.restore();
}

export function dome(ctx: Ctx2D, st: ArchStyle, x: number, y: number, r: number, meridians = 6) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = st.fill;
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = st.shade;
  ctx.lineWidth = st.lw * 0.6;
  ctx.beginPath();
  for (let i = 0; i < meridians; i++) {
    const a = (i / meridians) * Math.PI * 2;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = st.ink;
  ctx.lineWidth = st.lw;
  ctx.stroke();
}

/** Row of arches seen from above as a pier ladder with semicircles on one side. */
export function arcade(ctx: Ctx2D, st: ArchStyle, x1: number, x2: number, y: number, n: number, depth: number) {
  const w = x2 - x1;
  ctx.save();
  ctx.fillStyle = st.fill;
  ctx.fillRect(x1, y - depth / 2, w, depth);
  ctx.strokeStyle = st.ink;
  ctx.lineWidth = st.lw;
  ctx.strokeRect(x1, y - depth / 2, w, depth);
  ctx.lineWidth = st.lw * 0.7;
  for (let i = 0; i < n; i++) {
    const cx = x1 + (w * (i + 0.5)) / n;
    const r = Math.max(0.3, w / n / 2 - st.lw);
    ctx.beginPath();
    ctx.arc(cx, y + depth / 2, r, 0, Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

/** Small bronze pennant: the non-colour marker for active/deployed projects. */
export function pennant(ctx: Ctx2D, st: ArchStyle, x: number, y: number, size: number) {
  ctx.save();
  ctx.strokeStyle = st.ink;
  ctx.lineWidth = st.lw * 0.8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - size * 1.6);
  ctx.stroke();
  ctx.fillStyle = st.bronze;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 1.6);
  ctx.lineTo(x + size * 1.1, y - size * 1.3);
  ctx.lineTo(x, y - size);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

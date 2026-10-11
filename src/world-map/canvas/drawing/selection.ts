import type { DrawContext, WorldPoint } from "../../types";
import { px } from "./common";
import { drawDisc, gradientDisc } from "./sprites";

export interface GlowOptions {
  position: WorldPoint;
  radius: number;
  /** 0–1; deployed 1, active ~0.6. */
  intensity: number;
}

/** Soft blue halo drawn beneath a stamp. Only for active/deployed items. */
export function drawActiveGlow(dc: DrawContext, { position, radius, intensity }: GlowOptions) {
  if (intensity <= 0) return;
  const { ctx, theme } = dc;
  const r = radius * theme.glow.radius;
  const inner = 0.25 / theme.glow.radius;
  const disc = gradientDisc(theme.palette.activeBlueGlow, [
    [0, 1],
    [inner, 1],
    [inner + 0.55 * (1 - inner), 0.35],
    [1, 0],
  ]);
  if (disc) drawDisc(ctx, disc, position.x, position.y, r, theme.glow.alpha * intensity);
}

/** Thin expanding ring; `progress` 0–1. Under reduced motion draws a static double ring. */
export function drawPulseRing(dc: DrawContext, { position, radius, progress }: { position: WorldPoint; radius: number; progress: number }) {
  const { ctx, theme } = dc;
  ctx.save();
  ctx.strokeStyle = theme.palette.activeBlue;
  ctx.lineWidth = px(dc, 1.5);
  if (dc.reducedMotion) {
    for (const k of [1.35, 1.6]) {
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius * k, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    for (const offset of [0, 0.5]) {
      const t = (progress + offset) % 1;
      ctx.globalAlpha = (1 - t) * 0.85;
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius * (1.1 + t * 1.3), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Selection: solid blue ring with faint outer ring and cardinal ticks. */
export function drawSelectionRing(dc: DrawContext, { position, radius }: { position: WorldPoint; radius: number }) {
  const { ctx, theme } = dc;
  const r = radius * 1.25;
  ctx.save();
  ctx.strokeStyle = theme.palette.activeBlue;
  ctx.lineWidth = px(dc, 2);
  ctx.beginPath();
  ctx.arc(position.x, position.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = px(dc, 1);
  ctx.beginPath();
  ctx.arc(position.x, position.y, r + px(dc, 5), 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = px(dc, 1.5);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    ctx.moveTo(position.x + Math.cos(a) * (r + px(dc, 3)), position.y + Math.sin(a) * (r + px(dc, 3)));
    ctx.lineTo(position.x + Math.cos(a) * (r + px(dc, 10)), position.y + Math.sin(a) * (r + px(dc, 10)));
  }
  ctx.stroke();
  ctx.restore();
}

/** Keyboard focus: dashed ink ring around a thin blue ring (distinguishable from selection without colour). */
export function drawFocusRing(dc: DrawContext, { position, radius }: { position: WorldPoint; radius: number }) {
  const { ctx, theme } = dc;
  ctx.save();
  ctx.strokeStyle = theme.palette.ink;
  ctx.lineWidth = px(dc, 1.5);
  ctx.setLineDash([px(dc, 4), px(dc, 3)]);
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius * 1.25 + px(dc, 8), 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = theme.palette.activeBlue;
  ctx.lineWidth = px(dc, 1);
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius * 1.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

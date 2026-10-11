import type { DebugOverlayFlags, DrawContext, GeneratedWorld } from "../../types";
import { smoothPolyline, tracePath } from "../../utils/geometry";
import { px } from "./common";

const MAGENTA = "#ff4fd8";
const CYAN = "#3ee6ff";
const LIME = "#a6ff4d";
const AMBER = "#ffb347";

export function drawDebugOverlays(dc: DrawContext, { world, flags }: { world: GeneratedWorld; flags: Partial<DebugOverlayFlags> }) {
  const { ctx } = dc;
  ctx.save();
  ctx.lineWidth = px(dc, 1.2);

  if (flags.territoryPolygons) {
    ctx.strokeStyle = MAGENTA;
    ctx.globalAlpha = 0.9;
    for (const r of world.regions) {
      ctx.beginPath();
      tracePath(ctx, r.cell, true);
      ctx.stroke();
      ctx.fillStyle = MAGENTA;
      ctx.beginPath();
      ctx.arc(r.site.x, r.site.y, px(dc, 4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.setLineDash([px(dc, 4), px(dc, 4)]);
    for (const r of world.regions) {
      for (const poly of r.polygons.slice(1)) {
        ctx.beginPath();
        tracePath(ctx, poly, true);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  }

  if (flags.hitRegions) {
    ctx.strokeStyle = CYAN;
    ctx.fillStyle = CYAN;
    for (const h of world.hitRegions) {
      if (h.kind !== "settlement") continue;
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.arc(h.center.x, h.center.y, h.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.stroke();
    }
  }

  if (flags.paths) {
    ctx.globalAlpha = 0.9;
    const draw = (pts: { x: number; y: number }[], color: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      tracePath(ctx, smoothPolyline(pts, 6), false);
      ctx.stroke();
      for (const p of pts) ctx.fillRect(p.x - px(dc, 2), p.y - px(dc, 2), px(dc, 4), px(dc, 4));
    };
    world.roads.forEach((r) => draw(r.path, LIME));
    world.terrain.rivers.forEach((r) => draw(r.path, CYAN));
    world.seaRoutes.forEach((r) => draw(r.path, AMBER));
    world.terrain.mountains.forEach((m) => draw(m.ridge, MAGENTA));
  }

  if (flags.anchors) {
    ctx.strokeStyle = AMBER;
    ctx.globalAlpha = 1;
    const cross = (x: number, y: number, s: number) => {
      ctx.beginPath();
      ctx.moveTo(x - s, y);
      ctx.lineTo(x + s, y);
      ctx.moveTo(x, y - s);
      ctx.lineTo(x, y + s);
      ctx.stroke();
    };
    world.settlements.forEach((s) => cross(s.position.x, s.position.y, px(dc, 7)));
    ctx.strokeStyle = MAGENTA;
    world.regions.forEach((r) => cross(r.labelAnchor.x, r.labelAnchor.y, px(dc, 12)));
  }

  if (flags.spatialIndex) {
    ctx.strokeStyle = LIME;
    ctx.globalAlpha = 0.25;
    const cell = 200;
    const b = world.bounds;
    ctx.beginPath();
    for (let x = b.minX; x <= b.maxX; x += cell) {
      ctx.moveTo(x, b.minY);
      ctx.lineTo(x, b.maxY);
    }
    for (let y = b.minY; y <= b.maxY; y += cell) {
      ctx.moveTo(b.minX, y);
      ctx.lineTo(b.maxX, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

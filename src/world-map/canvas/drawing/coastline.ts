import type { DrawContext, Landmass, TerritoryRegion, WorldPolygon } from "../../types";
import { mix } from "../../utils/color";
import { polygonBounds, polygonCentroid, tracePath } from "../../utils/geometry";
import { applyLineStyle } from "../styles/lineStyles";
import { px } from "./common";

export function landPath(landmasses: Landmass[]): Path2D {
  const path = new Path2D();
  for (const l of landmasses) tracePath(path, l.polygon, true);
  return path;
}

/** Off-white shallow-water rings drawn as thin offset contours around a coast (before land fill). */
export function drawShallowRings(dc: DrawContext, { polygon }: { polygon: WorldPolygon }) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const erase = p.sea;
  const thickness = Math.max(px(dc, 0.9), 0.8);
  const rings = [
    { offset: 22, alpha: 0.16 },
    { offset: 13, alpha: 0.28 },
    { offset: 6, alpha: 0.45 },
  ];
  ctx.save();
  ctx.lineJoin = "round";
  for (const ring of rings) {
    ctx.beginPath();
    tracePath(ctx, polygon, true);
    ctx.strokeStyle = mix(erase, p.shallows, ring.alpha);
    ctx.lineWidth = ring.offset * 2;
    ctx.stroke();
    ctx.strokeStyle = erase;
    ctx.lineWidth = ring.offset * 2 - thickness * 2;
    ctx.stroke();
  }
  ctx.restore();
}

/** Layer 4: marble land fill with large warm/cool tonal patches. */
export function drawLandFill(dc: DrawContext, { landmasses }: { landmasses: Landmass[] }) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const rng = dc.rng.fork("land-fill");
  const path = landPath(landmasses);
  ctx.save();
  ctx.fillStyle = p.marble;
  ctx.fill(path);
  ctx.clip(path);
  for (const land of landmasses) {
    const b = land.bounds;
    const w = b.maxX - b.minX;
    const h = b.maxY - b.minY;
    const blobs = Math.max(3, Math.round((w * h) / 260000));
    for (let i = 0; i < blobs; i++) {
      const warm = rng.chance(0.75);
      ctx.globalAlpha = warm ? rng.range(0.35, 0.6) : rng.range(0.08, 0.16);
      ctx.fillStyle = warm ? p.marbleWarm : p.marbleShadow;
      ctx.beginPath();
      ctx.ellipse(
        b.minX + rng.next() * w,
        b.minY + rng.next() * h,
        rng.range(0.08, 0.22) * Math.max(w, 200),
        rng.range(0.06, 0.18) * Math.max(h, 200),
        rng.range(0, Math.PI),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Layer 3b: hand-drawn ink coast contour with an inner engraved shade band and offshore rocks. */
export function drawCoastline(dc: DrawContext, { polygon, id }: { polygon: WorldPolygon; id: string }) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const rng = dc.rng.fork(`coast:${id}`);
  const path = new Path2D();
  tracePath(path, polygon, true);

  ctx.save();
  // Inner shade band, clipped to land.
  ctx.save();
  ctx.clip(path);
  ctx.strokeStyle = p.marbleShadow;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 9;
  ctx.lineJoin = "round";
  ctx.stroke(path);
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = p.inkSoft;
  ctx.stroke(path);
  ctx.restore();

  // Main contour plus a faint offset second pass for the hand-inked feel.
  applyLineStyle(ctx, theme.lines.coast, 1);
  ctx.lineWidth = Math.max(px(dc, 1.4), 1.3);
  ctx.stroke(path);
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = Math.max(px(dc, 0.8), 0.6);
  ctx.translate(0.8, 0.6);
  ctx.stroke(path);
  ctx.restore();

  // Rocks just offshore.
  const c = polygonCentroid(polygon);
  ctx.fillStyle = p.ink;
  for (let i = 0; i < polygon.length; i++) {
    if (!rng.chance(0.06)) continue;
    const v = polygon[i];
    const dx = v.x - c.x;
    const dy = v.y - c.y;
    const len = Math.hypot(dx, dy) || 1;
    const n = rng.int(1, 3);
    for (let k = 0; k < n; k++) {
      const off = rng.range(5, 11);
      ctx.globalAlpha = rng.range(0.5, 0.85);
      ctx.beginPath();
      ctx.arc(v.x + (dx / len) * off + rng.range(-3, 3), v.y + (dy / len) * off + rng.range(-3, 3), rng.range(0.8, 1.9), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Layer 8: dash-dot bronze borders on edges shared between territory cells, clipped to land. */
export function drawTerritoryBorders(dc: DrawContext, { regions, landmasses }: { regions: TerritoryRegion[]; landmasses: Landmass[] }) {
  const { ctx, theme } = dc;
  const continent = landmasses.filter((l) => l.kind === "continent");
  if (continent.length === 0) return;
  const key = (x: number, y: number) => `${Math.round(x)},${Math.round(y)}`;
  const seen = new Set<string>();
  const edges: [number, number, number, number][] = [];
  for (const r of regions) {
    const cell = r.cell;
    for (let i = 0; i < cell.length; i++) {
      const a = cell[i];
      const b = cell[(i + 1) % cell.length];
      const k1 = `${key(a.x, a.y)}|${key(b.x, b.y)}`;
      const k2 = `${key(b.x, b.y)}|${key(a.x, a.y)}`;
      if (seen.has(k1) || seen.has(k2)) continue;
      seen.add(k1);
      edges.push([a.x, a.y, b.x, b.y]);
    }
  }
  const clip = landPath(continent);
  ctx.save();
  ctx.clip(clip);
  ctx.beginPath();
  for (const [ax, ay, bx, by] of edges) {
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
  }
  ctx.strokeStyle = theme.palette.bronze;
  ctx.globalAlpha = 0.1;
  ctx.lineWidth = 9;
  ctx.stroke();
  applyLineStyle(ctx, theme.lines.territoryBorder, 1);
  ctx.lineWidth = Math.max(px(dc, 1.3), 1.2);
  ctx.stroke();
  ctx.restore();
}

export function landmassFromPolygon(id: string, polygon: WorldPolygon, kind: Landmass["kind"] = "island"): Landmass {
  return { id, kind, polygon, bounds: polygonBounds(polygon) };
}

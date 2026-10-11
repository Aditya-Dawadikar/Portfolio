import type { DrawContext, SeededRandom, TreeType, WorldPoint, WorldPolygon } from "../../types";
import { clamp01, distToPolyline, lerp, pointInPolygon, polygonBounds } from "../../utils/geometry";
import { isCulled, px } from "./common";
import { TREE_REF, treeAssetId } from "../assets/assetIds";
import { q, stampAsset } from "./sprites";

function treePath(type: TreeType, s: number): Path2D {
  const p = new Path2D();
  if (type === "cypress") {
    p.moveTo(0, -14 * s);
    p.bezierCurveTo(4 * s, -9 * s, 3.4 * s, -2.5 * s, 1.2 * s, 0);
    p.lineTo(-1.2 * s, 0);
    p.bezierCurveTo(-3.4 * s, -2.5 * s, -4 * s, -9 * s, 0, -14 * s);
  } else if (type === "olive") {
    const cy = -6.5 * s;
    const r = 4.6 * s;
    const lumps = 6;
    for (let i = 0; i <= lumps; i++) {
      const a = (i / lumps) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.85;
      if (i === 0) p.moveTo(x, y);
      else {
        const am = ((i - 0.5) / lumps) * Math.PI * 2;
        p.quadraticCurveTo(Math.cos(am) * r * 1.35, cy + Math.sin(am) * r * 1.15, x, y);
      }
    }
    p.closePath();
  } else {
    p.moveTo(0, -14 * s);
    p.lineTo(3.4 * s, -8.5 * s);
    p.lineTo(1.8 * s, -8.8 * s);
    p.lineTo(4.6 * s, -3.6 * s);
    p.lineTo(2.2 * s, -3.8 * s);
    p.lineTo(5.4 * s, 0);
    p.lineTo(-5.4 * s, 0);
    p.lineTo(-2.2 * s, -3.8 * s);
    p.lineTo(-4.6 * s, -3.6 * s);
    p.lineTo(-1.8 * s, -8.8 * s);
    p.lineTo(-3.4 * s, -8.5 * s);
    p.closePath();
  }
  return p;
}

export interface TreeOptions {
  position: WorldPoint;
  scale: number;
  treeType: TreeType;
}

/** A single tree stamp: ground shadow, marble fill, ink outline, one shade stroke. */
export function drawTree(dc: DrawContext, { position, scale, treeType }: TreeOptions) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const s = scale * 0.7;
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.fillStyle = p.marbleShadow;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(2.5 * s, 0.6 * s, 4.2 * s, 1.3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  const path = treePath(treeType, s);
  ctx.globalAlpha = 1;
  ctx.fillStyle = p.marble;
  ctx.fill(path);
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = Math.max(px(dc, 0.9), 0.6);
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.85;
  ctx.stroke(path);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth *= 0.8;
  ctx.beginPath();
  if (treeType === "olive") {
    ctx.moveTo(0, -1.8 * s);
    ctx.lineTo(0, 1 * s);
    ctx.moveTo(2 * s, -9 * s);
    ctx.quadraticCurveTo(4 * s, -6.5 * s, 2.4 * s, -3.4 * s);
  } else {
    ctx.moveTo(1 * s, -10 * s);
    ctx.lineTo(2.2 * s, -1.5 * s);
  }
  ctx.stroke();
  ctx.restore();
}

export interface ForestOptions {
  polygon: WorldPolygon;
  density: number;
  treeType: TreeType;
  rng: SeededRandom;
}

/** Layer 6: staggered tree stamps inside a polygon, thinning towards the edge. */
export function drawForestCluster(dc: DrawContext, { polygon, density, treeType, rng }: ForestOptions) {
  const b = polygonBounds(polygon);
  const spacing = lerp(15, 8, clamp01(density));
  const trees: { x: number; y: number; s: number }[] = [];
  let row = 0;
  for (let y = b.minY; y <= b.maxY; y += spacing * 0.8, row++) {
    for (let x = b.minX + (row % 2 ? spacing / 2 : 0); x <= b.maxX; x += spacing) {
      const pt = { x: x + rng.range(-0.35, 0.35) * spacing, y: y + rng.range(-0.3, 0.3) * spacing };
      const keepRoll = rng.next();
      const scaleRoll = rng.range(0.8, 1.2);
      if (!pointInPolygon(pt, polygon)) continue;
      const edge = clamp01(distToPolyline(pt, polygon, true) / (spacing * 2.2));
      if (keepRoll > 0.25 + 0.75 * edge) continue;
      trees.push({ ...pt, s: scaleRoll * (0.75 + 0.25 * edge) });
    }
  }
  trees.sort((a, c) => a.y - c.y);
  for (const t of trees) {
    if (isCulled(dc, t, 12)) continue;
    stampTree(dc, { position: t, scale: t.s, treeType });
  }
}

/** Same look as drawTree, stamped from the shared sprite cache. */
function stampTree(dc: DrawContext, { position, scale, treeType }: TreeOptions) {
  const b = q(scale);
  const s = b * 0.7;
  stampAsset(dc, { id: treeAssetId(treeType), scale: b / TREE_REF }, `tree|${treeType}|${b}`, { ox: 6.5 * s + 1, oy: 15 * s + 1, w: 14.5 * s + 2, h: 17.5 * s + 2 }, position, (sdc) =>
    drawTree(sdc, { position: { x: 0, y: 0 }, scale: b, treeType }),
  );
}

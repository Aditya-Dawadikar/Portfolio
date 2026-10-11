import type { WorldBounds, WorldPoint, WorldPolygon, WorldPolyline } from "../types";

export const TAU = Math.PI * 2;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const clamp01 = (v: number) => clamp(v, 0, 1);

export const dist = (a: WorldPoint, b: WorldPoint) => Math.hypot(a.x - b.x, a.y - b.y);
export const lerpPoint = (a: WorldPoint, b: WorldPoint, t: number): WorldPoint => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

export function pointInPolygon(p: WorldPoint, poly: WorldPolygon): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

export function polygonBounds(poly: WorldPoint[]): WorldBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of poly) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

export const boundsContains = (b: WorldBounds, p: WorldPoint, pad = 0) =>
  p.x >= b.minX - pad && p.x <= b.maxX + pad && p.y >= b.minY - pad && p.y <= b.maxY + pad;

export const expandBounds = (b: WorldBounds, pad: number): WorldBounds => ({
  minX: b.minX - pad,
  minY: b.minY - pad,
  maxX: b.maxX + pad,
  maxY: b.maxY + pad,
});

export function polygonArea(poly: WorldPolygon): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += (poly[j].x + poly[i].x) * (poly[j].y - poly[i].y);
  }
  return Math.abs(a / 2);
}

export function polygonCentroid(poly: WorldPolygon): WorldPoint {
  let x = 0;
  let y = 0;
  for (const p of poly) {
    x += p.x;
    y += p.y;
  }
  return { x: x / poly.length, y: y / poly.length };
}

/** Corner-cutting smoothing. */
export function chaikin(points: WorldPoint[], iterations = 1, closed = true): WorldPoint[] {
  let pts = points;
  for (let it = 0; it < iterations; it++) {
    const out: WorldPoint[] = [];
    const n = pts.length;
    const last = closed ? n : n - 1;
    if (!closed) out.push(pts[0]);
    for (let i = 0; i < last; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      out.push(lerpPoint(a, b, 0.25), lerpPoint(a, b, 0.75));
    }
    if (!closed) out.push(pts[n - 1]);
    pts = out;
  }
  return pts;
}

/** Catmull-Rom through the control points of an open polyline. */
export function smoothPolyline(points: WorldPolyline, samples = 6): WorldPolyline {
  if (points.length < 3) return points.slice();
  const out: WorldPoint[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < samples; s++) {
      const t = s / samples;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export function distToSegment(p: WorldPoint, a: WorldPoint, b: WorldPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : clamp01(((p.x - a.x) * dx + (p.y - a.y) * dy) / len2);
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

export function distToPolyline(p: WorldPoint, line: WorldPoint[], closed = false): number {
  let best = Infinity;
  const n = line.length;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const d = distToSegment(p, line[i], line[(i + 1) % n]);
    if (d < best) best = d;
  }
  return best;
}

export function nearestPointOnPolyline(p: WorldPoint, line: WorldPoint[], closed = false): WorldPoint {
  let best = Infinity;
  let out = line[0];
  const n = line.length;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = line[i];
    const b = line[(i + 1) % n];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : clamp01(((p.x - a.x) * dx + (p.y - a.y) * dy) / len2);
    const q = { x: a.x + dx * t, y: a.y + dy * t };
    const d = dist(p, q);
    if (d < best) {
      best = d;
      out = q;
    }
  }
  return out;
}

export function segmentIntersection(a: WorldPoint, b: WorldPoint, c: WorldPoint, d: WorldPoint): WorldPoint | null {
  const r = { x: b.x - a.x, y: b.y - a.y };
  const s = { x: d.x - c.x, y: d.y - c.y };
  const denom = r.x * s.y - r.y * s.x;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / denom;
  const u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: a.x + r.x * t, y: a.y + r.y * t };
}

export function polylineLength(line: WorldPolyline): number {
  let len = 0;
  for (let i = 1; i < line.length; i++) len += dist(line[i - 1], line[i]);
  return len;
}

/** Point and tangent angle at fraction t (0–1) of the polyline's length. */
export function pointAlong(line: WorldPolyline, t: number): { point: WorldPoint; angle: number } {
  const total = polylineLength(line);
  let target = clamp01(t) * total;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const seg = dist(a, b);
    if (target <= seg || i === line.length - 1) {
      const k = seg === 0 ? 0 : Math.min(1, target / seg);
      return { point: lerpPoint(a, b, k), angle: Math.atan2(b.y - a.y, b.x - a.x) };
    }
    target -= seg;
  }
  return { point: line[0], angle: 0 };
}

export function tracePath(ctx: CanvasPath, pts: WorldPoint[], closed: boolean) {
  if (pts.length === 0) return;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  if (closed) ctx.closePath();
}

/** Sutherland–Hodgman against the half-plane dot(p, n) <= c. */
export function clipPolygonHalfPlane(poly: WorldPolygon, n: WorldPoint, c: number): WorldPolygon {
  const out: WorldPolygon = [];
  const inside = (p: WorldPoint) => p.x * n.x + p.y * n.y <= c;
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const cIn = inside(cur);
    const pIn = inside(prev);
    if (cIn !== pIn) {
      const dp = prev.x * n.x + prev.y * n.y;
      const dc = cur.x * n.x + cur.y * n.y;
      const t = (c - dp) / (dc - dp);
      out.push(lerpPoint(prev, cur, t));
    }
    if (cIn) out.push(cur);
  }
  return out;
}

export function noisyBlob(
  center: WorldPoint,
  radius: number,
  vertices: number,
  roughness: number,
  rand: () => number,
): WorldPolygon {
  const phases = [rand() * TAU, rand() * TAU, rand() * TAU];
  const pts: WorldPolygon = [];
  for (let i = 0; i < vertices; i++) {
    const a = (i / vertices) * TAU;
    const r =
      radius *
      (1 +
        roughness *
          (0.5 * Math.sin(a * 2 + phases[0]) + 0.3 * Math.sin(a * 3 + phases[1]) + 0.2 * Math.sin(a * 5 + phases[2])) +
        (rand() - 0.5) * roughness * 0.25);
    pts.push({ x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r });
  }
  return chaikin(pts, 2, true);
}

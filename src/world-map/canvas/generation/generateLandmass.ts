import type { Landmass, SeededRandom, WorldGenerationOptions, WorldPoint } from "../../types";
import { chaikin, dist, distToPolyline, pointInPolygon, polygonBounds, TAU } from "../../utils/geometry";
import { createNoise2D, fbm } from "../../utils/noise";
import { sampleInt } from "../../utils/range";

export interface LandmassResult {
  landmasses: Landmass[];
  continent: Landmass;
  center: WorldPoint;
  /** Distance from `center` to the continent coast at a given angle. */
  radiusAt: (angle: number) => number;
}

/** Pipeline step 3: noise-distorted radial continent plus satellite islands. */
export function generateLandmass(rng: SeededRandom, options: WorldGenerationOptions): LandmassResult {
  const { width: W, height: H, coastRoughness, islandCount } = options;
  const center = { x: W / 2, y: H / 2 };
  const rx = W * 0.33;
  const ry = H * 0.32;
  const noise = createNoise2D(rng.int(0, 2 ** 31));
  const ox = rng.range(0, 100);
  const oy = rng.range(0, 100);

  const radial = (a: number) => {
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    const broad = fbm(noise, nx * 1.3 + ox, ny * 1.3 + oy, 3);
    const fine = fbm(noise, nx * 5 + ox + 40, ny * 5 + oy + 40, 3);
    return 1 + broad * 0.34 * (0.6 + coastRoughness) + fine * 0.09 * coastRoughness * 2;
  };
  const radiusAt = (a: number) => radial(a) * Math.hypot(rx * Math.cos(a), ry * Math.sin(a));

  const N = 220;
  const raw: WorldPoint[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU;
    const r = radial(a);
    raw.push({ x: center.x + Math.cos(a) * rx * r, y: center.y + Math.sin(a) * ry * r });
  }
  const contPoly = chaikin(raw, 1, true);
  const continent: Landmass = { id: "continent", kind: "continent", polygon: contPoly, bounds: polygonBounds(contPoly) };

  const islands: Landmass[] = [];
  const islandNoise = createNoise2D(rng.int(0, 2 ** 31));
  const islands_n = sampleInt(rng.fork("island-count"), islandCount);
  for (let i = 0; i < islands_n; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const angle = rng.range(0, TAU);
      const size = rng.range(40, 120) * (i < 2 ? 1.3 : 1);
      const d = radiusAt(angle) + size + rng.range(50, 170);
      const c = { x: center.x + Math.cos(angle) * d, y: center.y + Math.sin(angle) * d };
      if (c.x < size + 50 || c.y < size + 50 || c.x > W - size - 50 || c.y > H - size - 50) continue;
      if (pointInPolygon(c, contPoly) || distToPolyline(c, contPoly, true) < size + 45) continue;
      if (islands.some((o) => dist(c, { x: (o.bounds.minX + o.bounds.maxX) / 2, y: (o.bounds.minY + o.bounds.maxY) / 2 }) < size + (o.bounds.maxX - o.bounds.minX) / 2 + 50)) continue;
      const pts: WorldPoint[] = [];
      const n = 40;
      const seedOff = rng.range(0, 100);
      const stretch = rng.range(0.6, 1);
      const rot = rng.range(0, TAU);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU;
        const r = size * (1 + 0.38 * fbm(islandNoise, Math.cos(a) * 1.6 + seedOff, Math.sin(a) * 1.6 + seedOff, 3));
        const lx = Math.cos(a) * r;
        const ly = Math.sin(a) * r * stretch;
        pts.push({ x: c.x + lx * Math.cos(rot) - ly * Math.sin(rot), y: c.y + lx * Math.sin(rot) + ly * Math.cos(rot) });
      }
      const poly = chaikin(pts, 2, true);
      islands.push({ id: `island-${i}`, kind: "island", polygon: poly, bounds: polygonBounds(poly) });
      break;
    }
  }
  return { landmasses: [continent, ...islands], continent, center, radiusAt };
}

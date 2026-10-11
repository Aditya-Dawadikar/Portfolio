import type { Beach, BeachKind, Landmass, SeededRandom, Ship, WorldBounds, WorldGenerationOptions, WorldPoint } from "../../types";
import { boundsContains, dist, distToPolyline, noisyBlob, pointInPolygon, polygonBounds, TAU } from "../../utils/geometry";
import { createNoise2D } from "../../utils/noise";
import { sampleInt, sampleRange } from "../../utils/range";

/** Unit normal at polygon vertex i, pointing out of the landmass. */
function outwardNormal(poly: WorldPoint[], i: number): WorldPoint {
  const n = poly.length;
  const a = poly[(i - 2 + n) % n];
  const b = poly[(i + 2) % n];
  const len = dist(a, b) || 1;
  let nx = (b.y - a.y) / len;
  let ny = -(b.x - a.x) / len;
  if (pointInPolygon({ x: poly[i].x + nx * 4, y: poly[i].y + ny * 4 }, poly)) {
    nx = -nx;
    ny = -ny;
  }
  return { x: nx, y: ny };
}

/** Clusters of small islets a short sail off each mainland coast. Decorative: no territory owns them. */
export function generateCoastalIslets(
  rng: SeededRandom,
  mainland: Landmass[],
  existing: Landmass[],
  o: NonNullable<WorldGenerationOptions["coastalIslets"]>,
  bounds: WorldBounds,
): Landmass[] {
  const out: Landmass[] = [];
  const clear = (q: WorldPoint, r: number) =>
    [...existing, ...out].every((l) => {
      if (!boundsContains(l.bounds, q, r + 80)) return true;
      return !pointInPolygon(q, l.polygon) && distToPolyline(q, l.polygon, true) > r + 10;
    });

  for (const home of mainland) {
    const r = rng.fork(`islets:${home.id}`);
    const poly = home.polygon;
    const clusters = sampleInt(r, o.clusters);
    for (let c = 0; c < clusters; c++) {
      const perCluster = sampleInt(r, o.perCluster);
      const distance = sampleRange(r, o.distance);
      const spread = sampleRange(r, o.spread);
      const i = r.int(0, poly.length - 1);
      const n = outwardNormal(poly, i);
      const center = { x: poly[i].x + n.x * (distance + spread * 0.5), y: poly[i].y + n.y * (distance + spread * 0.5) };
      let placed = 0;
      for (let k = 0; k < perCluster * 8 && placed < perCluster; k++) {
        const size = Math.max(3, sampleRange(r, o.size));
        const a = r.range(0, TAU);
        const d = Math.sqrt(r.next()) * spread;
        const q = { x: center.x + Math.cos(a) * d, y: center.y + Math.sin(a) * d };
        if (!boundsContains(bounds, q, -(size + 40)) || !clear(q, size)) continue;
        const polygon = noisyBlob(q, size, 12, 0.42, r.next);
        out.push({ id: `islet-${home.id}-${c}-${placed}`, kind: "island", polygon, bounds: polygonBounds(polygon) });
        placed++;
      }
    }
  }
  return out;
}

/** Sandy and rocky runs along every coastline, chosen by low-frequency noise along the perimeter. */
export function generateBeaches(rng: SeededRandom, landmasses: Landmass[], o: NonNullable<WorldGenerationOptions["beaches"]>): Beach[] {
  const noise = createNoise2D(rng.int(0, 2 ** 31));
  const beaches: Beach[] = [];
  landmasses.forEach((land, li) => {
    const poly = land.polygon;
    let s = 0;
    let run: { kind: BeachKind; idx: number[] } | null = null;
    const flush = () => {
      if (run && run.idx.length >= 3) {
        beaches.push({
          id: `beach-${land.id}-${beaches.length}`,
          landmassId: land.id,
          kind: run.kind,
          path: run.idx.map((i) => poly[i]),
          inland: run.idx.map((i) => {
            const n = outwardNormal(poly, i);
            return { x: -n.x, y: -n.y };
          }),
          width: sampleRange(rng, o.width) * (land.kind === "island" && land.bounds.maxX - land.bounds.minX < 80 ? 0.6 : 1),
        });
      }
      run = null;
    };
    for (let i = 0; i < poly.length; i++) {
      if (i > 0) s += dist(poly[i - 1], poly[i]);
      const coverage = (noise(s / 140, li * 13.7) + 1) / 2;
      const kindNoise = (noise(s / 260 + 50, li * 7.1) + 1) / 2;
      const kind: BeachKind | null = coverage > 1 - o.amount ? (kindNoise < o.rocky ? "rocky" : "sandy") : null;
      if (!kind || (run && run.kind !== kind)) flush();
      if (kind) {
        if (!run) run = { kind, idx: [] };
        run.idx.push(i);
      }
    }
    flush();
  });
  return beaches;
}

/** Open-sea ships across the world and small boats hugging each territory's coast. */
export function generateShips(
  rng: SeededRandom,
  landmasses: Landmass[],
  mainland: Landmass[],
  o: NonNullable<WorldGenerationOptions["ships"]>,
  bounds: WorldBounds,
): Ship[] {
  const ships: Ship[] = [];
  const landClearance = (p: WorldPoint, pad: number) =>
    landmasses.every((l) => !boundsContains(l.bounds, p, pad) || (!pointInPolygon(p, l.polygon) && distToPolyline(p, l.polygon, true) > pad));
  const shipClear = (p: WorldPoint, gap: number) => ships.every((s) => dist(s.position, p) > gap);

  // Ocean: galleys and sailboats well away from any shore.
  const sea = rng.fork("ships:ocean");
  const oceanCount = sampleInt(sea, o.ocean);
  for (let k = 0, made = 0; k < oceanCount * 30 && made < oceanCount; k++) {
    const p = { x: sea.range(bounds.minX + 60, bounds.maxX - 60), y: sea.range(bounds.minY + 60, bounds.maxY - 60) };
    const kind = sea.chance(0.45) ? "galley" : "sailboat";
    const scale = Math.max(0.3, sampleRange(sea, o.size));
    const heading = sea.range(0, TAU);
    if (!landClearance(p, 90 * scale) || !shipClear(p, 160)) continue;
    ships.push({ id: `ship-ocean-${made}`, kind, position: p, heading, scale });
    made++;
  }

  // Coast: sailboats and rowboats just offshore, mostly running along the coastline.
  for (const home of mainland) {
    const r = rng.fork(`ships:${home.id}`);
    const count = sampleInt(r, o.coastal);
    const poly = home.polygon;
    for (let k = 0, made = 0; k < count * 25 && made < count; k++) {
      const i = r.int(0, poly.length - 1);
      const n = outwardNormal(poly, i);
      const kind = r.chance(0.55) ? "rowboat" : "sailboat";
      const scale = Math.max(0.3, sampleRange(r, o.size));
      const off = r.range(26, 70) * scale;
      const p = { x: poly[i].x + n.x * off, y: poly[i].y + n.y * off };
      const along = Math.atan2(n.x, -n.y) + (r.chance(0.5) ? 0 : Math.PI);
      const heading = along + r.range(-0.5, 0.5);
      if (!landClearance(p, 16 * scale) || !shipClear(p, 60)) continue;
      ships.push({ id: `ship-${home.id}-${made}`, kind, position: p, heading, scale });
      made++;
    }
  }
  return ships;
}

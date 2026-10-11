/**
 * Bakes every atlas stamp (src/world-map/canvas/assets/catalog.ts) into PNG sprite sheets.
 *
 *   pnpm atlas:assets
 *
 * Output: public/atlas/assets/<group>-<level>x-<n>.png plus manifest.json. Each asset is
 * rendered with the same vector function the map uses, at every resolution level in its
 * definition, trimmed to its visible pixels and shelf-packed. Rerun after changing any
 * drawing function or the theme; the map falls back to live drawing for missing assets.
 */
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { Path2D, createCanvas, type Canvas } from "@napi-rs/canvas";
import { ASSUMED_DPR, atlasAssetCatalog } from "../src/world-map/canvas/assets/catalog";
import type { AssetRect, AtlasAssetManifest } from "../src/world-map/canvas/assets/atlasAssets";
import { createRandom } from "../src/world-map/canvas/engine/seededRandom";
import { midnightMarbleTheme } from "../src/world-map/canvas/styles/mapTheme";
import type { Ctx2D, DrawContext } from "../src/world-map/types";

// The drawing code builds shapes with the browser's global Path2D.
(globalThis as unknown as { Path2D: typeof Path2D }).Path2D = Path2D;

const OUT_DIR = path.join(process.cwd(), "public", "atlas", "assets");
const SHEET_WIDTH = 2048;
const PAD = 2;

interface Baked {
  id: string;
  level: number;
  canvas: Canvas;
  /** Destination rect relative to the anchor, in asset units. */
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

/** Renders one asset at `level` device px per unit and trims it to its visible pixels. */
function bake(def: ReturnType<typeof atlasAssetCatalog>[number], level: number): Baked | null {
  const { box } = def;
  const w = Math.ceil(box.w * level);
  const h = Math.ceil(box.h * level);
  const full = createCanvas(w, h);
  const ctx = full.getContext("2d");
  ctx.scale(level, level);
  ctx.translate(box.ox, box.oy);
  const dc: DrawContext = {
    ctx: ctx as unknown as Ctx2D,
    theme: midnightMarbleTheme,
    rng: createRandom(def.id),
    // Hairlines are sized in CSS px: world stamps assume ASSUMED_DPR, screen-space assets draw at zoom 1.
    zoom: def.screenSpace ? 1 : level / ASSUMED_DPR,
    lod: "near",
    reducedMotion: false,
    time: 0,
  };
  def.render(dc);

  const { data } = ctx.getImageData(0, 0, w, h);
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] === 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return null;
  // One transparent pixel of margin keeps antialiased edges from bleeding into neighbours.
  x0 = Math.max(0, x0 - 1);
  y0 = Math.max(0, y0 - 1);
  x1 = Math.min(w - 1, x1 + 1);
  y1 = Math.min(h - 1, y1 + 1);
  const tw = x1 - x0 + 1;
  const th = y1 - y0 + 1;
  const trimmed = createCanvas(tw, th);
  trimmed.getContext("2d").drawImage(full, x0, y0, tw, th, 0, 0, tw, th);
  return { id: def.id, level, canvas: trimmed, dx: x0 / level - box.ox, dy: y0 / level - box.oy, dw: tw / level, dh: th / level };
}

/** Shelf-packs sprites into sheets at most SHEET_WIDTH wide and tall. */
function pack(items: Baked[]) {
  const sorted = [...items].sort((a, b) => b.canvas.height - a.canvas.height || a.id.localeCompare(b.id));
  const sheets: { width: number; height: number; placed: { item: Baked; x: number; y: number }[] }[] = [];
  let cur = { width: 0, height: 0, placed: [] as { item: Baked; x: number; y: number }[] };
  let x = 0;
  let y = 0;
  let rowH = 0;
  for (const item of sorted) {
    const { width: w, height: h } = item.canvas;
    if (x + w > SHEET_WIDTH) {
      x = 0;
      y += rowH + PAD;
      rowH = 0;
    }
    if (y + h > SHEET_WIDTH && cur.placed.length) {
      sheets.push(cur);
      cur = { width: 0, height: 0, placed: [] };
      x = 0;
      y = 0;
      rowH = 0;
    }
    cur.placed.push({ item, x, y });
    cur.width = Math.max(cur.width, x + w);
    cur.height = Math.max(cur.height, y + h);
    x += w + PAD;
    rowH = Math.max(rowH, h);
  }
  if (cur.placed.length) sheets.push(cur);
  return sheets;
}

async function main() {
  const t0 = Date.now();
  const defs = atlasAssetCatalog();
  const ids = new Set<string>();
  for (const d of defs) {
    if (ids.has(d.id)) throw new Error(`Duplicate asset id ${d.id}`);
    ids.add(d.id);
  }

  // Group by sheet family (group × level).
  const families = new Map<string, Baked[]>();
  for (const def of defs) {
    for (const level of def.levels) {
      const baked = bake(def, level);
      if (!baked) {
        console.warn(`! ${def.id} @${level}x drew nothing`);
        continue;
      }
      const key = `${def.group}|${level}`;
      families.set(key, [...(families.get(key) ?? []), baked]);
    }
  }

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest: AtlasAssetManifest = { version: "", theme: midnightMarbleTheme.name, sheets: [], assets: {} };
  const hash = createHash("sha256");
  let totalBytes = 0;
  let totalPixels = 0;
  for (const [key, items] of Array.from(families.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    const [group, levelStr] = key.split("|");
    const level = Number(levelStr);
    pack(items).forEach((sheet, n) => {
      const canvas = createCanvas(sheet.width, sheet.height);
      const ctx = canvas.getContext("2d");
      const index = manifest.sheets.length;
      for (const { item, x, y } of sheet.placed) {
        ctx.drawImage(item.canvas, x, y);
        const rect: AssetRect = [index, x, y, item.canvas.width, item.canvas.height, round(item.dx), round(item.dy), round(item.dw), round(item.dh)];
        (manifest.assets[item.id] ??= { levels: {} }).levels[String(level)] = rect;
      }
      const file = `${group}-${level}x-${n}.png`;
      const png = canvas.toBuffer("image/png");
      fs.writeFileSync(path.join(OUT_DIR, file), png);
      hash.update(png);
      totalBytes += png.length;
      totalPixels += sheet.width * sheet.height;
      manifest.sheets.push({ file, level, width: sheet.width, height: sheet.height });
      console.log(`  ${file.padEnd(28)} ${String(sheet.placed.length).padStart(4)} sprites  ${sheet.width}×${sheet.height}  ${(png.length / 1024).toFixed(0)} KB`);
    });
  }
  manifest.version = hash.digest("hex").slice(0, 12);
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest));
  console.log(
    `Baked ${defs.length} assets into ${manifest.sheets.length} sheets (${(totalBytes / 1024 / 1024).toFixed(2)} MB, ${(totalPixels / 1e6).toFixed(1)} MP) in ${((Date.now() - t0) / 1000).toFixed(1)} s → ${path.relative(process.cwd(), OUT_DIR)}`,
  );
}

const round = (v: number) => Math.round(v * 1000) / 1000;

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Runtime side of the pre-rendered PNG assets (public/atlas/assets, built by
 * scripts/build-atlas-assets.ts). Sheets load lazily per resolution level; until the
 * level a stamp needs is loaded, `drawAsset` returns false and the caller falls back
 * to the live vector sprite, so the map never waits on (or breaks without) the PNGs.
 */
import type { DrawContext, WorldPoint } from "../../types";

const ATLAS_ASSET_BASE = "/atlas/assets/";

/** [sheet index, sx, sy, sw, sh, dx, dy, dw, dh]: source pixels, then destination relative to the anchor in asset units. */
export type AssetRect = [number, number, number, number, number, number, number, number, number];

export interface AtlasAssetManifest {
  version: string;
  theme: string;
  sheets: { file: string; level: number; width: number; height: number }[];
  assets: Record<string, { levels: Record<string, AssetRect> }>;
}

type SheetImage = ImageBitmap | HTMLCanvasElement | HTMLImageElement;

let manifest: AtlasAssetManifest | null = null;
let manifestPromise: Promise<AtlasAssetManifest | null> | null = null;
const sheets = new Map<number, SheetImage>();
const sheetLoads = new Map<number, Promise<void>>();
const listeners = new Set<() => void>();
/** Sorted level list per asset, computed once. */
const levelCache = new Map<string, number[]>();

/** Called whenever a sheet finishes loading, so the map can redraw sharper. */
export function onAtlasAssetsChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function loadManifest(): Promise<AtlasAssetManifest | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  manifestPromise ??= fetch(`${ATLAS_ASSET_BASE}manifest.json`, { cache: "no-cache" })
    .then((r) => (r.ok ? (r.json() as Promise<AtlasAssetManifest>) : null))
    .then((m) => (manifest = m))
    .catch(() => null);
  return manifestPromise;
}

/**
 * Decodes a sheet into CPU memory: the big terrain caches are CPU-backed canvases, and
 * stamping a GPU-backed image into them forces a readback per call.
 */
async function decodeSheet(url: string): Promise<SheetImage> {
  const blob = await (await fetch(url)).blob();
  const bitmap = await createImageBitmap(blob);
  if (typeof OffscreenCanvas === "undefined") return bitmap;
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return bitmap;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas.transferToImageBitmap();
}

function loadSheet(index: number): Promise<void> {
  const existing = sheetLoads.get(index);
  if (existing) return existing;
  const m = manifest;
  if (!m) return Promise.resolve();
  const sheet = m.sheets[index];
  const p = decodeSheet(`${ATLAS_ASSET_BASE}${sheet.file}?v=${m.version}`)
    .then((img) => {
      sheets.set(index, img);
      listeners.forEach((fn) => fn());
    })
    .catch(() => {
      /* keep using the vector fallback */
    });
  sheetLoads.set(index, p);
  return p;
}

/**
 * Loads the manifest plus every sheet at or below `maxLevel` (enough for the overview).
 * Higher levels load on demand as the camera zooms in. Never rejects.
 */
export async function preloadAtlasAssets(maxLevel = 2): Promise<void> {
  const m = await loadManifest();
  if (!m) return;
  await Promise.all(m.sheets.map((s, i) => (s.level <= maxLevel ? loadSheet(i) : null)));
}

function levelsOf(id: string, levels: Record<string, AssetRect>): number[] {
  let list = levelCache.get(id);
  if (!list) {
    list = Object.keys(levels)
      .map(Number)
      .sort((a, b) => a - b);
    levelCache.set(id, list);
  }
  return list;
}

interface DrawAssetOptions {
  /** Multiplier from the baked reference size to the drawn size. */
  scale?: number;
  rotation?: number;
  alpha?: number;
  grayscale?: boolean;
  flipX?: boolean;
}

/**
 * Blits asset `id` with its anchor at `at`, choosing the smallest baked level that is at
 * least as sharp as the current transform needs. Returns false if it couldn't (no manifest,
 * other theme, unknown id, or the needed sheet still loading); the caller then draws vector.
 */
export function drawAsset(dc: DrawContext, id: string, at: WorldPoint, opts: DrawAssetOptions = {}): boolean {
  const m = manifest;
  if (!m) {
    void loadManifest();
    return false;
  }
  if (m.theme !== dc.theme.name) return false;
  const entry = m.assets[id];
  if (!entry) return false;
  const { scale = 1, rotation = 0, alpha = 1, grayscale = false, flipX = false } = opts;
  if (alpha <= 0) return true;

  const { ctx } = dc;
  const t = ctx.getTransform();
  const need = (Math.hypot(t.a, t.b) || 1) * scale;
  const levels = levelsOf(id, entry.levels);
  const target = levels.find((l) => l >= need) ?? levels[levels.length - 1];
  // Prefer the target level; otherwise any sharper level that's already loaded.
  let rect: AssetRect | null = null;
  for (const l of levels) {
    if (l < target) continue;
    const r = entry.levels[l];
    if (sheets.has(r[0])) {
      rect = r;
      break;
    }
    if (l === target) void loadSheet(r[0]);
  }
  if (!rect) return false;

  const [sheet, sx, sy, sw, sh, dx, dy, dw, dh] = rect;
  const img = sheets.get(sheet)!;
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = prevAlpha * alpha;
  if (grayscale) ctx.filter = "grayscale(1)";
  if (rotation === 0 && !flipX) {
    ctx.drawImage(img as CanvasImageSource, sx, sy, sw, sh, at.x + dx * scale, at.y + dy * scale, dw * scale, dh * scale);
  } else {
    ctx.save();
    ctx.translate(at.x, at.y);
    if (rotation) ctx.rotate(rotation);
    ctx.scale(flipX ? -scale : scale, scale);
    ctx.drawImage(img as CanvasImageSource, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.restore();
  }
  if (grayscale) ctx.filter = "none";
  ctx.globalAlpha = prevAlpha;
  return true;
}

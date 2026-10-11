import type { Ctx2D, DrawContext, WorldPoint } from "../../types";
import { drawAsset } from "../assets/atlasAssets";

/**
 * Sprite cache. Repeated stamps (trees, mountains, hills, waves, rocks, settlements,
 * glows, fog puffs, compass) are drawn once with their vector function into an
 * offscreen bitmap, then stamped with drawImage, which is far cheaper than
 * re-running fill/stroke per element.
 *
 * Resolution follows the current transform, quantised to quarter-octaves (≤19% apart,
 * always rounded up) so continuous zooming reuses sprites instead of re-rendering them.
 */
type SpriteCanvas = HTMLCanvasElement | OffscreenCanvas;
/** What gets stamped: an immutable ImageBitmap where supported (fastest drawImage source). */
type SpriteImage = SpriteCanvas | ImageBitmap;

export interface SpriteBox {
  /** Anchor offset inside the sprite, in world units (the anchor is drawn at `at`). */
  ox: number;
  oy: number;
  /** Sprite size in world units. */
  w: number;
  h: number;
}

interface Sprite extends SpriteBox {
  canvas: SpriteImage;
}

/** Freeze a finished canvas into an ImageBitmap; drawing from a live canvas makes Chrome snapshot it on every call. */
function freeze(canvas: SpriteCanvas): SpriteImage {
  if (typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) return canvas.transferToImageBitmap();
  return canvas;
}

/**
 * Sprites live in CPU memory: the large cached terrain canvases are CPU-backed, and
 * stamping a GPU-backed sprite into them forces a readback per call (~40× slower in Chrome).
 */
const SPRITE_CTX = { willReadFrequently: true } as const;

const cache = new Map<string, Sprite | null>();
const CACHE_LIMIT = 4000;
const MAX_SPRITE_PX = 1024;

function makeCanvas(w: number, h: number): SpriteCanvas | null {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  return null;
}

/** Device pixels per world unit for the current transform. */
const pixelScale = (ctx: Ctx2D) => {
  const m = ctx.getTransform();
  return Math.hypot(m.a, m.b) || 1;
};

const bucketScale = (s: number) => Math.pow(2, Math.ceil(Math.log2(s) * 4) / 4);

/**
 * Returns a cached sprite for `key`, rendering it with `render` on first use.
 * `render` draws around the origin in world units; line widths stay hairline because
 * the sprite context's zoom mirrors the caller's screen scale.
 */
function getSprite(dc: DrawContext, key: string, box: SpriteBox, render: (sdc: DrawContext) => void): Sprite | null {
  const actual = pixelScale(dc.ctx);
  const pxs = bucketScale(actual);
  const cssPerDevice = dc.zoom / actual;
  const full = `${dc.theme.name}|${key}|${pxs.toFixed(4)}|${cssPerDevice.toFixed(3)}`;
  if (cache.has(full)) return cache.get(full) ?? null;

  const wPx = Math.ceil(box.w * pxs);
  const hPx = Math.ceil(box.h * pxs);
  let sprite: Sprite | null = null;
  if (wPx > 0 && hPx > 0 && wPx <= MAX_SPRITE_PX && hPx <= MAX_SPRITE_PX) {
    const canvas = makeCanvas(wPx, hPx);
    const sctx = canvas?.getContext("2d", SPRITE_CTX) as Ctx2D | null;
    if (canvas && sctx) {
      sctx.scale(pxs, pxs);
      sctx.translate(box.ox, box.oy);
      render({ ...dc, ctx: sctx, zoom: pxs * cssPerDevice, cull: undefined });
      sprite = { canvas: freeze(canvas), ...box };
    }
  }
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(full, sprite);
  return sprite;
}

/** Stamps a sprite with its anchor at `at`, optionally rotated, faded or desaturated. */
export function blit(dc: DrawContext, sprite: Sprite, at: WorldPoint, opts: { rotation?: number; alpha?: number; scale?: number; grayscale?: boolean; flipX?: boolean } = {}) {
  const { ctx } = dc;
  const { rotation = 0, alpha = 1, scale = 1, grayscale = false, flipX = false } = opts;
  if (alpha <= 0) return;
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = prevAlpha * alpha;
  if (grayscale) ctx.filter = "grayscale(1)";
  if (rotation === 0 && scale === 1 && !flipX) {
    ctx.drawImage(sprite.canvas as CanvasImageSource, at.x - sprite.ox, at.y - sprite.oy, sprite.w, sprite.h);
  } else {
    ctx.save();
    ctx.translate(at.x, at.y);
    if (rotation) ctx.rotate(rotation);
    if (scale !== 1 || flipX) ctx.scale(flipX ? -scale : scale, scale);
    ctx.drawImage(sprite.canvas as CanvasImageSource, -sprite.ox, -sprite.oy, sprite.w, sprite.h);
    ctx.restore();
  }
  if (grayscale) ctx.filter = "none";
  ctx.globalAlpha = prevAlpha;
}

/** Convenience: get-or-render then blit; falls back to direct vector drawing if sprites are unavailable. */
export function stamp(
  dc: DrawContext,
  key: string,
  box: SpriteBox,
  at: WorldPoint,
  render: (sdc: DrawContext) => void,
  opts?: Parameters<typeof blit>[3],
) {
  const sprite = getSprite(dc, key, box, render);
  if (sprite) {
    blit(dc, sprite, at, opts);
    return;
  }
  const { ctx } = dc;
  ctx.save();
  ctx.translate(at.x, at.y);
  if (opts?.rotation) ctx.rotate(opts.rotation);
  if (opts?.scale || opts?.flipX) ctx.scale((opts.flipX ? -1 : 1) * (opts.scale ?? 1), opts.scale ?? 1);
  if (opts?.alpha != null) ctx.globalAlpha *= opts.alpha;
  render(dc);
  ctx.restore();
}

/**
 * Draws the pre-rendered PNG asset `asset.id` (baked at a reference size; `asset.scale`
 * maps it to this stamp's size). Falls back to `stamp` with the same vector render
 * while the PNG sheets are loading, or if they're unavailable.
 */
export function stampAsset(
  dc: DrawContext,
  asset: { id: string; scale: number },
  key: string,
  box: SpriteBox,
  at: WorldPoint,
  render: (sdc: DrawContext) => void,
  opts?: Parameters<typeof blit>[3],
) {
  if (drawAsset(dc, asset.id, at, { ...opts, scale: asset.scale * (opts?.scale ?? 1) })) return;
  stamp(dc, key, box, at, render, opts);
}

/** Quantise a continuous size so similar stamps share a sprite. */
export const q = (v: number, step = 0.05) => Math.round(v / step) * step;

const discCache = new Map<string, SpriteImage | null>();

/**
 * A radial-gradient disc rendered once at 128px. Gradients are smooth, so one bitmap
 * scales to any radius; use globalAlpha for intensity. Stops: [offset 0–1, alpha 0–1].
 */
export function gradientDisc(color: string, stops: [number, number][]): SpriteImage | null {
  const key = `${color}|${stops.map((s) => s.join(":")).join(",")}`;
  if (discCache.has(key)) return discCache.get(key) ?? null;
  const size = 128;
  const canvas = makeCanvas(size, size);
  const c = canvas?.getContext("2d", SPRITE_CTX) as Ctx2D | null;
  if (!canvas || !c) {
    discCache.set(key, null);
    return null;
  }
  const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  const hex = color.replace("#", "");
  const [r, gg, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (const [o, a] of stops) g.addColorStop(o, `rgba(${r}, ${gg}, ${b}, ${a})`);
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  const image = freeze(canvas);
  discCache.set(key, image);
  return image;
}

/** Draws a gradient disc centred at (x, y) with world radius r. */
export function drawDisc(ctx: Ctx2D, disc: SpriteImage, x: number, y: number, r: number, alpha: number) {
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * alpha;
  ctx.drawImage(disc as CanvasImageSource, x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = prev;
}

const patternTiles = new Map<string, SpriteImage | null>();

/**
 * A repeating texture tile (64×64 world units at 1px per unit), drawn once by `render`.
 * Use with ctx.createPattern to texture large areas without per-dot draw calls.
 */
export function patternTile(key: string, render: (c: Ctx2D, size: number) => void): SpriteImage | null {
  if (patternTiles.has(key)) return patternTiles.get(key) ?? null;
  const size = 64;
  const canvas = makeCanvas(size, size);
  const c = canvas?.getContext("2d", SPRITE_CTX) as Ctx2D | null;
  if (!canvas || !c) {
    patternTiles.set(key, null);
    return null;
  }
  render(c, size);
  const image = freeze(canvas);
  patternTiles.set(key, image);
  return image;
}

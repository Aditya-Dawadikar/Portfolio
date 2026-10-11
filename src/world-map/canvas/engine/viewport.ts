import type { LodLevel, ScreenPoint, ViewportSize, ViewportState, WorldBounds, WorldPoint } from "../../types";
import { clamp } from "../../utils/geometry";

export function worldToScreen(v: ViewportState, size: ViewportSize, p: WorldPoint): ScreenPoint {
  return { x: (p.x - v.x) * v.zoom + size.width / 2, y: (p.y - v.y) * v.zoom + size.height / 2 };
}

export function screenToWorld(v: ViewportState, size: ViewportSize, p: ScreenPoint): WorldPoint {
  return { x: (p.x - size.width / 2) / v.zoom + v.x, y: (p.y - size.height / 2) / v.zoom + v.y };
}

/** Viewport that fits the world's land area, with zoom limits derived from it. */
export function fitViewport(bounds: WorldBounds, size: ViewportSize, focus?: WorldBounds): ViewportState {
  const target = focus ?? bounds;
  const w = target.maxX - target.minX;
  const h = target.maxY - target.minY;
  // Portrait screens crop the sides a little rather than showing mostly sea.
  const portrait = size.width / size.height < 0.8;
  const zoom = Math.min(size.width / w, size.height / h) * (portrait ? 1.55 : 1);
  const worldFit = Math.min(size.width / (bounds.maxX - bounds.minX), size.height / (bounds.maxY - bounds.minY));
  return {
    x: (target.minX + target.maxX) / 2,
    y: (target.minY + target.maxY) / 2,
    zoom,
    baseZoom: zoom,
    minZoom: Math.min(worldFit * 0.9, zoom * 0.8),
    maxZoom: Math.max(zoom * 8, 3.2),
  };
}

export function clampViewport(v: ViewportState, bounds: WorldBounds): ViewportState {
  return {
    ...v,
    zoom: clamp(v.zoom, v.minZoom, v.maxZoom),
    x: clamp(v.x, bounds.minX, bounds.maxX),
    y: clamp(v.y, bounds.minY, bounds.maxY),
  };
}

/** Zoom by `factor` keeping the world point under `anchor` fixed on screen. */
export function zoomAt(v: ViewportState, size: ViewportSize, anchor: ScreenPoint, factor: number): ViewportState {
  const zoom = clamp(v.zoom * factor, v.minZoom, v.maxZoom);
  const before = screenToWorld(v, size, anchor);
  const next = { ...v, zoom };
  const after = screenToWorld(next, size, anchor);
  return { ...next, x: v.x + (before.x - after.x), y: v.y + (before.y - after.y) };
}

export function visibleBounds(v: ViewportState, size: ViewportSize, pad = 0): WorldBounds {
  const hw = size.width / 2 / v.zoom + pad;
  const hh = size.height / 2 / v.zoom + pad;
  return { minX: v.x - hw, minY: v.y - hh, maxX: v.x + hw, maxY: v.y + hh };
}

/** Zoom relative to the home view. */
export const relativeZoom = (v: ViewportState) => v.zoom / (v.baseZoom ?? v.minZoom / 0.9);

/** far: zoomed out past home (landmarks + major only) · mid: home to 1.8× · near: beyond (names, all detail). */
export function lodFor(v: ViewportState): LodLevel {
  const rel = relativeZoom(v);
  if (rel < 0.85) return "far";
  if (rel < 1.8) return "mid";
  return "near";
}

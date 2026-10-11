"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ScreenPoint, ViewportSize, ViewportState, WorldBounds, WorldPoint } from "../types";
import { createCameraAnimation, sampleCamera } from "../canvas/engine/camera";
import { clampViewport, fitViewport, zoomAt } from "../canvas/engine/viewport";

/**
 * Owns the camera: clamped viewport state, eased flights and inertial glide.
 * `viewport` is React state for overlays; `viewportRef` is always current for the render loop.
 */
export function useMapViewport(
  bounds: WorldBounds | null,
  focus: WorldBounds | null,
  size: ViewportSize | null,
  reducedMotion: boolean,
) {
  const [viewport, setViewportState] = useState<ViewportState | null>(null);
  const viewportRef = useRef<ViewportState | null>(null);
  const rafRef = useRef<number | null>(null);
  const homeRef = useRef<ViewportState | null>(null);
  const [moving, setMoving] = useState(false);

  const commit = useCallback(
    (v: ViewportState) => {
      if (!bounds) return;
      const c = clampViewport(v, bounds);
      viewportRef.current = c;
      setViewportState(c);
    },
    [bounds],
  );

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setMoving(false);
  }, []);

  // Fit on first measure / world change; keep centre and relative zoom on resize.
  const boundsKey = bounds ? `${bounds.maxX}x${bounds.maxY}` : "";
  const focusKey = focus ? `${focus.minX}:${focus.minY}:${focus.maxX}:${focus.maxY}` : "";
  useEffect(() => {
    if (!bounds || !size) return;
    const home = fitViewport(bounds, size, focus ?? undefined);
    const prevHome = homeRef.current;
    const cur = viewportRef.current;
    const sameWorld = prevHome && prevHome.x === home.x && prevHome.y === home.y;
    homeRef.current = home;
    if (cur && prevHome && sameWorld) {
      commit({ ...home, x: cur.x, y: cur.y, zoom: home.zoom * (cur.zoom / prevHome.zoom) });
    } else {
      commit(home);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsKey, focusKey, size?.width, size?.height, commit]);

  const animateTo = useCallback(
    (target: Partial<ViewportState>, durationMs = 800) => {
      const from = viewportRef.current;
      if (!from || !bounds) return;
      stop();
      const to = clampViewport({ ...from, ...target }, bounds);
      if (reducedMotion) {
        commit(to);
        return;
      }
      setMoving(true);
      const anim = createCameraAnimation(from, to, durationMs);
      const tick = (now: number) => {
        const { viewport: v, done } = sampleCamera(anim, now);
        commit(v);
        if (done) {
          rafRef.current = null;
          setMoving(false);
        } else rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [bounds, commit, reducedMotion, stop],
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      const v = viewportRef.current;
      if (!v) return;
      if (rafRef.current != null) stop();
      commit({ ...v, x: v.x - dx / v.zoom, y: v.y - dy / v.zoom });
    },
    [commit, stop],
  );

  const zoomAtPoint = useCallback(
    (factor: number, anchor: ScreenPoint) => {
      const v = viewportRef.current;
      if (!v || !size) return;
      if (rafRef.current != null) stop();
      commit(zoomAt(v, size, anchor, factor));
    },
    [commit, size, stop],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const v = viewportRef.current;
      if (!v) return;
      animateTo({ zoom: v.zoom * factor }, 280);
    },
    [animateTo],
  );

  /** Inertial glide after a drag; velocity in screen px per ms. Friction ≈ 0.92 per 60fps frame. */
  const glide = useCallback(
    (vx: number, vy: number) => {
      if (reducedMotion || Math.hypot(vx, vy) < 0.08) return;
      stop();
      setMoving(true);
      let last = performance.now();
      let velX = vx;
      let velY = vy;
      const tick = (now: number) => {
        const dt = Math.min(32, now - last);
        last = now;
        const v = viewportRef.current;
        if (!v) return;
        commit({ ...v, x: v.x - (velX * dt) / v.zoom, y: v.y - (velY * dt) / v.zoom });
        const decay = Math.pow(0.92, dt / 16.67);
        velX *= decay;
        velY *= decay;
        if (Math.hypot(velX, velY) > 0.01) rafRef.current = requestAnimationFrame(tick);
        else {
          rafRef.current = null;
          setMoving(false);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [commit, reducedMotion, stop],
  );

  /** Fly to a world point; screen offsets shift it off-centre (e.g. to clear a side panel or sheet). */
  const flyTo = useCallback(
    (p: WorldPoint, zoom?: number, screenOffsetX = 0, screenOffsetY = 0) => {
      const v = viewportRef.current;
      if (!v) return;
      const z = Math.min(zoom ?? v.zoom, v.maxZoom);
      animateTo({ x: p.x + screenOffsetX / z, y: p.y + screenOffsetY / z, zoom: z });
    },
    [animateTo],
  );

  const fitBounds = useCallback(
    (b: WorldBounds, screenOffsetX = 0) => {
      if (!size) return;
      const v = viewportRef.current;
      const zoom = Math.min((size.width - Math.abs(screenOffsetX) * 2) / (b.maxX - b.minX), size.height / (b.maxY - b.minY)) * 0.85;
      animateTo({ x: (b.minX + b.maxX) / 2 + screenOffsetX / zoom, y: (b.minY + b.maxY) / 2, zoom: v ? Math.max(v.minZoom, zoom) : zoom });
    },
    [animateTo, size],
  );

  const reset = useCallback(() => {
    if (homeRef.current) animateTo(homeRef.current);
  }, [animateTo]);

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  return { viewport, viewportRef, moving, panBy, zoomAtPoint, zoomBy, glide, flyTo, fitBounds, animateTo, reset, stop };
}

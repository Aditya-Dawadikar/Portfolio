"use client";

import { type MutableRefObject, useEffect, useRef, useState } from "react";
import type {
  GeneratedWorld,
  MapTarget,
  MapTheme,
  ScreenPoint,
  Settlement,
  SettlementVisualState,
  ViewportSize,
  ViewportState,
} from "../../types";
import { onAtlasAssetsChange } from "../../canvas/assets/atlasAssets";
import { hitTest } from "../../canvas/engine/hitTesting";
import { type CrispFrame, type StaticTier, buildCrispFrame, buildStaticTier, renderFrame, viewportKey } from "../../canvas/engine/mapRenderer";
import { screenToWorld } from "../../canvas/engine/viewport";

/** Rendered terrain per world object; freed automatically when the world is no longer referenced. */
const tierCache = new WeakMap<GeneratedWorld, { theme: MapTheme; tiers: StaticTier[] }>();

export interface MapCanvasProps {
  world: GeneratedWorld;
  theme: MapTheme;
  size: ViewportSize;
  viewport: ViewportState;
  viewportRef: MutableRefObject<ViewportState | null>;
  moving: boolean;
  isSettlementVisible: (s: Settlement) => boolean;
  stateFor: (s: Settlement) => Partial<SettlementVisualState>;
  highlightedIds: Set<string>;
  selectedId: string | null;
  pulseActive: boolean;
  reducedMotion: boolean;
  showFog?: boolean;
  active: boolean;
  ariaLabel: string;
  onPan: (dx: number, dy: number) => void;
  onZoomAt: (factor: number, anchor: ScreenPoint) => void;
  onGlide: (vx: number, vy: number) => void;
  onHover: (target: MapTarget | null, pointer: ScreenPoint | null) => void;
  onSelect: (target: MapTarget | null) => void;
  onDragChange?: (dragging: boolean) => void;
  onReady?: () => void;
}

/** Canvas renderer + pointer surface. Converts pointer to world coords, hit-tests, and composites frames. */
export function MapCanvas(props: MapCanvasProps) {
  const { world, theme, size } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const tiersRef = useRef<StaticTier[]>([]);
  const crispRef = useRef<CrispFrame | null>(null);
  const dirtyRef = useRef(true);
  const hoverRef = useRef<MapTarget | null>(null);

  // Static cache: one low-resolution tier for fast panning. Sharpness comes from the
  // viewport-sized crisp frame rendered once the camera settles; a full-resolution
  // world-sized tier (~12.6 MP) cost ~6 s of rasterisation and was dropped.
  useEffect(() => {
    crispRef.current = null;
    const cached = tierCache.get(world);
    if (cached && cached.theme === theme) {
      tiersRef.current = cached.tiers;
    } else {
      // Cap the bitmap's long side so a grown world doesn't make the cache huge.
      const longSide = Math.max(world.bounds.maxX - world.bounds.minX, world.bounds.maxY - world.bounds.minY);
      tiersRef.current = [buildStaticTier(world, theme, Math.min(0.45, 2600 / longSide))];
      tierCache.set(world, { theme, tiers: tiersRef.current });
    }
    dirtyRef.current = true;
    propsRef.current.onReady?.();
  }, [world, theme]);

  // A PNG sheet finished loading (e.g. a sharper level after zooming in): redraw with it.
  const [assetsVersion, setAssetsVersion] = useState(0);
  useEffect(
    () =>
      onAtlasAssetsChange(() => {
        crispRef.current = null;
        dirtyRef.current = true;
        setAssetsVersion((v) => v + 1);
      }),
    [],
  );

  // Any prop change marks the frame dirty.
  useEffect(() => {
    dirtyRef.current = true;
  });

  // Sharp re-render of the visible region once the camera has settled.
  useEffect(() => {
    if (props.moving) return;
    const v = props.viewport;
    const best = tiersRef.current[tiersRef.current.length - 1];
    const need = v.zoom * size.devicePixelRatio;
    if (best && best.factor >= need * 1.02) return;
    const id = window.setTimeout(() => {
      const cur = propsRef.current.viewportRef.current;
      if (!cur || viewportKey(cur, size) !== viewportKey(v, size)) return;
      crispRef.current = buildCrispFrame(world, theme, v, size);
      dirtyRef.current = true;
    }, 180);
    return () => window.clearTimeout(id);
  }, [props.viewport, props.moving, size, world, theme, assetsVersion]);

  // Render loop: redraw when dirty or animating; paused when inactive.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !props.active) return;
    canvas.width = Math.round(size.width * size.devicePixelRatio);
    canvas.height = Math.round(size.height * size.devicePixelRatio);
    dirtyRef.current = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const start = performance.now();
    let raf = 0;
    let lastAnim = 0;
    const loop = (now: number) => {
      const p = propsRef.current;
      const v = p.viewportRef.current;
      const routeLit = p.highlightedIds.size > 0 && p.world.seaRoutes.some((r) => p.highlightedIds.has(r.fromId) || p.highlightedIds.has(r.toId));
      const animating = !p.reducedMotion && ((p.showFog ?? true) || p.pulseActive || routeLit);
      const fps = p.pulseActive || routeLit ? 60 : 30;
      if (v && (dirtyRef.current || (animating && now - lastAnim > 1000 / fps - 2))) {
        dirtyRef.current = false;
        lastAnim = now;
        renderFrame(ctx, {
          world: p.world,
          theme: p.theme,
          viewport: v,
          size: p.size,
          tiers: tiersRef.current,
          crisp: crispRef.current,
          time: now - start,
          reducedMotion: p.reducedMotion,
          isSettlementVisible: p.isSettlementVisible,
          stateFor: p.stateFor,
          highlightedIds: p.highlightedIds,
          selectedId: p.selectedId,
          showFog: p.showFog ?? true,
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [size, props.active]);

  // Pointer, pinch and wheel handling.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pointers = new Map<number, ScreenPoint>();
    let downAt: ScreenPoint | null = null;
    let moved = false;
    let lastMove = { x: 0, y: 0, t: 0 };
    let velocity = { x: 0, y: 0 };
    let pinch: { dist: number; mid: ScreenPoint } | null = null;

    const local = (e: PointerEvent | WheelEvent | MouseEvent): ScreenPoint => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const pick = (p: ScreenPoint) => {
      const P = propsRef.current;
      const v = P.viewportRef.current;
      if (!v) return null;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      return hitTest(P.world, screenToWorld(v, P.size, p), v.zoom, P.isSettlementVisible, coarse ? 22 : 10);
    };
    const setHover = (t: MapTarget | null, p: ScreenPoint | null) => {
      const prev = hoverRef.current;
      const same = prev?.kind === t?.kind && prev?.id === t?.id;
      hoverRef.current = t;
      canvas.style.cursor = t?.kind === "settlement" ? "pointer" : "";
      if (!same || t?.kind === "settlement") propsRef.current.onHover(t, p);
    };

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const p = local(e);
      pointers.set(e.pointerId, p);
      if (pointers.size === 1) {
        downAt = p;
        moved = false;
        velocity = { x: 0, y: 0 };
        lastMove = { ...p, t: performance.now() };
      } else if (pointers.size === 2) {
        const [a, b] = Array.from(pointers.values());
        pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
        moved = true;
      }
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (!pointers.has(e.pointerId)) {
        if (e.pointerType === "mouse") setHover(pick(p), p);
        return;
      }
      const prev = pointers.get(e.pointerId)!;
      pointers.set(e.pointerId, p);
      const P = propsRef.current;
      if (pointers.size >= 2 && pinch) {
        const [a, b] = Array.from(pointers.values());
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        P.onPan(mid.x - pinch.mid.x, mid.y - pinch.mid.y);
        if (pinch.dist > 0) P.onZoomAt(d / pinch.dist, mid);
        pinch = { dist: d, mid };
        return;
      }
      if (!downAt) return;
      if (!moved && Math.hypot(p.x - downAt.x, p.y - downAt.y) > 4) {
        moved = true;
        canvas.style.cursor = "grabbing";
        P.onDragChange?.(true);
        setHover(null, null);
      }
      if (moved) {
        P.onPan(p.x - prev.x, p.y - prev.y);
        const now = performance.now();
        const dt = Math.max(1, now - lastMove.t);
        velocity = { x: 0.7 * ((p.x - lastMove.x) / dt) + 0.3 * velocity.x, y: 0.7 * ((p.y - lastMove.y) / dt) + 0.3 * velocity.y };
        lastMove = { ...p, t: now };
      }
    };
    const onUp = (e: PointerEvent) => {
      const p = local(e);
      const P = propsRef.current;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size > 0) return;
      if (!moved && downAt) {
        P.onSelect(pick(p));
      } else if (moved) {
        canvas.style.cursor = "";
        P.onDragChange?.(false);
        if (performance.now() - lastMove.t < 80) P.onGlide(velocity.x, velocity.y);
      }
      downAt = null;
      moved = false;
    };
    const onLeave = () => {
      if (pointers.size === 0) setHover(null, null);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 16 : 1;
      const factor = Math.exp(-e.deltaY * scale * (e.ctrlKey ? 0.01 : 0.0018));
      propsRef.current.onZoomAt(factor, local(e));
    };
    const onDbl = (e: MouseEvent) => propsRef.current.onZoomAt(2, local(e));

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDbl);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDbl);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={props.ariaLabel}
      className="absolute inset-0 touch-none select-none"
      style={{ width: size.width, height: size.height }}
    />
  );
}

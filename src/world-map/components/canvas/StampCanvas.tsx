"use client";

import { useEffect, useRef } from "react";
import type { DrawContext, MapTheme } from "../../types";
import { midnightMarbleTheme } from "../../canvas/styles/mapTheme";
import { makeDrawContext } from "../../canvas/engine/mapRenderer";
import { drawLandFill, drawMarbleTexture, landPath } from "../../canvas/drawing";
import { useElementVisibility } from "../../hooks/useElementVisibility";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export interface StampCanvasProps {
  width: number;
  height: number;
  /** Screen pixels per world unit. World size = width/zoom × height/zoom. */
  zoom?: number;
  background?: "marble" | "sea" | "none";
  seed?: string;
  animate?: boolean;
  theme?: MapTheme;
  className?: string;
  ariaLabel?: string;
  /** Change to force a redraw when `draw` closes over new values. */
  version?: string | number;
  draw: (dc: DrawContext, info: { width: number; height: number }) => void;
}

/** Small fixed canvas that renders real drawing functions. Used by the legend and the gallery. */
export function StampCanvas({ width, height, zoom = 1, background = "marble", seed = "stamp", animate = false, theme = midnightMarbleTheme, className, ariaLabel, version, draw }: StampCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visible = useElementVisibility(ref as React.RefObject<HTMLElement>);
  const reducedMotion = useReducedMotion();
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ww = width / zoom;
    const wh = height / zoom;
    const t0 = performance.now();
    let raf = 0;
    const render = (now: number) => {
      ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);
      ctx.clearRect(0, 0, ww, wh);
      const dc = makeDrawContext(ctx, theme, seed, zoom, { reducedMotion, time: now - t0 });
      if (background === "sea") {
        ctx.fillStyle = theme.palette.sea;
        ctx.fillRect(0, 0, ww, wh);
      } else if (background === "marble") {
        const rect = [
          { x: -2, y: -2 },
          { x: ww + 2, y: -2 },
          { x: ww + 2, y: wh + 2 },
          { x: -2, y: wh + 2 },
        ];
        const land = [{ id: "bg", kind: "island" as const, polygon: rect, bounds: { minX: 0, minY: 0, maxX: ww, maxY: wh } }];
        drawLandFill(dc, { landmasses: land });
        drawMarbleTexture(dc, { clip: landPath(land), bounds: { minX: 0, minY: 0, maxX: ww, maxY: wh }, intensity: 0.6 });
      }
      drawRef.current(makeDrawContext(ctx, theme, seed, zoom, { reducedMotion, time: now - t0 }), { width: ww, height: wh });
      if (animate && !reducedMotion) raf = requestAnimationFrame(render);
    };
    if (visible || !animate) render(performance.now());
    return () => cancelAnimationFrame(raf);
  }, [width, height, zoom, background, seed, animate, theme, reducedMotion, visible, version]);

  return (
    <canvas
      ref={ref}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={className}
      style={{ width, height, display: "block" }}
    />
  );
}

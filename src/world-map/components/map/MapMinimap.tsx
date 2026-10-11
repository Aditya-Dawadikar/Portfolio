"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { GeneratedWorld, MapTheme, ViewportSize, ViewportState, WorldPoint } from "../../types";
import { visibleBounds } from "../../canvas/engine/viewport";
import { landPath } from "../../canvas/drawing";
import { tracePath } from "../../utils/geometry";
import { MarblePanel } from "../primitives";

export interface MapMinimapProps {
  world: GeneratedWorld;
  theme: MapTheme;
  viewport: ViewportState;
  size: ViewportSize;
  onNavigate: (p: WorldPoint) => void;
  width?: number;
  className?: string;
}

/** Engraved outline overview with the current viewport as a thin blue rectangle. Click/drag to move. */
export function MapMinimap({ world, theme, viewport, size, onNavigate, width = 180, className }: MapMinimapProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const W = world.bounds.maxX - world.bounds.minX;
  const H = world.bounds.maxY - world.bounds.minY;
  const height = Math.round((width * H) / W);
  const k = width / W;

  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const base = document.createElement("canvas");
    base.width = width * dpr;
    base.height = height * dpr;
    const ctx = base.getContext("2d")!;
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    const p = theme.palette;
    ctx.fillStyle = p.seaDeep;
    ctx.fillRect(0, 0, W, H);
    const lp = landPath(world.landmasses);
    ctx.fillStyle = "rgba(235, 231, 223, 0.08)";
    ctx.fill(lp);
    ctx.strokeStyle = p.ivory;
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 1 / k;
    ctx.stroke(lp);
    ctx.save();
    ctx.clip(lp);
    ctx.strokeStyle = p.bronze;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([3 / k, 2 / k]);
    for (const r of world.landmasses.some((l) => l.kind === "continent") ? world.regions : []) {
      ctx.beginPath();
      tracePath(ctx, r.cell, true);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = p.ivory;
    for (const s of world.settlements) {
      ctx.beginPath();
      ctx.arc(s.position.x, s.position.y, (s.tier === "landmark" ? 2 : 1.2) / k, 0, Math.PI * 2);
      ctx.fill();
    }
    baseRef.current = base;
  }, [world, theme, width, height, k, W, H]);

  useEffect(() => {
    const c = ref.current;
    const base = baseRef.current;
    if (!c || !base) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = width * dpr;
    c.height = height * dpr;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(base, 0, 0);
    const vb = visibleBounds(viewport, size);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    ctx.strokeStyle = theme.palette.activeBlue;
    ctx.lineWidth = 1.2 / k;
    ctx.strokeRect(vb.minX, vb.minY, vb.maxX - vb.minX, vb.maxY - vb.minY);
  }, [viewport, size, width, height, k, theme, world]);

  const nav = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onNavigate({ x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k });
  };

  return (
    <MarblePanel className={cn("p-1", className)}>
      <canvas
        ref={ref}
        role="img"
        aria-label="Minimap. Click to move the view."
        className="block cursor-crosshair touch-none rounded-[2px]"
        style={{ width, height }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          nav(e);
        }}
        onPointerMove={(e) => e.buttons === 1 && nav(e)}
      />
    </MarblePanel>
  );
}

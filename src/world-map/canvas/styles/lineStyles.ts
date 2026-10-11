import type { LineStyle, MapLineStyles, MapPalette } from "../../types";

export function createLineStyles(p: MapPalette): MapLineStyles {
  return {
    coast: { width: 1.4, color: p.ink, alpha: 0.9, join: "round" },
    shallowRing: { width: 0.9, color: p.shallows, alpha: 0.4 },
    contour: { width: 0.7, color: p.inkSoft, alpha: 0.35 },
    hatch: { width: 0.6, color: p.inkSoft, alpha: 0.5 },
    territoryBorder: { width: 1.3, color: p.bronze, alpha: 0.7, dash: [10, 4, 2, 4] },
    roadMinor: { width: 1.3, color: p.bronzeDim, alpha: 0.85, dash: [6, 3.5], cap: "round" },
    roadMajor: { width: 2.4, color: p.marbleWarm, alpha: 1, cap: "round" },
    river: { width: 0.8, color: p.ink, alpha: 0.8 },
    seaRoute: { width: 1.4, color: p.ivory, alpha: 0.55, dash: [1, 6], cap: "round" },
    selection: { width: 2, color: p.activeBlue, alpha: 1 },
  };
}

/** Applies a line style. `zoom` converts screen-pixel widths into world units. */
export function applyLineStyle(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, style: LineStyle, zoom = 1) {
  ctx.strokeStyle = style.color;
  ctx.globalAlpha = style.alpha;
  ctx.lineWidth = style.width / zoom;
  ctx.setLineDash(style.dash ? style.dash.map((d) => d / zoom) : []);
  ctx.lineCap = style.cap ?? "butt";
  ctx.lineJoin = style.join ?? "round";
}

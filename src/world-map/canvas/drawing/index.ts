import type { DrawContext, Settlement, SettlementVisualState } from "../../types";
import { isLandmarkKind, drawLandmark } from "./landmarks";
import { drawRuins } from "./ruins";
import { drawActiveGlow, drawFocusRing, drawPulseRing, drawSelectionRing } from "./selection";
import { drawSettlement } from "./settlements";
import { settlementBox, settlementShape } from "../assets/assetIds";
import { q, stamp, stampAsset } from "./sprites";

export * from "./atmosphere";
export * from "./beaches";
export * from "./coastline";
export * from "./decorations";
export * from "./debug";
export * from "./forests";
export * from "./landmarks";
export * from "./marbleTexture";
export * from "./mountains";
export * from "./rivers";
export * from "./roads";
export * from "./routeEffects";
export * from "./ruins";
export * from "./selection";
export * from "./settlements";
export * from "./ships";
export * from "./sprites";
export * from "./water";

export type SettlementLike = Pick<
  Settlement,
  "kind" | "tier" | "position" | "scale" | "rotation" | "activeGlow" | "weathering" | "status" | "hitRadius"
> & { repositoryId?: string };

/** Glow → stamp → pulse/selection/focus. Shared by the map renderer and the gallery. */
export function drawSettlementWithEffects(dc: DrawContext, s: SettlementLike, state: Partial<SettlementVisualState> = {}) {
  const seedKey = s.repositoryId ?? `${s.kind}:${s.position.x}:${s.position.y}`;
  if (s.activeGlow > 0 && !state.dimmed && s.kind !== "ruin") {
    drawActiveGlow(dc, { position: s.position, radius: s.hitRadius, intensity: s.activeGlow });
  }
  // The stamp is a pre-rendered PNG (one of a few baked layouts per kind), drawn upright then
  // rotated and dimmed at stamp time. Hover thickens the outline, so it is drawn live; both
  // paths share the layout seed so a stamp keeps its shape when hovered.
  const origin = { x: 0, y: 0 };
  const look = { hovered: !!state.hovered };
  const shape = settlementShape(s.kind, s.tier, s.status, s.weathering, seedKey);
  const render = (sdc: DrawContext) => {
    const key = shape.seedKey;
    if (s.kind === "ruin") {
      drawRuins(sdc, { position: origin, scale: s.scale, weathering: shape.weathering, seedKey: key, state: look });
    } else if (isLandmarkKind(s.kind)) {
      drawLandmark(sdc, { position: origin, scale: s.scale, kind: s.kind, status: s.status, seedKey: key, state: look });
    } else {
      drawSettlement(sdc, { position: origin, scale: s.scale, kind: s.kind, tier: s.tier, status: s.status, weathering: shape.weathering, seedKey: key, state: look });
    }
  };
  const key = `stl|${s.kind}|${s.tier}|${s.status}|${shape.weathering}|${q(s.scale, 0.02)}|${look.hovered ? 1 : 0}|${shape.seedKey}`;
  const box = settlementBox(s.scale);
  const opts = { rotation: s.rotation, alpha: state.dimmed ? 0.32 : 1, grayscale: !!state.dimmed };
  if (look.hovered) stamp(dc, key, box, s.position, render, opts);
  else stampAsset(dc, { id: shape.assetId, scale: s.scale / shape.refScale }, key, box, s.position, render, opts);
  if (state.pulse != null) drawPulseRing(dc, { position: s.position, radius: s.hitRadius, progress: state.pulse });
  if (state.selected) drawSelectionRing(dc, { position: s.position, radius: s.hitRadius });
  if (state.focused) drawFocusRing(dc, { position: s.position, radius: s.hitRadius });
}

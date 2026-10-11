import type {
  DrawContext,
  MinorSettlementKind,
  RepositoryStatus,
  SettlementTier,
  SettlementVisualState,
  StampOptions,
} from "../../types";
import { createRandom } from "../engine/seededRandom";
import { riverColor } from "./rivers";
import {
  type ArchStyle,
  building,
  colonnade,
  column,
  crenellatedRing,
  dashedCircle,
  pennant,
} from "./classicalArchitecture";
import { drawRuinsLocal } from "./ruins";

export interface SettlementDrawOptions extends StampOptions {
  kind: MinorSettlementKind;
  tier: SettlementTier;
  status: RepositoryStatus;
  weathering: number;
  /** Stable id so jittered details never change between frames. */
  seedKey?: string;
  state?: Partial<SettlementVisualState>;
}

export function archStyle(dc: DrawContext, scale: number, state: Partial<SettlementVisualState> = {}): ArchStyle {
  const p = dc.theme.palette;
  const base = Math.max(1.1 / dc.zoom, 0.35);
  return {
    ink: p.ink,
    fill: p.marble,
    shade: p.inkSoft,
    bronze: p.bronze,
    water: riverColor(dc.theme),
    lw: (base * (state.hovered ? 1.7 : 1)) / scale,
  };
}

/** Begin a stamp: translate/rotate/scale and apply dimming. Caller must restore. */
export function beginStamp(dc: DrawContext, opts: StampOptions, state: Partial<SettlementVisualState> = {}) {
  const { ctx } = dc;
  ctx.save();
  ctx.translate(opts.position.x, opts.position.y);
  ctx.rotate(opts.rotation ?? 0);
  ctx.scale(opts.scale, opts.scale);
  if (state.dimmed) {
    ctx.globalAlpha = 0.32;
    ctx.filter = "grayscale(1)";
  }
}

/** Ground shadow under a stamp. */
export function groundShadow(dc: DrawContext, r: number) {
  const { ctx, theme } = dc;
  ctx.save();
  ctx.fillStyle = theme.palette.marbleShadow;
  ctx.globalAlpha *= 0.28;
  ctx.beginPath();
  ctx.ellipse(r * 0.18, r * 0.2, r, r * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Layer 11: minor/major repository settlements as top-down plans. */
export function drawSettlement(dc: DrawContext, opts: SettlementDrawOptions) {
  const { ctx } = dc;
  const state = opts.state ?? {};
  const st = archStyle(dc, opts.scale, state);
  const rng = createRandom(opts.seedKey ?? `${opts.kind}:${opts.position.x}:${opts.position.y}`);
  const major = opts.tier !== "minor";

  beginStamp(dc, opts, state);
  if (opts.kind === "ruin") {
    drawRuinsLocal(dc, st, rng, opts.weathering);
    ctx.restore();
    return;
  }
  groundShadow(dc, major ? 15 : 11);

  switch (opts.kind) {
    case "village": {
      if (major) dashedCircle(ctx, st, 0, 0, 15);
      const houses = major ? 9 : rng.int(4, 6);
      for (let i = 0; i < houses; i++) {
        const a = (i / houses) * Math.PI * 2 + rng.range(-0.3, 0.3);
        const r = (major && i % 2 ? 11 : 6.5) + rng.range(-1, 1);
        const w = rng.range(3.2, 4.8);
        const h = rng.range(2.4, 3.4);
        building(ctx, st, Math.cos(a) * r - w / 2, Math.sin(a) * r - h / 2, w, h, { rotation: a + Math.PI / 2 });
      }
      column(ctx, st, 0, 0, 1.4);
      break;
    }
    case "outpost": {
      ctx.fillStyle = st.fill;
      ctx.fillRect(-9, -9, 18, 18);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw * 1.3;
      ctx.beginPath();
      ctx.moveTo(-2.5, 9);
      ctx.lineTo(-9, 9);
      ctx.lineTo(-9, -9);
      ctx.lineTo(9, -9);
      ctx.lineTo(9, 9);
      ctx.lineTo(2.5, 9);
      ctx.stroke();
      ctx.lineWidth = st.lw * 0.7;
      ctx.beginPath();
      for (let t = -9; t <= 9; t += 3) {
        ctx.moveTo(t, -9);
        ctx.lineTo(t, -10.6);
        ctx.moveTo(-9, t);
        ctx.lineTo(-10.6, t);
        ctx.moveTo(9, t);
        ctx.lineTo(10.6, t);
      }
      ctx.stroke();
      building(ctx, st, -4, -5, 8, 6);
      if (major) {
        for (const [x, y] of [
          [-9, -9],
          [9, -9],
          [-9, 9],
          [9, 9],
        ]) crenellatedRing(ctx, st, x, y, 2.6, 8);
      }
      break;
    }
    case "workshop": {
      building(ctx, st, -8, -6, 12, 5.5);
      building(ctx, st, -8, -0.5, 5.5, 8);
      ctx.save();
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw * 0.7;
      ctx.setLineDash([st.lw * 2, st.lw * 2]);
      ctx.strokeRect(-1.5, 0.5, 8, 7);
      ctx.restore();
      column(ctx, st, 2.5, -3.2, 1.1);
      ctx.fillStyle = st.ink;
      for (let i = 0; i < 3; i++) ctx.fillRect(0 + i * 2.2, 3 + (i % 2), 1.1, 1.1);
      if (major) {
        building(ctx, st, 7, -8, 5, 9);
        building(ctx, st, -2, 9, 9, 4);
      }
      break;
    }
    case "shrine": {
      if (major) {
        ctx.save();
        ctx.strokeStyle = st.ink;
        ctx.lineWidth = st.lw * 0.7;
        ctx.setLineDash([st.lw * 2, st.lw * 2]);
        ctx.strokeRect(-11, -11, 22, 22);
        ctx.restore();
      }
      ctx.fillStyle = st.fill;
      ctx.fillRect(-6, -6, 12, 12);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.strokeRect(-7.5, -7.5, 15, 15);
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        column(ctx, st, Math.cos(a) * 4, Math.sin(a) * 4, 0.9);
      }
      ctx.fillStyle = st.bronze;
      ctx.beginPath();
      ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "archive": {
      building(ctx, st, -11, -4.5, 22, 8);
      colonnade(ctx, st, -10, 5.5, 10, 5.5, 8, 0.85);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw * 0.6;
      ctx.beginPath();
      ctx.moveTo(-11, 4);
      ctx.lineTo(11, 4);
      ctx.stroke();
      if (major) {
        building(ctx, st, -3.5, -15, 7, 10.5);
        colonnade(ctx, st, -6, -14, -6, -6, 4, 0.75);
        colonnade(ctx, st, 6, -14, 6, -6, 4, 0.75);
      }
      break;
    }
    case "port": {
      // Pier extends along +x towards the water.
      ctx.fillStyle = st.fill;
      ctx.fillRect(5, -1.6, 14, 3.2);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.strokeRect(5, -1.6, 14, 3.2);
      ctx.fillStyle = st.ink;
      for (let x = 7; x < 19; x += 3) {
        ctx.fillRect(x, -2.4, 0.9, 0.9);
        ctx.fillRect(x, 1.5, 0.9, 0.9);
      }
      // Boat.
      ctx.save();
      ctx.translate(16, 5.5);
      ctx.fillStyle = st.fill;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.6, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      building(ctx, st, -8, -6, 6, 4.5);
      building(ctx, st, -8, 0, 4.5, 5.5);
      building(ctx, st, -2, -1.5, 5, 6);
      if (major) {
        building(ctx, st, -13, -10, 5, 5);
        building(ctx, st, -2, -10, 6, 4);
        ctx.fillStyle = st.fill;
        ctx.fillRect(5, -12, 3, 9);
        ctx.strokeRect(5, -12, 3, 9);
      }
      break;
    }
    case "tower": {
      if (major) {
        ctx.save();
        ctx.strokeStyle = st.ink;
        ctx.lineWidth = st.lw * 2.2;
        ctx.beginPath();
        ctx.moveTo(-12, 8);
        ctx.lineTo(0, 0);
        ctx.lineTo(12, 8);
        ctx.stroke();
        ctx.restore();
        crenellatedRing(ctx, st, -12, 8, 3.2, 8);
        crenellatedRing(ctx, st, 12, 8, 3.2, 8);
      }
      ctx.fillStyle = st.fill;
      ctx.fillRect(-7, -7, 14, 14);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.strokeRect(-7, -7, 14, 14);
      crenellatedRing(ctx, st, 0, 0, 4.8, 12);
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }

  if (opts.status === "deployed" || opts.status === "active") {
    pennant(ctx, st, major ? 11 : 8, major ? -10 : -7, 2.6);
  }
  ctx.restore();
}

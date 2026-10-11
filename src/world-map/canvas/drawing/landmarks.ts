import type { DrawContext, LandmarkKind, RepositoryStatus, SettlementVisualState, StampOptions } from "../../types";
import { createRandom } from "../engine/seededRandom";
import {
  arcade,
  building,
  colonnade,
  column,
  crenellatedRing,
  dashedCircle,
  dome,
  pennant,
  peristyle,
  wall,
} from "./classicalArchitecture";
import { hatchRect } from "./common";
import { archStyle, beginStamp, groundShadow } from "./settlements";

export const LANDMARK_KINDS: readonly LandmarkKind[] = [
  "observatory",
  "citadel",
  "aqueduct",
  "academy",
  "bridge_city",
  "forum",
  "arena",
  "library",
  "temple",
];

export const isLandmarkKind = (k: string): k is LandmarkKind => (LANDMARK_KINDS as readonly string[]).includes(k);

export interface LandmarkDrawOptions extends StampOptions {
  kind: LandmarkKind;
  status: RepositoryStatus;
  seedKey?: string;
  state?: Partial<SettlementVisualState>;
}

/** Base local radius of every landmark before `scale`. */
export const LANDMARK_RADIUS = 22;

/** Layer 12: significant-project landmarks. Scale should follow impactScore. */
export function drawLandmark(dc: DrawContext, opts: LandmarkDrawOptions) {
  const { ctx } = dc;
  const state = opts.state ?? {};
  const st = archStyle(dc, opts.scale, state);
  const rng = createRandom(opts.seedKey ?? `${opts.kind}:${opts.position.x}:${opts.position.y}`);
  beginStamp(dc, opts, state);
  groundShadow(dc, LANDMARK_RADIUS);

  switch (opts.kind) {
    case "observatory": {
      dashedCircle(ctx, st, 0, 0, 21);
      ctx.save();
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw * 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, 17.5, -Math.PI * 0.9, Math.PI * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 14.5, Math.PI * 0.4, Math.PI * 1.3);
      ctx.stroke();
      ctx.restore();
      column(ctx, st, Math.cos(Math.PI * 0.2) * 17.5, Math.sin(Math.PI * 0.2) * 17.5, 1.8);
      column(ctx, st, Math.cos(Math.PI * 1.3) * 14.5, Math.sin(Math.PI * 1.3) * 14.5, 1.3);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        column(ctx, st, Math.cos(a) * 11, Math.sin(a) * 11, 0.9);
      }
      dome(ctx, st, 0, 0, 8, 8);
      ctx.save();
      ctx.rotate(-0.6);
      ctx.fillStyle = st.ink;
      ctx.fillRect(-0.9, -8, 1.8, 7);
      ctx.restore();
      break;
    }
    case "citadel": {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? 21 : 13.5;
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      ctx.fillStyle = st.fill;
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fill();
      wall(ctx, st, pts, 1.6);
      for (let i = 0; i < 10; i += 2) crenellatedRing(ctx, st, pts[i].x, pts[i].y, 2, 6);
      // Inner keep.
      ctx.save();
      ctx.beginPath();
      ctx.rect(-5.5, -5.5, 11, 11);
      ctx.fillStyle = st.fill;
      ctx.fill();
      ctx.clip();
      ctx.strokeStyle = st.shade;
      ctx.lineWidth = st.lw * 0.6;
      hatchRect(ctx, -5.5, -5.5, 11, 11, 1.4);
      ctx.restore();
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw * 1.2;
      ctx.strokeRect(-5.5, -5.5, 11, 11);
      crenellatedRing(ctx, st, 0, 0, 2.8, 10);
      building(ctx, st, -11, 3, 5, 3);
      building(ctx, st, 6, 3, 5, 3);
      building(ctx, st, -2.5, -12, 5, 3.4);
      // Gate.
      ctx.fillStyle = st.fill;
      ctx.fillRect(-2, 12, 4, 3);
      ctx.strokeRect(-2, 12, 4, 3);
      break;
    }
    case "aqueduct": {
      ctx.save();
      ctx.rotate(-0.22);
      arcade(ctx, st, -27, 18, 0, 9, 4.6);
      ctx.strokeStyle = st.water;
      ctx.lineWidth = st.lw * 1.3;
      ctx.beginPath();
      ctx.moveTo(-27, 0);
      ctx.lineTo(18, 0);
      ctx.stroke();
      ctx.restore();
      // Castellum.
      ctx.save();
      ctx.translate(20, -4);
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = st.fill;
      ctx.fill();
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = st.water;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      // Terraces.
      for (let i = 0; i < 3; i++) building(ctx, st, 12 + i * 1.5, 4 + i * 4, 12 - i * 3, 3.2, { ridge: false });
      building(ctx, st, -18, 7, 5, 4);
      building(ctx, st, -11, 9, 4, 5);
      break;
    }
    case "academy": {
      building(ctx, st, -17, -18, 34, 5.5);
      colonnade(ctx, st, -16, -11.2, 16, -11.2, 11, 0.9);
      ctx.fillStyle = st.fill;
      ctx.fillRect(-15, -9, 30, 19);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.strokeRect(-15, -9, 30, 19);
      peristyle(ctx, st, -12.5, -6.5, 25, 14, 3.2, 0.75);
      // Garden.
      ctx.fillStyle = st.shade;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(-6 + (i % 3) * 6, -2 + Math.floor(i / 3) * 5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Exedra.
      ctx.beginPath();
      ctx.arc(0, 10, 7, 0, Math.PI);
      ctx.fillStyle = st.fill;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 10, 4.5, 0, Math.PI);
      ctx.stroke();
      break;
    }
    case "bridge_city": {
      ctx.fillStyle = st.water;
      ctx.fillRect(-26, -4.5, 52, 9);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.beginPath();
      ctx.moveTo(-26, -4.5);
      ctx.lineTo(26, -4.5);
      ctx.moveTo(-26, 4.5);
      ctx.lineTo(26, 4.5);
      ctx.stroke();
      // Quays.
      ctx.lineWidth = st.lw * 0.6;
      ctx.beginPath();
      ctx.moveTo(-24, -6);
      ctx.lineTo(24, -6);
      ctx.moveTo(-24, 6);
      ctx.lineTo(24, 6);
      ctx.stroke();
      for (const side of [-1, 1]) {
        for (let i = 0; i < 6; i++) {
          const w = rng.range(4, 6);
          const h = rng.range(3.2, 5);
          building(ctx, st, -20 + i * 7 + rng.range(-0.6, 0.6), side < 0 ? -8 - h - rng.range(0, 2) : 8 + rng.range(0, 2), w, h);
        }
      }
      // Long arched bridge across the river.
      ctx.fillStyle = st.fill;
      ctx.fillRect(-3, -9, 6, 18);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.beginPath();
      ctx.moveTo(-3, -9);
      ctx.lineTo(-3, 9);
      ctx.moveTo(3, -9);
      ctx.lineTo(3, 9);
      ctx.stroke();
      for (const y of [-2.2, 2.2]) {
        ctx.beginPath();
        ctx.arc(-3, y, 1.8, Math.PI / 2, Math.PI * 1.5);
        ctx.moveTo(3, y - 1.8);
        ctx.arc(3, y, 1.8, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
      break;
    }
    case "forum": {
      ctx.fillStyle = st.fill;
      ctx.fillRect(-14, -9, 28, 18);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.strokeRect(-14, -9, 28, 18);
      ctx.save();
      ctx.strokeStyle = st.shade;
      ctx.lineWidth = st.lw * 0.4;
      ctx.globalAlpha *= 0.5;
      for (let x = -14; x <= 14; x += 3.5) {
        ctx.beginPath();
        ctx.moveTo(x, -9);
        ctx.lineTo(x, 9);
        ctx.stroke();
      }
      ctx.restore();
      colonnade(ctx, st, -12, -11, 12, -11, 9, 0.85);
      colonnade(ctx, st, -12, 11, 12, 11, 9, 0.85);
      // Basilica with apse.
      building(ctx, st, 15, -10, 7, 20, { ridge: true });
      ctx.beginPath();
      ctx.arc(22, 0, 4, -Math.PI / 2, Math.PI / 2);
      ctx.fillStyle = st.fill;
      ctx.fill();
      ctx.stroke();
      // Small temple.
      building(ctx, st, -22, -4.5, 7, 9);
      colonnade(ctx, st, -15, -4, -15, 4, 3, 0.7);
      // Rostra.
      ctx.beginPath();
      ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = st.bronze;
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "arena": {
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 15, 0, 0, Math.PI * 2);
      ctx.fillStyle = st.fill;
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = st.shade;
      ctx.lineWidth = st.lw * 0.6;
      ctx.beginPath();
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        ctx.moveTo(Math.cos(a) * 13, Math.sin(a) * 8);
        ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 15);
      }
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw * 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = st.lw * 0.7;
      ctx.beginPath();
      ctx.ellipse(0, 0, 17.5, 11.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = st.fill;
      ctx.fill();
      ctx.lineWidth = st.lw;
      ctx.stroke();
      ctx.fillStyle = st.fill;
      ctx.fillRect(-23, -1.6, 10, 3.2);
      ctx.fillRect(13, -1.6, 10, 3.2);
      ctx.strokeRect(-23, -1.6, 10, 3.2);
      ctx.strokeRect(13, -1.6, 10, 3.2);
      break;
    }
    case "library": {
      building(ctx, st, -16, -12, 30, 11);
      ctx.beginPath();
      ctx.arc(14, -6.5, 5.5, -Math.PI / 2, Math.PI / 2);
      ctx.fillStyle = st.fill;
      ctx.fill();
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.stroke();
      colonnade(ctx, st, -15, 0.5, 13, 0.5, 10, 0.85);
      ctx.fillStyle = st.fill;
      ctx.fillRect(-11, 3, 22, 13);
      ctx.strokeRect(-11, 3, 22, 13);
      peristyle(ctx, st, -8.5, 5.5, 17, 8, 2.8, 0.65);
      // Shelving hatch inside the hall.
      ctx.save();
      ctx.strokeStyle = st.shade;
      ctx.lineWidth = st.lw * 0.5;
      ctx.beginPath();
      for (let x = -13; x < 11; x += 2.4) {
        ctx.moveTo(x, -10);
        ctx.lineTo(x, -7.5);
      }
      ctx.stroke();
      ctx.restore();
      break;
    }
    case "temple": {
      ctx.save();
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw * 0.7;
      ctx.setLineDash([st.lw * 3, st.lw * 2]);
      ctx.strokeRect(-17, -24, 34, 48);
      ctx.restore();
      // Stylobate steps.
      ctx.fillStyle = st.fill;
      ctx.fillRect(-14, -21, 28, 42);
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw;
      ctx.strokeRect(-14, -21, 28, 42);
      ctx.strokeRect(-12.5, -19.5, 25, 39);
      peristyle(ctx, st, -10.5, -17.5, 21, 35, 3.5, 1);
      // Cella.
      ctx.save();
      ctx.beginPath();
      ctx.rect(-6, -10, 12, 22);
      ctx.fillStyle = st.fill;
      ctx.fill();
      ctx.clip();
      ctx.strokeStyle = st.shade;
      ctx.lineWidth = st.lw * 0.6;
      hatchRect(ctx, -6, -10, 12, 22, 1.5);
      ctx.restore();
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = st.lw * 1.2;
      ctx.strokeRect(-6, -10, 12, 22);
      // Pronaos columns and cult statue.
      colonnade(ctx, st, -4, -13.5, 4, -13.5, 3, 0.9);
      ctx.fillStyle = st.bronze;
      ctx.beginPath();
      ctx.arc(0, 6, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Front steps.
      ctx.lineWidth = st.lw * 0.6;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        ctx.moveTo(-8, -21 - 1 - i * 1.2);
        ctx.lineTo(8, -21 - 1 - i * 1.2);
      }
      ctx.stroke();
      break;
    }
  }

  if (opts.status === "deployed" || opts.status === "active") {
    pennant(ctx, st, 17, -16, 3.2);
  }
  ctx.restore();
}

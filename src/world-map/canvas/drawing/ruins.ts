import type { DrawContext, SeededRandom, StampOptions, SettlementVisualState } from "../../types";
import { createRandom } from "../engine/seededRandom";
import type { ArchStyle } from "./classicalArchitecture";

/** Ruin plan in local stamp space: broken foundation, toppled columns, half arch, rubble. */
export function drawRuinsLocal(dc: DrawContext, st: ArchStyle, rng: SeededRandom, weathering: number) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  ctx.save();
  ctx.globalAlpha *= 0.6 + 0.25 * (1 - weathering);
  const ink = p.inkSoft;

  // Broken foundation with gaps.
  ctx.strokeStyle = ink;
  ctx.lineWidth = st.lw * 1.2;
  ctx.lineCap = "round";
  const corners = [
    { x: -10, y: -7 },
    { x: 10, y: -7 },
    { x: 10, y: 7 },
    { x: -10, y: 7 },
  ];
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const segs = 4;
    for (let s = 0; s < segs; s++) {
      if (rng.chance(0.3)) continue;
      const t0 = s / segs;
      const t1 = (s + 0.75) / segs;
      ctx.moveTo(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0);
      ctx.lineTo(a.x + (b.x - a.x) * t1, a.y + (b.y - a.y) * t1);
    }
  }
  ctx.stroke();

  // Standing column stumps.
  ctx.fillStyle = p.marble;
  ctx.lineWidth = st.lw * 0.8;
  for (let i = 0; i < 5; i++) {
    if (rng.chance(0.4)) continue;
    ctx.beginPath();
    ctx.arc(-8 + i * 4, -4, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Toppled column drums.
  const fallen = rng.int(2, 4);
  for (let i = 0; i < fallen; i++) {
    ctx.save();
    ctx.translate(rng.range(-7, 7), rng.range(0, 5));
    ctx.rotate(rng.range(-1.2, 1.2));
    ctx.fillRect(-3.5, -0.9, 7, 1.8);
    ctx.strokeRect(-3.5, -0.9, 7, 1.8);
    ctx.beginPath();
    ctx.moveTo(-1, -0.9);
    ctx.lineTo(-1, 0.9);
    ctx.moveTo(1.4, -0.9);
    ctx.lineTo(1.4, 0.9);
    ctx.stroke();
    ctx.restore();
  }

  // Collapsed half-arch.
  ctx.lineWidth = st.lw * 1.4;
  ctx.beginPath();
  ctx.arc(6, 10, 5, Math.PI, Math.PI * 1.55);
  ctx.stroke();

  // Rubble.
  ctx.fillStyle = ink;
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(rng.range(-12, 12), rng.range(-10, 12), rng.range(0.5, 1.2), rng.range(0.5, 1.2));
  }
  ctx.restore();
}

/** Layer 11: archived repository (or decorative ruin) at a world position. Never glows. */
export function drawRuins(
  dc: DrawContext,
  opts: StampOptions & { weathering?: number; seedKey?: string; state?: Partial<SettlementVisualState> },
) {
  const { ctx } = dc;
  const state = opts.state ?? {};
  const lw = (Math.max(1.1 / dc.zoom, 0.35) * (state.hovered ? 1.7 : 1)) / opts.scale;
  const p = dc.theme.palette;
  ctx.save();
  ctx.translate(opts.position.x, opts.position.y);
  ctx.rotate(opts.rotation ?? 0);
  ctx.scale(opts.scale, opts.scale);
  if (state.dimmed) ctx.globalAlpha = 0.32;
  drawRuinsLocal(
    dc,
    { ink: p.inkSoft, fill: p.marble, shade: p.inkSoft, bronze: p.bronzeDim, water: p.sea, lw },
    createRandom(opts.seedKey ?? `ruin:${opts.position.x}:${opts.position.y}`),
    opts.weathering ?? 1,
  );
  ctx.restore();
}

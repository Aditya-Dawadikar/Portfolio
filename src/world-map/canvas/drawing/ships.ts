import type { Ctx2D, DrawContext, Ship, ShipKind } from "../../types";
import { mix } from "../../utils/color";
import { hatchRect, isCulled, px } from "./common";
import { SHIP_REF, shipAssetId } from "../assets/assetIds";
import { q, stampAsset } from "./sprites";

/** Hull length in world units at scale 1. */
const LENGTH: Record<ShipKind, number> = { galley: 54, sailboat: 34, rowboat: 20 };
/** Mast height as a multiple of hull length (0 = no mast). */
const MAST: Record<ShipKind, number> = { galley: 0.85, sailboat: 1.0, rowboat: 0 };

/**
 * Ship in a 3/4 side projection, sailing towards +x, with the waterline amidships at
 * the origin. Masts and sails stay upright, so stamps are mirrored (not rotated) to
 * face their heading.
 */
export function drawShipStamp(dc: DrawContext, kind: ShipKind, scale: number) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const L = LENGTH[kind] * scale;
  const H = L * (kind === "rowboat" ? 0.2 : 0.15); // freeboard
  const lw = Math.max(px(dc, 1), 0.6);
  const mastH = MAST[kind] * L;
  const mastX = kind === "galley" ? -L * 0.02 : -L * 0.06;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Shadow on the water.
  ctx.fillStyle = p.seaDeep;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(-L * 0.02, H * 0.35, L * 0.56, H * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wake trailing from the stern, with ripples along the waterline.
  ctx.strokeStyle = p.shallows;
  ctx.lineWidth = lw;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(-L * 0.46, H * 0.15);
  ctx.quadraticCurveTo(-L * 0.8, H * 0.05, -L * 1.2, -H * 0.25);
  ctx.moveTo(-L * 0.46, H * 0.4);
  ctx.quadraticCurveTo(-L * 0.8, H * 0.65, -L * 1.2, H * 1.05);
  ctx.stroke();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const x = -L * (0.25 - i * 0.28);
    ctx.moveTo(x - L * 0.08, H * 0.45);
    ctx.quadraticCurveTo(x, H * 0.3, x + L * 0.08, H * 0.45);
  }
  ctx.moveTo(L * 0.5, H * 0.1);
  ctx.quadraticCurveTo(L * 0.62, H * 0.05, L * 0.68, H * 0.3);
  ctx.stroke();

  // Oars into the water (galley, rowboat): drawn before the hull so the hull overlaps them.
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = lw * 0.9;
  if (kind === "galley") {
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const x = L * (0.3 - i * 0.1);
      ctx.moveTo(x, -H * 0.3);
      ctx.lineTo(x - L * 0.07, H * 1.2);
    }
    ctx.stroke();
  } else if (kind === "rowboat") {
    ctx.beginPath();
    ctx.moveTo(-L * 0.02, -H * 0.9);
    ctx.lineTo(-L * 0.42, H * 1.2);
    ctx.moveTo(L * 0.04, -H * 0.9);
    ctx.lineTo(L * 0.3, H * 1.25);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Hull: sheer line rising to bow and stern, curving down to the keel.
  const hull = new Path2D();
  hull.moveTo(-L * 0.5, -H * 1.15);
  hull.quadraticCurveTo(0, -H * 0.75, L * 0.56, -H * 1.45);
  hull.quadraticCurveTo(L * 0.46, H * 0.35, L * 0.2, H * 0.45);
  hull.lineTo(-L * 0.3, H * 0.42);
  hull.quadraticCurveTo(-L * 0.47, H * 0.3, -L * 0.5, -H * 1.15);
  hull.closePath();
  ctx.fillStyle = mix(p.ink, p.bronze, 0.55);
  ctx.fill(hull);

  // Planking: light streaks following the sheer line.
  ctx.save();
  ctx.clip(hull);
  ctx.strokeStyle = p.marbleWarm;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = lw * 0.6;
  ctx.beginPath();
  for (const k of [0.45, 0.05]) {
    ctx.moveTo(-L * 0.5, -H * 1.15 + H * (1 - k) * 0.9);
    ctx.quadraticCurveTo(0, -H * 0.75 + H * (1 - k) * 0.9, L * 0.56, -H * 1.45 + H * (1 - k) * 1.1);
  }
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = lw;
  ctx.stroke(hull);

  // Deck seen from slightly above: a light sliver along the sheer line.
  ctx.beginPath();
  ctx.moveTo(-L * 0.48, -H * 1.15);
  ctx.quadraticCurveTo(0, -H * 0.75, L * 0.54, -H * 1.42);
  ctx.quadraticCurveTo(0, -H * 1.35, -L * 0.48, -H * 1.15);
  ctx.closePath();
  ctx.fillStyle = p.marbleWarm;
  ctx.fill();
  ctx.lineWidth = lw * 0.7;
  ctx.stroke();

  if (kind === "rowboat") {
    // Rower.
    ctx.fillStyle = p.ink;
    ctx.beginPath();
    ctx.arc(0, -H * 1.55, H * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Mast.
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = lw * 1.2;
  ctx.beginPath();
  ctx.moveTo(mastX, -H * 0.95);
  ctx.lineTo(mastX, -mastH);
  ctx.stroke();

  if (kind === "galley") {
    // Square sail on a yard, billowing forward, with bronze stripes.
    const top = -mastH * 0.92;
    const bottom = -H * 2.1;
    const half = L * 0.3;
    const belly = L * 0.12;
    const sail = new Path2D();
    sail.moveTo(mastX - half, top);
    sail.lineTo(mastX + half, top);
    sail.quadraticCurveTo(mastX + half + belly, (top + bottom) / 2, mastX + half * 0.9, bottom);
    sail.quadraticCurveTo(mastX + belly * 0.4, bottom + H * 0.5, mastX - half * 0.9, bottom);
    sail.quadraticCurveTo(mastX - half + belly * 0.6, (top + bottom) / 2, mastX - half, top);
    sail.closePath();
    paintSail(ctx, dc, sail, mastX - half, top, half * 2 + belly, bottom - top, lw);
    ctx.save();
    ctx.clip(sail);
    ctx.fillStyle = mix(p.bronze, p.ivory, 0.25);
    ctx.globalAlpha = 0.75;
    for (const k of [-0.42, 0.18]) ctx.fillRect(mastX + half * k, top, half * 0.24, bottom - top + H);
    ctx.restore();
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = lw;
    ctx.stroke(sail);
    // Yard.
    ctx.lineWidth = lw * 1.3;
    ctx.beginPath();
    ctx.moveTo(mastX - half * 1.08, top);
    ctx.lineTo(mastX + half * 1.08, top);
    ctx.stroke();
  } else {
    // Triangular main sail and a small jib, both bellied by the wind.
    const head = -mastH;
    const foot = -H * 1.6;
    const main = new Path2D();
    main.moveTo(mastX, head);
    main.quadraticCurveTo(mastX + L * 0.26, (head + foot) / 2 + L * 0.05, mastX + L * 0.4, foot);
    main.lineTo(mastX, foot);
    main.closePath();
    paintSail(ctx, dc, main, mastX, head, L * 0.4, foot - head, lw);
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = lw;
    ctx.stroke(main);
    const jib = new Path2D();
    jib.moveTo(mastX + L * 0.03, head + L * 0.12);
    jib.quadraticCurveTo(mastX + L * 0.2, (head + foot) / 2 + L * 0.1, mastX + L * 0.5, foot + H * 0.2);
    jib.lineTo(mastX + L * 0.06, foot + H * 0.1);
    jib.closePath();
    paintSail(ctx, dc, jib, mastX, head, L * 0.5, foot - head, lw);
    ctx.strokeStyle = p.ink;
    ctx.stroke(jib);
  }

  // Pennant streaming aft from the masthead.
  ctx.fillStyle = p.bronze;
  ctx.strokeStyle = p.ink;
  ctx.lineWidth = lw * 0.8;
  ctx.beginPath();
  ctx.moveTo(mastX, -mastH);
  ctx.quadraticCurveTo(mastX - L * 0.1, -mastH - H * 0.3, mastX - L * 0.2, -mastH + H * 0.15);
  ctx.lineTo(mastX, -mastH + H * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Ivory sail with soft hatched shading on its trailing half. */
function paintSail(ctx: Ctx2D, dc: DrawContext, path: Path2D, x: number, y: number, w: number, h: number, lw: number) {
  ctx.fillStyle = dc.theme.palette.ivory;
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  ctx.beginPath();
  ctx.rect(x, y, w * 0.45, h);
  ctx.clip();
  ctx.strokeStyle = dc.theme.palette.inkSoft;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = lw * 0.5;
  hatchRect(ctx, x, Math.min(y, y + h), w, Math.abs(h), Math.max(lw * 2.2, 1.2));
  ctx.restore();
}

/** Stamps every ship from the sprite cache, mirrored to face its heading. */
export function drawShips(dc: DrawContext, ships: Ship[]) {
  for (const s of ships) {
    const L = LENGTH[s.kind] * s.scale;
    if (isCulled(dc, s.position, L * 1.6)) continue;
    const b = q(s.scale);
    stampAsset(dc, { id: shipAssetId(s.kind), scale: b / SHIP_REF }, `ship3q|${s.kind}|${b}`, shipStampBox(s.kind, b), s.position, (sdc) => drawShipStamp(sdc, s.kind, b), {
      flipX: Math.cos(s.heading) < 0,
      rotation: Math.sin(s.heading) * 0.06,
    });
  }
}

/** Sprite box (anchor offset and size, world units) that fits a ship stamp at `scale`. */
export function shipStampBox(kind: ShipKind, scale: number) {
  const L = LENGTH[kind] * scale;
  const mast = Math.max(MAST[kind] * L, L * 0.45);
  return { ox: L * 1.3, oy: mast + L * 0.15, w: L * 2.05, h: mast + L * 0.5 };
}

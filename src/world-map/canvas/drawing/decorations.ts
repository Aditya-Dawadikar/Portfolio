import type { DrawContext, StatueVariant, WorldPoint } from "../../types";

/** Engraved 16-point compass rose in ivory/bronze. Draw in screen space or world space. */
export function drawCompassRose(dc: DrawContext, { position, scale }: { position: WorldPoint; scale: number }) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const lw = 1 / (dc.zoom * scale);
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.scale(scale, scale);
  ctx.lineJoin = "miter";

  ctx.strokeStyle = p.ivory;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = lw;
  for (const r of [40, 34]) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const inner = i % 4 === 0 ? 34 : 37;
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * 40, Math.sin(a) * 40);
  }
  ctx.stroke();

  const point = (angle: number, len: number, width: number, light: string, dark: string) => {
    const tip = { x: Math.cos(angle) * len, y: Math.sin(angle) * len };
    const l = { x: Math.cos(angle - Math.PI / 2) * width, y: Math.sin(angle - Math.PI / 2) * width };
    const r = { x: Math.cos(angle + Math.PI / 2) * width, y: Math.sin(angle + Math.PI / 2) * width };
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(l.x, l.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r.x, r.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = p.ivory;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.lineTo(r.x, r.y);
    ctx.stroke();
  };
  for (let i = 0; i < 16; i++) {
    if (i % 4 === 0) continue;
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const len = i % 2 === 0 ? 27 : 18;
    point(a, len, i % 2 === 0 ? 4.5 : 3, p.bronzeDim, p.seaDeep);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    point(a, i === 0 ? 44 : 38, 6, p.ivory, p.bronze);
  }
  ctx.beginPath();
  ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = p.bronze;
  ctx.fill();
  ctx.strokeStyle = p.ivory;
  ctx.stroke();
  ctx.restore();
}

/** Rare central monument: plinth plus simplified top-down robed figure holding an attribute. */
export function drawClassicalStatue(dc: DrawContext, { position, scale, variant }: { position: WorldPoint; scale: number; variant: StatueVariant }) {
  const { ctx, theme } = dc;
  const p = theme.palette;
  const lw = Math.max(1.1 / dc.zoom, 0.35) / scale;
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.scale(scale, scale);
  ctx.lineWidth = lw;
  ctx.strokeStyle = p.ink;
  ctx.fillStyle = p.marbleShadow;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(3, 3, 15, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Plinth.
  ctx.fillStyle = p.marble;
  ctx.fillRect(-12, -12, 24, 24);
  ctx.strokeRect(-12, -12, 24, 24);
  ctx.strokeRect(-9.5, -9.5, 19, 19);
  ctx.beginPath();
  for (const [ax, ay, bx, by] of [
    [-12, -12, -9.5, -9.5],
    [12, -12, 9.5, -9.5],
    [-12, 12, -9.5, 9.5],
    [12, 12, 9.5, 9.5],
  ]) {
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
  }
  ctx.stroke();

  if (variant === "atlas") {
    ctx.beginPath();
    ctx.arc(0, -3, 7, 0, Math.PI * 2);
    ctx.fillStyle = p.marble;
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(0, -3, 3, 7, 0, 0, Math.PI * 2);
    ctx.moveTo(-7, -3);
    ctx.lineTo(7, -3);
    ctx.moveTo(-6.5, -6);
    ctx.lineTo(6.5, -6);
    ctx.moveTo(-6.5, 0);
    ctx.lineTo(6.5, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Robe (shoulders) with drape folds and head.
  ctx.fillStyle = p.ivory;
  ctx.beginPath();
  ctx.ellipse(0, 3, 6.5, 4.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-4, 1);
  ctx.quadraticCurveTo(-1, 4, -2.5, 7);
  ctx.moveTo(1, 0);
  ctx.quadraticCurveTo(3, 3.5, 2, 7.2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(0, 2.2, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Extended arm and attribute.
  ctx.beginPath();
  ctx.moveTo(4.5, 1.5);
  ctx.lineTo(8, -3);
  ctx.stroke();
  ctx.fillStyle = p.bronze;
  if (variant === "architect") {
    ctx.beginPath();
    ctx.moveTo(7, -3);
    ctx.lineTo(11, -3);
    ctx.lineTo(7, -7.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (variant === "scroll") {
    ctx.fillRect(6.5, -6.5, 5, 3);
    ctx.strokeRect(6.5, -6.5, 5, 3);
    ctx.beginPath();
    ctx.arc(6.5, -5, 1.5, 0, Math.PI * 2);
    ctx.arc(11.5, -5, 1.5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (variant === "compass") {
    ctx.beginPath();
    ctx.moveTo(8, -3);
    ctx.lineTo(6, -9);
    ctx.moveTo(8, -3);
    ctx.lineTo(10.5, -8.5);
    ctx.lineWidth = lw * 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(8, -3, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

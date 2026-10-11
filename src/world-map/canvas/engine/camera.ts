import type { CameraAnimation, Easing, ViewportState } from "../../types";

const easeInOutCubic: Easing = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function createCameraAnimation(from: ViewportState, to: ViewportState, durationMs = 750, easing = easeInOutCubic): CameraAnimation {
  return { from, to, startedAt: performance.now(), durationMs, easing };
}

/** Interpolates position linearly and zoom geometrically, so flights feel weighty rather than floaty. */
export function sampleCamera(anim: CameraAnimation, now: number): { viewport: ViewportState; done: boolean } {
  const raw = Math.min(1, (now - anim.startedAt) / anim.durationMs);
  const t = anim.easing(raw);
  const { from, to } = anim;
  const zoom = Math.exp(Math.log(from.zoom) + (Math.log(to.zoom) - Math.log(from.zoom)) * t);
  return {
    viewport: { ...to, x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, zoom },
    done: raw >= 1,
  };
}

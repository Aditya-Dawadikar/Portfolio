import type { NumOrRange, SeededRandom } from "../types";

const bounds = (v: { min: number; max: number }) => [Math.min(v.min, v.max), Math.max(v.min, v.max)] as const;

/** A fixed number, or a seeded uniform draw from {min, max}. */
export function sampleRange(rng: SeededRandom, v: NumOrRange): number {
  if (typeof v === "number") return v;
  const [lo, hi] = bounds(v);
  return lo === hi ? lo : rng.range(lo, hi);
}

/** Integer version of sampleRange (inclusive). */
export function sampleInt(rng: SeededRandom, v: NumOrRange): number {
  if (typeof v === "number") return Math.round(v);
  const [lo, hi] = bounds(v);
  return Math.round(lo) === Math.round(hi) ? Math.round(lo) : rng.int(Math.round(lo), Math.round(hi));
}

export const rangeMax = (v: NumOrRange) => (typeof v === "number" ? v : bounds(v)[1]);

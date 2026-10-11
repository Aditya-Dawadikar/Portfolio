export type Noise2D = (x: number, y: number) => number;

/** Seeded 2D value noise in [-1, 1]. */
export function createNoise2D(seed: number): Noise2D {
  const hash = (x: number, y: number) => {
    let h = seed ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  };
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    const top = a + (b - a) * u;
    const bottom = c + (d - c) * u;
    return (top + (bottom - top) * v) * 2 - 1;
  };
}

/** Fractal sum of octaves, normalised to roughly [-1, 1]. */
export function fbm(noise: Noise2D, x: number, y: number, octaves = 4): number {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

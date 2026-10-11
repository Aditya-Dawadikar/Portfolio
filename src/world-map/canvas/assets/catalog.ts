/**
 * Every pre-rendered atlas asset: its id, sprite box and the vector function that draws it.
 * `scripts/build-atlas-assets.ts` bakes these into PNG sheets under public/atlas/assets;
 * the map blits from those sheets (see atlasAssets.ts) and falls back to live vector
 * drawing for anything missing. Change a drawing function → rerun `pnpm atlas:assets`.
 */
import type { DrawContext } from "../../types";
import { ROCK_VARIANTS, drawRock } from "../drawing/beaches";
import { drawCompassRose } from "../drawing/decorations";
import { drawTree } from "../drawing/forests";
import { LANDMARK_KINDS, drawLandmark } from "../drawing/landmarks";
import { MOUNTAIN_VARIANTS, drawHill, drawMountain } from "../drawing/mountains";
import { drawRuins } from "../drawing/ruins";
import { drawSettlement } from "../drawing/settlements";
import { drawShipStamp, shipStampBox } from "../drawing/ships";
import type { SpriteBox } from "../drawing/sprites";
import { drawWaveGlyph } from "../drawing/water";
import { createRandom } from "../engine/seededRandom";
import {
  COMPASS_ASSET_ID,
  COMPASS_REF,
  HILL_ASSET_ID,
  HILL_REF,
  LANDMARK_VARIANTS,
  MINOR_KINDS,
  MOUNTAIN_REF,
  ROCK_REF,
  RUIN_WEATHERING,
  SETTLEMENT_REF,
  SETTLEMENT_VARIANTS,
  SHIP_KINDS,
  SHIP_REF,
  TREE_REF,
  TREE_TYPES,
  WAVE_REF,
  mountainAssetId,
  rockAssetId,
  settlementBox,
  shipAssetId,
  treeAssetId,
  waveAssetId,
} from "./assetIds";

/** Baked resolutions, in device pixels per world unit. The runtime picks the smallest one ≥ what it needs. */
const WORLD_LEVELS = [0.5, 1, 2, 4, 8];
/** The compass is screen-anchored: levels are device pixels per CSS pixel. */
const SCREEN_LEVELS = [1, 2, 3];
/** Hairline widths are baked for this devicePixelRatio. */
export const ASSUMED_DPR = 2;

interface AssetDef {
  id: string;
  /** Assets in one group share a sheet per level. */
  group: string;
  /** Anchor offset and size in world units (CSS pixels for screen-space assets). */
  box: SpriteBox;
  levels: number[];
  screenSpace?: boolean;
  render: (dc: DrawContext) => void;
}

const origin = { x: 0, y: 0 };

function settlementAssets(): AssetDef[] {
  const out: AssetDef[] = [];
  for (const w of RUIN_WEATHERING) {
    for (let v = 0; v < SETTLEMENT_VARIANTS; v++) {
      const scale = SETTLEMENT_REF.minor;
      out.push({
        id: `settlement/ruin/w${w}/v${v}`,
        group: "settlements",
        box: settlementBox(scale),
        levels: WORLD_LEVELS,
        render: (dc) => drawRuins(dc, { position: origin, scale, weathering: w, seedKey: `ruin:v${v}` }),
      });
    }
  }
  for (const kind of MINOR_KINDS) {
    for (const tier of ["minor", "major"] as const) {
      for (const lit of [false, true]) {
        for (let v = 0; v < SETTLEMENT_VARIANTS; v++) {
          const scale = SETTLEMENT_REF[tier];
          out.push({
            id: `settlement/${kind}/${tier}/${lit ? "lit" : "plain"}/v${v}`,
            group: "settlements",
            box: settlementBox(scale),
            levels: WORLD_LEVELS,
            render: (dc) =>
              drawSettlement(dc, { position: origin, scale, kind, tier, status: lit ? "active" : "maintained", weathering: 0, seedKey: `${kind}:v${v}` }),
          });
        }
      }
    }
  }
  for (const kind of LANDMARK_KINDS) {
    for (const lit of [false, true]) {
      for (let v = 0; v < LANDMARK_VARIANTS; v++) {
        const scale = SETTLEMENT_REF.landmark;
        out.push({
          id: `settlement/${kind}/landmark/${lit ? "lit" : "plain"}/v${v}`,
          group: "landmarks",
          box: settlementBox(scale),
          levels: WORLD_LEVELS,
          render: (dc) => drawLandmark(dc, { position: origin, scale, kind, status: lit ? "active" : "maintained", seedKey: `${kind}:v${v}` }),
        });
      }
    }
  }
  return out;
}

/** The full catalog, in a stable order. */
export function atlasAssetCatalog(): AssetDef[] {
  const defs: AssetDef[] = [];
  for (const type of TREE_TYPES) {
    const s = TREE_REF * 0.7;
    defs.push({
      id: treeAssetId(type),
      group: "terrain",
      box: { ox: 6.5 * s + 1, oy: 15 * s + 1, w: 14.5 * s + 2, h: 17.5 * s + 2 },
      levels: WORLD_LEVELS,
      render: (dc) => drawTree(dc, { position: origin, scale: TREE_REF, treeType: type }),
    });
  }
  for (let v = 0; v < MOUNTAIN_VARIANTS; v++) {
    for (const snowcap of [false, true]) {
      const s = 20 * MOUNTAIN_REF;
      defs.push({
        id: mountainAssetId(v, snowcap),
        group: "terrain",
        box: { ox: 1.4 * s + 2, oy: 1.35 * s + 2, w: 2.9 * s + 4, h: 1.8 * s + 4 },
        levels: WORLD_LEVELS,
        render: (dc) => drawMountain(dc, { position: origin, scale: MOUNTAIN_REF, snowcap, rng: createRandom(`mtn-variant:${v}`) }),
      });
    }
  }
  {
    const s = 9 * HILL_REF;
    defs.push({ id: HILL_ASSET_ID, group: "terrain", box: { ox: s + 2, oy: 0.8 * s + 2, w: 2 * s + 4, h: s + 4 }, levels: WORLD_LEVELS, render: (dc) => drawHill(dc, s) });
  }
  for (const doubled of [false, true]) {
    const b = WAVE_REF;
    defs.push({
      id: waveAssetId(doubled),
      group: "sea",
      box: { ox: 8 * b + 1, oy: 4 * b + 1, w: 16 * b + 2, h: 10 * b + 2 },
      levels: WORLD_LEVELS,
      render: (dc) => drawWaveGlyph(dc, b, doubled),
    });
  }
  for (let v = 0; v < ROCK_VARIANTS; v++) {
    const size = ROCK_REF;
    defs.push({
      id: rockAssetId(v),
      group: "sea",
      box: { ox: size * 1.2 + 1, oy: size * 1.2 + 1, w: size * 2.4 + 2, h: size * 2.4 + 2 },
      levels: WORLD_LEVELS,
      render: (dc) => drawRock(dc, size, v),
    });
  }
  for (const kind of SHIP_KINDS) {
    defs.push({ id: shipAssetId(kind), group: "sea", box: shipStampBox(kind, SHIP_REF), levels: WORLD_LEVELS, render: (dc) => drawShipStamp(dc, kind, SHIP_REF) });
  }
  defs.push(...settlementAssets());
  {
    const s = COMPASS_REF;
    defs.push({
      id: COMPASS_ASSET_ID,
      group: "compass",
      box: { ox: 48 * s, oy: 48 * s, w: 96 * s, h: 96 * s },
      levels: SCREEN_LEVELS,
      screenSpace: true,
      render: (dc) => drawCompassRose(dc, { position: origin, scale: s }),
    });
  }
  return defs;
}

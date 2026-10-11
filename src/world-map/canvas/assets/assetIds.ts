/**
 * Ids, reference scales and variant mapping for the pre-rendered atlas assets.
 * Imports no drawing module that renders settlements or terrain, so those can use it without a cycle.
 */
import type {
  MinorSettlementKind,
  RepositoryStatus,
  SettlementKind,
  SettlementTier,
  ShipKind,
  TreeType,
} from "../../types";
import type { SpriteBox } from "../drawing/sprites";
import { isLandmarkKind } from "../drawing/landmarks";
import { hashString } from "../engine/seededRandom";

/* Reference scales: each asset is baked at this scale and blitted at `scale / ref`. */
export const TREE_REF = 1;
export const MOUNTAIN_REF = 1;
export const HILL_REF = 1;
export const WAVE_REF = 1;
export const ROCK_REF = 6;
export const SHIP_REF = 1;
export const COMPASS_REF = 1;
export const SETTLEMENT_REF: Record<SettlementTier, number> = { minor: 1, major: 1.25, landmark: 2 };

export const TREE_TYPES: TreeType[] = ["cypress", "olive", "pine"];
export const SHIP_KINDS: ShipKind[] = ["galley", "sailboat", "rowboat"];
export const MINOR_KINDS: Exclude<MinorSettlementKind, "ruin">[] = ["village", "outpost", "workshop", "shrine", "archive", "port", "tower"];
/** Pre-jittered layouts per settlement kind; each repository maps to one by id hash. */
export const SETTLEMENT_VARIANTS = 3;
/** Landmarks are one per territory, so a single layout each is enough. */
export const LANDMARK_VARIANTS = 1;
export const RUIN_WEATHERING = [0, 0.5, 1];

export const treeAssetId = (type: TreeType) => `tree/${type}`;
export const mountainAssetId = (variant: number, snowcap: boolean) => `mountain/${variant}${snowcap ? "-snow" : ""}`;
export const HILL_ASSET_ID = "hill";
export const waveAssetId = (doubled: boolean) => `wave/${doubled ? "double" : "single"}`;
export const rockAssetId = (variant: number) => `rock/${variant}`;
export const shipAssetId = (kind: ShipKind) => `ship/${kind}`;
export const COMPASS_ASSET_ID = "compass";

/** Box around a settlement stamp at `scale` (matches the live sprite cache). */
export const settlementBox = (scale: number): SpriteBox => {
  const half = 30 * scale + 4;
  return { ox: half, oy: half, w: half * 2, h: half * 2 };
};

/** Only these statuses change a stamp: deployed and active fly a pennant. */
const isLit = (status: RepositoryStatus) => status === "deployed" || status === "active";

interface SettlementShape {
  /** Seeds the stamp's jitter; shared by the baked asset and the vector fallback so they match. */
  seedKey: string;
  assetId: string;
  /** Scale the asset was baked at. */
  refScale: number;
  weathering: number;
}

/** Maps a settlement to one of a finite set of baked layouts. */
export function settlementShape(kind: SettlementKind, tier: SettlementTier, status: RepositoryStatus, weathering: number, seedKey: string): SettlementShape {
  if (kind === "ruin") {
    const w = RUIN_WEATHERING.reduce((best, v) => (Math.abs(v - weathering) < Math.abs(best - weathering) ? v : best));
    const variant = hashString(seedKey) % SETTLEMENT_VARIANTS;
    return { seedKey: `ruin:v${variant}`, assetId: `settlement/ruin/w${w}/v${variant}`, refScale: SETTLEMENT_REF.minor, weathering: w };
  }
  const landmark = isLandmarkKind(kind);
  const variant = hashString(seedKey) % (landmark ? LANDMARK_VARIANTS : SETTLEMENT_VARIANTS);
  const t = landmark ? "landmark" : tier === "landmark" ? "major" : tier;
  return {
    seedKey: `${kind}:v${variant}`,
    assetId: `settlement/${kind}/${t}/${isLit(status) ? "lit" : "plain"}/v${variant}`,
    refScale: SETTLEMENT_REF[t],
    weathering,
  };
}

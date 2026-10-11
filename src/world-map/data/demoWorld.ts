import type { Territory, WorldMapData } from "../types";
import { DEMO_REPOSITORIES } from "./repositories";
import { DEMO_TERRITORIES } from "./territories";

const territories: Territory[] = DEMO_TERRITORIES.map((t) => ({
  ...t,
  repositoryIds: DEMO_REPOSITORIES.filter((r) => r.category === t.id).map((r) => r.id),
}));

export const DEMO_WORLD: WorldMapData = {
  seed: { value: "midnight-marble", version: 1 },
  repositories: DEMO_REPOSITORIES,
  territories,
  options: {
    width: 3200,
    height: 2400,
    islandCount: 7,
    coastRoughness: 0.55,
    detail: "high",
    maxSeaRoutes: 4,
  },
};

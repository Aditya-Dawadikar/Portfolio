import { DATA } from "@/data/resume";
import type { WorldMapData } from "@/world-map/types";
import { DEMO_TERRITORIES } from "@/world-map/data/territories";
import { type FeaturedProject, type GitHubRepoLike, repositoriesFromGitHub } from "@/world-map/data/githubAdapter";

export const GITHUB_ATLAS_USERNAME = "Aditya-Dawadikar";

const REPO_URL = /github\.com\/aditya-dawadikar\/([A-Za-z0-9_.-]+)/i;

const repoNameFrom = (...urls: (string | undefined)[]) => {
  for (const u of urls) {
    const m = u?.match(REPO_URL);
    if (m) return m[1];
  }
  return null;
};

/** Resume projects and hackathons enrich the matching repositories (impact, description, tech, demo). */
function featuredFromResume(): FeaturedProject[] {
  const out = new Map<string, FeaturedProject>();
  for (const p of DATA.projects) {
    const name = repoNameFrom(p.href, ...p.links.map((l) => l.href));
    if (!name) continue;
    const demo = p.href && !REPO_URL.test(p.href) ? p.href : undefined;
    out.set(name.toLowerCase(), {
      repoName: name,
      title: p.title,
      description: p.description,
      technologies: [...p.technologies],
      demoUrl: demo,
      hackathonWinner: "hackathonWinner" in p && Boolean(p.hackathonWinner),
    });
  }
  for (const h of DATA.hackathons) {
    const name = repoNameFrom(...h.links.map((l) => l.href));
    if (!name) continue;
    const prev = out.get(name.toLowerCase());
    out.set(name.toLowerCase(), {
      ...prev,
      repoName: name,
      title: prev?.title ?? h.title,
      description: prev?.description ?? h.description,
      hackathon: true,
      hackathonWinner: prev?.hackathonWinner || h.result === "winner",
    });
  }
  return Array.from(out.values());
}

/** Builds the dense, real-data world for /atlas. */
export function buildGitHubWorld(repos: GitHubRepoLike[], fetchedAt: string): WorldMapData {
  const repositories = repositoriesFromGitHub(repos, featuredFromResume(), { now: new Date(fetchedAt) });
  const territories = DEMO_TERRITORIES.map((t) => ({
    ...(t.id === "open_source" ? { ...t, name: "Web & Open Source", summary: "Harbour towns of interfaces and forks, where work arrives from distant shores and leaves improved." } : t),
    repositoryIds: repositories.filter((r) => r.category === t.id).map((r) => r.id),
  }));
  return {
    seed: { value: GITHUB_ATLAS_USERNAME.toLowerCase(), version: 3 },
    repositories,
    territories,
    options: {
      width: 3800,
      height: 2850,
      islandCount: { min: 6, max: 12 },
      coastRoughness: 0.6,
      detail: "high",
      maxSeaRoutes: 9,
      density: 1.9,
      archipelago: { gap: 90, spread: 170, radius: 500 },
      structureScale: 1.6,
      sizeContrast: 0.35,
      lakes: { count: { min: 0, max: 4 }, size: { min: 0.8, max: 2 } },
      beaches: { amount: 0.5, rocky: 0.4, width: { min: 8, max: 22 } },
      ships: { ocean: { min: 10, max: 18 }, coastal: { min: 2, max: 6 }, size: { min: 0.8, max: 1.3 } },
      coastalIslets: {
        clusters: { min: 1, max: 3 },
        perCluster: { min: 3, max: 10 },
        size: { min: 8, max: 28 },
        distance: { min: 50, max: 140 },
        spread: { min: 60, max: 130 },
      },
      vegetation: { min: 0.7, max: 1.4 },
      mountains: { min: 0.6, max: 1.5 },
      hills: { min: 0.6, max: 1.5 },
    },
  };
}

/**
 * Fetches every public repository (owned + forks) for a GitHub user via the REST API.
 *
 * Caching (fetch once, reuse everywhere):
 *   1. In-process memory — instant for every request after the first.
 *   2. Filesystem JSON at .cache/github/<user>.json (falls back to os.tmpdir() on
 *      read-only hosts) — survives dev-server restarts. Fresh for 24 hours.
 *   3. GitHub API — only when the cache is missing or stale. Concurrent requests share
 *      one in-flight fetch; if GitHub fails, a stale cache is served instead.
 * Set GITHUB_TOKEN to raise the API rate limit.
 */
import fs from "fs/promises";
import os from "os";
import path from "path";
import type { GitHubRepoLike } from "@/world-map/data/githubAdapter";

const GITHUB_REPOS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type GitHubReposResult =
  | { ok: true; repos: GitHubRepoLike[]; fetchedAt: string }
  | { ok: false; error: string };

interface CacheEntry {
  repos: GitHubRepoLike[];
  fetchedAt: string;
  savedAt: number;
}

let cacheDir = path.join(process.cwd(), ".cache", "github");
const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<GitHubReposResult>>();

const fileFor = (username: string) => path.join(cacheDir, `${encodeURIComponent(username.toLowerCase())}.json`);
const isFresh = (e: CacheEntry) => Date.now() - e.savedAt < GITHUB_REPOS_CACHE_TTL_MS;
const asResult = (e: CacheEntry): GitHubReposResult => ({ ok: true, repos: e.repos, fetchedAt: e.fetchedAt });

async function readDisk(username: string): Promise<CacheEntry | null> {
  try {
    return JSON.parse(await fs.readFile(fileFor(username), "utf8")) as CacheEntry;
  } catch {
    return null;
  }
}

async function writeDisk(username: string, entry: CacheEntry) {
  try {
    await fs.mkdir(cacheDir, { recursive: true });
  } catch {
    cacheDir = path.join(os.tmpdir(), "github-cache");
    await fs.mkdir(cacheDir, { recursive: true }).catch(() => {});
  }
  await fs.writeFile(fileFor(username), JSON.stringify(entry), "utf8").catch(() => {});
}

async function fetchFromGitHub(username: string): Promise<GitHubReposResult> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const repos: GitHubRepoLike[] = [];
  try {
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=100&page=${page}`,
        { headers, cache: "no-store" },
      );
      if (!res.ok) {
        const limited = res.status === 403 || res.status === 429;
        return { ok: false, error: limited ? "GitHub API rate limit reached. Try again later." : `GitHub API responded ${res.status}.` };
      }
      const batch = (await res.json()) as GitHubRepoLike[];
      // Keep only what the atlas reads; GitHub's full objects are ~15× larger.
      repos.push(
        ...batch.map((r) => ({
          name: r.name,
          html_url: r.html_url,
          description: r.description,
          fork: r.fork,
          archived: r.archived,
          language: r.language,
          topics: r.topics ?? [],
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          size: r.size,
          pushed_at: r.pushed_at,
          homepage: r.homepage,
        })),
      );
      if (batch.length < 100) break;
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "GitHub fetch failed." };
  }
  // Pin "now" to the newest push so recency is stable for the lifetime of the cache.
  const newest = repos.reduce((m, r) => Math.max(m, Date.parse(r.pushed_at) || 0), 0);
  return { ok: true, repos, fetchedAt: new Date(newest || Date.now()).toISOString() };
}

export async function fetchGitHubRepos(username: string): Promise<GitHubReposResult> {
  const key = username.toLowerCase();

  const mem = memory.get(key);
  if (mem && isFresh(mem)) return asResult(mem);

  const disk = mem ?? (await readDisk(key));
  if (disk && isFresh(disk)) {
    memory.set(key, disk);
    return asResult(disk);
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const p = (async () => {
    try {
      const result = await fetchFromGitHub(username);
      if (result.ok) {
        const entry: CacheEntry = { repos: result.repos, fetchedAt: result.fetchedAt, savedAt: Date.now() };
        memory.set(key, entry);
        await writeDisk(key, entry);
        return result;
      }
      // GitHub failed: a stale copy beats an error page.
      return disk ? asResult(disk) : result;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

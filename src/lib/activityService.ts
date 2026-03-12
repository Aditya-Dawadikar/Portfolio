/**
 * Activity service — computes GitHub + LeetCode activity data locally
 * (server-side, inside Next.js API routes). No external backend required.
 *
 * Logic ported from portfolio-backend/portfolio-server/server.js.
 *
 * Caching strategy (mirrors readmeCache.ts):
 *   - Filesystem cache at .cache/activity/ with a 15-minute TTL.
 *   - Within a session (first visit + ~15 min) the cached file is returned
 *     immediately — no re-fetch.
 *   - On the next visit after the TTL expires, fresh data is fetched from
 *     GitHub / LeetCode and the file is overwritten.
 *   - If a live fetch fails, the stale cached file is returned as a fallback.
 *   - In-flight deduplication prevents concurrent requests from triggering
 *     redundant fetches.
 */
import fs from "fs/promises";
import path from "path";
import os from "os";

export interface ActivityDay {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export interface MergedDay {
    date: string;
    github: number;
    leetcode: number;
    total: number;
}

export interface GithubResult {
    ok: true;
    totalContributions: number;
    days: ActivityDay[];
}

export interface LeetCodeResult {
    ok: true;
    totalSubmissions: number;
    days: ActivityDay[];
}

export interface ActivityResult {
    ok: boolean;
    params: { githubUsername: string; leetcodeUsername: string };
    sources: {
        github: GithubResult | { ok: false; error: string };
        leetcode: LeetCodeResult | { ok: false; error: string };
    };
    merged: MergedDay[];
}

// ---------------------------------------------------------------------------
// Filesystem cache with 15-minute TTL (same pattern as readmeCache.ts)
// ---------------------------------------------------------------------------

/** How long a cached file is considered fresh (15 minutes). */
const CACHE_TTL_SECONDS = 15 * 60;

const DEFAULT_CACHE_DIR = path.join(process.cwd(), ".cache", "activity");
let CACHE_DIR = DEFAULT_CACHE_DIR;

/** In-process dedupe: avoids concurrent fetches for the same key. */
const inflight = new Map<string, Promise<unknown>>();

async function ensureCacheDir(): Promise<void> {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch {
        const tmpDir = path.join(os.tmpdir(), "activity-cache");
        await fs.mkdir(tmpDir, { recursive: true });
        CACHE_DIR = tmpDir;
    }
}

function cacheFilePath(key: string): string {
    return path.join(CACHE_DIR, encodeURIComponent(key) + ".json");
}

/**
 * Returns cached data if the file is younger than CACHE_TTL_SECONDS.
 * Returns null when missing or expired so the caller re-fetches.
 */
async function getCached<T>(key: string): Promise<T | null> {
    await ensureCacheDir();
    const file = cacheFilePath(key);
    try {
        const st = await fs.stat(file);
        const ageSeconds = (Date.now() - st.mtimeMs) / 1000;
        if (ageSeconds <= CACHE_TTL_SECONDS) {
            const raw = await fs.readFile(file, "utf8");
            return JSON.parse(raw) as T;
        }
    } catch {
        // file missing or unreadable — fall through
    }
    return null;
}

/** Writes the result to the filesystem so subsequent requests can reuse it. */
async function setCached<T>(key: string, value: T): Promise<void> {
    await ensureCacheDir();
    const file = cacheFilePath(key);
    try {
        await fs.writeFile(file, JSON.stringify(value), "utf8");
    } catch {
        // ignore write errors (e.g. read-only FS in serverless)
    }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function fetchActivityData(
    githubUsername: string,
    leetcodeUsername: string
): Promise<ActivityResult> {
    const [githubResult, leetcodeResult] = await Promise.allSettled([
        fetchGithubActivityCached(githubUsername),
        fetchLeetCodeActivityCached(leetcodeUsername),
    ]);

    const github: GithubResult | { ok: false; error: string } =
        githubResult.status === "fulfilled"
            ? githubResult.value
            : { ok: false, error: githubResult.reason?.message ?? "GitHub fetch failed" };

    const leetcode: LeetCodeResult | { ok: false; error: string } =
        leetcodeResult.status === "fulfilled"
            ? leetcodeResult.value
            : { ok: false, error: leetcodeResult.reason?.message ?? "LeetCode fetch failed" };

    const merged = mergeDailyActivity(
        github.ok ? github.days : [],
        leetcode.ok ? leetcode.days : []
    );

    return {
        ok: github.ok && leetcode.ok,
        params: { githubUsername, leetcodeUsername },
        sources: { github, leetcode },
        merged,
    };
}

// ---------------------------------------------------------------------------
// GitHub
// ---------------------------------------------------------------------------

async function fetchGithubActivityCached(username: string): Promise<GithubResult> {
    const key = `github:${username}`;

    const cached = await getCached<GithubResult>(key);
    if (cached) return cached;

    if (inflight.has(key)) return inflight.get(key) as Promise<GithubResult>;

    const p = (async () => {
        try {
            const result = await fetchGithubActivity(username);
            await setCached(key, result);
            return result;
        } catch (err) {
            // On fetch error, return stale cache if available
            const file = cacheFilePath(key);
            try {
                const raw = await fs.readFile(file, "utf8");
                return JSON.parse(raw) as GithubResult;
            } catch {
                throw err;
            }
        } finally {
            inflight.delete(key);
        }
    })();

    inflight.set(key, p);
    return p;
}

async function fetchGithubActivity(username: string): Promise<GithubResult> {
    const today = new Date();
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - 364);

    const toStr = today.toISOString().slice(0, 10);
    const fromStr = from.toISOString().slice(0, 10);
    const encodedUsername = encodeURIComponent(username);

    // Build per-calendar-year ranges so GitHub returns full data
    const ranges: Array<{ from: string; to: string }> = [];
    for (let year = from.getUTCFullYear(); year <= today.getUTCFullYear(); year++) {
        ranges.push({
            from: fromStr > `${year}-01-01` ? fromStr : `${year}-01-01`,
            to: toStr < `${year}-12-31` ? toStr : `${year}-12-31`,
        });
    }

    const allDays: Array<{ date: string; count: number }> = [];

    for (const range of ranges) {
        const response = await fetch(
            `https://github.com/users/${encodedUsername}/contributions?from=${range.from}&to=${range.to}`,
            {
                headers: {
                    "User-Agent": "activity-aggregator",
                    Accept: "image/svg+xml,text/html;q=0.9,*/*;q=0.8",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub public endpoint error (${response.status}).`);
        }

        const rawCalendar = await response.text();

        if (rawCalendar.includes("Not Found")) {
            throw new Error("GitHub user not found.");
        }

        const tooltipCountByCellId = parseTooltipCountByCellId(rawCalendar);
        if (tooltipCountByCellId.size === 0) {
            throw new Error("Could not parse GitHub tooltip contribution data.");
        }

        const dayTags =
            rawCalendar.match(/<td[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g) ||
            rawCalendar.match(/<[^>]*data-date="[^"]+"[^>]*>/g) ||
            [];

        const daysRaw = dayTags
            .map((tag) => {
                const date = extractAttribute(tag, "data-date");
                const cellId = extractAttribute(tag, "id");
                if (!cellId) return null;

                const count = tooltipCountByCellId.get(cellId);
                if (!date || !Number.isFinite(count)) return null;

                return { date, count: count as number };
            })
            .filter((d): d is { date: string; count: number } => d !== null)
            .filter((day) => day.date >= range.from && day.date <= range.to);

        allDays.push(...daysRaw);
    }

    // Deduplicate by date
    const byDate = new Map<string, { date: string; count: number }>();
    for (const day of allDays) {
        byDate.set(day.date, day);
    }

    const daysAll = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    const days = daysAll.filter((day) => day.date >= fromStr && day.date <= toStr);

    if (!days.length) {
        throw new Error("Could not parse GitHub contribution calendar.");
    }

    const totalContributions = days.reduce((sum, day) => sum + day.count, 0);

    return {
        ok: true,
        totalContributions,
        days: computeLevelsForDays(days),
    };
}

// ---------------------------------------------------------------------------
// LeetCode
// ---------------------------------------------------------------------------

async function fetchLeetCodeActivityCached(username: string): Promise<LeetCodeResult> {
    const key = `leetcode:${username}`;

    const cached = await getCached<LeetCodeResult>(key);
    if (cached) return cached;

    if (inflight.has(key)) return inflight.get(key) as Promise<LeetCodeResult>;

    const p = (async () => {
        try {
            const result = await fetchLeetCodeActivity(username);
            await setCached(key, result);
            return result;
        } catch (err) {
            // On fetch error, return stale cache if available
            const file = cacheFilePath(key);
            try {
                const raw = await fs.readFile(file, "utf8");
                return JSON.parse(raw) as LeetCodeResult;
            } catch {
                throw err;
            }
        } finally {
            inflight.delete(key);
        }
    })();

    inflight.set(key, p);
    return p;
}

async function fetchLeetCodeActivity(username: string): Promise<LeetCodeResult> {
    const query = `
    query userCalendar($username: String!) {
      matchedUser(username: $username) {
        userCalendar {
          submissionCalendar
        }
      }
    }
  `;

    const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) {
        throw new Error(`LeetCode API error (${response.status}).`);
    }

    const json = await response.json();

    if (json.errors?.length) {
        throw new Error(`LeetCode GraphQL error: ${json.errors[0].message}`);
    }

    const submissionCalendarRaw =
        json?.data?.matchedUser?.userCalendar?.submissionCalendar;

    if (!submissionCalendarRaw) {
        throw new Error("LeetCode user not found or calendar unavailable.");
    }

    const calendarMap: Record<string, number> = JSON.parse(submissionCalendarRaw);
    const days = Object.entries(calendarMap)
        .map(([unixTimestamp, count]) => ({
            date: new Date(Number(unixTimestamp) * 1000).toISOString().slice(0, 10),
            count: Number(count),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    const totalSubmissions = days.reduce((sum, day) => sum + day.count, 0);

    return {
        ok: true,
        totalSubmissions,
        days: computeLevelsForDays(days),
    };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mergeDailyActivity(
    githubDays: ActivityDay[],
    leetcodeDays: ActivityDay[]
): MergedDay[] {
    const byDate = new Map<string, MergedDay>();

    for (const day of githubDays) {
        byDate.set(day.date, { date: day.date, github: day.count, leetcode: 0, total: day.count });
    }

    for (const day of leetcodeDays) {
        const existing = byDate.get(day.date);
        if (!existing) {
            byDate.set(day.date, { date: day.date, github: 0, leetcode: day.count, total: day.count });
        } else {
            existing.leetcode = day.count;
            existing.total = existing.github + day.count;
        }
    }

    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function computeLevelsForDays(
    days: Array<{ date: string; count: number }>
): ActivityDay[] {
    if (!days.length) return [];

    const counts = days.map((d) => d.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    if (minCount === maxCount) {
        return days.map((day) => ({ ...day, level: day.count === 0 ? 0 : 2 })) as ActivityDay[];
    }

    return days.map((day) => {
        if (day.count === 0) return { ...day, level: 0 as const };

        const normalized = (day.count - minCount) / (maxCount - minCount);
        let level: 0 | 1 | 2 | 3 | 4;

        if (normalized <= 0.25) level = 1;
        else if (normalized <= 0.5) level = 2;
        else if (normalized <= 0.75) level = 3;
        else level = 4;

        return { ...day, level };
    });
}

function extractAttribute(tag: string, attrName: string): string | null {
    const match = tag.match(new RegExp(`${attrName}="([^"]*)"`));
    return match ? match[1] : null;
}

function parseTooltipCountByCellId(rawCalendar: string): Map<string, number> {
    const map = new Map<string, number>();
    const tooltipTags =
        rawCalendar.match(/<tool-tip\b[^>]*>[\s\S]*?<\/tool-tip>/g) || [];

    for (const tag of tooltipTags) {
        const cellId = extractAttribute(tag, "for");
        if (!cellId) continue;

        const textOnly = tag
            .replace(/<template[\s\S]*?<\/template>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const count = parseContributionCountText(textOnly);
        if (Number.isFinite(count)) {
            map.set(cellId, count);
        }
    }

    return map;
}

function parseContributionCountText(text: string): number {
    if (!text) return NaN;

    const match = text.match(/([\d,]+)\s+contributions?/i);
    if (match) return Number(match[1].replace(/,/g, ""));

    if (/^no\s+contributions?/i.test(text)) return 0;

    return NaN;
}

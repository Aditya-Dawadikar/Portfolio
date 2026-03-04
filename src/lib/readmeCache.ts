import fs from "fs/promises";
import path from "path";
import os from "os";

const DEFAULT_CACHE_DIR = path.join(process.cwd(), ".cache", "readmes");
let CACHE_DIR = DEFAULT_CACHE_DIR;

async function ensureDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (err) {
    // Fallback for environments where the project folder is read-only (serverless)
    const tmpDir = path.join(os.tmpdir(), "readmes-cache");
    await fs.mkdir(tmpDir, { recursive: true });
    CACHE_DIR = tmpDir;
  }
}

function cachePath(url: string) {
  return path.join(CACHE_DIR, encodeURIComponent(url) + ".md");
}

// In-process dedupe map to avoid concurrent fetches for the same URL
const inflight = new Map<string, Promise<string>>();

/**
 * Fetch a URL with a simple local filesystem cache.
 * Returns cached content when younger than `maxAgeSeconds`.
 * If a fetch is already in progress for the same URL in this process, it will be reused.
 * If remote fetch fails and a stale cache exists, returns the stale content instead of throwing.
 * Default TTL is 30s (<= 2 requests / minute).
 */
export async function fetchWithLocalCache(url: string, maxAgeSeconds = 30): Promise<string> {
  await ensureDir();
  const file = cachePath(url);

  // If a fresh cache exists, return it immediately
  try {
    const st = await fs.stat(file);
    const age = (Date.now() - st.mtimeMs) / 1000;
    if (age <= maxAgeSeconds) {
      return await fs.readFile(file, "utf8");
    }
  } catch (e) {
    // file missing or inaccessible -> continue to fetch
  }

  // If another fetch for this URL is in-flight, reuse it
  if (inflight.has(url)) {
    return inflight.get(url)!;
  }

  const p = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      }
      const text = await res.text();
      try {
        await fs.writeFile(file, text, "utf8");
      } catch (e) {
        // ignore write errors
      }
      return text;
    } catch (err) {
      // On fetch error, try to return stale cache if available
      try {
        const stale = await fs.readFile(file, "utf8");
        return stale;
      } catch (e) {
        // No stale cache available — rethrow original error
        throw err;
      }
    } finally {
      inflight.delete(url);
    }
  })();

  inflight.set(url, p);
  return p;
}

import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache", "readmes");

async function ensureDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

function cachePath(url: string) {
  return path.join(CACHE_DIR, encodeURIComponent(url) + ".md");
}

/**
 * Fetch a URL with a simple local filesystem cache.
 * Returns cached content when younger than `maxAgeSeconds`.
 * Default TTL is 30s (<= 2 requests / minute).
 */
export async function fetchWithLocalCache(url: string, maxAgeSeconds = 30): Promise<string> {
  await ensureDir();
  const file = cachePath(url);

  try {
    const st = await fs.stat(file);
    const age = (Date.now() - st.mtimeMs) / 1000;
    if (age <= maxAgeSeconds) {
      return await fs.readFile(file, "utf8");
    }
  } catch (e) {
    // file missing or inaccessible -> continue to fetch
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  // write cache best-effort
  try {
    await fs.writeFile(file, text, "utf8");
  } catch (e) {
    // ignore write errors
  }
  return text;
}

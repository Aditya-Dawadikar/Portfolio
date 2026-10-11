import BLOG_ARCHIVE from "@/data/blog-links";

export type BlogPost = {
  title: string;
  href: string;
  /** e.g. "Jul 8, 2026" */
  date: string;
  tags: string[];
  /** The post's cover image (its first image), when there is one. */
  image?: string;
};

const FEED_URL = "https://medium.com/feed/@aditya-dawadikar";
/** Re-fetch the feed at most once an hour; pages using it regenerate in the background. */
const REVALIDATE_SECONDS = 60 * 60;

function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function readTag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  if (!match) return undefined;
  const value = match[1].replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1").trim();
  return decodeEntities(value);
}

function readAllTags(xml: string, name: string) {
  return Array.from(xml.matchAll(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "g"))).map((m) =>
    decodeEntities(m[1].replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1").trim()),
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Medium appends tracking params (`?source=rss-…`) to every link. */
function cleanUrl(url: string) {
  return url.split("?")[0];
}

/** Archive and feed URLs for the same post can differ (the feed adds an id suffix), so posts are matched by title. */
function titleKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** First real image in the post body; Medium also embeds a tracking pixel, which is skipped. */
function coverImage(item: string) {
  const body = readTag(item, "content:encoded") ?? "";
  return Array.from(body.matchAll(/<img[^>]*\ssrc="([^"]+)"/g))
    .map((m) => m[1])
    .find((src) => !src.includes("/_/stat"));
}

export function parseMediumFeed(xml: string): BlogPost[] {
  return Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).flatMap(([, item]) => {
    const title = readTag(item, "title");
    const link = readTag(item, "link");
    const pubDate = readTag(item, "pubDate");
    if (!title || !link || !pubDate || Number.isNaN(Date.parse(pubDate))) return [];
    return [{ title, href: cleanUrl(link), date: formatDate(new Date(pubDate)), tags: readAllTags(item, "category"), image: coverImage(item) }];
  });
}

async function fetchFeed(): Promise<BlogPost[]> {
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (portfolio feed reader)" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseMediumFeed(await res.text());
  } catch (error) {
    console.warn(`[medium] feed unavailable, showing the archive only: ${(error as Error).message}`);
    return [];
  }
}

/**
 * Every Medium post, newest first. The RSS feed is the live source but only carries
 * the latest 10 posts, so older ones come from the archive in `blog-links.ts`.
 * When a post is in both, the feed's copy wins.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const feed = await fetchFeed();
  const seen = new Set(feed.map((post) => titleKey(post.title)));
  const archived = BLOG_ARCHIVE.filter((post) => post.date && !seen.has(titleKey(post.title))).map((post) => ({
    title: post.title,
    href: post.href,
    date: post.date!,
    tags: post.tags ?? [],
    image: post.image,
  }));

  return [...feed, ...archived].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

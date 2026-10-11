import type { Repository, RepositoryStatus, TerritoryKind } from "../types";
import { clamp } from "../utils/geometry";

/** The subset of GitHub's REST repository object the adapter reads. */
export interface GitHubRepoLike {
  name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  size: number;
  pushed_at: string;
  homepage: string | null;
}

/** Extra context for repositories the owner highlights elsewhere (resume, hackathons). */
export interface FeaturedProject {
  repoName: string;
  title?: string;
  description?: string;
  technologies?: string[];
  demoUrl?: string;
  hackathon?: boolean;
  hackathonWinner?: boolean;
}

interface GitHubAdapterOptions {
  /** Reference time for recency (pass the fetch time so server and client agree). */
  now: Date;
  /** Pushed within this many days → active. */
  activeWithinDays?: number;
  /** Untouched for longer than this → drawn as a ruin. */
  dormantAfterDays?: number;
}

/** First matching rule wins. Matched against "name words + description + technologies". */
const CATEGORY_RULES: [TerritoryKind, RegExp][] = [
  ["cloud", /system design/],
  ["experiments", /hackathon|\bhacks?\b|\bpoc\b|playground|\btest\b|simulation|flappy|particle|blob|conway|game of life|visuali[sz]er|open (life|world)|kivi tree|vaccum|chess/],
  ["research", /lora|llama|\bddp\b|neural|neuronite|classification|disease|prediction|\bml project\b|hyper parameter|dataset|\bcs\s?\d{3}|\bccs\b|\bdaa\b|interview|\bprep\b|flashcard|learning|algo|codechef|competitive|books|coding material|collection|behavioral|engineer \d{4}|progress|research|paper/],
  ["agents", /agent|\bai\b|llm|\brag\b|gpt|claude|\bbot\b|bot talk|eval|ml ?flow|vllm|mnemo|train my ai|langchain|langgraph|negotiation/],
  ["cloud", /kubernetes|\bk8s\b|argo|\bray\b|ray flux|spark|flink|distributed|\bs3\b|mini s3|kafka|cluster|\baws\b|\bec2\b|cicd|\bci\b|workflow|job runner|rate limit|log manager|observability|monitor|\bt mon\b|release gate|multiserver|\btcp\b|congestion|network|docker|cloud/],
  ["backend", /server|\bapi\b|\brest\b|spring|express|\bnode\b|django|flask|database|\bsql\b|\bdb\b|in mem|scratch db|auth|blockchain|solidity|golang|\bgo lang\b|placement|management|ecommerce|polls/],
  ["open_source", /react|angular|frontend|front end|portfolio|website|\bhtml\b|\bui\b|web ui|client|blog|todo|timeline|graphs|weather|\bspa\b/],
];

const LANGUAGE_FALLBACK: Record<string, TerritoryKind> = {
  Python: "agents",
  "Jupyter Notebook": "research",
  JavaScript: "open_source",
  TypeScript: "open_source",
  HTML: "open_source",
  CSS: "open_source",
  Vue: "open_source",
  Java: "backend",
  Go: "backend",
  "C#": "backend",
  Kotlin: "backend",
  PHP: "backend",
  Ruby: "backend",
  "C++": "experiments",
  C: "experiments",
  Cuda: "experiments",
  Rust: "experiments",
  Shell: "cloud",
  HCL: "cloud",
  Dockerfile: "cloud",
};

const LINK_STOPWORDS = new Set([
  "aditya", "dawadikar", "app", "apps", "client", "server", "project", "projects", "assignment", "basic", "basics",
  "simple", "with", "angular", "react", "nodejs", "node", "express", "typescript", "javascript", "java", "python",
  "final", "test", "rest", "spring", "boot", "from", "for", "the", "and", "website", "setup", "data", "based",
]);

/** "RealtimeLogManager" / "vibe-in-client" → "Realtime Log Manager" / "vibe in client". */
function humanizeRepoName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_.]+/g, " ")
    .trim();
}

function classify(haystack: string, language: string | null, fork: boolean): TerritoryKind {
  if (fork) return "open_source";
  for (const [kind, re] of CATEGORY_RULES) if (re.test(haystack)) return kind;
  return (language && LANGUAGE_FALLBACK[language]) || "research";
}

const DAY = 86_400_000;
const monthYear = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

/**
 * Pure mapping from GitHub repositories to map `Repository` records.
 * Category, impact, activity, status and relationships are derived heuristically.
 */
export function repositoriesFromGitHub(repos: GitHubRepoLike[], featured: FeaturedProject[], options: GitHubAdapterOptions): Repository[] {
  const { now, activeWithinDays = 120, dormantAfterDays = 4 * 365 } = options;
  const featuredByName = new Map(featured.map((f) => [f.repoName.toLowerCase(), f]));

  const records = repos.map((gh) => {
    const f = featuredByName.get(gh.name.toLowerCase());
    const human = humanizeRepoName(gh.name);
    const technologies = Array.from(new Set([...(f?.technologies ?? []), ...(gh.language ? [gh.language] : []), ...(gh.topics ?? [])]));
    const haystack = `${human} ${gh.description ?? ""} ${f?.title ?? ""} ${f?.description ?? ""} ${technologies.join(" ")}`.toLowerCase();
    if (technologies.length === 0) technologies.push("Notes");
    const category = f?.hackathon ? "experiments" : classify(haystack, gh.language, gh.fork);

    const pushed = new Date(gh.pushed_at);
    const days = Math.max(0, (now.getTime() - pushed.getTime()) / DAY);
    const demoUrl = f?.demoUrl || gh.homepage || undefined;

    let status: RepositoryStatus;
    if (gh.archived) status = "archived";
    else if (demoUrl && !gh.fork) status = "deployed";
    else if (days <= activeWithinDays) status = "active";
    else if (days <= dormantAfterDays) status = "maintained";
    else status = "archived";

    let impact = 12 + Math.min(18, Math.log2(gh.size + 1) * 1.6) + gh.stargazers_count * 6 + gh.forks_count * 3;
    if (f) impact += 45;
    if (f?.hackathonWinner) impact += 14;
    if (demoUrl) impact += 8;
    if (gh.fork) impact = Math.min(impact, 40);

    const description =
      f?.description?.trim() ||
      gh.description?.trim() ||
      `${human} — ${gh.language ?? "notes"} ${gh.fork ? "fork" : "repository"}, last updated ${monthYear(pushed)}.`;

    return {
      tokens: human.toLowerCase().split(/\s+/).filter((t) => t.length >= 4 && !/^\d+$/.test(t) && !LINK_STOPWORDS.has(t)),
      repo: {
        id: gh.name.toLowerCase(),
        name: gh.name,
        description,
        category,
        technologies,
        githubUrl: gh.html_url,
        demoUrl,
        status,
        stars: gh.stargazers_count,
        lastUpdatedAt: gh.pushed_at,
        impactScore: Math.round(clamp(impact, 5, 100)),
        activityScore: Math.round(100 * Math.exp(-days / 200)),
        isOpenSourceContribution: gh.fork || undefined,
        linksTo: [] as string[],
      } satisfies Repository,
    };
  });

  // Relationships: repositories sharing a meaningful name word (client/server pairs, series, rewrites).
  const byToken = new Map<string, string[]>();
  for (const { tokens, repo } of records) for (const t of tokens) byToken.set(t, [...(byToken.get(t) ?? []), repo.id]);
  for (const { tokens, repo } of records) {
    const related = new Set<string>();
    for (const t of tokens) {
      const ids = byToken.get(t) ?? [];
      if (ids.length > 6) continue; // too generic to mean anything
      ids.forEach((id) => id !== repo.id && related.add(id));
    }
    repo.linksTo = Array.from(related).slice(0, 4);
  }
  return records.map((r) => r.repo);
}

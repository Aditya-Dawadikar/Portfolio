import { DATA } from "@/data/resume";
import type { BlogPost } from "@/lib/medium";

/**
 * Turns the dated items in `resume.tsx` and the Medium posts into a git history:
 * every branch means something, and every commit is a real event placed by its date.
 *
 *   main ── education (merges back on graduation)
 *        ── work (merges back when a stretch of roles ends)
 *        ── projects (open) ── hackathons (open, forks from the project that won the first one)
 *                           ── publications (open) ── papers (open)
 *                                                  ── medium (open)
 */

export type BranchId =
  | "main"
  | "education"
  | "work"
  | "projects"
  | "hackathons"
  | "publications"
  | "papers"
  | "medium";

export type Branch = {
  id: BranchId;
  lane: number;
  color: string;
  parent: BranchId | null;
  open: boolean;
};

export type Commit = {
  sha: string;
  branch: BranchId;
  type: string;
  scope?: string;
  breaking?: boolean;
  subject: string;
  dateLabel: string;
  /** Parent shas, first parent first. A merge commit has two. */
  parents: string[];
  isMerge: boolean;
  tags: string[];
  /** DOM ids this commit points at; the first one is where clicking it scrolls to. */
  targets: string[];
  /** Position in the log, 0 = newest. */
  row: number;
};

export type Timeline = {
  branches: Branch[];
  commits: Commit[];
  /** Branch name -> sha of its tip, for open branches and HEAD. */
  refs: { branch: BranchId; sha: string; head: boolean }[];
  /** DOM id of a card -> shas of the commits that belong to it. */
  commitsByTarget: Record<string, string[]>;
};

export const BRANCHES: Branch[] = [
  { id: "main", lane: 0, color: "#f4f4f5", parent: null, open: true },
  { id: "education", lane: 1, color: "#60a5fa", parent: "main", open: false },
  { id: "work", lane: 2, color: "#34d399", parent: "main", open: false },
  { id: "projects", lane: 3, color: "#fbbf24", parent: "main", open: true },
  { id: "hackathons", lane: 4, color: "#fb7185", parent: "projects", open: true },
  // The research grew out of the pulmonary-disease project, so publishing forks from projects.
  { id: "publications", lane: 5, color: "#c4b5fd", parent: "projects", open: true },
  { id: "papers", lane: 6, color: "#a78bfa", parent: "publications", open: true },
  { id: "medium", lane: 7, color: "#f0abfc", parent: "publications", open: true },
];

/** Where life stands today; this is HEAD on main. */
const CURRENT_STATUS = { subject: "open to new opportunities", date: "June 2026" };

/** The summary says the journey started in 2016; that is the root commit. */
const FIRST_COMMIT = { subject: "initial commit — first lines of code as a 10th grader", date: "2016" };

/**
 * The resume lists degrees by year only. These months only order the commits; the
 * labels still show the year alone.
 */
const ACADEMIC_MONTHS: Record<string, { start: number; end: number }> = {
  "Savitribai Phule Pune University": { start: 8, end: 6 },
  "San Jose State University": { start: 8, end: 5 },
};

const SHORT_NAMES: Record<string, string> = {
  "Quantiphi Analytics Pvt. Ltd": "Quantiphi",
  "Dept. Computer Science, San Jose State University": "SJSU",
  "BreakThroughTech, Cornell University": "BreakThroughTech",
  "San Jose State University": "SJSU",
  "Savitribai Phule Pune University": "SPPU",
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type When = { key: number; label: string };

/** Parses the loose date strings used across the data files ("June, 2026", "07-09 April 2022", "Jul 6, 2025", "2018"). */
function parseWhen(text: string, edge: "start" | "end", fallbackMonth?: number): When {
  const parts = text.split(/\s+[-–]\s+/);
  const part = edge === "end" ? parts[parts.length - 1] : parts[0];
  const yearMatch = part.match(/\b(?:19|20)\d{2}\b/);
  if (!yearMatch) throw new Error(`timeline: cannot read a year from "${text}"`);
  const year = Number(yearMatch[0]);
  const monthIndex = MONTHS.findIndex((m) => new RegExp(`\\b${m}`, "i").test(part));
  const dayMatch = part.replace(yearMatch[0], "").match(/\b(\d{1,2})\b/);

  if (monthIndex === -1) {
    const month = fallbackMonth ?? (edge === "end" ? 12 : 1);
    return { key: year * 10000 + month * 100 + (edge === "end" ? 28 : 1), label: String(year) };
  }
  const month = monthIndex + 1;
  // Month-only dates sit mid-month so day-precise posts in the same month interleave sensibly;
  // a stretch starts at the top of its month and ends at the bottom of it.
  const day = dayMatch ? Number(dayMatch[1]) : edge === "end" ? 28 : edge === "start" && parts.length > 1 ? 1 : 15;
  return { key: year * 10000 + month * 100 + day, label: `${MONTH_LABELS[monthIndex]} ${year}` };
}

export function shortName(name: string) {
  return SHORT_NAMES[name] ?? name.split(",")[0].trim();
}

/** "Master's Degree of Computer Science (Ms CS)" -> "master's in Computer Science" */
function degreeName(degree: string) {
  const match = degree.match(/^(\w+'s) Degree of (.+?)\s*\(/);
  return match ? `${match[1].toLowerCase()} in ${match[2]}` : degree;
}

/** "Neuronite - C++ Library for Neural Networks" -> "Neuronite"; short prefixes like "KT" keep the full title. */
function projectName(title: string) {
  const head = title.split(/\s+[-—]\s+/)[0].trim();
  return head.length >= 4 ? head : title;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function shaOf(input: string) {
  // FNV-1a, widened to 7 hex chars like an abbreviated git sha.
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i += 1) {
    h1 = Math.imul(h1 ^ input.charCodeAt(i), 16777619);
    h2 = Math.imul(h2 ^ input.charCodeAt(i), 2246822519);
  }
  return ((h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16)).slice(0, 7);
}

type Draft = Omit<Commit, "sha" | "parents" | "row"> & {
  key: number;
  seq: number;
  /** Commits that share a lineage (one degree, one stretch of jobs, a whole open branch). */
  era: string;
  /** For merge commits on main: the era being merged in. */
  mergesEra?: string;
};

export function projectTarget(title: string) {
  return `project-${slugify(title)}`;
}

function hrefsOf(item: { href?: string; links?: readonly { href: string }[] }) {
  return new Set([item.href, ...(item.links ?? []).map((link) => link.href)].filter(Boolean) as string[]);
}

/** `posts` are the Medium posts (see getBlogPosts); post commits target `post-<index in posts>`. */
export function buildTimeline(blogPosts: BlogPost[]): Timeline {
  const drafts: Draft[] = [];
  const add = (draft: Omit<Draft, "seq" | "tags" | "isMerge"> & Partial<Pick<Draft, "tags" | "isMerge">>) => {
    drafts.push({ tags: [], isMerge: false, ...draft, seq: drafts.length });
  };

  // ── main: the root commit ────────────────────────────────────────────────
  const first = parseWhen(FIRST_COMMIT.date, "start");
  add({ branch: "main", era: "main", type: "chore", subject: FIRST_COMMIT.subject, key: first.key, dateLabel: first.label, targets: ["about"] });

  // ── education: each degree forks from main and merges back on graduation ──
  [...DATA.education].reverse().forEach((edu) => {
    const index = DATA.education.indexOf(edu);
    const months = ACADEMIC_MONTHS[edu.school];
    const start = parseWhen(edu.start, "start", months?.start);
    const end = parseWhen(edu.end, "end", months?.end);
    const era = `education:${index}`;
    const target = `education-${index}`;
    const name = degreeName(edu.degree);
    add({ branch: "education", era, type: "feat", scope: "education", subject: `begin ${name} @ ${shortName(edu.school)}`, key: start.key, dateLabel: start.label, targets: [target] });
    add({ branch: "main", era: "main", mergesEra: era, isMerge: true, type: "merge", scope: "education", subject: `graduate with a ${name} from ${shortName(edu.school)}`, key: end.key, dateLabel: end.label, targets: [target], tags: ["🎓 graduated"] });
  });

  // ── work: overlapping roles form one stretch on the work branch; a gap merges it back ──
  const roles = DATA.work
    .map((role, index) => ({ role, index, start: parseWhen(role.start, "start"), end: parseWhen(role.end, "end") }))
    .sort((a, b) => a.start.key - b.start.key);

  const stretches: (typeof roles)[] = [];
  for (const role of roles) {
    const current = stretches[stretches.length - 1];
    const currentEnd = current ? Math.max(...current.map((r) => r.end.key)) : -1;
    // Within about a month counts as continuous (e.g. an internship rolling into a full-time offer).
    if (current && role.start.key <= currentEnd + 100) current.push(role);
    else stretches.push([role]);
  }

  stretches.forEach((stretch, s) => {
    const era = `work:${s}`;
    const stretchEnd = stretch.reduce((latest, r) => (r.end.key > latest.end.key ? r : latest));
    const promotedFrom = new Set<number>();

    stretch.forEach((r, i) => {
      const company = shortName(r.role.company);
      const previous = stretch
        .slice(0, i)
        .find((p) => p.role.company === r.role.company && r.start.key - p.end.key <= 100 && r.start.key > p.end.key);
      if (previous) {
        promotedFrom.add(previous.index);
        add({ branch: "work", era, type: "refactor", scope: "work", subject: `promote to ${r.role.title} @ ${company}`, key: r.start.key, dateLabel: r.start.label, targets: [`work-${r.index}`], tags: ["promotion"] });
      } else {
        add({ branch: "work", era, type: "feat", scope: "work", subject: `join ${company} as ${r.role.title}`, key: r.start.key, dateLabel: r.start.label, targets: [`work-${r.index}`] });
      }
    });

    stretch.forEach((r) => {
      if (promotedFrom.has(r.index) || r.end.key === stretchEnd.end.key) return;
      add({ branch: "work", era, type: "chore", scope: "work", subject: `wrap up ${r.role.title} @ ${shortName(r.role.company)}`, key: r.end.key, dateLabel: r.end.label, targets: [`work-${r.index}`] });
    });

    const closing = stretch.filter((r) => r.end.key === stretchEnd.end.key);
    const companies = Array.from(new Set(stretch.map((r) => shortName(r.role.company))));
    const firstYear = Math.floor(stretch[0].start.key / 10000);
    const lastYear = Math.floor(stretchEnd.end.key / 10000);
    const years = firstYear === lastYear ? `${firstYear}` : `${firstYear}–${lastYear}`;
    add({
      branch: "main",
      era: "main",
      mergesEra: era,
      isMerge: true,
      type: "merge",
      scope: "work",
      subject: `wrap up ${companies.join(", ").replace(/, ([^,]*)$/, " & $1")} (${years})`,
      key: stretchEnd.end.key,
      dateLabel: stretchEnd.end.label,
      targets: closing.map((r) => `work-${r.index}`),
    });
  });

  // ── hackathons & projects ───────────────────────────────────────────────
  // A project that was born at a hackathon lives only on the hackathons branch;
  // one that existed before (and later won) keeps its own commit on projects.
  const hackathonOfProject = new Map<string, number>();
  DATA.projects.forEach((project) => {
    const projectStart = parseWhen(project.dates, "start").key;
    const projectHrefs = hrefsOf(project);
    DATA.hackathons.forEach((hackathon, h) => {
      const shared = Array.from(hrefsOf(hackathon)).some((href) => projectHrefs.has(href));
      const hackathonMonth = Math.floor(parseWhen(hackathon.dates, "start").key / 100);
      if (shared && Math.floor(projectStart / 100) >= hackathonMonth) hackathonOfProject.set(project.title, h);
    });
  });

  const projectTargetsOfHackathon = new Map<number, string[]>();
  DATA.projects.forEach((project) => {
    const h = hackathonOfProject.get(project.title);
    if (h === undefined) {
      const when = parseWhen(project.dates, "start");
      add({
        branch: "projects",
        era: "projects",
        type: "feat",
        scope: "projects",
        subject: `build ${projectName(project.title)}`,
        key: when.key,
        dateLabel: when.label,
        targets: [projectTarget(project.title)],
        tags: project.active ? ["WIP"] : [],
      });
    } else {
      projectTargetsOfHackathon.set(h, [...(projectTargetsOfHackathon.get(h) ?? []), projectTarget(project.title)]);
    }
  });

  DATA.hackathons.forEach((hackathon, h) => {
    const when = parseWhen(hackathon.dates, "start");
    const won = hackathon.result === "winner";
    const targets = [`hackathon-${h}`, ...(projectTargetsOfHackathon.get(h) ?? [])];
    add({
      branch: "hackathons",
      era: "hackathons",
      type: won ? "feat" : "chore",
      scope: "hackathons",
      breaking: won,
      subject: won ? `win ${hackathon.event} with ${hackathon.project}` : `build ${hackathon.project} @ ${hackathon.event}`,
      key: when.key,
      dateLabel: when.label,
      targets,
      tags: won ? ["🏆 winner"] : [],
    });
  });

  // ── publications → papers & medium ──────────────────────────────────────
  const papers = DATA.papers.map((paper, index) => ({ paper, index, when: parseWhen(paper.date, "start") }));
  const posts = blogPosts.map((post, index) => ({ post, index, when: parseWhen(post.date, "start") }));
  const firstPublished = Math.min(...papers.map((p) => p.when.key), ...posts.map((p) => p.when.key));
  const firstPublishedLabel = [...papers, ...posts].find((p) => p.when.key === firstPublished)!.when.label;
  add({ branch: "publications", era: "publications", type: "chore", scope: "publications", subject: "start publishing research & writing", key: firstPublished - 1, dateLabel: firstPublishedLabel, targets: ["publications"] });

  papers.forEach(({ paper, index, when }) => {
    add({ branch: "papers", era: "papers", type: "docs", scope: "papers", subject: `publish "${paper.title}" in ${paper.venueShort}`, key: when.key, dateLabel: when.label, targets: [`paper-${index}`] });
  });
  posts.forEach(({ post, index, when }) => {
    add({ branch: "medium", era: "medium", type: "docs", scope: "medium", subject: `write "${post.title}"`, key: when.key, dateLabel: when.label, targets: [`post-${index}`] });
  });

  // ── HEAD ────────────────────────────────────────────────────────────────
  const now = parseWhen(CURRENT_STATUS.date, "start");
  add({ branch: "main", era: "main", type: "chore", subject: CURRENT_STATUS.subject, key: now.key, dateLabel: now.label, targets: ["contact"] });

  // ── wire parents by replaying history oldest → newest ────────────────────
  const chronological = [...drafts].sort((a, b) => a.key - b.key || a.seq - b.seq);
  const shaOfDraft = new Map<Draft, string>();
  const taken = new Set<string>();
  for (const draft of chronological) {
    let sha = shaOf(`${draft.branch}|${draft.type}|${draft.subject}|${draft.key}`);
    while (taken.has(sha)) sha = shaOf(sha);
    taken.add(sha);
    shaOfDraft.set(draft, sha);
  }

  const parentBranchOf = new Map(BRANCHES.map((b) => [b.id, b.parent]));
  const tipOfEra = new Map<string, string>();
  const tipOfBranch = new Map<BranchId, string>();
  const parentsOf = new Map<Draft, string[]>();

  for (const draft of chronological) {
    const sha = shaOfDraft.get(draft)!;
    const parents: string[] = [];
    const eraTip = tipOfEra.get(draft.era);
    if (eraTip) {
      parents.push(eraTip);
    } else {
      const forkFrom = parentBranchOf.get(draft.branch);
      const forkTip = forkFrom ? tipOfBranch.get(forkFrom) : undefined;
      if (forkTip) parents.push(forkTip);
    }
    if (draft.mergesEra) {
      const merged = tipOfEra.get(draft.mergesEra);
      if (merged) parents.push(merged);
    }
    parentsOf.set(draft, parents);
    tipOfEra.set(draft.era, sha);
    tipOfBranch.set(draft.branch, sha);
  }

  const newestFirst = [...chronological].reverse();
  const commits: Commit[] = newestFirst.map((draft, row) => {
    const { key: _key, seq: _seq, era: _era, mergesEra: _mergesEra, ...rest } = draft;
    return { ...rest, sha: shaOfDraft.get(draft)!, parents: parentsOf.get(draft)!, row };
  });

  const refs = BRANCHES.filter((b) => b.open && tipOfBranch.has(b.id)).map((b) => ({
    branch: b.id,
    sha: tipOfBranch.get(b.id)!,
    head: b.id === "main",
  }));

  const commitsByTarget: Record<string, string[]> = {};
  for (const commit of commits) {
    for (const target of commit.targets) {
      (commitsByTarget[target] ??= []).push(commit.sha);
    }
  }

  return { branches: BRANCHES, commits, refs, commitsByTarget };
}

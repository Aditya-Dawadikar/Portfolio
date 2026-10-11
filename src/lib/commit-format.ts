import type { Branch, BranchId, Commit } from "@/lib/timeline";

/** Conventional-commit header, e.g. `feat(hackathons)!: win SFHacks 2026 with EVBnB`. */
export function commitHeader(commit: Pick<Commit, "type" | "scope" | "breaking" | "subject">) {
  return `${commit.type}${commit.scope ? `(${commit.scope})` : ""}${commit.breaking ? "!" : ""}: ${commit.subject}`;
}

export function branchColor(branches: Branch[], id: BranchId) {
  return branches.find((b) => b.id === id)?.color ?? "#f4f4f5";
}

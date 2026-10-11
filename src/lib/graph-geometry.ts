import type { BranchId, Commit } from "@/lib/timeline";

export type GraphEdge = {
  id: string;
  /** SVG path, always drawn from the older (lower) commit towards the newer one. */
  d: string;
  /** Branch whose colour the edge takes. */
  branch: BranchId;
  /** Row of the older end, used to replay history oldest → newest. */
  lowerRow: number;
};

/**
 * Lines between every commit and its parents for a newest-at-top graph.
 * Same-lane parents are straight lines; a fork curves out of the parent and runs up the
 * new lane; a merge runs up the merged lane and curves into the merge commit.
 */
export function graphEdges(
  commits: Commit[],
  position: (commit: Commit) => { x: number; y: number },
  rowHeight: number,
): GraphEdge[] {
  if (!rowHeight) return [];
  const bySha = new Map(commits.map((c) => [c.sha, c]));
  const edges: GraphEdge[] = [];

  for (const child of commits) {
    child.parents.forEach((parentSha, index) => {
      const parent = bySha.get(parentSha)!;
      const { x: xc, y: yc } = position(child);
      const { x: xp, y: yp } = position(parent);
      const bend = Math.min(rowHeight * 1.6, yp - yc);
      let d: string;
      let branch: BranchId;
      if (xc === xp) {
        d = `M ${xp} ${yp} L ${xc} ${yc}`;
        branch = child.branch;
      } else if (child.isMerge && index > 0) {
        d = `M ${xp} ${yp} L ${xp} ${yc + bend} C ${xp} ${yc + bend * 0.45} ${xc} ${yc + bend * 0.55} ${xc} ${yc}`;
        branch = parent.branch;
      } else {
        d = `M ${xp} ${yp} C ${xp} ${yp - bend * 0.55} ${xc} ${yp - bend * 0.45} ${xc} ${yp - bend} L ${xc} ${yc}`;
        branch = child.branch;
      }
      edges.push({ id: `${child.sha}-${parentSha}`, d, branch, lowerRow: parent.row });
    });
  }
  return edges;
}

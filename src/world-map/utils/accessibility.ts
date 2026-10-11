import type { ScoredRepository, SettlementKind, Territory } from "../types";

export const KIND_LABEL: Record<SettlementKind, string> = {
  village: "Village",
  outpost: "Outpost",
  workshop: "Workshop",
  shrine: "Shrine",
  archive: "Archive",
  port: "Port",
  ruin: "Ruin",
  tower: "Tower",
  observatory: "Observatory",
  citadel: "Citadel",
  aqueduct: "Aqueduct complex",
  academy: "Academy",
  bridge_city: "Bridge city",
  forum: "Forum",
  arena: "Arena",
  library: "Library",
  temple: "Temple",
};

export const KIND_MEANING: Record<SettlementKind, string> = {
  village: "Small utility or learning repository",
  outpost: "Small, focused backend or cloud project",
  workshop: "Prototype or experiment",
  shrine: "Tiny special-interest project",
  archive: "Maintained library, tooling or notes",
  port: "Open-source or externally connected project",
  ruin: "Archived repository",
  tower: "Infrastructure or security project",
  observatory: "Major AI & agents project",
  citadel: "Major backend & security project",
  aqueduct: "Major cloud & distributed-systems project",
  academy: "Major research project",
  bridge_city: "Major open-source project",
  forum: "Major experiment or hackathon project",
  arena: "Hackathon showcase",
  library: "Documentation or knowledge system",
  temple: "Flagship project",
};

export function settlementAriaLabel(r: ScoredRepository, territory?: Territory) {
  return `${r.name}, ${KIND_LABEL[r.settlementKind].toLowerCase()} in ${territory?.name ?? r.category}, ${r.status}`;
}

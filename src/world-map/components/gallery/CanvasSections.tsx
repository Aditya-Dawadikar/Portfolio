"use client";

import type {
  DrawContext,
  Landmass,
  LandmarkKind,
  MinorSettlementKind,
  RepositoryStatus,
  SettlementTier,
  SettlementVisualState,
  StatueVariant,
  TerritoryRegion,
  TreeType,
  WorldPoint,
} from "../../types";
import {
  type SettlementLike,
  drawActiveGlow,
  drawBridge,
  drawClassicalStatue,
  drawCloudsAndFog,
  drawCoastline,
  drawCompassRose,
  drawConnectionThread,
  drawForestCluster,
  drawHills,
  drawLake,
  drawLandFill,
  drawMarbleTexture,
  drawMountain,
  drawMountainRange,
  drawRiver,
  drawRoad,
  drawSea,
  drawSeaRoute,
  drawSettlementWithEffects,
  drawShallowRings,
  drawTerritoryBorders,
  drawWaves,
  landPath,
  landmassFromPolygon,
  LANDMARK_RADIUS,
} from "../../canvas/drawing";
import { createRandom } from "../../canvas/engine/seededRandom";
import { lerp, noisyBlob } from "../../utils/geometry";
import { KIND_LABEL, KIND_MEANING } from "../../utils/accessibility";
import { StampCanvas } from "../canvas/StampCanvas";
import { Grid, SubHeading, Tile } from "./GalleryParts";

const island = (c: WorldPoint, r: number, seed: string, kind: Landmass["kind"] = "continent") =>
  landmassFromPolygon(seed, noisyBlob(c, r, 30, 0.32, createRandom(seed).next), kind);

/** Sea + island scene used by several tiles. */
function seaScene(dc: DrawContext, w: number, h: number, isl: Landmass[]) {
  const bounds = { minX: 0, minY: 0, maxX: w, maxY: h };
  drawSea(dc, { bounds, landmasses: isl });
  isl.forEach((l) => drawShallowRings(dc, { polygon: l.polygon }));
  drawWaves(dc, { bounds, landmasses: isl, spacing: 26 });
  drawLandFill(dc, { landmasses: isl });
  drawMarbleTexture(dc, { clip: landPath(isl), bounds, intensity: 1 });
  isl.forEach((l) => drawCoastline(dc, { polygon: l.polygon, id: l.id }));
}

const T_W = 260;
const T_H = 180;

/* ------------------------------------------------------------------ */

export function TerrainSection() {
  const trees: TreeType[] = ["cypress", "olive", "pine"];
  return (
    <>
      <SubHeading>Water & coast</SubHeading>
      <Grid min={240}>
        <Tile name="Sea, depth bands & waves" fn="drawSea · drawWaves" note="Stepped engraved bands, never a smooth gradient">
          <StampCanvas width={T_W} height={T_H} background="none" seed="sea" draw={(dc, { width, height }) => {
            const bounds = { minX: 0, minY: 0, maxX: width, maxY: height };
            const l = island({ x: width * 0.5, y: height * 0.5 }, 22, "sea-isle");
            drawSea(dc, { bounds, landmasses: [l] });
            drawWaves(dc, { bounds, landmasses: [l], spacing: 22 });
          }} />
        </Tile>
        <Tile name="Coastline & shallow rings" fn="drawShallowRings · drawCoastline" note="Ink contour, 3 off-white rings, offshore rocks">
          <StampCanvas width={T_W} height={T_H} background="none" seed="coast" draw={(dc, { width, height }) => seaScene(dc, width, height, [island({ x: width / 2, y: height / 2 }, 58, "coast-a")])} />
        </Tile>
        <Tile name="Archipelago" fn="generateLandmass → islands" note="Satellite islands share every coast rule">
          <StampCanvas width={T_W} height={T_H} zoom={0.8} background="none" seed="arch" draw={(dc, { width, height }) =>
            seaScene(dc, width, height, [
              island({ x: width * 0.3, y: height * 0.45 }, 52, "arch-a"),
              island({ x: width * 0.72, y: height * 0.3 }, 28, "arch-b", "island"),
              island({ x: width * 0.7, y: height * 0.75 }, 20, "arch-c", "island"),
            ])
          } />
        </Tile>
        <Tile name="Marble texture" fn="drawMarbleTexture" note="Veins, cracks, hatch patches, stipple (≤15% contrast)">
          <StampCanvas width={T_W} height={T_H} zoom={1.4} background="marble" seed="marble" draw={(dc, { width, height }) => {
            const rect = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }];
            drawMarbleTexture(dc, { clip: landPath([landmassFromPolygon("m", rect)]), bounds: { minX: 0, minY: 0, maxX: width, maxY: height }, intensity: 1.6 });
          }} />
        </Tile>
      </Grid>

      <SubHeading>Relief</SubHeading>
      <Grid min={240}>
        <Tile name="Mountain range with pass" fn="drawMountainRange" note="Gap left where a road may cross">
          <StampCanvas width={T_W} height={T_H} zoom={1.1} seed="ridge" draw={(dc, { width, height }) => {
            const ridge = [{ x: 18, y: height * 0.62 }, { x: width * 0.35, y: height * 0.5 }, { x: width * 0.6, y: height * 0.6 }, { x: width - 18, y: height * 0.45 }];
            drawRoad(dc, { path: [{ x: width * 0.47, y: height + 4 }, { x: width * 0.49, y: height * 0.55 }, { x: width * 0.47, y: -4 }], rank: "minor" });
            drawMountainRange(dc, { ridge, density: 1, scaleRange: [0.7, 1.1], snowcaps: false, passes: [{ x: width * 0.48, y: height * 0.55 }], rng: createRandom("ridge") });
          }} />
        </Tile>
        <Tile name="Snow-capped range" fn="drawMountainRange · snowcaps" note="Cloud territory only (elevationBias > 0.4)">
          <StampCanvas width={T_W} height={T_H} zoom={1.1} seed="snow" draw={(dc, { width, height }) => {
            drawMountainRange(dc, { ridge: [{ x: 16, y: height * 0.55 }, { x: width * 0.5, y: height * 0.65 }, { x: width - 16, y: height * 0.5 }], density: 1.1, scaleRange: [0.85, 1.3], snowcaps: true, passes: [], rng: createRandom("snow") });
          }} />
        </Tile>
        <Tile name="Single peaks by scale" fn="drawMountain">
          <StampCanvas width={T_W} height={T_H} zoom={1.2} seed="peaks" draw={(dc, { width, height }) => {
            [0.6, 0.9, 1.2, 1.5].forEach((s, i) => drawMountain(dc, { position: { x: width * (0.15 + i * 0.23), y: height * 0.68 }, scale: s, snowcap: i === 3, rng: createRandom(`pk${i}`) }));
          }} />
        </Tile>
        <Tile name="Hills" fn="drawHills">
          <StampCanvas width={T_W} height={T_H} zoom={1.6} seed="hills" draw={(dc, { width, height }) => {
            const r = createRandom("hills");
            const pts = Array.from({ length: 14 }, () => ({ x: r.range(12, width - 12), y: r.range(14, height - 6) }));
            drawHills(dc, { points: pts });
          }} />
        </Tile>
      </Grid>

      <SubHeading>Vegetation & water</SubHeading>
      <Grid min={240}>
        {trees.map((t) => (
          <Tile key={t} name={`${t[0].toUpperCase()}${t.slice(1)} forest`} fn={`drawForestCluster · ${t}`} note="Staggered, softer at the edge">
            <StampCanvas width={T_W} height={T_H} zoom={1.4} seed={`forest-${t}`} draw={(dc, { width, height }) =>
              drawForestCluster(dc, { polygon: noisyBlob({ x: width / 2, y: height / 2 + 4 }, Math.min(width, height) * 0.4, 18, 0.35, createRandom(t).next), density: 0.8, treeType: t, rng: createRandom(`f-${t}`) })
            } />
          </Tile>
        ))}
        <Tile name="River with tributary" fn="drawRiver" note="Narrow at source, wider at mouth">
          <StampCanvas width={T_W} height={T_H} zoom={1} seed="river" draw={(dc, { width, height }) =>
            drawRiver(dc, {
              path: [{ x: 20, y: 16 }, { x: width * 0.3, y: height * 0.35 }, { x: width * 0.55, y: height * 0.45 }, { x: width * 0.75, y: height * 0.7 }, { x: width + 4, y: height * 0.85 }],
              widthAtSource: 1.2,
              widthAtMouth: 9,
              tributaries: [{ id: "t", path: [{ x: width * 0.65, y: 8 }, { x: width * 0.62, y: height * 0.25 }, { x: width * 0.58, y: height * 0.47 }], widthAtSource: 1, widthAtMouth: 3, tributaries: [] }],
            })
          } />
        </Tile>
        <Tile name="Lake" fn="drawLake">
          <StampCanvas width={T_W} height={T_H} zoom={1.3} seed="lake" draw={(dc, { width, height }) => {
            drawRiver(dc, { path: [{ x: width / 2 + 10, y: height / 2 + 10 }, { x: width * 0.7, y: height * 0.75 }, { x: width + 4, y: height * 0.85 }], widthAtSource: 2, widthAtMouth: 4, tributaries: [] });
            drawLake(dc, { polygon: noisyBlob({ x: width / 2, y: height / 2 }, 30, 14, 0.3, createRandom("lk").next) });
          }} />
        </Tile>
        <Tile name="Territory border" fn="drawTerritoryBorders" note="Dash-dot bronze on shared edges, clipped to land">
          <StampCanvas width={T_W} height={T_H} background="none" seed="border" draw={(dc, { width, height }) => {
            const land = island({ x: width / 2, y: height / 2 }, 74, "border-land");
            seaScene(dc, width, height, [land]);
            const cellA = [{ x: 0, y: 0 }, { x: width * 0.55, y: 0 }, { x: width * 0.42, y: height }, { x: 0, y: height }];
            const cellB = [{ x: width * 0.55, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: width * 0.42, y: height }];
            const region = (cell: WorldPoint[], id: TerritoryRegion["territoryId"]): TerritoryRegion => ({ territoryId: id, site: cell[0], weight: 0, cell, islandIds: [], polygons: [cell], bounds: { minX: 0, minY: 0, maxX: width, maxY: height }, centroid: cell[0], labelAnchor: cell[0], area: 1 });
            drawTerritoryBorders(dc, { regions: [region(cellA, "agents"), region(cellB, "backend")], landmasses: [land] });
          }} />
        </Tile>
      </Grid>
    </>
  );
}

/* ------------------------------------------------------------------ */

const MINOR_KINDS: MinorSettlementKind[] = ["village", "outpost", "workshop", "shrine", "archive", "port", "tower", "ruin"];

function settlement(kind: SettlementLike["kind"], pos: WorldPoint, opts: Partial<SettlementLike> = {}): SettlementLike {
  const isLm = !MINOR_KINDS.includes(kind as MinorSettlementKind);
  const tier: SettlementTier = opts.tier ?? (isLm ? "landmark" : "minor");
  const scale = opts.scale ?? 1;
  return {
    kind,
    tier,
    position: pos,
    scale,
    rotation: 0,
    activeGlow: 0,
    weathering: kind === "ruin" ? 1 : 0,
    status: kind === "ruin" ? "archived" : "maintained",
    hitRadius: isLm ? LANDMARK_RADIUS * scale * 1.05 : 13 * scale * (tier === "major" ? 1.25 : 1),
    repositoryId: `gallery-${kind}-${tier}`,
    ...opts,
  };
}

export function SettlementSection() {
  return (
    <Grid min={300}>
      {MINOR_KINDS.map((k) => (
        <Tile key={k} name={KIND_LABEL[k]} fn={`drawSettlement · ${k}`} note={KIND_MEANING[k]}>
          <div className="grid grid-cols-2">
            {(["minor", "major"] as const).map((tier) => (
              <div key={tier} className="relative">
                <StampCanvas width={150} height={120} zoom={2.6} seed={`${k}-${tier}`} draw={(dc, { width, height }) =>
                  drawSettlementWithEffects(dc, settlement(k, { x: k === "port" ? width / 2 - 6 : width / 2, y: height / 2 + 1 }, { tier: k === "ruin" ? "minor" : tier, scale: k === "ruin" && tier === "major" ? 1.3 : 1 }))
                } />
                <span className="absolute left-1.5 top-1 text-[9px] uppercase tracking-[0.2em] text-[#5c564e]">{tier}</span>
              </div>
            ))}
          </div>
        </Tile>
      ))}
    </Grid>
  );
}

/* ------------------------------------------------------------------ */

const LANDMARKS: { kind: LandmarkKind; territory: string }[] = [
  { kind: "observatory", territory: "AI & Agents" },
  { kind: "citadel", territory: "Backend & Security" },
  { kind: "aqueduct", territory: "Cloud & Distributed" },
  { kind: "academy", territory: "Research Lab" },
  { kind: "bridge_city", territory: "Open Source Frontier" },
  { kind: "forum", territory: "Experiments" },
  { kind: "arena", territory: "Hackathons" },
  { kind: "library", territory: "Docs & tooling" },
  { kind: "temple", territory: "World flagship" },
];

export function LandmarkSection() {
  return (
    <>
      <Grid min={250}>
        {LANDMARKS.map(({ kind, territory }) => (
          <Tile key={kind} name={`${KIND_LABEL[kind]} — ${territory}`} fn={`drawLandmark · ${kind}`} note={KIND_MEANING[kind]}>
            <StampCanvas width={280} height={220} zoom={2.2} seed={kind} draw={(dc, { width, height }) =>
              drawSettlementWithEffects(dc, settlement(kind, { x: width / 2, y: height / 2 + 2 }, { scale: 1.75 }))
            } />
          </Tile>
        ))}
      </Grid>
      <SubHeading>Landmark scale follows impactScore</SubHeading>
      <Tile name="Temple at impact 40 · 70 · 100" fn="settlementScale(impactScore) → lerp(1.5, 2.4)">
        <StampCanvas width={760} height={200} zoom={1.25} seed="scale" draw={(dc, { width, height }) => {
          [40, 70, 100].forEach((impact, i) => {
            const scale = lerp(1.5, 2.4, impact / 100);
            drawSettlementWithEffects(dc, settlement("temple", { x: width * (0.18 + i * 0.32), y: height / 2 + 4 }, { scale, status: "deployed", activeGlow: 1 }));
          });
        }} />
      </Tile>
    </>
  );
}

/* ------------------------------------------------------------------ */

const STATUS_ROWS: { status: RepositoryStatus; kind: SettlementLike["kind"]; tier: SettlementTier; glow: number; scale: number }[] = [
  { status: "deployed", kind: "observatory", tier: "landmark", glow: 1, scale: 1.3 },
  { status: "active", kind: "tower", tier: "major", glow: 0.6, scale: 1.25 },
  { status: "maintained", kind: "archive", tier: "major", glow: 0, scale: 1.25 },
  { status: "archived", kind: "ruin", tier: "minor", glow: 0, scale: 1.4 },
];

const STATES: { label: string; state: (t: number) => Partial<SettlementVisualState>; animate?: boolean }[] = [
  { label: "Base", state: () => ({}) },
  { label: "Hover", state: () => ({ hovered: true }) },
  { label: "Selected", state: () => ({ selected: true }) },
  { label: "Focused", state: () => ({ focused: true }) },
  { label: "Filtered / dimmed", state: () => ({ dimmed: true }) },
  { label: "Search pulse", state: (t) => ({ pulse: (t % 1600) / 1600, selected: true }), animate: true },
];

export function StatusMatrixSection() {
  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-2">
        <thead>
          <tr>
            <th className="w-28" />
            {STATES.map((s) => (
              <th key={s.label} className="text-left text-[10px] font-normal uppercase tracking-[0.2em] text-[#a59e92]">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STATUS_ROWS.map((row) => (
            <tr key={row.status}>
              <th className="text-left align-middle">
                <div className="text-[13px] font-normal capitalize text-[#f2ede2]">{row.status}</div>
                <div className="text-[10px] font-normal text-[#8f887c]">{KIND_LABEL[row.kind]} · {row.tier}</div>
              </th>
              {STATES.map((s) => (
                <td key={s.label} className="w-[142px] overflow-hidden rounded-[4px] border border-[#f2ede2]/12 p-0">
                  <StampCanvas width={140} height={118} zoom={1.35} seed={`${row.status}-${s.label}`} animate={s.animate} draw={(dc, { width, height }) =>
                    drawSettlementWithEffects(
                      dc,
                      settlement(row.kind, { x: width / 2, y: height / 2 + 2 }, { tier: row.tier, status: row.status, activeGlow: row.glow, scale: row.scale, weathering: row.status === "archived" ? 1 : 0 }),
                      s.state(dc.time),
                    )
                  } />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const C_W = 340;
const C_H = 200;

function bridgeScene(dc: DrawContext, w: number, h: number, variant: "stone" | "aqueduct" | "long_arch") {
  const width = variant === "long_arch" ? 12 : variant === "aqueduct" ? 7 : 5;
  const river = { path: [{ x: w * 0.42, y: -4 }, { x: w * 0.5, y: h * 0.5 }, { x: w * 0.56, y: h + 4 }], widthAtSource: width * 0.8, widthAtMouth: width, tributaries: [] };
  drawRiver(dc, river);
  const road = [{ x: -4, y: h * 0.55 }, { x: w * 0.3, y: h * 0.5 }, { x: w * 0.7, y: h * 0.48 }, { x: w + 4, y: h * 0.42 }];
  drawRoad(dc, { path: road, rank: variant === "stone" ? "minor" : "major" });
  drawBridge(dc, { position: { x: w * 0.5, y: h * 0.49 }, angle: -0.04, span: width * 2 + 12, variant });
}

export function ConnectionSection() {
  const routePath = (w: number, h: number) => [{ x: w * 0.2, y: h * 0.55 }, { x: w * 0.35, y: h * 0.18 }, { x: w * 0.62, y: h * 0.16 }, { x: w * 0.8, y: h * 0.5 }];
  const routeIsles = (w: number, h: number) => [island({ x: w * 0.14, y: h * 0.62 }, 34, "ri-a"), island({ x: w * 0.86, y: h * 0.62 }, 30, "ri-b", "island")];
  return (
    <Grid min={300}>
      <Tile name="Roads: minor footpath & major road" fn="drawRoad · minor | major" note="Major roads: double line + milestones">
        <StampCanvas width={C_W} height={C_H} zoom={1.2} seed="roads" draw={(dc, { width, height }) => {
          drawRoad(dc, { path: [{ x: -4, y: height * 0.3 }, { x: width * 0.3, y: height * 0.22 }, { x: width * 0.65, y: height * 0.35 }, { x: width + 4, y: height * 0.25 }], rank: "minor" });
          drawRoad(dc, { path: [{ x: -4, y: height * 0.75 }, { x: width * 0.35, y: height * 0.62 }, { x: width * 0.7, y: height * 0.8 }, { x: width + 4, y: height * 0.7 }], rank: "major" });
        }} />
      </Tile>
      {(["stone", "aqueduct", "long_arch"] as const).map((v) => (
        <Tile key={v} name={`${v === "long_arch" ? "Long arched" : v[0].toUpperCase() + v.slice(1)} bridge`} fn={`drawBridge · ${v}`} note={v === "aqueduct" ? "Used in Cloud territory" : v === "long_arch" ? "Spans > 22 units" : "Default crossing"}>
          <StampCanvas width={C_W} height={C_H} zoom={2} seed={`bridge-${v}`} draw={(dc, { width, height }) => bridgeScene(dc, width, height, v)} />
        </Tile>
      ))}
      <Tile name="Sea route — idle" fn="drawSeaRoute" note="Dotted ivory; only selected relationships are drawn">
        <StampCanvas width={C_W} height={C_H} zoom={1} background="none" seed="route-idle" draw={(dc, { width, height }) => {
          seaScene(dc, width, height, routeIsles(width, height));
          drawSeaRoute(dc, { path: routePath(width, height) });
        }} />
      </Tile>
      <Tile name="Sea route — highlighted" fn="drawSeaRoute · highlighted" note="Dim blue, flowing dots and a ship (static under reduced motion)">
        <StampCanvas width={C_W} height={C_H} zoom={1} background="none" seed="route-lit" animate draw={(dc, { width, height }) => {
          seaScene(dc, width, height, routeIsles(width, height));
          drawSeaRoute(dc, { path: routePath(width, height), highlighted: true });
        }} />
      </Tile>
      <Tile name="Selected connection thread" fn="drawConnectionThread" note="Blue thread along roads touching the selection">
        <StampCanvas width={C_W} height={C_H} zoom={1.4} seed="thread" draw={(dc, { width, height }) => {
          const path = [{ x: width * 0.2, y: height * 0.6 }, { x: width * 0.5, y: height * 0.4 }, { x: width * 0.8, y: height * 0.55 }];
          drawRoad(dc, { path, rank: "major" });
          drawConnectionThread(dc, { path });
          drawSettlementWithEffects(dc, settlement("tower", path[0], { status: "active", tier: "minor" }), { selected: true });
          drawSettlementWithEffects(dc, settlement("village", path[2], { tier: "minor" }));
        }} />
      </Tile>
    </Grid>
  );
}

/* ------------------------------------------------------------------ */

export function AtmosphereSection() {
  const statues: StatueVariant[] = ["architect", "scroll", "compass", "atlas"];
  return (
    <>
      <Grid min={300}>
        <Tile name="Clouds & fog" fn="drawCloudsAndFog" note="Slow drift; fades near selected items; static under reduced motion">
          <StampCanvas width={C_W} height={C_H} zoom={0.7} background="none" seed="fog" animate draw={(dc, { width, height }) => {
            seaScene(dc, width, height, [island({ x: width / 2, y: height / 2 }, 120, "fog-land")]);
            drawCloudsAndFog(dc, { bounds: { minX: 0, minY: 0, maxX: width, maxY: height }, count: 10 });
          }} />
        </Tile>
        <Tile name="Compass rose" fn="drawCompassRose" note="Engraved 16-point rose, screen-anchored on the map">
          <StampCanvas width={C_W} height={C_H} background="sea" seed="compass" draw={(dc, { width, height }) => drawCompassRose(dc, { position: { x: width / 2, y: height / 2 + 2 }, scale: 1.8 })} />
        </Tile>
        <Tile name="Active glow intensities" fn="drawActiveGlow" note="0 (maintained) · 0.6 (active) · 1.0 (deployed)">
          <StampCanvas width={C_W} height={C_H} zoom={1.6} seed="glow" draw={(dc, { width, height }) => {
            [0, 0.6, 1].forEach((g, i) => {
              const p = { x: width * (0.2 + i * 0.3), y: height / 2 };
              drawActiveGlow(dc, { position: p, radius: 16, intensity: g });
              drawSettlementWithEffects(dc, settlement("outpost", p, { status: g === 1 ? "deployed" : g > 0 ? "active" : "maintained", tier: "major" }));
            });
          }} />
        </Tile>
      </Grid>
      <SubHeading>Classical statue (one per world, at the reset point)</SubHeading>
      <Grid min={180}>
        {statues.map((v) => (
          <Tile key={v} name={`Statue — ${v}`} fn={`drawClassicalStatue · ${v}`}>
            <StampCanvas width={200} height={150} zoom={3.2} seed={`statue-${v}`} draw={(dc, { width, height }) => drawClassicalStatue(dc, { position: { x: width / 2, y: height / 2 }, scale: 1, variant: v })} />
          </Tile>
        ))}
      </Grid>
    </>
  );
}

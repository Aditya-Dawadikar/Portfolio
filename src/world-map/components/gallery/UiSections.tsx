"use client";

import { useMemo, useState } from "react";
import { Layers, Settings2, Star } from "lucide-react";
import type { GeneratedWorld, MapFilters } from "../../types";
import { midnightMarbleTheme } from "../../canvas/styles/mapTheme";
import { fitViewport } from "../../canvas/engine/viewport";
import { EMPTY_FILTERS, repositoryMatches } from "../../hooks/useMapFilters";
import { KIND_LABEL } from "../../utils/accessibility";
import { StampCanvas } from "../canvas/StampCanvas";
import { MapControls } from "../map/MapControls";
import { MapFilterBar } from "../map/MapFilterBar";
import { MapLegend } from "../map/MapLegend";
import { MapMinimap } from "../map/MapMinimap";
import { MapAttribution, MapEmptyState, MapLoadingState } from "../map/MapStates";
import { MapTooltip } from "../map/MapTooltip";
import { RepositoryDetailPanel } from "../map/RepositoryDetailPanel";
import { RepositoryListView } from "../map/RepositoryListView";
import { TerritoryDetailPanel } from "../map/TerritoryDetailPanel";
import {
  MarbleBadge,
  MarbleButton,
  MarbleDivider,
  MarbleIconButton,
  MarbleModal,
  MarblePanel,
  MarbleSearchInput,
  MarbleSelect,
  MarbleSheet,
  MarbleTooltip,
  marbleStyles,
} from "../primitives";
import { Grid, SubHeading, Tile } from "./GalleryParts";

const noop = () => {};

/** Backdrop that imitates the map behind overlays. */
function MapBackdrop({ children, height, className = "" }: { children: React.ReactNode; height: number; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height, background: "radial-gradient(120% 90% at 40% 40%, #1a2c43, #0a1422)" }}>
      {children}
    </div>
  );
}

export function PrimitivesSection() {
  const [tech, setTech] = useState<string[]>(["TypeScript"]);
  const [q, setQ] = useState("orrery");
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);
  return (
    <Grid min={300}>
      <Tile name="MarblePanel" fn="tone: solid | translucent · engraved">
        <MapBackdrop height={220} className="grid grid-cols-3 gap-3 p-4">
          <MarblePanel className="flex items-end p-2 text-[11px]">Solid</MarblePanel>
          <MarblePanel tone="translucent" className="flex items-end p-2 text-[11px]">Translucent</MarblePanel>
          <MarblePanel engraved className="flex items-end p-2 text-[11px]">Engraved</MarblePanel>
        </MapBackdrop>
      </Tile>
      <Tile name="MarbleButton · MarbleIconButton" fn="variant: primary | ghost · label → aria-label + tooltip">
        <MapBackdrop height={220} className="flex flex-col items-start justify-center gap-4 p-5">
          <div className="flex gap-2">
            <MarbleButton>Primary</MarbleButton>
            <MarbleButton variant="ghost">Ghost</MarbleButton>
            <MarbleButton size="sm" disabled>
              Disabled
            </MarbleButton>
          </div>
          <MarblePanel className="flex gap-1 p-1">
            <MarbleIconButton label="Layers" tooltipSide="bottom">
              <Layers className="h-4 w-4" />
            </MarbleIconButton>
            <MarbleIconButton label="Favourite" tooltipSide="bottom" pressed>
              <Star className="h-4 w-4" />
            </MarbleIconButton>
            <MarbleIconButton label="Settings" tooltipSide="bottom">
              <Settings2 className="h-4 w-4" />
            </MarbleIconButton>
          </MarblePanel>
        </MapBackdrop>
      </Tile>
      <Tile name="MarbleBadge · MarbleDivider · MarbleTooltip" fn="status badges always pair icon + word">
        <MapBackdrop height={220} className="flex flex-col justify-center gap-4 p-5">
          <div className="flex flex-wrap gap-1.5">
            <MarbleBadge tone="deployed" />
            <MarbleBadge tone="active" />
            <MarbleBadge tone="maintained" />
            <MarbleBadge tone="archived" />
            <MarbleBadge>TypeScript</MarbleBadge>
            <MarbleBadge tone="bronze">Open source</MarbleBadge>
          </div>
          <MarbleDivider />
          <MarbleTooltip content="Tooltips sit on dark stone" side="bottom">
            <MarbleButton variant="ghost" size="sm">
              Hover or focus me
            </MarbleButton>
          </MarbleTooltip>
        </MapBackdrop>
      </Tile>
      <Tile name="MarbleSelect · MarbleSearchInput" fn="multi-select listbox · search with clear">
        <MapBackdrop height={300} className="space-y-3 p-5">
          <MarbleSearchInput aria-label="Demo search" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} />
          <MarbleSelect
            label="Technology"
            value={tech}
            onChange={setTech}
            options={["TypeScript", "Go", "Rust", "Python", "React"].map((v) => ({ value: v, label: v, count: v.length }))}
          />
        </MapBackdrop>
      </Tile>
      <Tile name="MarbleModal" fn="focus trap · Escape closes · returns focus">
        <MapBackdrop height={300} className="flex items-center justify-center">
          <MarbleButton onClick={() => setModal(true)}>Open modal</MarbleButton>
          <MarbleModal open={modal} onClose={() => setModal(false)} title="Keyboard map">
            <ul className="space-y-1 text-[13px] text-[#ddd6c8]">
              <li>Arrow keys — pan (Shift for faster)</li>
              <li>+ / − — zoom · 0 — reset</li>
              <li>Tab — settlements; arrows jump between them</li>
              <li>/ — search · Esc — close panel</li>
            </ul>
          </MarbleModal>
        </MapBackdrop>
      </Tile>
      <Tile name="MarbleSheet (mobile)" fn="two snap points · swipe / button / Escape to close">
        <MapBackdrop height={300} className="flex items-center justify-center">
          <MarbleButton onClick={() => setSheet(true)}>Open sheet</MarbleButton>
          <MarbleSheet open={sheet} onClose={() => setSheet(false)} label="Demo sheet">
            <div className="space-y-2 p-4 text-[13px] text-[#ddd6c8]">
              <p className={`${marbleStyles.display} text-[22px] text-[#f2ede2]`}>Bottom sheet</p>
              <p>Tap the handle to expand; swipe down to close.</p>
            </div>
          </MarbleSheet>
        </MapBackdrop>
      </Tile>
    </Grid>
  );
}

export function OverlaySection({ world }: { world: GeneratedWorld }) {
  const [filters, setFilters] = useState<MapFilters>(EMPTY_FILTERS);
  const repos = useMemo(() => Object.values(world.repositories), [world]);
  const territories = useMemo(() => Object.values(world.territories), [world]);
  const flagship = repos.find((r) => r.settlementKind === "temple") ?? repos[0];
  const ruin = repos.find((r) => r.status === "archived") ?? repos[1];
  const territory = world.territories[flagship.category];
  const miniSize = { width: 1200, height: 700, devicePixelRatio: 1 };
  const miniViewport = { ...fitViewport(world.bounds, miniSize), zoom: fitViewport(world.bounds, miniSize).zoom * 2.2 };
  const matchCount = repos.filter((r) => repositoryMatches(r, filters)).length;
  const connections = flagship.resolvedLinks.map((id) => world.repositories[id]).filter(Boolean);

  return (
    <>
      <SubHeading>Controls, filters & legend</SubHeading>
      <Grid min={300}>
        <Tile name="MapControls" fn="orientation: vertical (desktop) | horizontal (mobile)">
          <MapBackdrop height={260} className="flex items-center justify-center gap-10">
            <MapControls onZoomIn={noop} onZoomOut={noop} onReset={noop} onToggleFullscreen={noop} />
            <MapControls orientation="horizontal" touch onZoomIn={noop} onZoomOut={noop} onReset={noop} />
          </MapBackdrop>
        </Tile>
        <Tile name="MapFilterBar — expanded (live)" fn="territory · status · technology · major only · reset" note="Hosts MapSearch; filtering dims, never removes">
          <MapBackdrop height={560} className="p-4">
            <MapFilterBar filters={filters} onChange={setFilters} territories={territories} repositories={repos} matchCount={matchCount} onSearchSelect={noop} />
          </MapBackdrop>
        </Tile>
        <Tile name="MapFilterBar — collapsed (mobile default)" fn="defaultCollapsed">
          <MapBackdrop height={120} className="p-4">
            <MapFilterBar filters={{ ...EMPTY_FILTERS, statuses: ["deployed"] }} onChange={noop} territories={territories} repositories={repos} matchCount={5} onSearchSelect={noop} defaultCollapsed />
          </MapBackdrop>
        </Tile>
        <Tile name="MapLegend" fn="every row draws the real stamp">
          <MapBackdrop height={560} className="p-4">
            <MapLegend />
          </MapBackdrop>
        </Tile>
        <Tile name="MapMinimap" fn="engraved outline + blue viewport rectangle">
          <MapBackdrop height={200} className="flex items-center justify-center">
            <MapMinimap world={world} theme={midnightMarbleTheme} viewport={miniViewport} size={miniSize} onNavigate={noop} width={240} />
          </MapBackdrop>
        </Tile>
      </Grid>

      <SubHeading>Tooltips</SubHeading>
      <Grid min={290}>
        <Tile name="MapTooltip — live settlement" fn="name · kind · status · one line · CTA">
          <MapBackdrop height={170} className="flex items-center justify-center">
            <MapTooltip inline content={{ title: flagship.name, kindLabel: KIND_LABEL[flagship.settlementKind], status: flagship.status, description: flagship.description }} anchor={null} containerSize={{ width: 0, height: 0 }} />
          </MapBackdrop>
        </Tile>
        <Tile name="MapTooltip — archived ruin" fn="no blue indicator">
          <MapBackdrop height={170} className="flex items-center justify-center">
            <MapTooltip inline content={{ title: ruin.name, kindLabel: KIND_LABEL[ruin.settlementKind], status: ruin.status, description: ruin.description }} anchor={null} containerSize={{ width: 0, height: 0 }} />
          </MapBackdrop>
        </Tile>
        <Tile name="MapTooltip — territory" fn="hovering empty ground">
          <MapBackdrop height={170} className="flex items-center justify-center">
            <MapTooltip inline content={{ title: territory.name, kindLabel: "Territory", description: territory.summary, cta: "Click to open territory" }} anchor={null} containerSize={{ width: 0, height: 0 }} />
          </MapBackdrop>
        </Tile>
        <Tile name="Territory label (HTML overlay)" fn="TerritoryLabelLayer" note="Engraved small caps on a bronze rule — never baked into canvas">
          <div className="relative">
            <StampCanvas width={320} height={170} zoom={1.4} seed="label" draw={() => {}} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`${marbleStyles.display} ${marbleStyles.engravedLabel} text-[22px] font-semibold uppercase`} style={{ letterSpacing: "0.24em" }}>
                {territory.name}
              </span>
              <span className="mt-1 flex w-56 items-center gap-1.5">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#a87d45]" />
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <path d="M4 0 L8 4 L4 8 L0 4 Z" fill="#ebe7df" stroke="#a87d45" />
                </svg>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#a87d45]" />
              </span>
            </div>
          </div>
        </Tile>
      </Grid>

      <SubHeading>Detail panels</SubHeading>
      <div className="flex flex-wrap gap-6">
        <Tile name="RepositoryDetailPanel" fn="side (desktop) · sheet (mobile)">
          <MapBackdrop height={760} className="p-4">
            <RepositoryDetailPanel variant="inline" repository={flagship} territory={territory} connections={connections} onClose={noop} onSelectConnection={noop} />
          </MapBackdrop>
        </Tile>
        <Tile name="TerritoryDetailPanel" fn="story · totals · notable projects · tech clusters">
          <MapBackdrop height={760} className="p-4">
            <TerritoryDetailPanel variant="inline" territory={territory} repositories={repos.filter((r) => r.category === territory.id)} onSelectRepository={noop} onExploreAll={noop} onClose={noop} />
          </MapBackdrop>
        </Tile>
        <Tile name="RepositoryListView" fn="accessible non-map alternative" className="min-w-[320px] flex-1">
          <MapBackdrop height={760} className="p-4">
            <RepositoryListView className="h-full" territories={territories} repositories={repos} matches={() => true} onSelect={noop} onClose={noop} />
          </MapBackdrop>
        </Tile>
      </div>

      <SubHeading>States & chrome</SubHeading>
      <Grid min={300}>
        <Tile name="MapLoadingState" fn="coastline draws itself; static under reduced motion">
          <div className="relative h-[220px]">
            <MapLoadingState />
          </div>
        </Tile>
        <Tile name="MapEmptyState — no data" fn="reason: no-data">
          <MapBackdrop height={220} className="flex items-center justify-center">
            <MapEmptyState reason="no-data" />
          </MapBackdrop>
        </Tile>
        <Tile name="MapEmptyState — all filtered" fn="reason: all-filtered">
          <MapBackdrop height={220} className="flex items-center justify-center">
            <MapEmptyState reason="all-filtered" onResetFilters={noop} />
          </MapBackdrop>
        </Tile>
        <Tile name="MapAttribution" fn="seed · version · View as list">
          <MapBackdrop height={220} className="flex items-end p-4">
            <MapAttribution seed={world.seed.value} version={world.seed.version} onShowList={noop} />
          </MapBackdrop>
        </Tile>
      </Grid>
    </>
  );
}

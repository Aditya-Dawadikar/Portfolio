"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  DebugOverlayFlags,
  GeneratedWorld,
  MapTarget,
  MapTheme,
  ScreenPoint,
  Settlement,
  SettlementVisualState,
  TerritoryKind,
  WorldMapData,
} from "../../types";
import { preloadAtlasAssets } from "../../canvas/assets/atlasAssets";
import { generateWorld } from "../../canvas/generation/generateWorld";
import { hashString } from "../../canvas/engine/seededRandom";
import { midnightMarbleTheme } from "../../canvas/styles/mapTheme";
import { lodFor, worldToScreen } from "../../canvas/engine/viewport";
import { useElementSize } from "../../hooks/useElementSize";
import { useElementVisibility } from "../../hooks/useElementVisibility";
import { useMapFilters } from "../../hooks/useMapFilters";
import { useMapViewport } from "../../hooks/useMapViewport";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { KIND_LABEL } from "../../utils/accessibility";
import { expandBounds, polygonBounds } from "../../utils/geometry";
import { MapCanvas } from "./MapCanvas";
import { MapControls } from "./MapControls";
import { MapFilterBar } from "./MapFilterBar";
import { MapLegend } from "./MapLegend";
import { MapMinimap } from "./MapMinimap";
import { MapAnnouncer, MapAttribution, MapEmptyState, MapLoadingState } from "./MapStates";
import { MapTooltip, type MapTooltipContent } from "./MapTooltip";
import { RepositoryDetailPanel } from "./RepositoryDetailPanel";
import { RepositoryListView } from "./RepositoryListView";
import { RepositoryMarkerLayer } from "./RepositoryMarkerLayer";
import { TerritoryDetailPanel } from "./TerritoryDetailPanel";
import { TerritoryLabelLayer } from "./TerritoryLabelLayer";

export interface PortfolioWorldMapProps {
  data: WorldMapData;
  theme?: MapTheme;
  debug?: Partial<DebugOverlayFlags>;
  height?: string;
  showMinimap?: boolean;
  showLegend?: boolean;
  showFog?: boolean;
  className?: string;
  onSelectRepository?: (id: string | null) => void;
  onWorldGenerated?: (world: GeneratedWorld, ms: number) => void;
}

const PANEL_W = 376;

/** Generated worlds survive remounts and client navigation; generation is pure, so the data is the key. */
const worldCache = new Map<string, GeneratedWorld>();
const WORLD_CACHE_LIMIT = 12;
const worldCacheKey = (data: WorldMapData) => {
  const json = JSON.stringify(data);
  return `${json.length}:${hashString(json)}`;
};
function rememberWorld(key: string, world: GeneratedWorld) {
  worldCache.delete(key);
  worldCache.set(key, world);
  if (worldCache.size > WORLD_CACHE_LIMIT) worldCache.delete(worldCache.keys().next().value as string);
}

/** Feature container: owns world, filters, selection and camera. Draws no pixels itself. */
export function PortfolioWorldMap({
  data,
  theme = midnightMarbleTheme,
  debug,
  height = "100dvh",
  showMinimap = true,
  showLegend = true,
  showFog = true,
  className,
  onSelectRepository,
  onWorldGenerated,
}: PortfolioWorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(containerRef);
  const active = useElementVisibility(containerRef);
  const reducedMotion = useReducedMotion();
  const compact = (size?.width ?? 1024) < 768;

  // Generate after first paint so the loading state is visible.
  const [world, setWorld] = useState<GeneratedWorld | null>(null);
  const onGenRef = useRef(onWorldGenerated);
  onGenRef.current = onWorldGenerated;
  useEffect(() => {
    const key = worldCacheKey(data);
    const cached = worldCache.get(key);
    if (cached) {
      onGenRef.current?.(cached, 0);
      setWorld(cached);
      return;
    }
    setWorld(null);
    let cancelled = false;
    // The overview-level PNG sheets load while the world generates, so the first frame uses them.
    const assets = preloadAtlasAssets();
    const id = window.setTimeout(() => {
      const t0 = performance.now();
      const w = generateWorld(data);
      onGenRef.current?.(w, performance.now() - t0);
      rememberWorld(key, w);
      void assets.then(() => {
        if (!cancelled) setWorld(w);
      });
    }, 30);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [data]);

  const landFocus = useMemo(() => (world ? expandBounds(polygonBounds(world.landmasses.flatMap((l) => l.polygon)), 60) : null), [world]);
  const cam = useMapViewport(world?.bounds ?? null, landFocus, size, reducedMotion);
  const { viewport } = cam;
  const { filters, setFilters, matches, matchCount, reset: resetFilters, active: filtering } = useMapFilters(world?.repositories);

  const [hovered, setHovered] = useState<MapTarget | null>(null);
  const [pointer, setPointer] = useState<ScreenPoint | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryKind | null>(null);
  const [focusedRepo, setFocusedRepo] = useState<string | null>(null);
  const [pulse, setPulse] = useState<{ id: string; startedAt: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setSelectedRepo(null);
    setSelectedTerritory(null);
    setHovered(null);
    setPulse(null);
  }, [world]);

  useEffect(() => {
    if (!pulse) return;
    const id = window.setTimeout(() => setPulse(null), theme.glow.pulseDurationMs * 3);
    return () => window.clearTimeout(id);
  }, [pulse, theme.glow.pulseDurationMs]);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const settlementById = useMemo(() => new Map(world?.settlements.map((s) => [s.repositoryId, s]) ?? []), [world]);
  const lod = viewport ? lodFor(viewport) : "far";

  const isSettlementVisible = useCallback(
    (s: Settlement) => {
      if (s.repositoryId === selectedRepo || s.repositoryId === focusedRepo || s.repositoryId === pulse?.id) return true;
      if (lod === "far") return s.tier !== "minor";
      return true;
    },
    [lod, selectedRepo, focusedRepo, pulse],
  );

  const stateFor = useCallback(
    (s: Settlement): Partial<SettlementVisualState> => {
      const id = s.repositoryId;
      return {
        hovered: hovered?.kind === "settlement" && hovered.id === id,
        selected: selectedRepo === id,
        focused: focusedRepo === id,
        dimmed: filtering && !matches(id),
        pulse: pulse?.id === id ? ((performance.now() - pulse.startedAt) % theme.glow.pulseDurationMs) / theme.glow.pulseDurationMs : null,
      };
    },
    [hovered, selectedRepo, focusedRepo, filtering, matches, pulse, theme.glow.pulseDurationMs],
  );

  const highlightedIds = useMemo(() => {
    const s = new Set<string>();
    if (selectedRepo) s.add(selectedRepo);
    if (hovered?.kind === "settlement") s.add(hovered.id);
    if (focusedRepo) s.add(focusedRepo);
    return s;
  }, [selectedRepo, hovered, focusedRepo]);

  const panelOffset = useCallback(() => {
    if (!size) return { x: 0, y: 0 };
    return compact ? { x: 0, y: size.height * 0.22 } : { x: PANEL_W / 2, y: 0 };
  }, [compact, size]);

  const selectRepository = useCallback(
    (id: string, opts: { fly?: boolean; pulse?: boolean } = {}) => {
      if (!world) return;
      const s = settlementById.get(id);
      const r = world.repositories[id];
      if (!s || !r) return;
      setSelectedRepo(id);
      setSelectedTerritory(null);
      setListOpen(false);
      if (opts.pulse) setPulse({ id, startedAt: performance.now() });
      onSelectRepository?.(id);
      setAnnouncement(`Selected ${r.name}, ${KIND_LABEL[r.settlementKind].toLowerCase()} in ${world.territories[r.category]?.name}, ${r.status}.`);
      if (opts.fly !== false && cam.viewportRef.current) {
        const off = panelOffset();
        const v = cam.viewportRef.current;
        const target = Math.max(v.zoom, (v.baseZoom ?? v.zoom) * (s.tier === "landmark" ? 2.1 : 2.5));
        cam.flyTo(s.position, target, off.x, off.y);
      }
    },
    [world, settlementById, onSelectRepository, cam, panelOffset],
  );

  const selectTerritory = useCallback(
    (id: TerritoryKind) => {
      if (!world) return;
      setSelectedTerritory(id);
      setSelectedRepo(null);
      onSelectRepository?.(null);
      const t = world.territories[id];
      const n = Object.values(world.repositories).filter((r) => r.category === id).length;
      setAnnouncement(`${t.name} territory, ${n} settlements.`);
    },
    [world, onSelectRepository],
  );

  const closePanels = useCallback(() => {
    setSelectedRepo(null);
    setSelectedTerritory(null);
    onSelectRepository?.(null);
  }, [onSelectRepository]);

  const onCanvasSelect = useCallback(
    (t: MapTarget | null) => {
      if (!t) return closePanels();
      if (t.kind === "settlement") selectRepository(t.id, { fly: true });
      else selectTerritory(t.id);
    },
    [closePanels, selectRepository, selectTerritory],
  );

  const onHover = useCallback((t: MapTarget | null, p: ScreenPoint | null) => {
    setHovered(t);
    setPointer(p);
  }, []);

  const onFocusMarker = useCallback(
    (id: string | null) => {
      setFocusedRepo(id);
      if (!id || !size || !cam.viewportRef.current) return;
      const s = settlementById.get(id);
      if (!s) return;
      const p = worldToScreen(cam.viewportRef.current, size, s.position);
      const m = 80;
      if (p.x < m || p.y < m || p.x > size.width - m || p.y > size.height - m) cam.flyTo(s.position);
    },
    [cam, settlementById, size],
  );

  const exploreTerritory = useCallback(
    (id: TerritoryKind) => {
      if (!world) return;
      setFilters({ ...filters, territories: [id] });
      const region = world.regions.find((r) => r.territoryId === id);
      if (region) cam.fitBounds(expandBounds(region.bounds, 40), compact ? 0 : PANEL_W / 2);
      setAnnouncement(`Showing ${world.territories[id].name}. ${Object.values(world.repositories).filter((r) => r.category === id).length} settlements.`);
    },
    [world, filters, setFilters, cam, compact],
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("input, select, textarea, [role='listbox'], [role='dialog']")) return;
    const step = e.shiftKey ? 240 : 80;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => cam.panBy(step, 0),
      ArrowRight: () => cam.panBy(-step, 0),
      ArrowUp: () => cam.panBy(0, step),
      ArrowDown: () => cam.panBy(0, -step),
      "+": () => cam.zoomBy(1.4),
      "=": () => cam.zoomBy(1.4),
      "-": () => cam.zoomBy(1 / 1.4),
      "0": () => cam.reset(),
      Escape: () => (listOpen ? setListOpen(false) : closePanels()),
      "/": () => containerRef.current?.querySelector<HTMLInputElement>("[data-map-search]")?.focus(),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  // Tooltip content: hovered or keyboard-focused settlement, else hovered territory.
  let tooltip: { content: MapTooltipContent; anchor: ScreenPoint } | null = null;
  if (world && viewport && size && !dragging) {
    const tipId = hovered?.kind === "settlement" ? hovered.id : focusedRepo;
    if (tipId && tipId !== selectedRepo) {
      const r = world.repositories[tipId];
      const s = settlementById.get(tipId);
      if (r && s) {
        const anchor = hovered?.kind === "settlement" && pointer ? pointer : worldToScreen(viewport, size, { x: s.position.x, y: s.position.y + s.hitRadius });
        tooltip = { content: { title: r.name, kindLabel: KIND_LABEL[r.settlementKind], status: r.status, description: r.description }, anchor };
      }
    } else if (hovered?.kind === "territory" && pointer && hovered.id !== selectedTerritory && !compact) {
      const t = world.territories[hovered.id];
      tooltip = { content: { title: t.name, kindLabel: "Territory", description: t.summary, cta: "Click to open territory" }, anchor: pointer };
    }
  }

  const repoList = useMemo(() => (world ? Object.values(world.repositories) : []), [world]);
  const territoryList = useMemo(() => (world ? Object.values(world.territories) : []), [world]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    repoList.forEach((r) => (c[r.category] = (c[r.category] ?? 0) + 1));
    return c;
  }, [repoList]);
  const landmarkObstacles = useMemo(
    () => world?.settlements.filter((s) => s.tier !== "minor").map((s) => ({ position: s.position, radius: s.hitRadius })) ?? [],
    [world],
  );
  const visibleSettlements = useMemo(() => world?.settlements.filter(isSettlementVisible) ?? [], [world, isSettlementVisible]);

  const panelOpen = !!(selectedRepo || selectedTerritory);
  const sideOpen = panelOpen && !compact;
  const selected = selectedRepo && world ? world.repositories[selectedRepo] : null;

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate w-full overflow-hidden bg-[#0a1422] text-[#f2ede2] focus:outline-none", className)}
      style={{ height }}
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <button
        type="button"
        onClick={() => setListOpen(true)}
        className="sr-only z-50 rounded-[3px] bg-[#16181e] px-3 py-2 text-[12px] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:ring-2 focus:ring-[#3d8bff]"
      >
        Skip to repository list
      </button>

      {world && size && viewport && (
        <>
          <MapCanvas
            world={world}
            theme={theme}
            size={size}
            viewport={viewport}
            viewportRef={cam.viewportRef}
            moving={cam.moving || dragging}
            isSettlementVisible={isSettlementVisible}
            stateFor={stateFor}
            highlightedIds={highlightedIds}
            selectedId={selectedRepo}
            pulseActive={!!pulse}
            reducedMotion={reducedMotion}
            showFog={showFog}
            debug={debug}
            active={active}
            ariaLabel={`Atlas of ${repoList.length} repositories across ${territoryList.length} territories. Use the settlement buttons, or the repository list, to explore.`}
            onPan={cam.panBy}
            onZoomAt={cam.zoomAtPoint}
            onGlide={cam.glide}
            onHover={onHover}
            onSelect={onCanvasSelect}
            onDragChange={setDragging}
          />
          <TerritoryLabelLayer
            regions={world.regions}
            territories={world.territories}
            counts={counts}
            obstacles={landmarkObstacles}
            viewport={viewport}
            size={size}
            selectedId={selectedTerritory}
            onSelect={selectTerritory}
          />
          <RepositoryMarkerLayer
            settlements={visibleSettlements}
            repositories={world.repositories}
            territories={world.territories}
            viewport={viewport}
            size={size}
            dimmed={(id) => filtering && !matches(id)}
            onFocus={onFocusMarker}
            onSelect={(id) => selectRepository(id, { fly: true })}
          />
        </>
      )}

      {/* Marble-grain edge vignette. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] shadow-[inset_0_0_120px_rgba(3,7,14,0.75),inset_0_0_0_1px_rgba(242,237,226,0.12)]" />

      {world && size && viewport && (
        <>
          <div className="absolute left-4 top-4 z-30">
            <MapFilterBar
              key={compact || size.width < 1100 || size.height < 760 ? "c" : "w"}
              filters={filters}
              onChange={setFilters}
              territories={territoryList}
              repositories={repoList}
              matchCount={matchCount}
              onSearchSelect={(id) => selectRepository(id, { fly: true, pulse: true })}
              defaultCollapsed={compact || size.width < 1100 || size.height < 760}
            />
          </div>

          {filtering && matchCount === 0 && (
            <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2">
              <MapEmptyState reason="all-filtered" onResetFilters={resetFilters} />
            </div>
          )}

          {showLegend && !(compact && panelOpen) && (
            <div className="absolute bottom-9 left-4 z-30">
              <MapLegend key={compact || size.height < 1000 ? "c" : "w"} defaultCollapsed={compact || size.height < 1000} />
            </div>
          )}

          {!(compact && panelOpen) && (
            <div
              className={cn("absolute z-30 flex flex-col items-end gap-2 transition-[right] duration-200", compact ? "bottom-9 right-3" : "bottom-9")}
              style={compact ? undefined : { right: sideOpen ? PANEL_W + 16 : 16 }}
            >
              {showMinimap && size.width >= 1024 && (
                <MapMinimap world={world} theme={theme} viewport={viewport} size={size} onNavigate={(p) => cam.flyTo(p)} />
              )}
              <MapControls
                orientation={compact ? "horizontal" : "vertical"}
                touch={compact}
                onZoomIn={() => cam.zoomBy(1.5)}
                onZoomOut={() => cam.zoomBy(1 / 1.5)}
                onReset={() => {
                  closePanels();
                  cam.reset();
                }}
                onToggleFullscreen={toggleFullscreen}
                isFullscreen={fullscreen}
              />
            </div>
          )}

          <MapAttribution
            seed={world.seed.value}
            version={world.seed.version}
            onShowList={() => setListOpen(true)}
            className="absolute bottom-2.5 left-4 z-30"
          />

          <MapTooltip content={tooltip?.content ?? null} anchor={tooltip?.anchor ?? null} containerSize={size} />

          {selected && (
            <RepositoryDetailPanel
              key={selected.id}
              variant={compact ? "sheet" : "side"}
              repository={selected}
              territory={world.territories[selected.category]}
              connections={Array.from(new Set([...selected.resolvedLinks, ...repoList.filter((r) => r.resolvedLinks.includes(selected.id)).map((r) => r.id)]))
                .map((id) => world.repositories[id])
                .filter(Boolean)}
              onClose={closePanels}
              onSelectConnection={(id) => selectRepository(id, { fly: true, pulse: true })}
              onSelectTerritory={selectTerritory}
            />
          )}
          {selectedTerritory && !selected && (
            <TerritoryDetailPanel
              key={selectedTerritory}
              variant={compact ? "sheet" : "side"}
              territory={world.territories[selectedTerritory]}
              repositories={repoList.filter((r) => r.category === selectedTerritory)}
              onSelectRepository={(id) => selectRepository(id, { fly: true, pulse: true })}
              onExploreAll={() => exploreTerritory(selectedTerritory)}
              onClose={closePanels}
            />
          )}

          {listOpen && (
            <RepositoryListView
              className="absolute inset-3 z-50 sm:inset-8"
              territories={territoryList}
              repositories={repoList}
              matches={(id) => !filtering || matches(id)}
              onSelect={(id) => selectRepository(id, { fly: true, pulse: true })}
              onClose={() => setListOpen(false)}
            />
          )}
        </>
      )}

      {!world && <MapLoadingState />}
      {world && repoList.length === 0 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <MapEmptyState reason="no-data" />
        </div>
      )}
      <MapAnnouncer message={announcement} />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Dices, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebugOverlayFlags, GeneratedWorld, WorldMapData } from "../../types";
import { DEMO_WORLD } from "../../data/demoWorld";
import { generateWorld } from "../../canvas/generation/generateWorld";
import { hashString } from "../../canvas/engine/seededRandom";
import { PortfolioWorldMap } from "../map/PortfolioWorldMap";
import { MarbleButton, MarblePanel, marbleStyles } from "../primitives";
import { AtmosphereSection, ConnectionSection, LandmarkSection, SettlementSection, StatusMatrixSection, TerrainSection } from "./CanvasSections";
import { LazyMount, Section, Toggle } from "./GalleryParts";
import { OverlaySection, PrimitivesSection } from "./UiSections";

const PRESETS = ["midnight-marble", "aegean-ink", "bronze-meridian", "porphyry-coast", "cypress-delta"];

const NAV = [
  ["world", "World"],
  ["terrain", "Terrain"],
  ["settlements", "Settlements"],
  ["landmarks", "Landmarks"],
  ["states", "States"],
  ["connections", "Connections"],
  ["atmosphere", "Atmosphere"],
  ["primitives", "Primitives"],
  ["overlays", "Overlays"],
  ["devices", "Devices"],
  ["determinism", "Determinism"],
] as const;

function worldSignature(w: GeneratedWorld) {
  return hashString(
    JSON.stringify({
      s: w.settlements.map((s) => [s.repositoryId, s.kind, Math.round(s.position.x * 100), Math.round(s.position.y * 100)]),
      r: w.roads.map((r) => r.path.length),
      l: w.landmasses.map((l) => l.polygon.length + Math.round(l.polygon[0].x)),
    }),
  )
    .toString(16)
    .padStart(8, "0");
}

export function WorldMapGallery() {
  const [seed, setSeed] = useState(DEMO_WORLD.seed.value);
  const [draftSeed, setDraftSeed] = useState(seed);
  const [history, setHistory] = useState<string[]>([seed]);
  const [debug, setDebug] = useState<DebugOverlayFlags>({ territoryPolygons: false, hitRegions: false, paths: false, anchors: false, spatialIndex: false });
  const [fog, setFog] = useState(true);
  const [stats, setStats] = useState<{ ms: number; world: GeneratedWorld } | null>(null);

  const data: WorldMapData = useMemo(() => ({ ...DEMO_WORLD, seed: { value: seed, version: DEMO_WORLD.seed.version } }), [seed]);
  // Generated after mount (never during SSR/hydration) so the page paints immediately.
  const [galleryWorld, setGalleryWorld] = useState<GeneratedWorld | null>(null);
  const [determinism, setDeterminism] = useState<{ a: string; b: string; other: string } | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setGalleryWorld(generateWorld(DEMO_WORLD)), 400);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    setDeterminism(null);
    const id = window.setTimeout(() => {
      const a = generateWorld(data);
      const b = generateWorld(data);
      const other = generateWorld({ ...data, seed: { ...data.seed, value: `${data.seed.value}-alt` } });
      setDeterminism({ a: worldSignature(a), b: worldSignature(b), other: worldSignature(other) });
    }, 1200);
    return () => window.clearTimeout(id);
  }, [data]);

  const applySeed = (s: string) => {
    const v = s.trim() || DEMO_WORLD.seed.value;
    setSeed(v);
    setDraftSeed(v);
    setHistory((h) => [v, ...h.filter((x) => x !== v)].slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-[#070d17] text-[#f2ede2]">
      <header className="sticky top-0 z-[60] border-b border-[#f2ede2]/10 bg-[#070d17]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-6 overflow-x-auto px-6 py-3">
          <span className={cn(marbleStyles.display, "shrink-0 text-[18px] font-semibold uppercase tracking-[0.18em]")}>Atlas Gallery</span>
          <nav className="flex gap-4 text-[11px] uppercase tracking-[0.18em] text-[#a59e92]">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 hover:text-[#e2c89c]">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6">
        <div className="pb-6 pt-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c49a5e]">Midnight marble cartography</p>
          <h1 className={cn(marbleStyles.display, "mt-2 text-[56px] font-semibold leading-[0.95] tracking-[0.02em]")}>Portfolio World Map</h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[#a59e92]">
            Development gallery for the procedural atlas. Every tile below is drawn live by the same Canvas functions the map uses — seeded, deterministic, no
            sprites. Repository names are fictional.
          </p>
        </div>

        <Section id="world" index={1} title="The world" description="PortfolioWorldMap with the demo dataset. Drag, scroll or pinch to move; click settlements and territories; Tab through settlements; press / to search.">
          <MarblePanel tone="translucent" className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 p-3">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                applySeed(draftSeed);
              }}
            >
              <label htmlFor="seed" className="text-[10px] uppercase tracking-[0.2em] text-[#a59e92]">
                Seed
              </label>
              <input
                id="seed"
                value={draftSeed}
                onChange={(e) => setDraftSeed(e.target.value)}
                className="h-8 w-48 rounded-[3px] border border-[#f2ede2]/20 bg-[#0d1016]/60 px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
              />
              <MarbleButton size="sm" type="submit">
                Generate
              </MarbleButton>
              <MarbleButton size="sm" variant="ghost" onClick={() => applySeed(`atlas-${Math.random().toString(36).slice(2, 8)}`)}>
                <Dices className="h-3.5 w-3.5" /> Random
              </MarbleButton>
            </form>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set([...PRESETS, ...history])).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applySeed(p)}
                  className={cn("rounded-[3px] border px-2 py-1 text-[11px]", p === seed ? "border-[#c49a5e] bg-[#a87d45]/25" : "border-[#f2ede2]/15 text-[#cfc8ba] hover:border-[#f2ede2]/35")}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Toggle label="Territory polygons" checked={debug.territoryPolygons} onChange={(v) => setDebug({ ...debug, territoryPolygons: v })} />
              <Toggle label="Hit regions" checked={debug.hitRegions} onChange={(v) => setDebug({ ...debug, hitRegions: v })} />
              <Toggle label="Paths" checked={debug.paths} onChange={(v) => setDebug({ ...debug, paths: v })} />
              <Toggle label="Anchors" checked={debug.anchors} onChange={(v) => setDebug({ ...debug, anchors: v })} />
              <Toggle label="Spatial grid" checked={debug.spatialIndex} onChange={(v) => setDebug({ ...debug, spatialIndex: v })} />
              <Toggle label="Fog" checked={fog} onChange={setFog} />
            </div>
          </MarblePanel>
          <div className="overflow-hidden rounded-[6px] border border-[#f2ede2]/12">
            <PortfolioWorldMap data={data} debug={debug} showFog={fog} height="82vh" onWorldGenerated={(world, ms) => setStats({ world, ms })} />
          </div>
          {stats && (
            <p className="mt-3 text-[12px] text-[#8f887c]">
              Generated in {stats.ms.toFixed(0)} ms · {stats.world.landmasses.length} landmasses · {stats.world.settlements.length} settlements · {stats.world.terrain.mountains.length} ridges ·{" "}
              {stats.world.terrain.forests.length} forests · {stats.world.terrain.rivers.length} rivers · {stats.world.roads.length} roads ·{" "}
              {stats.world.roads.reduce((s, r) => s + r.bridges.length, 0)} bridges · {stats.world.seaRoutes.length} sea routes
            </p>
          )}
        </Section>

        <Section id="terrain" index={2} title="Terrain stamps" description="Water, coast, marble, relief, vegetation and rivers. All parameterised and seeded; the static layers are cached offscreen on the map.">
          <TerrainSection />
        </Section>

        <Section id="settlements" index={3} title="Settlements" description="Minor repository markers as top-down classical plans, at minor and major tier. Major tier adds walls or a second cluster rather than becoming a second landmark.">
          <SettlementSection />
        </Section>

        <Section id="landmarks" index={4} title="Landmarks" description="One signature landmark per territory, plus the world flagship temple. Scale follows impactScore.">
          <LandmarkSection />
        </Section>

        <Section id="states" index={5} title="Status × state" description="The visual-regression sheet. Blue appears only for deployed/active glow and selection; status never relies on colour alone (pennants, ruins, dashed focus).">
          <StatusMatrixSection />
        </Section>

        <Section id="connections" index={6} title="Roads, bridges & routes" description="Roads link related settlements within a territory; bridges appear where roads cross rivers; sea routes carry only selected cross-territory relationships.">
          <ConnectionSection />
        </Section>

        <Section id="atmosphere" index={7} title="Atmosphere & monuments" description="Fog, compass rose, active glow and the single classical statue that marks the reset point.">
          <AtmosphereSection />
        </Section>

        <Section id="primitives" index={8} title="Marble primitives" description="Dark veined stone, thin ivory borders, bronze details. Shared by every overlay.">
          <PrimitivesSection />
        </Section>

        <Section id="overlays" index={9} title="Map overlays" description="React components that sit above the canvas. All text is HTML.">
          {galleryWorld ? <OverlaySection world={galleryWorld} /> : <p className="text-[13px] text-[#8f887c]">Generating demo world…</p>}
        </Section>

        <Section id="devices" index={10} title="Device arrangements" description="The same component measured into a phone and a tablet frame. Under 768px: collapsed filters, horizontal touch controls, bottom-sheet details, no minimap.">
          <LazyMount minHeight={780}>
            <div className="flex flex-wrap items-start gap-8">
              <figure>
                <div className="overflow-hidden rounded-[28px] border-[6px] border-[#1b1f27] shadow-2xl" style={{ width: 390 + 12 }}>
                  <PortfolioWorldMap data={DEMO_WORLD} height="760px" showFog={fog} />
                </div>
                <figcaption className="mt-2 text-[12px] text-[#a59e92]">Phone · 390 × 760</figcaption>
              </figure>
              <figure className="min-w-0 flex-1">
                <div className="overflow-hidden rounded-[18px] border-[6px] border-[#1b1f27] shadow-2xl" style={{ maxWidth: 834 + 12 }}>
                  <PortfolioWorldMap data={DEMO_WORLD} height="620px" showFog={fog} showMinimap={false} />
                </div>
                <figcaption className="mt-2 text-[12px] text-[#a59e92]">Tablet · up to 834 wide</figcaption>
              </figure>
            </div>
          </LazyMount>
        </Section>

        <Section id="determinism" index={11} title="Determinism" description="The world is a pure function of data + seed. Two independent generations must hash identically; a different seed must not.">
          {!determinism ? (
            <p className="text-[13px] text-[#8f887c]">Hashing three generations…</p>
          ) : (
            <MarblePanel tone="translucent" className="grid max-w-2xl gap-3 p-5 font-mono text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#a59e92]">generateWorld(&quot;{seed}&quot;) #1</span>
                <span>{determinism.a}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#a59e92]">generateWorld(&quot;{seed}&quot;) #2</span>
                <span>{determinism.b}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#a59e92]">generateWorld(&quot;{seed}-alt&quot;)</span>
                <span>{determinism.other}</span>
              </div>
              <div className="flex items-center gap-2 border-t border-[#f2ede2]/10 pt-3 font-sans">
                {determinism.a === determinism.b && determinism.a !== determinism.other ? (
                  <>
                    <Check className="h-4 w-4 text-[#7fd18b]" /> Same seed → same world; different seed → different world.
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-[#ff7a7a]" /> Determinism check failed.
                  </>
                )}
              </div>
            </MarblePanel>
          )}
        </Section>
      </main>
    </div>
  );
}

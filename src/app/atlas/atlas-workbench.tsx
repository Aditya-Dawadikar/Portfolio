"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Check, Copy, Dices, Github, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { WorldMapData } from "@/world-map/types";
import { PortfolioWorldMap } from "@/world-map/components/map/PortfolioWorldMap";
import { MarbleButton, MarbleDivider, MarbleIconButton, MarblePanel, marbleStyles } from "@/world-map/components/primitives";
import { cn } from "@/lib/utils";

/**
 * Slider ranges for the Terrain panel. Edit min / max / step here to change what
 * the controls allow; saved browser settings outside a new range are clamped into it.
 */
const TERRAIN_FIELD_CONFIG = {
  coastNoise: { label: "Coast noise", hint: "Wobble of the outer coastline", min: 0, max: 5, step: 0.5 },
  islandEdgeNoise: { label: "Island edge noise", hint: "Ruggedness of each independently generated land", min: 0, max: 500, step: 2 },
  continentRadius: { label: "Continent radius", hint: "Radius of an average territory's island; busier territories get bigger ones. The world grows to fit.", min: 150, max: 1200, step: 10 },
  channelWidth: { label: "Channel width", hint: "Minimum water between separate territory lands", min: 0, max: 300, step: 5 },
  islandSpread: { label: "Island spread", hint: "Extra distance between separate lands", min: 0, max: 500, step: 10 },
  islets: { label: "Outlying islets", min: 0, max: 100, step: 1 , random: true },
  vegetation: { label: "Vegetation", hint: "Forest count and thickness", min: 0, max: 3, step: 0.1 , random: true },
  mountains: { label: "Mountains", hint: "Number of ridges", min: 0, max: 3, step: 0.1 , random: true },
  hills: { label: "Hills", min: 0, max: 3, step: 0.1 , random: true },
  density: { label: "Overall density", hint: "Scales all features, rivers and ruins together", min: 0.5, max: 3, step: 0.1 },
  settlementSpacing: { label: "Distance between structures", min: 0.3, max: 3, step: 0.05 },
  structureSize: { label: "Structure size", min: 0.6, max: 3, step: 0.05 },
  sizeContrast: { label: "Size contrast", hint: "1 = big projects dwarf small ones · 0 = all the same size", min: 0, max: 1, step: 0.05 },
  seaRoutes: { label: "Sea routes", hint: "Max cross-territory routes", min: 0, max: 20, step: 1 },
  lakeCount: { label: "Lakes per island", hint: "Extra standalone lakes on each territory (0 = only river-source lakes)", min: 0, max: 10, step: 1 , random: true },
  lakeSize: { label: "Lake size", hint: "Scales every lake, including river sources", min: 0.4, max: 4, step: 0.1 , random: true },
  beachAmount: { label: "Beach coverage", hint: "Share of coastline that is beach (0 = none)", min: 0, max: 1, step: 0.05 },
  rockyShare: { label: "Rocky share", hint: "0 = all sandy · 1 = all rocky", min: 0, max: 1, step: 0.05 },
  beachWidth: { label: "Beach width", min: 2, max: 30, step: 1 , random: true },
  isletClusters: { label: "Clusters per island", hint: "Groups of islets off each territory (0 = none)", min: 0, max: 8, step: 1 , random: true },
  isletsPerCluster: { label: "Islets per cluster", min: 1, max: 20, step: 1 , random: true },
  isletSize: { label: "Islet size", min: 6, max: 60, step: 1 , random: true },
  isletDistance: { label: "Distance from coast", min: 20, max: 300, step: 5 , random: true },
  isletSpread: { label: "Cluster spread", hint: "How loosely a cluster's islets scatter", min: 20, max: 250, step: 5 , random: true },
  oceanShips: { label: "Ocean ships", hint: "Galleys and sailboats on open water (whole map)", min: 0, max: 80, step: 1, random: true },
  coastalBoats: { label: "Coastal boats per island", hint: "Sailboats and rowboats just offshore", min: 0, max: 30, step: 1, random: true },
  shipSize: { label: "Ship size", min: 0.3, max: 3, step: 0.05, random: true },
} satisfies Record<string, { label: string; hint?: string; min: number; max: number; step: number; random?: true }>;

type ConfigOf = typeof TERRAIN_FIELD_CONFIG;
type NumericField = keyof ConfigOf;
/** Fields flagged `random: true` hold a {min, max}; every instance draws its own value from it. */
type RangeField = { [K in NumericField]: ConfigOf[K] extends { random: true } ? K : never }[NumericField];
type ScalarField = Exclude<NumericField, RangeField>;
type Range = { min: number; max: number };

type TerrainSettings = { seed: string; fog: boolean } & { [K in ScalarField]: number } & { [K in RangeField]: Range };

const isRangeField = (k: NumericField): k is RangeField => "random" in TERRAIN_FIELD_CONFIG[k];
const toRange = (v: number | Range | undefined, fallback: number): Range =>
  v == null ? { min: fallback, max: fallback } : typeof v === "number" ? { min: v, max: v } : { min: v.min, max: v.max };

const STORAGE_KEY = "atlas-terrain-v1";

function defaultsFrom(data: WorldMapData): TerrainSettings {
  const o = data.options ?? {};
  return {
    seed: data.seed.value,
    coastNoise: o.coastRoughness ?? 2.5,
    islandEdgeNoise: o.archipelago?.roughness ?? 175,
    continentRadius: o.archipelago?.radius ?? 500,
    channelWidth: o.archipelago?.gap ?? 90,
    islandSpread: o.archipelago?.spread ?? 170,
    islets: toRange(o.islandCount, 7),
    density: o.density ?? 1,
    vegetation: toRange(o.vegetation, 0.1),
    mountains: toRange(o.mountains, 1),
    hills: toRange(o.hills, 1),
    settlementSpacing: o.settlementSpacing ?? 1,
    structureSize: o.structureScale ?? 1,
    sizeContrast: o.sizeContrast ?? 1,
    seaRoutes: o.maxSeaRoutes ?? 4,
    lakeCount: toRange(o.lakes?.count, 0),
    lakeSize: toRange(o.lakes?.size, 1),
    beachAmount: o.beaches?.amount ?? 0.9,
    rockyShare: o.beaches?.rocky ?? 0.25,
    beachWidth: toRange(o.beaches?.width, 20),
    isletClusters: toRange(o.coastalIslets?.clusters, 0),
    isletsPerCluster: toRange(o.coastalIslets?.perCluster, 7),
    isletSize: toRange(o.coastalIslets?.size, 22),
    isletDistance: toRange(o.coastalIslets?.distance, 130),
    isletSpread: toRange(o.coastalIslets?.spread, 90),
    oceanShips: toRange(o.ships?.ocean, 0),
    coastalBoats: toRange(o.ships?.coastal, 0),
    shipSize: toRange(o.ships?.size, 1),
    fog: true,
  };
}

function toWorldData(base: WorldMapData, s: TerrainSettings): WorldMapData {
  return {
    ...base,
    seed: { ...base.seed, value: s.seed.trim() || base.seed.value },
    options: {
      ...base.options,
      coastRoughness: s.coastNoise,
      islandCount: s.islets,
      density: s.density,
      vegetation: s.vegetation,
      mountains: s.mountains,
      hills: s.hills,
      settlementSpacing: s.settlementSpacing,
      structureScale: s.structureSize,
      sizeContrast: s.sizeContrast,
      maxSeaRoutes: Math.round(s.seaRoutes),
      lakes: { count: s.lakeCount, size: s.lakeSize },
      beaches: s.beachAmount > 0 ? { amount: s.beachAmount, rocky: s.rockyShare, width: s.beachWidth } : undefined,
      ships:
        s.oceanShips.max > 0 || s.coastalBoats.max > 0 ? { ocean: s.oceanShips, coastal: s.coastalBoats, size: s.shipSize } : undefined,
      coastalIslets:
        s.isletClusters.max > 0
          ? { clusters: s.isletClusters, perCluster: s.isletsPerCluster, size: s.isletSize, distance: s.isletDistance, spread: s.isletSpread }
          : undefined,
      archipelago: { gap: s.channelWidth, spread: s.islandSpread, roughness: s.islandEdgeNoise, radius: s.continentRadius },
    },
  };
}

interface FieldProps {
  field: ScalarField;
  value: number;
  onChange: (v: number) => void;
}

function Field({ field, value, onChange }: FieldProps) {
  const { label, min, max, step } = TERRAIN_FIELD_CONFIG[field];
  const hint: string | undefined = "hint" in TERRAIN_FIELD_CONFIG[field] ? (TERRAIN_FIELD_CONFIG[field] as { hint: string }).hint : undefined;
  const id = `atlas-${label.replace(/\W+/g, "-").toLowerCase()}`;
  const clampTo = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[12px] text-[#e6dfd1]">
          {label}
        </label>
        <input
          type="number"
          aria-label={`${label} value`}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(clampTo(v));
          }}
          className="h-7 w-[72px] rounded-[3px] border border-[#f2ede2]/20 bg-[#0d1016]/60 px-1.5 text-right text-[12px] tabular-nums text-[#f2ede2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer accent-[#c49a5e]"
      />
      {hint && <p className="text-[10px] leading-snug text-[#8f887c]">{hint}</p>}
    </div>
  );
}

/** Min/max pair for a randomized field; each end has a slider and a number box, and they never cross. */
function RangeControl({ field, value, onChange }: { field: RangeField; value: Range; onChange: (v: Range) => void }) {
  const cfg = TERRAIN_FIELD_CONFIG[field] as { label: string; hint?: string; min: number; max: number; step: number };
  const { label, min, max, step, hint } = cfg;
  const clampTo = (v: number) => Math.min(max, Math.max(min, v));
  const setEnd = (end: "min" | "max", raw: number) => {
    if (Number.isNaN(raw)) return;
    const v = clampTo(raw);
    onChange(end === "min" ? { min: v, max: Math.max(v, value.max) } : { min: Math.min(v, value.min), max: v });
  };
  const row = (end: "min" | "max") => (
    <div className="flex items-center gap-2">
      <span className="w-7 text-[10px] uppercase tracking-[0.14em] text-[#8f887c]">{end}</span>
      <input
        type="range"
        aria-label={`${label} ${end}`}
        min={min}
        max={max}
        step={step}
        value={value[end]}
        onChange={(e) => setEnd(end, parseFloat(e.target.value))}
        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[#c49a5e]"
      />
      <input
        type="number"
        aria-label={`${label} ${end} value`}
        min={min}
        max={max}
        step={step}
        value={value[end]}
        onChange={(e) => setEnd(end, parseFloat(e.target.value))}
        className="h-7 w-[64px] rounded-[3px] border border-[#f2ede2]/20 bg-[#0d1016]/60 px-1.5 text-right text-[12px] tabular-nums text-[#f2ede2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
      />
    </div>
  );
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] text-[#e6dfd1]">{label}</span>
        <span className="text-[10px] tabular-nums text-[#c49a5e]">
          {value.min === value.max ? value.min : `${value.min} – ${value.max}`} · random
        </span>
      </div>
      {row("min")}
      {row("max")}
      {hint && <p className="text-[10px] leading-snug text-[#8f887c]">{hint}</p>}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#c49a5e]">{title}</h3>
      {children}
    </section>
  );
}

/** /atlas client shell: header, the map, and a live terrain-tuning panel. */
export function AtlasWorkbench({ data, username }: { data: WorldMapData; username: string }) {
  const defaults = useMemo(() => defaultsFrom(data), [data]);
  const [draft, setDraft] = useState<TerrainSettings>(defaults);
  const [applied, setApplied] = useState<TerrainSettings>(defaults);
  const [open, setOpen] = useState(false);
  const [genMs, setGenMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const loaded = useRef(false);

  // Restore saved settings once (per-browser convenience only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = { ...defaults, ...(JSON.parse(raw) as Partial<TerrainSettings>) };
        for (const key of Object.keys(TERRAIN_FIELD_CONFIG) as NumericField[]) {
          const { min, max } = TERRAIN_FIELD_CONFIG[key];
          const c = (v: unknown, d: number) => Math.min(max, Math.max(min, typeof v === "number" && !Number.isNaN(v) ? v : d));
          if (isRangeField(key)) {
            const v = saved[key] as unknown;
            const d = defaults[key];
            // Older saves stored a single number; treat it as a fixed range.
            const r = typeof v === "number" ? { min: v, max: v } : (v as Range | null) ?? d;
            const lo = c(r.min, d.min);
            saved[key] = { min: lo, max: Math.max(lo, c(r.max, d.max)) };
          } else {
            saved[key] = c(saved[key], defaults[key]);
          }
        }
        setDraft(saved);
        setApplied(saved);
      }
    } catch {
      /* storage unavailable */
    }
    loaded.current = true;
  }, [defaults]);

  // Regenerating takes ~1s, so apply slider changes after a short pause.
  useEffect(() => {
    const id = window.setTimeout(() => setApplied(draft), 450);
    return () => window.clearTimeout(id);
  }, [draft]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applied));
    } catch {
      /* storage unavailable */
    }
  }, [applied]);

  const worldData = useMemo(() => toWorldData(data, applied), [data, applied]);
  useEffect(() => setGenMs(null), [worldData]);
  const pending = JSON.stringify(draft) !== JSON.stringify(applied) || genMs === null;
  const set = <K extends keyof TerrainSettings>(key: K) => (v: TerrainSettings[K]) => setDraft((d) => ({ ...d, [key]: v }));

  return (
    <div className="flex h-[100dvh] flex-col bg-[#070d17] text-[#f2ede2]">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[#f2ede2]/10 px-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#a59e92] hover:text-[#e2c89c]">
            <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Portfolio</span>
          </Link>
          <h1 className={cn(marbleStyles.display, "truncate text-[19px] font-semibold uppercase tracking-[0.18em]")}>GitHub Atlas</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/atlas/guide" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#a59e92] hover:text-[#e2c89c]">
            <BookOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Field guide</span>
          </Link>
          <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#a59e92] hover:text-[#e2c89c] sm:inline-flex">
            <Github className="h-3.5 w-3.5" /> {data.repositories.length} repositories
          </a>
          <MarbleButton size="sm" variant={open ? "primary" : "ghost"} aria-expanded={open} aria-controls="atlas-terrain" onClick={() => setOpen((o) => !o)}>
            <SlidersHorizontal className="h-3.5 w-3.5" /> Terrain
          </MarbleButton>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <PortfolioWorldMap
          data={worldData}
          height="calc(100dvh - 3rem)"
          showFog={applied.fog}
          onWorldGenerated={(_, ms) => setGenMs(ms)}
        />

        {open && (
          <MarblePanel
            id="atlas-terrain"
            engraved
            role="region"
            aria-label="Terrain controls"
            className={cn(marbleStyles.fadeIn, "absolute right-4 top-4 z-[45] flex max-h-[calc(100%-2rem)] w-[310px] max-w-[calc(100vw-2rem)] flex-col")}
          >
            <div className="flex items-center justify-between border-b border-[#f2ede2]/10 px-4 py-3">
              <div>
                <h2 className={cn(marbleStyles.display, "text-[17px] uppercase tracking-[0.18em]")}>Terrain</h2>
                <p className="text-[10px] text-[#8f887c]" aria-live="polite">
                  {pending ? "Regenerating…" : genMs === 0 ? "Loaded from cache" : `Generated in ${Math.round(genMs ?? 0)} ms`}
                </p>
              </div>
              <MarbleIconButton label="Close terrain controls" tooltipSide="left" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </MarbleIconButton>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 py-4">
              <Group title="Seed">
                <div className="flex gap-2">
                  <input
                    aria-label="Seed"
                    value={draft.seed}
                    onChange={(e) => set("seed")(e.target.value)}
                    className="h-8 min-w-0 flex-1 rounded-[3px] border border-[#f2ede2]/20 bg-[#0d1016]/60 px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
                  />
                  <MarbleIconButton label="Random seed" tooltipSide="left" size="sm" onClick={() => set("seed")(`atlas-${Math.random().toString(36).slice(2, 8)}`)}>
                    <Dices className="h-4 w-4" />
                  </MarbleIconButton>
                </div>
              </Group>
              <MarbleDivider />
              <Group title="Coast & islands">
                <Field field="coastNoise" value={draft.coastNoise} onChange={set("coastNoise")} />
                <Field field="islandEdgeNoise" value={draft.islandEdgeNoise} onChange={set("islandEdgeNoise")} />
                <Field field="continentRadius" value={draft.continentRadius} onChange={set("continentRadius")} />
                <Field field="channelWidth" value={draft.channelWidth} onChange={set("channelWidth")} />
                <Field field="islandSpread" value={draft.islandSpread} onChange={set("islandSpread")} />
                <RangeControl field="islets" value={draft.islets} onChange={set("islets")} />
              </Group>
              <MarbleDivider />
              <Group title="Beaches">
                <Field field="beachAmount" value={draft.beachAmount} onChange={set("beachAmount")} />
                <Field field="rockyShare" value={draft.rockyShare} onChange={set("rockyShare")} />
                <RangeControl field="beachWidth" value={draft.beachWidth} onChange={set("beachWidth")} />
              </Group>
              <MarbleDivider />
              <Group title="Ships">
                <RangeControl field="oceanShips" value={draft.oceanShips} onChange={set("oceanShips")} />
                <RangeControl field="coastalBoats" value={draft.coastalBoats} onChange={set("coastalBoats")} />
                <RangeControl field="shipSize" value={draft.shipSize} onChange={set("shipSize")} />
              </Group>
              <MarbleDivider />
              <Group title="Coastal islets">
                <RangeControl field="isletClusters" value={draft.isletClusters} onChange={set("isletClusters")} />
                <RangeControl field="isletsPerCluster" value={draft.isletsPerCluster} onChange={set("isletsPerCluster")} />
                <RangeControl field="isletSize" value={draft.isletSize} onChange={set("isletSize")} />
                <RangeControl field="isletDistance" value={draft.isletDistance} onChange={set("isletDistance")} />
                <RangeControl field="isletSpread" value={draft.isletSpread} onChange={set("isletSpread")} />
              </Group>
              <MarbleDivider />
              <Group title="Terrain">
                <RangeControl field="vegetation" value={draft.vegetation} onChange={set("vegetation")} />
                <RangeControl field="mountains" value={draft.mountains} onChange={set("mountains")} />
                <RangeControl field="hills" value={draft.hills} onChange={set("hills")} />
                <RangeControl field="lakeCount" value={draft.lakeCount} onChange={set("lakeCount")} />
                <RangeControl field="lakeSize" value={draft.lakeSize} onChange={set("lakeSize")} />
                <Field field="density" value={draft.density} onChange={set("density")} />
              </Group>
              <MarbleDivider />
              <Group title="Settlements">
                <Field field="settlementSpacing" value={draft.settlementSpacing} onChange={set("settlementSpacing")} />
                <Field field="structureSize" value={draft.structureSize} onChange={set("structureSize")} />
                <Field field="sizeContrast" value={draft.sizeContrast} onChange={set("sizeContrast")} />
                <Field field="seaRoutes" value={draft.seaRoutes} onChange={set("seaRoutes")} />
              </Group>
              <MarbleDivider />
              <Group title="Atmosphere">
                <label className="flex cursor-pointer items-center justify-between text-[12px] text-[#e6dfd1]">
                  Fog & clouds
                  <input type="checkbox" checked={draft.fog} onChange={(e) => set("fog")(e.target.checked)} className="h-3.5 w-3.5 accent-[#a87d45]" />
                </label>
              </Group>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#f2ede2]/10 px-4 py-3">
              <MarbleButton size="sm" variant="ghost" onClick={() => setDraft(defaults)}>
                <RotateCcw className="h-3 w-3" /> Defaults
              </MarbleButton>
              <MarbleButton
                size="sm"
                onClick={() => {
                  void navigator.clipboard?.writeText(JSON.stringify(applied, null, 2)).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  });
                }}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy settings"}
              </MarbleButton>
            </div>
          </MarblePanel>
        )}
      </div>
    </div>
  );
}

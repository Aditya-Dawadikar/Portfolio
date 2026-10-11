import type { MapTheme } from "../../types";
import { createLineStyles } from "./lineStyles";
import { midnightMarblePalette } from "./palette";

export const midnightMarbleTheme: MapTheme = {
  name: "Midnight Marble",
  palette: midnightMarblePalette,
  lines: createLineStyles(midnightMarblePalette),
  texture: { veinAlpha: 0.13, crackAlpha: 0.16, stippleDensity: 1, hatchAlpha: 0.1 },
  glow: { radius: 1.7, alpha: 0.5, pulseDurationMs: 1600 },
  fonts: {
    display: "var(--font-wm-display), 'Cormorant Garamond', 'Cormorant', Georgia, serif",
    label: "var(--font-wm-display), 'Cormorant Garamond', Georgia, serif",
    body: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
  },
};

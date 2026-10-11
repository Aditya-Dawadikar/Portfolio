"use client";

import { Compass, Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarbleIconButton, MarblePanel } from "../primitives";

export interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  orientation?: "vertical" | "horizontal";
  touch?: boolean;
  className?: string;
}

/** Compact zoom / reset / fullscreen stack. Icons only, each with an accessible label and tooltip. */
export function MapControls({ onZoomIn, onZoomOut, onReset, onToggleFullscreen, isFullscreen, orientation = "vertical", touch, className }: MapControlsProps) {
  const size = touch ? "touch" : "md";
  const side = orientation === "vertical" ? "left" : "top";
  const sep = <span aria-hidden className={cn("bg-[#f2ede2]/15", orientation === "vertical" ? "mx-1.5 h-px" : "my-1.5 w-px")} />;
  return (
    <MarblePanel
      role="toolbar"
      aria-label="Map controls"
      aria-orientation={orientation}
      className={cn("flex p-1", orientation === "vertical" ? "flex-col" : "flex-row", className)}
    >
      <MarbleIconButton label="Zoom in" size={size} tooltipSide={side} onClick={onZoomIn}>
        <Plus className="h-4 w-4" />
      </MarbleIconButton>
      <MarbleIconButton label="Zoom out" size={size} tooltipSide={side} onClick={onZoomOut}>
        <Minus className="h-4 w-4" />
      </MarbleIconButton>
      {sep}
      <MarbleIconButton label="Reset view" size={size} tooltipSide={side} onClick={onReset}>
        <Compass className="h-4 w-4" />
      </MarbleIconButton>
      {onToggleFullscreen && (
        <MarbleIconButton label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} size={size} tooltipSide={side} onClick={onToggleFullscreen} pressed={isFullscreen}>
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </MarbleIconButton>
      )}
    </MarblePanel>
  );
}

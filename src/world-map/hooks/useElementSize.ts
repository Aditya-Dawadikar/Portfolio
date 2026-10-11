"use client";

import { type RefObject, useEffect, useState } from "react";
import type { ViewportSize } from "../types";

/** CSS size + DPR of an element, via ResizeObserver. Null until measured. */
export function useElementSize(ref: RefObject<HTMLElement>): ViewportSize | null {
  const [size, setSize] = useState<ViewportSize | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(r.width);
      const height = Math.round(r.height);
      setSize((prev) =>
        prev && prev.width === width && prev.height === height && prev.devicePixelRatio === dpr
          ? prev
          : { width, height, devicePixelRatio: dpr },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

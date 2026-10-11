"use client";

import { Children, useEffect, useState } from "react";

/** Breakpoints match Tailwind's `sm` and `xl`, the ones the grid used before. */
function columnCount() {
  if (window.matchMedia("(min-width: 1280px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

/**
 * Masonry that reads left to right: item i goes to column i % n, so the first row
 * holds the first n items (unlike CSS `columns`, which fills each column top to bottom).
 * Before hydration it renders a plain row-major grid with the same order, so nothing
 * reshuffles when the columns kick in; the cards only close up their gaps.
 */
export function MasonryGrid({ children, gap = 16 }: { children: React.ReactNode; gap?: number }) {
  const items = Children.toArray(children);
  const [columns, setColumns] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setColumns(columnCount());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (columns === null) {
    return (
      <div className="grid grid-cols-1 items-start sm:grid-cols-2 xl:grid-cols-3" style={{ gap }}>
        {items}
      </div>
    );
  }

  const stacks: React.ReactNode[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => stacks[i % columns].push(item));

  return (
    <div className="flex items-start" style={{ gap }}>
      {stacks.map((stack, c) => (
        <div key={c} className="flex min-w-0 flex-1 flex-col" style={{ gap }}>
          {stack}
        </div>
      ))}
    </div>
  );
}

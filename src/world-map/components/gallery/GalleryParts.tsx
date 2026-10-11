"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { marbleStyles } from "../primitives";

export function Section({ id, index, title, description, children }: { id: string; index: number; title: string; description: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[#f2ede2]/10 py-14">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c49a5e]">{String(index).padStart(2, "0")}</p>
          <h2 className={cn(marbleStyles.display, "text-[34px] font-semibold uppercase leading-none tracking-[0.08em] text-[#f2ede2]")}>{title}</h2>
        </div>
        <p className="max-w-xl text-[13px] leading-relaxed text-[#a59e92]">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function Tile({ name, fn, note, children, className }: { name: string; fn?: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <figure className={cn("flex w-fit max-w-full flex-col gap-2", className)}>
      <div className="w-fit max-w-full overflow-hidden rounded-[4px] border border-[#f2ede2]/12 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">{children}</div>
      <figcaption className="px-0.5">
        <div className="text-[13px] text-[#f2ede2]">{name}</div>
        {fn && <code className="text-[11px] text-[#c49a5e]">{fn}</code>}
        {note && <div className="text-[11px] text-[#8f887c]">{note}</div>}
      </figcaption>
    </figure>
  );
}

export function Grid({ children, min = 220 }: { children: ReactNode; min?: number }) {
  return <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))` }}>{children}</div>;
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-4 mt-10 text-[11px] uppercase tracking-[0.26em] text-[#a59e92] first:mt-0">{children}</h3>;
}

/** Mounts children only once scrolled near the viewport (keeps extra map instances cheap). */
export function LazyMount({ children, minHeight }: { children: ReactNode; minHeight: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ minHeight }}>
      {show ? children : null}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-[#d9d2c4]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 accent-[#a87d45]" />
      {label}
    </label>
  );
}

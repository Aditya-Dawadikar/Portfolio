"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Archive, Check, ChevronDown, CircleDot, Rocket, Search, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RepositoryStatus } from "../../types";
import styles from "./marble.module.css";

export { styles as marbleStyles };

/* ------------------------------------------------------------------ */

export interface MarblePanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "solid" | "translucent";
  engraved?: boolean;
}

export const MarblePanel = forwardRef<HTMLDivElement, MarblePanelProps>(function MarblePanel(
  { tone = "solid", engraved = false, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.panel, tone === "translucent" && styles.translucent, engraved && styles.engraved, "relative rounded-md", className)}
      {...rest}
    />
  );
});

/* ------------------------------------------------------------------ */

export interface MarbleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
}

export const MarbleButton = forwardRef<HTMLButtonElement, MarbleButtonProps>(function MarbleButton(
  { variant = "primary", size = "md", className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[3px] font-medium tracking-[0.12em] uppercase transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#12141a]",
        "disabled:opacity-40 disabled:pointer-events-none",
        size === "sm" ? "h-8 px-3 text-[10px]" : "h-10 px-4 text-[11px]",
        variant === "primary"
          ? "border border-[#a87d45]/70 bg-[#a87d45]/10 text-[#f2ede2] hover:bg-[#a87d45]/25 hover:border-[#c49a5e]"
          : "border border-transparent text-[#d9d2c4] hover:border-[#f2ede2]/25 hover:text-[#f2ede2]",
        className,
      )}
      {...rest}
    />
  );
});

/* ------------------------------------------------------------------ */

export interface MarbleIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md" | "touch";
  tooltipSide?: "left" | "right" | "top" | "bottom";
  pressed?: boolean;
}

export const MarbleIconButton = forwardRef<HTMLButtonElement, MarbleIconButtonProps>(function MarbleIconButton(
  { label, size = "md", tooltipSide = "left", pressed, className, children, ...rest },
  ref,
) {
  return (
    <MarbleTooltip content={label} side={tooltipSide}>
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        className={cn(
          "inline-flex items-center justify-center rounded-[3px] text-[#c49a5e] transition-colors",
          "hover:bg-[#f2ede2]/10 hover:text-[#e2bd84]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]",
          pressed && "bg-[#f2ede2]/10 text-[#f2ede2]",
          size === "sm" ? "h-8 w-8" : size === "touch" ? "h-11 w-11" : "h-9 w-9",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    </MarbleTooltip>
  );
});

/* ------------------------------------------------------------------ */

export type BadgeTone = RepositoryStatus | "neutral" | "bronze";

const STATUS_ICON: Record<RepositoryStatus, typeof Rocket> = {
  deployed: Rocket,
  active: Sparkles,
  maintained: CircleDot,
  archived: Archive,
};

export const STATUS_LABEL: Record<RepositoryStatus, string> = {
  deployed: "Deployed",
  active: "Active",
  maintained: "Maintained",
  archived: "Archived",
};

export function MarbleBadge({ tone = "neutral", children, className, icon = true }: { tone?: BadgeTone; children?: ReactNode; className?: string; icon?: boolean }) {
  const isStatus = tone in STATUS_ICON;
  const Icon = isStatus ? STATUS_ICON[tone as RepositoryStatus] : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 text-[11px] leading-none tracking-wide",
        tone === "deployed" && "border-[#3d8bff]/60 bg-[#3d8bff]/10 text-[#cfe0ff]",
        tone === "active" && "border-[#3d8bff]/35 bg-[#3d8bff]/5 text-[#c9d6ec]",
        tone === "maintained" && "border-[#f2ede2]/25 text-[#d9d2c4]",
        tone === "archived" && "border-[#f2ede2]/15 text-[#a59e92] italic",
        tone === "neutral" && "border-[#f2ede2]/20 bg-[#f2ede2]/5 text-[#e6dfd1]",
        tone === "bronze" && "border-[#a87d45]/60 bg-[#a87d45]/10 text-[#e2c89c]",
        className,
      )}
    >
      {icon && Icon && <Icon aria-hidden className="h-3 w-3" />}
      {children ?? (isStatus ? STATUS_LABEL[tone as RepositoryStatus] : null)}
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function MarbleDivider({ ornament = true, className }: { ornament?: boolean; className?: string }) {
  return (
    <div className={cn(styles.divider, className)} role="separator">
      {ornament && (
        <svg aria-hidden width="10" height="10" viewBox="0 0 10 10">
          <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="none" stroke="currentColor" />
          <circle cx="5" cy="5" r="1.4" fill="currentColor" />
        </svg>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Lightweight CSS tooltip (hover + focus-within), restyled for the atlas. */
function MarbleTooltip({ content, side = "top", children }: { content: ReactNode; side?: "left" | "right" | "top" | "bottom"; children: ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-[3px] border border-[#f2ede2]/20 bg-[#16181e] px-2 py-1 text-[11px] text-[#f2ede2] opacity-0 shadow-lg transition-opacity duration-100",
          "group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "left" && "right-full top-1/2 mr-2 -translate-y-1/2",
          side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2",
          side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
          side === "bottom" && "left-1/2 top-full mt-2 -translate-x-1/2",
        )}
      >
        {content}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function MarbleSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Any",
}: {
  label: string;
  options: { value: string; label: string; count?: number }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div ref={rootRef} className="relative">
      <span id={`${id}-label`} className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-[#a59e92]">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="flex h-9 w-full items-center justify-between rounded-[3px] border border-[#f2ede2]/20 bg-[#0d1016]/60 px-2.5 text-left text-[13px] text-[#f2ede2] hover:border-[#f2ede2]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
      >
        <span className="truncate">{value.length ? value.join(", ") : placeholder}</span>
        <ChevronDown aria-hidden className="h-4 w-4 text-[#c49a5e]" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={`${id}-label`}
          className={cn(styles.panel, styles.fadeIn, "absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-[3px] p-1")}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          {options.map((o) => {
            const selected = value.includes(o.value);
            return (
              <li key={o.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => toggle(o.value)}
                  className="flex w-full items-center gap-2 rounded-[2px] px-2 py-1.5 text-left text-[13px] text-[#e6dfd1] hover:bg-[#f2ede2]/10 focus-visible:bg-[#f2ede2]/10 focus-visible:outline-none"
                >
                  <span className={cn("flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border", selected ? "border-[#c49a5e] bg-[#a87d45]/40" : "border-[#f2ede2]/30")}>
                    {selected && <Check aria-hidden className="h-3 w-3" />}
                  </span>
                  <span className="flex-1">{o.label}</span>
                  {o.count != null && <span className="text-[11px] text-[#8f887c]">{o.count}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export const MarbleSearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { onClear?: () => void }>(
  function MarbleSearchInput({ className, onClear, value, ...rest }, ref) {
    return (
      <div className={cn("relative", className)}>
        <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c49a5e]" />
        <input
          ref={ref}
          type="search"
          value={value}
          className="h-9 w-full rounded-[3px] border border-[#f2ede2]/20 bg-[#0d1016]/60 pl-8 pr-8 text-[13px] text-[#f2ede2] placeholder:text-[#8f887c] hover:border-[#f2ede2]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff] [&::-webkit-search-cancel-button]:hidden"
          {...rest}
        />
        {onClear && value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[2px] p-1 text-[#a59e92] hover:text-[#f2ede2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8bff]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    );
  },
);

/* ------------------------------------------------------------------ */

/** Mobile bottom sheet with two snap points; drag handle toggles, Escape closes. */
export function MarbleSheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const startY = useRef<number | null>(null);
  useEffect(() => {
    if (!open) return;
    setExpanded(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <section
      aria-label={label}
      className={cn(styles.panel, styles.fadeIn, "absolute inset-x-0 bottom-0 z-40 flex flex-col rounded-t-xl transition-[height] duration-200")}
      style={{ height: expanded ? "88%" : "46%" }}
    >
      <button
        type="button"
        aria-label={expanded ? "Collapse details" : "Expand details"}
        className="flex h-6 w-full shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3d8bff]"
        onClick={() => setExpanded((e) => !e)}
        onPointerDown={(e) => (startY.current = e.clientY)}
        onPointerUp={(e) => {
          if (startY.current == null) return;
          const dy = e.clientY - startY.current;
          startY.current = null;
          if (dy > 40) (expanded ? setExpanded(false) : onClose());
          else if (dy < -40) setExpanded(true);
        }}
      >
        <span className="h-1 w-10 rounded-full bg-[#f2ede2]/30" />
      </button>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  );
}

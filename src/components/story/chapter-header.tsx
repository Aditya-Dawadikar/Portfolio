"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Section opener: the git command that "checks out" the section types itself out,
 * then the heading rises line by line out of a mask.
 */
export function ChapterHeader({
  command,
  title,
  subtitle,
  className,
}: {
  command: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduceMotion = useReducedMotion();
  const show = inView || !!reduceMotion;
  const typing = reduceMotion ? 0 : 0.022;
  const typedFor = command.length * typing;

  return (
    <div ref={ref} className={cn("mb-8 space-y-3", className)}>
      <p className="font-mono text-xs text-zinc-500 sm:text-sm" aria-label={`$ ${command}`}>
        <span className="text-emerald-400">$</span>{" "}
        {command.split("").map((char, i) => (
          <motion.span
            key={i}
            aria-hidden
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={show ? { opacity: 1 } : undefined}
            transition={{ duration: 0.01, delay: i * typing }}
          >
            {char}
          </motion.span>
        ))}
        {!reduceMotion && (
          <motion.span
            aria-hidden
            className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-zinc-400"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </p>

      <h2 className="text-4xl font-semibold leading-[1.05] text-white lg:text-5xl">
        {title.split("\n").map((line, i) => (
          <span key={i} className="block overflow-hidden pb-[0.08em]">
            <motion.span
              className="block"
              initial={reduceMotion ? false : { y: "105%" }}
              animate={show ? { y: "0%" } : undefined}
              transition={{ duration: 0.8, delay: typedFor + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h2>

      {subtitle && (
        <motion.p
          className="max-w-2xl text-base text-zinc-400"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={show ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: typedFor + 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

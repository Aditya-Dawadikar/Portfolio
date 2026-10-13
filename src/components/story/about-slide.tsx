"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useMemo, useRef } from "react";

type Token = { word: string; href?: string };

/** Splits the markdown summary into words, keeping `[text](href)` links attached to their words. */
function tokenize(markdown: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|([^\s[]+)/g;
  for (const match of Array.from(markdown.matchAll(pattern))) {
    if (match[3]) {
      tokens.push({ word: match[3] });
    } else {
      const raw = match[2];
      const href = raw.startsWith("#") || raw.startsWith("/") || raw.startsWith("http") ? raw : `/${raw}`;
      match[1].split(/\s+/).forEach((word) => tokens.push({ word, href }));
    }
  }
  return tokens;
}

const WORD_STAGGER = 0.014;

/** The portrait fills the right half of the screen while the About text lights up word by word. */
export function AboutSlide({
  summary,
  avatarUrl,
  footer,
}: {
  summary: string;
  avatarUrl: string;
  /** Socials and the root commit, shown once the text has been read in. */
  footer: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = !!useReducedMotion();
  const inView = useInView(sectionRef, { once: true, amount: 0.6 });
  const tokens = useMemo(() => tokenize(summary), [summary]);

  const footerDelay = reduceMotion ? 0 : tokens.length * WORD_STAGGER;

  return (
    <section ref={sectionRef} id="about" data-branches="main" className="relative grid h-[100svh] snap-start snap-always grid-cols-1 overflow-hidden bg-[#010101] pt-14 text-white md:grid-cols-2">
      <div className="absolute inset-0 md:left-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="" aria-hidden className="h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(1,1,1,0.85)_100%)]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#010101] via-[#010101]/60 to-transparent md:hidden" />
      </div>

      <div className="relative z-10 flex items-end px-6 pb-10 sm:px-10 md:items-center md:pb-0 lg:px-16">
        <div className="max-w-xl space-y-6">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ delay: 0 }}
            className="text-xs uppercase tracking-[0.4em] text-zinc-400"
          >
            About
          </motion.p>
          <p className="text-base leading-relaxed sm:text-lg lg:text-xl">
            {tokens.map((token, i) => (
              <span key={i}>
                <motion.span
                  className="text-zinc-100"
                  initial={reduceMotion ? false : { opacity: 0.12 }}
                  animate={inView ? { opacity: 1 } : undefined}
                  transition={{ duration: 0.3, delay: i * WORD_STAGGER }}
                >
                  {token.href ? (
                    <Link href={token.href} className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
                      {token.word}
                    </Link>
                  ) : (
                    token.word
                  )}
                </motion.span>{" "}
              </span>
            ))}
          </p>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: footerDelay }}
          >
            {footer}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

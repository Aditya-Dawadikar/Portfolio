"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "./use-media-query";

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

const MORPH_SECONDS = 1.2;
const WORD_STAGGER = 0.014;

/**
 * Arriving on this screen, the hero video closes into a circle and becomes the avatar,
 * then the About text lights up word by word.
 */
export function AboutSlide({
  summary,
  avatarUrl,
  videoSrc,
  footer,
}: {
  summary: string;
  avatarUrl: string;
  videoSrc: string;
  /** Socials and the root commit, shown once the text has been read in. */
  footer: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const reduceMotion = !!useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const inView = useInView(sectionRef, { once: true, amount: 0.6 });
  const [box, setBox] = useState({ w: 0, h: 0 });
  const tokens = useMemo(() => tokenize(summary), [summary]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    const observer = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(media);
    return () => observer.disconnect();
  }, []);

  // Centre of the circle: middle of the right half on desktop, upper part of the screen on phones.
  const cx = box.w / 2;
  const cy = isDesktop ? box.h / 2 : box.h * 0.2;
  const fullRadius = Math.hypot(Math.max(cx, box.w - cx), Math.max(cy, box.h - cy)) + 2;
  const avatarRadius = isDesktop ? Math.min(box.w, box.h) * 0.26 : Math.min(box.w * 0.24, box.h * 0.11);

  const radius = useMotionValue(0);
  const avatarOpacity = useMotionValue(0);
  const clipPath = useTransform(radius, (r) => (box.w ? `circle(${r}px at ${cx}px ${cy}px)` : "none"));
  const ringOpacity = useTransform(radius, (r) => (r <= avatarRadius * 1.05 ? 1 : 0));

  useEffect(() => {
    if (!box.w) return;
    if (!inView) {
      radius.set(fullRadius);
      return;
    }
    if (reduceMotion) {
      radius.set(avatarRadius);
      avatarOpacity.set(1);
      return;
    }
    const morph = animate(radius, avatarRadius, { duration: MORPH_SECONDS, ease: [0.65, 0, 0.35, 1] });
    const fade = animate(avatarOpacity, 1, { duration: 0.5, delay: MORPH_SECONDS * 0.8 });
    return () => {
      morph.stop();
      fade.stop();
    };
  }, [inView, box.w, fullRadius, avatarRadius, reduceMotion, radius, avatarOpacity]);

  const textStart = reduceMotion ? 0 : MORPH_SECONDS * 0.7;
  const footerDelay = reduceMotion ? 0 : textStart + tokens.length * WORD_STAGGER;

  return (
    <section ref={sectionRef} id="about" data-branches="main" className="relative grid h-[100svh] snap-start snap-always grid-cols-1 overflow-hidden bg-[#010101] pt-14 text-white md:grid-cols-2">
      <div ref={mediaRef} className="absolute inset-0 md:left-1/2">
        <motion.div className="absolute inset-0 flex items-center justify-center" style={{ clipPath }}>
          <video className="h-full w-full object-cover md:h-auto md:max-h-full md:w-auto md:object-contain" autoPlay loop muted playsInline preload="metadata">
            <source src={videoSrc} type="video/mp4" />
          </video>
          <motion.img
            src={avatarUrl}
            alt=""
            aria-hidden
            className="absolute object-cover"
            style={{ opacity: avatarOpacity, left: cx - avatarRadius, top: cy - avatarRadius, width: avatarRadius * 2, height: avatarRadius * 2 }}
          />
        </motion.div>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 shadow-[0_0_60px_rgba(255,216,140,0.15)] transition-opacity duration-500"
          style={{ left: cx, top: cy, width: avatarRadius * 2 + 16, height: avatarRadius * 2 + 16, opacity: ringOpacity }}
        />
      </div>

      <div className="relative z-10 flex items-end px-6 pb-10 sm:px-10 md:items-center md:pb-0 lg:px-16">
        <div className="max-w-xl space-y-6">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ delay: textStart }}
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
                  transition={{ duration: 0.3, delay: textStart + i * WORD_STAGGER }}
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

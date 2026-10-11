"use client";

import { motion, useReducedMotion } from "framer-motion";

/** The opening screen: the name rises in letter by letter beside the hero video. */
export function Hero({ name, tagline, videoSrc }: { name: string; tagline: string; videoSrc: string }) {
  const reduceMotion = useReducedMotion();
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: "0.6em", filter: "blur(8px)" },
          animate: { opacity: 1, y: "0em", filter: "blur(0px)" },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <section className="relative grid h-[100svh] snap-start snap-always grid-cols-1 overflow-hidden bg-[#010101] pt-14 text-white md:grid-cols-2">
      <div className="relative z-10 flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="max-w-xl space-y-5">
          <motion.p {...rise(0.1)} className="text-xs uppercase tracking-[0.4em] text-zinc-400">
            Hello
          </motion.p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl" aria-label={`I am ${name}`}>
            {`I am ${name}`.split("").map((char, i) => (
              <motion.span key={i} aria-hidden className="inline-block whitespace-pre" {...rise(0.25 + i * 0.035)}>
                {char}
              </motion.span>
            ))}
          </h1>
          <motion.p {...rise(1)} className="max-w-lg text-base text-zinc-300 sm:text-lg">
            {tagline}
          </motion.p>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden md:relative md:flex md:items-center md:justify-center">
        <video
          className="h-full w-full object-cover md:h-auto md:max-h-[calc(100vh-4.5rem)] md:w-auto md:object-contain"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/75 md:hidden" aria-hidden="true" />
        <div className="landing-video-wash" aria-hidden="true" />
        <div className="landing-video-vignette" aria-hidden="true" />
      </div>

      <div className="landing-bottom-fade landing-bottom-fade-tall" aria-hidden="true" />
      <motion.div
        className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500"
        animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        scroll ↓
      </motion.div>
    </section>
  );
}

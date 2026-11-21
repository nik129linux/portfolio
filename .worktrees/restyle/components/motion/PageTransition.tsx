"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// app/template.tsx remounts this on every client navigation, so a module-level
// flag tells the first page load (no wipe) apart from a route change (wipe).
let hasLoaded = false;

const HIDDEN = "inset(100% 0% 0% 0%)";
const COVER = "inset(0% 0% 0% 0%)";
const GONE = "inset(0% 0% 100% 0%)";

export default function PageTransition() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hasLoaded && !reduce) setPlay(true);
    hasLoaded = true;
  }, []);

  return (
    <motion.div
      data-testid="page-transition"
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 bg-cobalt"
      initial={{ clipPath: HIDDEN }}
      animate={play ? { clipPath: [COVER, COVER, GONE] } : { clipPath: HIDDEN }}
      transition={play ? { duration: 0.6, times: [0, 0.3, 1], ease: [0.65, 0, 0.35, 1] } : { duration: 0 }}
      onAnimationComplete={() => setPlay(false)}
    />
  );
}

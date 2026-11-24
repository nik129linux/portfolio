"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const ProgressContext = createContext<MotionValue<number> | null>(null);

export default function Parallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 25 });

  return (
    <div ref={ref} data-testid="parallax" className={className ?? "relative w-full overflow-hidden bg-paper text-ink"}>
      <ProgressContext.Provider value={smooth}>{children}</ProgressContext.Provider>
    </div>
  );
}

export function ParallaxLayer({
  speed,
  drift = 0,
  children,
  className,
}: {
  speed: number;
  /** horizontal travel over the same progress, so layers can scatter outward */
  drift?: number;
  children: ReactNode;
  className?: string;
}) {
  const progress = useContext(ProgressContext);
  const y = useTransform(progress as MotionValue<number>, (v) => v * speed * 240);
  const x = useTransform(progress as MotionValue<number>, (v) => v * drift * 240);

  // Effect-only matchMedia (SSR and first client render agree; CSS in
  // globals.css forces no-transform from first paint under reduced motion).
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (reduce || !progress) {
    return (
      <div data-speed={speed} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div data-speed={speed} style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

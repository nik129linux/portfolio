"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const CLIP_START = "inset(30% 35% round 24px)";
const CLIP_END = "inset(0% 0% round 0px)";

export default function PortalReveal({ media, title }: { media: string; title: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  // Effect-only matchMedia (SSR and first client render agree; CSS in
  // globals.css forces the reduced-motion end state from first paint).
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 25 });
  const clipPath = useTransform(smooth, [0, 1], [CLIP_START, CLIP_END]);
  const scale = useTransform(smooth, [0, 1], [1.3, 1]);

  // Idle tilt for fine pointers only: ±6deg following the pointer.
  const rawRX = useMotionValue(0);
  const rawRY = useMotionValue(0);
  const rotateX = useSpring(rawRX, { stiffness: 200, damping: 25 });
  const rotateY = useSpring(rawRY, { stiffness: 200, damping: 25 });
  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      rawRY.set((e.clientX / window.innerWidth - 0.5) * 12);
      rawRX.set(-(e.clientY / window.innerHeight - 0.5) * 12);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rawRX, rawRY]);

  return (
    <section
      ref={sectionRef}
      data-testid="portal"
      className="relative w-full text-paper"
      style={{ height: "250vh" }}
    >
      <div
        className={`top-0 flex w-full items-center justify-center overflow-hidden ${reduce ? "relative" : "sticky"}`}
        style={{ height: "100svh" }}
      >
        <motion.div
          data-testid="portal-window"
          className="h-full w-full overflow-hidden bg-paper-2"
          style={
            reduce
              ? { clipPath: CLIP_END }
              : { clipPath, rotateX, rotateY, transformPerspective: 1200 }
          }
        >
          <motion.img
            src={media}
            alt={title}
            draggable={false}
            className="h-full w-full object-cover"
            style={reduce ? { scale: 1 } : { scale }}
          />
        </motion.div>
        <p aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-8 px-6 text-center font-display text-3xl text-paper">
          {title}
        </p>
      </div>
    </section>
  );
}

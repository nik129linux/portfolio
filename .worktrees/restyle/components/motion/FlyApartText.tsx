"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function drift(i: number) {
  const dx = (i % 2 === 0 ? 1 : -1) * (40 + ((i * 53) % 90));
  const dy = (i % 2 === 0 ? -1 : 1) * (24 + ((i * 31) % 70));
  const rot = (i % 2 === 0 ? 1 : -1) * (4 + ((i * 7) % 9));
  return { dx, dy, rot };
}

function Word({ word, index, drive }: { word: string; index: number; drive: MotionValue<number> }) {
  const { dx, dy, rot } = drift(index);
  const x = useTransform(drive, [0, 1], [0, dx]);
  const y = useTransform(drive, [0, 1], [0, dy]);
  const rotate = useTransform(drive, [0, 1], [0, rot]);
  return (
    <motion.span data-word style={{ x, y, rotate }} className="inline-block">
      {word}
    </motion.span>
  );
}

export default function FlyApartText({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // Mounted matchMedia state (not useReducedMotion): SSR and the first client
  // render must agree, or hydration replaces the DOM node mid-test.
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end start"] });
  const drive = useTransform(scrollYProgress, [0, 0.35, 1], [0, 0, 1]);
  const words = text.split(" ");

  return (
    <div ref={ref} data-testid="fly-apart" className="flex flex-wrap gap-x-[0.3em]">
      {words.map((w, i) =>
        reduce ? (
          <span key={i} data-word className="inline-block">
            {w}
          </span>
        ) : (
          <Word key={i} word={w} index={i} drive={drive} />
        )
      )}
    </div>
  );
}

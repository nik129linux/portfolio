"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function Word({
  word,
  index,
  total,
  progress,
  reduce,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  // The first word starts as the heading enters, the last one finishes at centre.
  const start = total > 1 ? (index / (total - 1)) * 0.4 : 0;
  const end = start + 0.6;
  const y = useTransform(progress, [start, end], ["100%", "0%"]);

  return (
    <span className="inline-block overflow-hidden align-bottom leading-tight">
      <motion.span data-word style={{ y: reduce ? 0 : y }} className="inline-block will-change-transform">
        {word}
      </motion.span>
    </span>
  );
}

export default function ScrubHeading({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  // Mounted matchMedia state: SSR and the first client render agree, so the
  // heading element itself is never replaced after hydration.
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const words = text.split(" ").filter(Boolean);

  return (
    <h2 ref={ref} data-testid="scrub-heading" className={`flex flex-wrap gap-x-2 ${className ?? ""}`}>
      {words.map((word, i) => (
        <Word key={`${word}-${i}`} word={word} index={i} total={words.length} progress={scrollYProgress} reduce={reduce} />
      ))}
    </h2>
  );
}

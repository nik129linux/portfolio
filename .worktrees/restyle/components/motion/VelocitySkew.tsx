"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

export default function VelocitySkew({ children, className }: { children: ReactNode; className?: string }) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 300, damping: 30 });
  const skew = useTransform(smooth, (v) => Math.max(-4, Math.min(4, v * 0.002)));

  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <motion.div data-velocity-skew style={{ skewY: reduce ? 0 : skew }} className={className}>
      {children}
    </motion.div>
  );
}

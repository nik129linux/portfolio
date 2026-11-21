"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useEffect, useRef, useState, type Ref } from "react";

function Group({ items, innerRef, hidden }: { items: string[]; innerRef?: Ref<HTMLDivElement>; hidden?: boolean }) {
  return (
    <div ref={innerRef} aria-hidden={hidden ? "true" : undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="font-display text-5xl font-bold tracking-tight md:text-6xl">{item}</span>
          <span aria-hidden="true" className="mx-6 inline-block size-2 shrink-0 rounded-full bg-coral" />
        </span>
      ))}
    </div>
  );
}

export default function Marquee({ items }: { items: string[] }) {
  const copyRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef(0);
  const x = useMotionValue(0);
  const [ready, setReady] = useState(false);
  const [reduce, setReduce] = useState(false);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduce(mq.matches);
      setReady(true);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    const measure = () => {
      unitRef.current = el.offsetWidth;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  useAnimationFrame((_, delta) => {
    if (!ready || reduce) return;
    const unit = unitRef.current;
    if (unit <= 0) return;
    // One full copy every 40s; scroll velocity briefly multiplies the speed,
    // and the spring lets it ease back to the base speed when scrolling stops.
    const base = unit / 40;
    const boost = 1 + Math.min(8, Math.abs(velocityFactor.get()));
    let next = x.get() - (base * boost * delta) / 1000;
    if (next <= -unit) next += unit;
    if (next > 0) next -= unit;
    x.set(next);
  });

  return (
    <section data-testid="marquee" className="relative w-full overflow-hidden bg-paper py-10 text-ink">
      <motion.div data-testid="marquee-track" style={{ x }} className="flex w-max will-change-transform">
        <Group items={items} innerRef={copyRef} />
        <Group items={items} hidden />
      </motion.div>
    </section>
  );
}

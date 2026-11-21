"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export type DrumItem = { slug: string; title: string; kind: string; href?: string };

const RADIUS = 170;

function WheelItem({
  item,
  index,
  step,
  active,
  rotation,
}: {
  item: DrumItem;
  index: number;
  step: number;
  active: boolean;
  rotation: MotionValue<number>;
}) {
  // Opacity falls off with the item's angular distance from the front.
  const opacity = useTransform(rotation, (r) => {
    const angle = (((index * step + r) % 360) + 360) % 360;
    const distance = angle > 180 ? 360 - angle : angle;
    return Math.max(0.12, 1 - distance / 180);
  });

  return (
    <div
      data-testid="drum-item"
      data-slug={item.slug}
      data-active={active ? "true" : "false"}
      className="absolute left-1/2 top-1/2 w-80 backface-hidden"
      style={{ transform: `translate(-50%, -50%) rotateX(${index * step}deg) translateZ(${RADIUS}px)` }}
    >
      <motion.div style={{ opacity }} className="rounded-2xl border border-line bg-paper-2 px-6 py-4">
        <a href={item.href ?? `#${item.slug}`} className="block text-ink">
          <span className="block font-display text-2xl font-bold">{item.title}</span>
          <span className="mt-1 block text-sm text-ink-2">{item.kind}</span>
        </a>
      </motion.div>
    </div>
  );
}

export default function DrumWheel({ items }: { items: DrumItem[] }) {
  const [reduce, setReduce] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeRef = useRef(0);
  const stateRef = useRef({ n: 0, step: 0 });
  const cleanupRef = useRef<(() => void) | null>(null);

  const targetRotation = useMotionValue(0);
  const rotation = useSpring(targetRotation, { stiffness: 90, damping: 20, mass: 0.6 });

  stateRef.current.n = items.length;
  stateRef.current.step = items.length > 0 ? 360 / items.length : 0;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReduce = () => setReduce(mq.matches);
    updateReduce();
    mq.addEventListener("change", updateReduce);
    return () => mq.removeEventListener("change", updateReduce);
  }, []);

  useEffect(() => {
    const update = () => setNarrow(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const staticMode = reduce || narrow;

  // Callback ref: the wheel listener lives exactly as long as the 3D stage,
  // and is gone in static mode, so the page never gets trapped.
  const attachRef = useCallback(
    (node: HTMLElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      if (!node || staticMode) return;

      const onWheel = (event: WheelEvent) => {
        if (event.deltaY === 0) return;
        const { n, step } = stateRef.current;
        if (n < 2) return;
        const active = activeRef.current;
        const direction = event.deltaY > 0 ? 1 : -1;
        // At either end, let the wheel scroll the page instead.
        if ((direction > 0 && active >= n - 1) || (direction < 0 && active <= 0)) return;
        event.preventDefault();
        const next = Math.min(n - 1, Math.max(0, active + direction));
        if (next === active) return;
        activeRef.current = next;
        setActiveIndex(next);
        targetRotation.set(-next * step);
      };

      node.addEventListener("wheel", onWheel, { passive: false });
      cleanupRef.current = () => node.removeEventListener("wheel", onWheel);
    },
    [staticMode, targetRotation]
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  if (staticMode) {
    return (
      <section ref={attachRef} data-testid="drum" data-mode="static" className="w-full bg-paper px-6 py-12 text-ink">
        <ul className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {items.map((item) => (
            <li key={item.slug} data-testid="drum-item" data-slug={item.slug}>
              <a
                href={item.href ?? `#${item.slug}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper-2 px-5 py-4 text-ink"
              >
                <span className="font-display text-xl font-bold">{item.title}</span>
                <span className="text-sm text-ink-2">{item.kind}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const step = items.length > 0 ? 360 / items.length : 0;

  return (
    <section
      ref={attachRef}
      data-testid="drum"
      data-mode="3d"
      data-lenis-prevent-wheel
      aria-label="Projects"
      className="relative flex h-96 w-full items-center justify-center overflow-hidden bg-paper text-ink"
      style={{ perspective: "1200px" }}
    >
      <motion.div style={{ rotateX: rotation, transformStyle: "preserve-3d" }} className="relative h-full w-full">
        {items.map((item, i) => (
          <WheelItem key={item.slug} item={item} index={i} step={step} active={i === activeIndex} rotation={rotation} />
        ))}
      </motion.div>
    </section>
  );
}

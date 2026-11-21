"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useState } from "react";

export type TunnelItem = { slug: string; title: string; kind: string; media: string; href?: string };

type CardData = TunnelItem & { angleCos: number; angleSin: number; radiusFactorX: number; radiusFactorY: number; rotationZ: number; index: number };

// Progress where the first card is already fully visible.
const START = 0.1;

function buildCards(items: TunnelItem[]): CardData[] {
  return items.map((item, i) => {
    const goldenAngle = i * 137.5 * (Math.PI / 180);
    return {
      ...item,
      angleCos: Math.cos(goldenAngle),
      angleSin: Math.sin(goldenAngle),
      radiusFactorX: 0.28 + (i % 3) * 0.08,
      radiusFactorY: 0.26 + (i % 2) * 0.09,
      rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
      index: i,
    };
  });
}

function useFinePointer(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 25, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 60, damping: 25, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

function TunnelCard({
  card,
  progress,
  total,
  stageW,
  stageH,
}: {
  card: CardData;
  progress: MotionValue<number>;
  total: number;
  stageW: number;
  stageH: number;
}) {
  const staggerSpan = 0.55;
  const start = (card.index / total) * (1 - staggerSpan);
  const end = start + staggerSpan;
  const local = useTransform(progress, [start, end], [0, 1]);
  const z = useTransform(local, [0, 1], [-1700, 500]);
  const opacity = useTransform(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);
  const cardWidth = Math.max(180, Math.min(270, stageW * 0.18));
  const cardH = cardWidth * 1.25;
  const baseX = card.angleCos * (stageW * card.radiusFactorX);
  const baseY = card.angleSin * (stageH * card.radiusFactorY);
  const href = card.href ?? `#${card.slug}`;

  return (
    <motion.div
      data-testid="tunnel-card"
      style={{
        width: cardWidth,
        marginLeft: -cardWidth / 2,
        marginTop: -cardH / 2,
        x: baseX,
        y: baseY,
        z,
        opacity,
        rotateZ: card.rotationZ,
      }}
      className="absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform"
    >
      <a
        href={href}
        className="block h-full w-full overflow-hidden rounded-2xl border border-line bg-paper text-ink"
      >
        <img src={card.media} alt={card.title} draggable={false} className="h-3/4 w-full object-cover" />
        <span className="block p-4">
          <span className="block text-sm font-semibold">{card.title}</span>
          <span className="mt-1 inline-block rounded-full bg-paper-2 px-2 py-0.5 text-xs text-ink-2">{card.kind}</span>
        </span>
      </a>
    </motion.div>
  );
}

export default function PerspectiveTunnel({ items }: { items: TunnelItem[] }) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stage, setStage] = useState({ width: 1440, height: 900 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReduce = () => setReduceMotion(mq.matches);
    updateReduce();
    mq.addEventListener("change", updateReduce);
    return () => mq.removeEventListener("change", updateReduce);
  }, []);

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 768);
      setStage({ width: window.innerWidth, height: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const rawProgress = useMotionValue(START);
  const smoothProgress = useSpring(rawProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 });

  useEffect(() => {
    const el = node;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const current = rawProgress.get();
      const delta = e.deltaY * 0.0004;
      const atTopRelease = current <= START && delta < 0;
      const atBottomRelease = current >= 1 && delta > 0;
      if (atTopRelease || atBottomRelease) return;
      e.preventDefault();
      rawProgress.set(Math.min(1, Math.max(START, current + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [node, rawProgress]);

  const pointer = useFinePointer(!reduceMotion);
  const panX = useTransform(pointer.x, (v) => v * -45);
  const panY = useTransform(pointer.y, (v) => v * -45);

  const cards = buildCards(items);
  const staticMode = !!reduceMotion || isMobile;

  // Index of the card currently closest to the viewer, from scroll progress.
  const [active, setActive] = useState(0);
  useEffect(() => {
    const total = cards.length;
    if (total === 0) return;
    return smoothProgress.on("change", (v) => {
      const i = Math.min(total - 1, Math.max(0, Math.round(((v - START) / (1 - START)) * (total - 1))));
      setActive((prev) => (prev === i ? prev : i));
    });
  }, [smoothProgress, cards.length]);

  if (staticMode) {
    return (
      <section ref={setNode} data-testid="tunnel"
      data-lenis-prevent-wheel data-mode="static" className="w-full overflow-hidden bg-paper py-8 text-ink">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
          {cards.map((card) => (
            <article key={card.slug} data-testid="tunnel-card" className="w-64 shrink-0 snap-center overflow-hidden rounded-2xl border border-line bg-paper">
              <a href={card.href ?? `#${card.slug}`} className="block">
                <img src={card.media} alt={card.title} draggable={false} className="aspect-[4/5] w-full object-cover" />
                <span className="block p-4">
                  <span className="block text-sm font-semibold">{card.title}</span>
                  <span className="mt-1 inline-block rounded-full bg-paper-2 px-2 py-0.5 text-xs text-ink-2">{card.kind}</span>
                </span>
              </a>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={setNode}
      data-testid="tunnel"
      data-lenis-prevent-wheel
      data-mode="3d"
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-paper text-ink"
      style={{ perspective: "1200px" }}
    >
      <motion.div style={{ x: panX, y: panY }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="px-6 text-center text-sm">Scroll to travel through the work</p>
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <p
          data-testid="tunnel-title"
          className="w-full px-6 text-center font-display text-ink"
          style={{ fontSize: "clamp(3rem, 12vw, 12rem)", lineHeight: 1, opacity: 0.12 }}
        >
          {cards[active]?.title ?? ""}
        </p>
      </div>
      <p
        data-testid="tunnel-counter"
        className="absolute bottom-6 right-6 font-sans text-sm tabular-nums text-ink"
      >
        {`${String(active + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`}
      </p>
      <div className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {cards.map((card) => (
          <TunnelCard key={card.slug} card={card} progress={smoothProgress} total={cards.length} stageW={stage.width} stageH={stage.height} />
        ))}
      </div>
    </section>
  );
}

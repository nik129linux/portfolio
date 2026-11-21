"use client";

/* eslint-disable @next/next/no-img-element */

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Project, Screen } from "@/data/types";

type DeviceKind = NonNullable<Project["device"]>;

const DEVICE_WIDTH: Record<DeviceKind, string> = {
  laptop: "w-full max-w-2xl",
  phone: "w-2/5 max-w-xs",
  watch: "w-1/3 max-w-2xs",
  monitor: "w-full max-w-2xl",
};

// Mounted matchMedia state: the server and the first client paint agree, and the
// root element never changes after hydration, only its classes and styles.
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function ScreenStack({ screens, title, active }: { screens: Screen[]; title: string; active: number }) {
  return (
    <>
      {screens.map((screen, i) => (
        <img
          key={screen.src}
          src={screen.src}
          alt={i === active ? `${title}: ${screen.caption}` : ""}
          aria-hidden={i !== active}
          data-screen={i}
          data-active={i === active ? "true" : "false"}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ease-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}

function DeviceFrame({ kind, screens, title, active }: { kind: DeviceKind; screens: Screen[]; title: string; active: number }) {
  if (kind === "phone") {
    return (
      <div className="w-full rounded-2xl border-4 border-ink bg-ink p-1.5 shadow-raised ring-1 ring-paper/15" style={{ aspectRatio: "9 / 19" }}>
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-paper-2">
          <ScreenStack screens={screens} title={title} active={active} />
          <div className="absolute left-1/2 top-1.5 h-1 w-1/3 -translate-x-1/2 rounded-full bg-ink" />
        </div>
      </div>
    );
  }

  if (kind === "watch") {
    return (
      <div className="flex flex-col items-center">
        <div aria-hidden className="h-8 w-1/3 rounded-t-md bg-ink-2" />
        <div className="relative aspect-5/6 w-full rounded-2xl border-4 border-ink bg-ink shadow-raised ring-1 ring-paper/15">
          <div className="absolute inset-1 overflow-hidden rounded-xl bg-paper-2">
            <ScreenStack screens={screens} title={title} active={active} />
          </div>
        </div>
        <div aria-hidden className="h-8 w-1/3 rounded-b-md bg-ink-2" />
      </div>
    );
  }

  if (kind === "monitor") {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="w-full rounded-xl border border-ink bg-ink p-2 shadow-raised ring-1 ring-paper/15">
          <div className="relative aspect-video overflow-hidden rounded-md bg-paper-2">
            <ScreenStack screens={screens} title={title} active={active} />
          </div>
        </div>
        <div aria-hidden className="h-6 w-6 bg-ink-2" />
        <div aria-hidden className="h-2 w-1/3 rounded-full bg-ink-2" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-ink bg-ink p-2 shadow-raised ring-1 ring-paper/15">
        <div className="relative aspect-video overflow-hidden rounded-md bg-paper-2">
          <ScreenStack screens={screens} title={title} active={active} />
        </div>
      </div>
      <div aria-hidden className="mx-auto h-1.5 w-2/5 rounded-b-md bg-ink" />
    </div>
  );
}

export default function ProjectShowcase({ project }: { project: Project }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const mobile = useMediaQuery("(max-width: 767px)");

  const device: DeviceKind = project.device ?? "laptop";
  const screens: Screen[] =
    project.deviceScreens && project.deviceScreens.length > 0
      ? project.deviceScreens
      : project.screens && project.screens.length > 0
        ? project.screens
        : [{ src: project.media, caption: project.title }];

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0001 });

  // The raw scroll progress picks the screen so stepping and reversing stay exact.
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.max(0, Math.min(screens.length - 1, Math.floor(p * screens.length)));
    setActive((prev) => (prev === next ? prev : next));
  });
  const shown = reduced ? 0 : active;

  // Scroll scrubs the device: in from the left, face on, out to the right. The
  // phone view keeps the same beat with a much smaller tilt.
  const tilt = mobile ? 4 : 12;
  const sway = mobile ? 3 : 8;
  const rotateX = useTransform(progress, [0, 0.5, 1], [-tilt, 0, tilt]);
  const rotateY = useTransform(progress, [0, 0.5, 1], [-sway, 0, sway]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.96, 1, 1.02]);
  const drift = useTransform(progress, [0, 0.5, 1], [12, 0, -12]);

  // The giant title sits behind, slides up and fades as the device takes the stage.
  const titleY = useTransform(progress, [0, 1], [0, -260]);
  const titleOpacity = useTransform(progress, [0, 0.8], [0.22, 0]);

  const deviceStyle: MotionStyle | undefined = reduced
    ? undefined
    : { rotateX, rotateY, scale, y: drift };

  return (
    <section
      ref={sectionRef}
      data-testid="showcase"
      aria-label={`${project.title} showcase`}
      className="relative w-full overflow-x-clip text-paper"
      style={{ height: reduced ? "auto" : "300vh" }}
    >
      <div
        className={`${reduced ? "relative" : "sticky top-0"} h-svh w-full overflow-hidden`}
        style={{ perspective: "1400px" }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <motion.h3
            data-testid="showcase-title"
            className="z-0 w-full whitespace-nowrap text-center font-display uppercase tracking-tight text-paper"
            style={{
              fontSize: "clamp(96px, 16vw, 240px)",
              lineHeight: 1,
              y: reduced ? 0 : titleY,
              opacity: reduced ? 0.22 : titleOpacity,
            }}
          >
            {project.title}
          </motion.h3>
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6">
          <motion.div
            data-testid="device"
            data-device={device}
            style={deviceStyle}
            className={`relative z-10 ${DEVICE_WIDTH[device]} will-change-transform`}
          >
            <DeviceFrame kind={device} screens={screens} title={project.title} active={shown} />
          </motion.div>

          <p
            data-testid="showcase-caption"
            className="flex min-h-10 max-w-md items-center text-center text-sm text-mist"
          >
            {screens[shown].caption}
          </p>
        </div>

        <p className="absolute bottom-6 right-6 z-10 font-sans text-sm tabular-nums text-mist">
          {String(shown + 1).padStart(2, "0")} / {String(screens.length).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/data/types";
import ProjectChips from "./ProjectChips";
import ProjectDetail from "./ProjectDetail";
import ProjectList from "./ProjectList";
import useOrbitProgress from "./useOrbitProgress";
import { OPEN_PROJECT } from "./openProject";
import { hasWebGL } from "@/components/motion/useSceneMode";
import "@/app/orbit.css";

// Loaded only in orbit mode, so phones and reduced-motion visitors never download three.js.
const ScreenField = dynamic(() => import("./ScreenField"), { ssr: false });

type Mode = "list" | "orbit";
type LenisLike = { scrollTo(y: number, options?: { immediate?: boolean }): void };
const ORBIT_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";


const pad = (n: number) => String(n).padStart(2, "0");

// DOM contract (the e2e specs rely on it):
//   [data-testid="project-orbit"]  root: data-mode="orbit"|"list", data-front="<slug>", data-ready once the first frame is drawn
//   [data-testid="orbit-track"] / [data-testid="orbit-stage"]  tall track and sticky stage (orbit mode)
//   [data-testid="orbit-caption"]  title + kind + count of the front project (orbit mode)
//   ProjectChips (orbit mode), ProjectList (list mode), ProjectDetail (both)
// SSR and first paint are the list: crawlers and no-JS visitors see every project.
export default function ProjectOrbit({ projects }: { projects: Project[] }) {
  const n = projects.length;
  const [mode, setMode] = useState<Mode>("list");
  const [lost, setLost] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [front, setFront] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(ORBIT_QUERY);
    const update = () => setMode(mq.matches && hasWebGL() ? "orbit" : "list");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const effective: Mode = lost ? "list" : mode;
  const progress = useOrbitProgress(trackRef, effective === "orbit");

  // Leaving orbit mode resets what only makes sense there.
  useEffect(() => {
    if (effective !== "orbit") {
      setReady(false);
      setFront(0);
    }
  }, [effective]);

  // Stop drawing while the section is off screen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || effective !== "orbit") return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [effective]);

  // Other sections open a project through openProject(slug); see ./openProject.ts.
  const external = useRef(false);
  useEffect(() => {
    const onOpen = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (!projects.some((p) => p.slug === slug)) return;
      external.current = true;
      setSelected(slug);
    };
    window.addEventListener(OPEN_PROJECT, onOpen);
    return () => window.removeEventListener(OPEN_PROJECT, onOpen);
  }, [projects]);

  const selectedProject = projects.find((p) => p.slug === selected) ?? null;

  // Closing a project the orbit was turned to by a click keeps the page on it, so the orbit does not
  // swing back to where the scroll position was.
  const close = useCallback(() => {
    const slug = selected;
    setSelected(null);
    // Opened from another section (Experience): leave the visitor where they are.
    if (external.current) {
      external.current = false;
      return;
    }
    const track = trackRef.current;
    if (!slug || !track || n < 2) return;
    const index = projects.findIndex((p) => p.slug === slug);
    const y = track.getBoundingClientRect().top + window.scrollY + (index / (n - 1)) * (track.offsetHeight - window.innerHeight);
    requestAnimationFrame(() => {
      const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    });
  }, [selected, projects, n]);

  const current = projects[Math.min(front, n - 1)];

  return (
    <div
      data-testid="project-orbit"
      data-mode={effective}
      data-front={current.slug}
      {...(ready ? { "data-ready": "" } : {})}
      className="mt-10"
    >
      {effective === "orbit" ? (
        <div ref={trackRef} data-testid="orbit-track" className="orbit-track" style={{ ["--steps" as string]: Math.max(1, n - 1) }}>
          <div data-testid="orbit-stage" className="orbit-stage">
            <div className="orbit-canvas" aria-hidden="true">
              <ScreenField
                projects={projects}
                progress={progress}
                selectedSlug={selected}
                // Always draw until the first frame exists (shaders compile, textures start loading before the
                // visitor arrives); only then stop while the section is off screen.
                active={active || !ready}
                onFront={setFront}
                onReady={() => setReady(true)}
                onLost={() => setLost(true)}
                onSelect={setSelected}
              />
            </div>
            <div className="orbit-hud">
              <div data-testid="orbit-caption" className="orbit-caption">
                <p>
                  <span className="orbit-kind">{current.kind}</span>
                  <span className="orbit-title">{current.title}</span>
                </p>
                <p className="orbit-count">
                  {pad(front + 1)} / {pad(n)}
                </p>
              </div>
              <ProjectChips projects={projects} activeSlug={current.slug} onSelect={setSelected} />
            </div>
          </div>
        </div>
      ) : (
        <ProjectList projects={projects} onOpen={setSelected} />
      )}

      <ProjectDetail project={selectedProject} onClose={close} />
    </div>
  );
}

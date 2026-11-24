"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useSceneMode from "@/components/motion/useSceneMode";
import { iconSrc } from "./logos";
import "./build.css";

// Loaded only in scene mode, so phones and reduced-motion visitors never download it.
const BuildScene = dynamic(() => import("./BuildScene"), { ssr: false });

type StackGroup = { group: string; items: string[] };

function Items({ items, size }: { items: string[]; size: "sm" | "lg" }) {
  return (
    <ul className={`build-items build-items-${size}`}>
      {items.map((item) => {
        const src = iconSrc(item);
        return (
          <li key={item}>
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny cached SVGs, decorative */}
            {src && <img src={src} alt="" width={22} height={22} />}
            <span>{item}</span>
          </li>
        );
      })}
    </ul>
  );
}

// DOM contract (tests/e2e/build.spec.ts): [data-testid="build-chapter"] data-mode="scene"|"list",
// data-ready once the first frame is drawn; scene mode has build-track (tall) and build-stage (sticky);
// every group is h3[data-group], the one in focus carries data-active="true".
export default function BuildChapter({ groups }: { groups: StackGroup[] }) {
  const { mode, resolved } = useSceneMode();
  const [lost, setLost] = useState(false);
  const [ready, setReady] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [current, setCurrent] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const effective = lost ? "list" : mode;
  const n = groups.length;

  useEffect(() => {
    if (effective !== "scene") {
      setReady(false);
      setCurrent(0);
    }
  }, [effective]);

  useEffect(() => {
    const el = track.current;
    if (effective !== "scene" || !el) return;
    gsap.registerPlugin(ScrollTrigger);
    const update = (p: number) => {
      progress.current = p;
      setCurrent(Math.min(n - 1, Math.max(0, Math.floor(p * n))));
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => {
      st.kill();
      io.disconnect();
    };
  }, [effective, n]);

  return (
    <div data-testid="build-chapter" data-mode={effective} data-gate={resolved ? "resolved" : "pending"} {...(ready ? { "data-ready": "" } : {})}>
      {effective === "scene" ? (
        <div ref={track} data-testid="build-track" className="build-track" style={{ ["--steps" as string]: n }}>
          <div data-testid="build-stage" className="build-stage">
            <div className="build-canvas" aria-hidden="true">
              <BuildScene groups={groups} progress={progress} active={onScreen || !ready} onReady={() => setReady(true)} onLost={() => setLost(true)} />
            </div>
            <div className="build-hud">
              {groups.map((g, i) => (
                <div key={g.group} className="build-slide" data-active={i === current ? "true" : "false"}>
                  <h3 data-group={g.group} data-active={i === current ? "true" : "false"} className="build-title">
                    {g.group}
                  </h3>
                  <Items items={g.items} size="sm" />
                </div>
              ))}
              <ol className="build-steps" aria-hidden="true">
                {groups.map((g, i) => (
                  <li key={g.group} data-on={i <= current ? "true" : "false"} />
                ))}
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <div className="build-list">
          {groups.map((g) => (
            <div key={g.group} className="build-list-group">
              <h3 data-group={g.group} className="build-title build-title-list">
                {g.group}
              </h3>
              <Items items={g.items} size="lg" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

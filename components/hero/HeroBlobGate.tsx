"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import useSceneMode from "@/components/motion/useSceneMode";

const HeroBlob = dynamic(() => import("./HeroBlob"), { ssr: false });

const PORTRAIT = "section#home img[src*='photo-cutout']";

// The hero's 3D blob. It waits for the portrait (the real first paint) before loading three.js,
// and draws only while the hero is on screen. Phones, reduced motion and no WebGL keep the
// static radial glow that sits under it.
export default function HeroBlobGate({ className }: { className?: string }) {
  const { mode, resolved } = useSceneMode();
  const [portrait, setPortrait] = useState(false);
  const [lost, setLost] = useState(false);
  const [ready, setReady] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const effective = lost ? "list" : mode;

  useEffect(() => {
    const img = document.querySelector<HTMLImageElement>(PORTRAIT);
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      setPortrait(true);
      return;
    }
    const done = () => setPortrait(true);
    img.addEventListener("load", done, { once: true });
    return () => img.removeEventListener("load", done);
  }, []);

  useEffect(() => {
    if (effective !== "scene") setReady(false);
  }, [effective]);

  useEffect(() => {
    const hero = document.querySelector("section#home");
    if (!hero || effective !== "scene") return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(hero);
    return () => io.disconnect();
  }, [effective]);

  return (
    <div data-testid="hero-blob" data-layer data-mode={effective} data-gate={resolved ? "resolved" : "pending"} {...(ready ? { "data-ready": "" } : {})} aria-hidden="true" className={className}>
      {effective === "scene" && portrait && (
        <HeroBlob active={onScreen || !ready} onReady={() => setReady(true)} onLost={() => setLost(true)} />
      )}
    </div>
  );
}

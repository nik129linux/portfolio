"use client";

import { useEffect, useState } from "react";

// One gate for every WebGL scene on the page (same rule as the project orbit): a canvas only on
// screens >= 768px, with motion allowed and WebGL available. First paint and SSR are "list", so
// crawlers, phones and reduced-motion visitors always get the plain DOM version.
export const SCENE_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

export type SceneMode = "list" | "scene";

// Probed once per page and released straight away: every probe is a real WebGL context, and Chrome
// starts killing live canvases at about 16 of them.
let webgl: boolean | null = null;
export function hasWebGL() {
  if (webgl !== null) return webgl;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    webgl = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}

// `resolved` turns true once the client has decided, so tests (and nothing else) can tell the
// server's first-paint "list" apart from a real decision.
export default function useSceneMode(): { mode: SceneMode; resolved: boolean } {
  const [mode, setMode] = useState<SceneMode>("list");
  const [resolved, setResolved] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(SCENE_QUERY);
    const update = () => setMode(mq.matches && hasWebGL() ? "scene" : "list");
    update();
    setResolved(true);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return { mode, resolved };
}

// Reads the page's colour tokens so a scene never hard-codes a colour.
export function readToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

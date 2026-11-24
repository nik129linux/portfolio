"use client";

import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Progress 0..1 along the tall track, kept in a ref. The scene reads it inside its render loop
// (never in a scroll handler) and does its own easing, so the ref holds the raw value.
export default function useOrbitProgress(track: RefObject<HTMLElement | null>, enabled: boolean): MutableRefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    const el = track.current;
    if (!enabled || !el) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progress.current = self.progress;
      },
      onRefresh: (self) => {
        progress.current = self.progress;
      },
    });
    return () => st.kill();
  }, [track, enabled]);

  return progress;
}

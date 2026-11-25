"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Scroll motion for Contact (markup in sections/Contact.tsx), scrubbed so it reverses:
// the left column's lines rise in one by one, the letter (form) lifts into place and the two
// sheets under it fan out to their resting angles. Reduced motion: finished state, no motion.
export default function ContactMotion({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const enter = { trigger: root, start: "top 85%", end: "top 35%", scrub: 0.5 };
      gsap.from("[data-contact-in]", { y: 40, opacity: 0, stagger: 0.15, ease: "power2.out", scrollTrigger: enter });
      gsap.from("[data-contact-form]", { y: 80, rotate: -2, opacity: 0, ease: "power2.out", scrollTrigger: enter });
      // the sheets start stacked under the form and open to their CSS angles
      gsap.from("[data-contact-sheet]", { rotate: 0, x: 0, y: 0, stagger: 0.1, ease: "power2.out", scrollTrigger: enter });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

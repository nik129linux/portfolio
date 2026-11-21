"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Parallax, { ParallaxLayer } from "@/components/motion/Parallax";
import TextScramble from "@/components/motion/TextScramble";
import { profile } from "@/data/profile";
import { buttonPrimary, buttonSecondary, buttonSecondaryMuted } from "@/components/ui/button";

function isPlaceholder(value: string) {
  return value.startsWith("[");
}

// Smoothstep: ease the raw scroll progress so the exit starts and ends softly.
function smoothstep(value: number) {
  const p = Math.min(1, Math.max(0, value));
  return p * p * (3 - 2 * p);
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  // Mounted matchMedia state (not useReducedMotion): SSR and the first client
  // render agree, so the section is never replaced after hydration.
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, (p) => (reduce ? 0 : -60 * smoothstep(p)));
  const blur = useTransform(scrollYProgress, (p) => (reduce ? 0 : 8 * smoothstep(p)));
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <section
      ref={sectionRef}
      id="home"
      className="px-4 pb-28 pt-20 sm:px-6 sm:pb-36 sm:pt-28 lg:px-8 lg:pb-40 lg:pt-32"
    >
      <div className="mx-auto max-w-none">
        <div className="eyebrow">
            <span aria-hidden className="h-px w-10 bg-cobalt" />
            <TextScramble
              as="p"
              className="text-sm font-semibold uppercase tracking-widest text-ink-2"
              text={profile.role}
            />
          </div>
          <h1 className="mt-6 max-w-none text-7xl leading-[0.9] tracking-tight text-ink sm:text-8xl lg:text-9xl">
            {profile.heroLine}
          </h1>
        <div className="mt-12 grid items-start gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <p className="max-w-prose text-xl leading-relaxed text-ink-2">
            {profile.heroSub}
          </p>
          <p className="mt-3 text-base text-ink-2">Based in {profile.location}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {isPlaceholder(profile.cvUrl) ? (
              <button
                type="button"
                aria-disabled="true"
                title="CV link coming soon"
                className={buttonSecondaryMuted}
              >
                Download CV <span className="soon">Soon</span>
              </button>
            ) : (
              <a
                href={profile.cvUrl}
                data-cta
                className={buttonSecondary}
              >
                Download CV
              </a>
            )}

            <a
              href="#projects"
              data-cta
              className={buttonPrimary}
            >
              See projects <ArrowRight aria-hidden className="btn-arrow size-4" />
            </a>
          </div>
        </div>

        <motion.div
          data-testid="hero-exit"
          style={{ y, filter }}
          className="relative z-10 lg:col-span-5 lg:col-start-8 lg:-mt-32 will-change-transform"
        >
          <Parallax className="relative mx-auto max-w-sm lg:max-w-none">
            <ParallaxLayer speed={0.6} className="absolute -bottom-3 -right-3 h-2/3 w-2/3">
              <div aria-hidden className="h-full w-full rounded-2xl bg-coral" />
            </ParallaxLayer>
            <ParallaxLayer speed={0.15} className="hero-photo relative overflow-hidden bg-paper-2">
              <Image
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                width={800}
                height={978}
                priority
                unoptimized
                className="h-auto w-full object-cover"
              />
            </ParallaxLayer>
          </Parallax>
        </motion.div>
        </div>
      </div>
    </section>
  );
}

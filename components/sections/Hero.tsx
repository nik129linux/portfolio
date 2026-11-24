import Image from "next/image";
import { ArrowDown } from "lucide-react";
import Parallax from "@/components/motion/Parallax";
import PointerDepth from "@/components/motion/PointerDepth";
import RevealHeading from "@/components/motion/RevealHeading";
import ScrollSpread from "@/components/motion/ScrollSpread";
import HeroBlobGate from "@/components/hero/HeroBlobGate";
import FloatingObjects, { type FloatingObject } from "@/components/ui/FloatingObjects";
import { profile } from "@/data/profile";
import { buttonPrimary, buttonSecondary, buttonSecondaryMuted } from "@/components/ui/button";

function isPlaceholder(value: string) {
  return value.startsWith("[");
}

const firstName = profile.name.split(" ")[0];

const objects: FloatingObject[] = [
  { name: "laptop", className: "left-[4%] top-[8%] w-20 sm:w-32 lg:w-44", speed: 0.7, drift: -1.3, rot: -7, dy: -16, dur: 7, depth: 34 },
  { name: "terminal", className: "left-[16%] top-[42%] w-16 sm:w-24 lg:w-32", speed: 0.35, drift: -1, rot: 5, dy: -12, dur: 8.5, delay: 1.2, depth: 18 },
  { name: "phone", className: "right-[5%] top-[12%] w-16 sm:w-28 lg:w-40", speed: 0.55, drift: 1.3, rot: 8, dy: -18, dur: 6.5, delay: 0.6, depth: 40 },
  { name: "watch", className: "right-[17%] top-[34%] w-14 sm:w-24 lg:w-32", speed: 0.25, drift: 1, rot: -6, dy: -10, dur: 9, delay: 2, depth: 22 },
];

// Signature moment: the name as a giant wordmark, the cut-out portrait standing in
// front of it, four glossy objects drifting at different parallax speeds.
export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <Parallax className="relative mx-auto max-w-[1500px]">
       <PointerDepth className="relative">
        <div
          aria-hidden
          data-testid="hero-glow"
          className="pointer-events-none absolute left-1/2 top-[10%] h-[64vw] max-h-[920px] w-[64vw] max-w-[920px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 45%, transparent), color-mix(in oklab, var(--accent) 12%, transparent) 55%, transparent)" }}
        />
        <HeroBlobGate className="pointer-events-none absolute left-1/2 top-[6%] z-0 h-[50vw] max-h-[720px] w-[50vw] max-w-[720px] -translate-x-1/2" />
        <div data-layer className="relative z-0">
          <ScrollSpread data-testid="hero-wordmark" aria-hidden="true" className="wordmark wordmark-hero text-center">
            <RevealHeading as="p" text={firstName} />
          </ScrollSpread>
        </div>

        <FloatingObjects items={objects} />

        <div data-layer className="relative z-20 mx-auto -mt-[8vw] w-[min(88vw,480px)] sm:-mt-[9vw]">
          <Image
            src="/photo-cutout.webp"
            alt={`Portrait of ${profile.name}`}
            width={800}
            height={978}
            priority
            unoptimized
            className="portrait-fade h-auto w-full"
          />
        </div>

        <div data-layer className="relative z-30 mt-6 grid gap-6 lg:absolute lg:inset-x-0 lg:bottom-4 lg:mt-0 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-display text-xl text-ink-2">Hi, I&apos;m</p>
            <p className="font-display text-4xl font-bold leading-none text-ink sm:text-5xl">{profile.name}</p>
            <RevealHeading
              as="h1"
              text={profile.heroLine}
              className="mt-4 max-w-xs text-xl leading-snug text-ink-2 sm:text-2xl"
            />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-4 lg:col-start-9 lg:items-end lg:text-right">
            <p className="max-w-xs text-base leading-relaxed text-ink-2">{profile.heroSub}</p>
            <p className="text-sm font-semibold text-ink">{profile.role}</p>
            <p className="text-sm text-ink-2">Based in {profile.location}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 lg:justify-end">
              {isPlaceholder(profile.cvUrl) ? (
                <button type="button" aria-disabled="true" title="CV link coming soon" className={buttonSecondaryMuted}>
                  Download CV <span className="soon">Soon</span>
                </button>
              ) : (
                <a
                  href={profile.cvUrl}
                  data-cta
                  className={buttonSecondary}
                  download
                  {...(profile.cvUrl.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  Download CV
                </a>
              )}
              <a href="#projects" data-cta className={buttonPrimary}>
                See projects <ArrowDown aria-hidden className="btn-arrow size-4" />
              </a>
            </div>
          </div>
        </div>
       </PointerDepth>
      </Parallax>
    </section>
  );
}

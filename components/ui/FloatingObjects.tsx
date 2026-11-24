import fs from "node:fs";
import path from "node:path";
import { ParallaxLayer } from "@/components/motion/Parallax";

export type FloatingObject = {
  /** file name under /public/3d without extension (e.g. "laptop") */
  name: string;
  /** Tailwind position + size classes, e.g. "left-[6%] top-[14%] w-24 sm:w-36" */
  className: string;
  speed: number;
  /** horizontal scatter on scroll: negative moves left, positive right (same scale as speed) */
  drift?: number;
  /** drift rotation in degrees, drift distance in px, loop seconds, start delay seconds */
  rot?: number;
  dy?: number;
  dur?: number;
  delay?: number;
  /** pointer depth in px: how far the object shifts with the pointer (0 = still) */
  depth?: number;
};

const SHAPES = ["rounded-[38%]", "rounded-full", "rounded-[22%]", "rounded-[46%_54%_40%_60%]"];

// Decorative layer. Renders the generated 3D PNG when /public/3d/<name>.png exists
// and a soft blue blob otherwise, so the page never ships a broken image.
// Must sit inside <Parallax>. Everything here is aria-hidden.
export default function FloatingObjects({ items }: { items: FloatingObject[] }) {
  return (
    <>
      {items.map((o, i) => {
        const file = path.join(process.cwd(), "public/3d", `${o.name}.png`);
        const has = fs.existsSync(file);
        return (
          <ParallaxLayer key={o.name} speed={o.speed} drift={o.drift} className={`pointer-events-none absolute ${o.className}`}>
            <div
              data-testid="float-object"
              aria-hidden="true"
              className="float-object"
              style={{
                ["--float-rot" as string]: `${o.rot ?? 6}deg`,
                ["--float-dy" as string]: `${o.dy ?? -14}px`,
                ["--float-dur" as string]: `${o.dur ?? 7}s`,
                ["--float-delay" as string]: `${o.delay ?? 0}s`,
                ["--depth" as string]: `${o.depth ?? 0}`,
              }}
            >
              {has ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/3d/${o.name}.png`} alt="" width={512} height={512} loading="lazy" className="h-auto w-full drop-shadow-xl" />
              ) : (
                <div
                  className={`aspect-square w-full bg-gradient-to-br from-accent-soft via-accent to-accent-strong shadow-raised ${SHAPES[i % SHAPES.length]}`}
                />
              )}
            </div>
          </ParallaxLayer>
        );
      })}
    </>
  );
}

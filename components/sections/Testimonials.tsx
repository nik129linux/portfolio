import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import Highlighter from "@/components/ui/Highlighter";
import { testimonials } from "@/data/testimonials";
import type { Testimonial } from "@/data/types";

// Printed-review layout. The first quote is the pull quote on a cobalt panel: paper text,
// a giant deep-cobalt quote mark behind it, depth from accent-deep. The rest sit beside it on
// cream, each with the person's photo (or their initials until a photo exists). The one
// concrete claim in each quote gets a hand-drawn mark when it scrolls in.
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function Face({ t, size }: { t: Testimonial; size: number }) {
  if (t.photo) {
    return <Image src={t.photo} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full bg-accent-soft font-display font-extrabold text-accent-strong"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(t.name)}
    </span>
  );
}

function body(t: Testimonial, mark: Mark) {
  const at = t.highlight ? t.quote.indexOf(t.highlight) : -1;
  if (at < 0) return t.quote;
  return (
    <>
      {t.quote.slice(0, at)}
      <Highlighter {...mark}>{t.highlight}</Highlighter>
      {t.quote.slice(at + t.highlight!.length)}
    </>
  );
}

type Mark = { action: "highlight" | "underline"; color: string; strokeWidth: number };
type Tone = { panel: string; pool: string; glyph: string; sub: string; ring: string; mark: Mark };

// Three panels, one palette: cobalt, deep cobalt, pale cobalt. Each has the same parts
// (a depth pool, a giant quote-mark watermark, a hand-drawn mark) in its own tone.
const tones: Tone[] = [
  {
    panel: "bg-accent text-accent-ink",
    pool: "bg-[radial-gradient(120%_90%_at_100%_100%,var(--accent-deep)_0%,transparent_60%)]",
    glyph: "text-accent-deep/70",
    sub: "text-accent-ink/75",
    ring: "ring-accent-ink/30",
    mark: { action: "underline", color: "var(--paper)", strokeWidth: 3 },
  },
  {
    panel: "bg-accent-deep text-accent-ink",
    pool: "bg-[radial-gradient(110%_90%_at_0%_0%,var(--accent)_0%,transparent_55%)] opacity-60",
    glyph: "text-accent/45",
    sub: "text-accent-ink/70",
    ring: "ring-accent-ink/25",
    mark: { action: "underline", color: "var(--accent-soft)", strokeWidth: 2.5 },
  },
  {
    panel: "bg-accent-soft text-ink",
    pool: "bg-[radial-gradient(100%_90%_at_100%_0%,var(--paper-2)_0%,transparent_60%)]",
    glyph: "text-accent/20",
    sub: "text-ink-2",
    ring: "ring-accent/25",
    mark: { action: "underline", color: "var(--accent)", strokeWidth: 2.5 },
  },
];

function Card({ t, tone, lead }: { t: Testimonial; tone: Tone; lead: boolean }) {
  return (
    <figure
      data-testid="testimonial"
      className={`relative isolate flex h-full flex-col justify-between overflow-hidden rounded-[32px] ${tone.panel} ${lead ? "p-8 sm:p-12 lg:p-14" : "p-8 sm:p-10"}`}
    >
      <span aria-hidden className={`absolute inset-0 -z-10 ${tone.pool}`} />
      <span
        aria-hidden
        className={`pointer-events-none absolute right-4 -z-10 select-none font-display font-extrabold leading-none ${tone.glyph} ${
          lead ? "-bottom-40 text-[20rem] sm:-bottom-52 sm:text-[26rem]" : "-bottom-28 text-[14rem] sm:-bottom-32 sm:text-[16rem]"
        }`}
      >
        &rdquo;
      </span>

      <blockquote
        className={`font-display font-bold ${lead ? "text-3xl leading-[1.15] sm:text-4xl lg:text-[3.25rem]" : "text-xl leading-snug sm:text-2xl"}`}
      >
        {body(t, tone.mark)}
      </blockquote>

      <figcaption className={`flex items-center gap-4 ${lead ? "mt-12" : "mt-8"}`}>
        <span className={`rounded-full ring-2 ${tone.ring}`}>
          <Face t={t} size={lead ? 56 : 44} />
        </span>
        <span>
          <span className="block text-base font-semibold">{t.name}</span>
          <span className={`block text-sm ${tone.sub}`}>{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

// Bento: the lead panel spans two rows on the left, the other two stack on the right.
export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-paper-2 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>Testimonials</SectionLabel>

        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:grid-rows-2">
          {testimonials.map((t, i) => (
            <div key={`${t.name}-${t.role}`} className={i === 0 ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5"}>
              <Card t={t} tone={tones[i % tones.length]} lead={i === 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

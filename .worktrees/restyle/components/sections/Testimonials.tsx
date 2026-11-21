import ScrubHeading from "@/components/motion/ScrubHeading";
import Image from "next/image";
import { nav } from "@/data/nav";
import { testimonials } from "@/data/testimonials";

const sectionLabel =
  nav.find((item) => item.id === "testimonials")?.label ?? "Testimonials";

const sectionIndex = String(nav.findIndex((item) => item.id === "testimonials") + 1).padStart(2, "0");

function initials(name: string) {
  const parts = name
    .replace(/[^A-Za-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const first = parts[0]?.charAt(0) ?? "?";
  const second = parts[1]?.charAt(0) ?? "";
  return `${first}${second}`.toUpperCase();
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="border-t border-line px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-40"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="self-start lg:col-span-4 lg:sticky lg:top-28">
          <p className="eyebrow">
            <span aria-hidden className="h-px w-10 bg-cobalt" />
            {sectionIndex} / {sectionLabel}
          </p>
          <ScrubHeading className="mt-8 text-5xl leading-none text-ink sm:text-6xl lg:text-7xl" text={sectionLabel} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
          {testimonials.map((testimonial, index) => (
            <figure
              key={`${testimonial.name}-${testimonial.role}`}
              data-testid="testimonial"
              className={`flex flex-col rounded-2xl bg-paper-2 p-6 shadow-card sm:p-8 ${index === 0 ? "sm:col-span-2" : ""} ${index % 2 === 0 && index !== 0 ? "sm:mt-12" : ""}`}
            >
              <blockquote className={`flex-1 leading-relaxed text-ink ${index === 0 ? "text-2xl" : "text-lg"}`}>
                {testimonial.quote}
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3">
                {testimonial.photo && !testimonial.photo.startsWith("[") ? (
                  <Image
                    src={testimonial.photo}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-coral text-base font-semibold text-ink"
                  >
                    {initials(testimonial.name)}
                  </span>
                )}

                <div>
                  <h3 className="text-base text-ink">{testimonial.name}</h3>
                  <p className="text-sm text-ink-2">{testimonial.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

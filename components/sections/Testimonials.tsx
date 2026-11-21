import SectionLabel from "@/components/ui/SectionLabel";
import { testimonials } from "@/data/testimonials";

// Three quote cards on a staggered baseline: the middle one drops on wide screens
// so the row reads as a hand-placed composition, not a feature grid. The short
// accent bar is the only ornament.
const offsets = ["", "lg:mt-12", ""];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-paper-2 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>Testimonials</SectionLabel>

        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:items-start">
          {testimonials.map((testimonial, index) => (
            <figure
              key={`${testimonial.name}-${testimonial.role}`}
              data-testid="testimonial"
              className={`flex flex-col rounded-[28px] bg-accent-soft p-8 sm:p-10 ${offsets[index % offsets.length]}`}
            >
              <span aria-hidden className="font-display text-7xl font-extrabold leading-none text-accent-strong">&ldquo;</span>

              <blockquote className="-mt-2 flex-1 font-display text-2xl font-bold leading-snug text-ink">
                {testimonial.quote}
              </blockquote>

              <figcaption className="mt-8">
                <p className="text-base font-semibold text-ink">{testimonial.name}</p>
                <p className="mt-1 text-sm text-ink-2">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

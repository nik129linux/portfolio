import { Fragment, type ElementType } from "react";

// Splits a statement into words; each word gets its own scroll-lit range (see
// .scrub-word in globals.css). The text stays one normal sentence for screen readers.
export default function ScrubText({ text, className, as: Tag = "p" }: { text: string; className?: string; as?: ElementType }) {
  const words = text.split(/\s+/).filter(Boolean);
  const last = Math.max(1, words.length - 1);
  return (
    <Tag className={className}>
      {words.map((word, i) => {
        const start = 24 + (i / last) * 12;
        return (
          <Fragment key={`${word}-${i}`}>
            <span className="scrub-word" style={{ ["--s" as string]: `${start.toFixed(1)}%`, ["--e" as string]: `${(start + 14).toFixed(1)}%` }}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}

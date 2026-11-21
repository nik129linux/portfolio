import type { ReactNode } from "react";

// Editorial section heading for the quieter chapters: a small blue dot and the
// title at display size, left aligned. The giant wordmarks stay reserved for the
// hero, Build, Projects and the footer so they keep their weight.
export default function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`flex items-center gap-3 font-display text-3xl font-bold leading-none text-ink sm:text-4xl ${className}`}>
      <span aria-hidden className="size-3 rounded-full bg-accent-strong" />
      {children}
    </h2>
  );
}

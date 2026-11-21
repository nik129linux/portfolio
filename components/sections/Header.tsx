"use client";

import { useEffect, useState } from "react";
import { nav } from "@/data/nav";
import { buttonPrimarySmall } from "@/components/ui/button";

// Sticky ink pill: section links, one light-blue CTA. The CTA lives outside the
// <nav> list so every section has exactly one link in the nav.
export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(nav[0]?.id ?? "home");

  useEffect(() => {
    const sections = nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="nav-pill mx-auto flex w-fit max-w-full items-center gap-1 rounded-full p-1.5">
        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {nav.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${
                  isActive ? "bg-paper-2/15 text-paper-2" : "text-paper-2/70 hover:text-paper-2"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-12 items-center rounded-full px-4 text-sm font-semibold text-paper-2 transition-colors duration-200 hover:bg-paper-2/10 md:hidden"
        >
          Open menu
        </button>

        <a href="#contact" data-cta className={`${buttonPrimarySmall} ml-1`}>
          Let&apos;s talk
        </a>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="nav-pill mx-auto mt-2 grid max-w-sm gap-1 rounded-[28px] p-2 md:hidden"
        >
          {nav.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={`flex min-h-12 items-center rounded-full px-4 text-base transition-colors duration-200 ${
                  isActive ? "bg-paper-2/15 text-paper-2" : "text-paper-2/70 hover:text-paper-2"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}

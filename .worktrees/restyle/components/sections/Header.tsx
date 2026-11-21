"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { nav } from "@/data/nav";
import { profile } from "@/data/profile";
import { buttonSecondarySmall } from "@/components/ui/button";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(nav[0]?.id ?? "home");
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = useReducedMotion();
  // The pill sits on the hovered link, or on the active one when nothing is hovered.
  const pillTarget = hovered ?? active;

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
    <header className="sticky top-0 z-50">
      <div className="mx-auto flex max-w-none items-center justify-between gap-3 glass-nav rounded-none border-x-0 border-t-0 border-b border-line px-4 py-3 sm:px-8">
        <a
          href="#home"
          className="font-display text-xl font-bold tracking-tight text-ink transition-opacity duration-200 hover:opacity-70"
          onClick={() => setOpen(false)}
        >
          {profile.name}
        </a>

        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label="Sections"
          onMouseLeave={() => setHovered(null)}
        >
          {nav.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                onMouseEnter={() => setHovered(item.id)}
                className={`relative rounded-full px-3 py-2 text-sm transition-colors duration-200 ${
                  isActive ? "text-cobalt" : "text-ink-2 hover:text-ink"
                }`}
              >
                {pillTarget === item.id ? (
                  <motion.span
                    layoutId="nav-pill"
                    data-testid="nav-pill"
                    aria-hidden
                    transition={reduce ? { duration: 0 } : undefined}
                    className="absolute inset-0 rounded-full bg-cobalt/10"
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className={buttonSecondarySmall + " md:hidden"}
        >
          Open menu
        </button>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="mx-4 mt-2 grid gap-1 rounded-2xl border border-transparent bg-paper p-2 shadow-card md:hidden"
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
                  isActive ? "text-cobalt" : "text-ink-2 hover:text-ink"
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

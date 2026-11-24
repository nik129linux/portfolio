"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState, type JSX } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { DUR_BASE, DUR_EXIT, EASE_IN_OUT, EASE_OUT } from "@/components/motion/tokens";
import { X } from "lucide-react";
import type { Project } from "@/data/types";
import { ProjectLinks } from "@/components/ui/ProjectLinks";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Lenis = { stop(): void; start(): void };

function hasRealLink(value?: string) {
  return Boolean(value) && !value!.startsWith("[");
}

// Full-screen detail layer. Under md it is a bottom sheet that slides up; from md up a centred panel
// that grows out of the chip or row that opened it and shrinks back into it on close. Reduced motion
// shows and hides it at once. AnimatePresence keeps it mounted through the exit.
export default function ProjectDetail({ project, onClose }: { project: Project | null; onClose: () => void }): JSX.Element {
  return <AnimatePresence>{project ? <DetailLayer key="detail" project={project} onClose={onClose} /> : null}</AnimatePresence>;
}

function DetailLayer({ project, onClose }: { project: Project; onClose: () => void }): JSX.Element {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<Element | null>(null);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  // False as soon as the close starts: the lock, keys and focus are released then, not after the
  // exit animation, so the page scrolls (and the orbit can hold its place) while the panel fades.
  const present = useIsPresent();
  // The element that opened the panel is focused at mount (a click focuses its button); remember it
  // before the focus moves into the panel, both to hand focus back and to grow from it.
  const [opener] = useState<Element | null>(() => (typeof document === "undefined" ? null : document.activeElement));
  const [origin, setOrigin] = useState<{ x: string; y: string } | null>(null);
  const [sheet, setSheet] = useState(false);

  useLayoutEffect(() => {
    const node = panel.current;
    setSheet(!window.matchMedia("(min-width: 768px)").matches);
    if (!node || !(opener instanceof HTMLElement)) return;
    const r = opener.getBoundingClientRect();
    // offsetLeft/Top are untouched by the scale transform; the layer is fixed at the viewport origin.
    setOrigin({ x: `${r.left + r.width / 2 - node.offsetLeft}px`, y: `${r.top + r.height / 2 - node.offsetTop}px` });
  }, [opener]);
  // Kept in a ref so a new callback identity never re-runs the open/close effect below
  // (that would hand focus back to the trigger mid-session and lose it on close).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    setIndex(0);
  }, [project?.slug]);

  // Lock the page, trap keys and take focus once, at mount. The release runs exactly once: as soon
  // as the close starts (present turns false, same commit as the close, so before the orbit's rAF
  // scroll) or at unmount, whichever comes first. Re-renders during the exit never re-lock.
  const release = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    lastFocus.current = opener ?? document.activeElement;
    closeRef.current?.focus();

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    lenis?.stop();
    root.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const node = panel.current;
      if (!node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || !node.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !node.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    let done = false;
    release.current = () => {
      if (done) return;
      done = true;
      document.removeEventListener("keydown", onKeyDown);
      lenis?.start();
      root.style.overflow = previousOverflow;
      const target = lastFocus.current;
      if (target instanceof HTMLElement && document.contains(target)) target.focus();
    };
    return () => release.current();
    // Mount-only on purpose: see the comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!present) release.current();
  }, [present]);

  const screens = project.screens ?? [];
  const screen = screens[index] ?? screens[0];
  const phone = project.device === "phone";
  const showLinks =
    hasRealLink(project.github) || hasRealLink(project.demo) || hasRealLink(project.download);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
      <motion.div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-ink/60"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: DUR_BASE, ease: EASE_OUT } }}
        exit={{ opacity: 0, transition: { duration: reduce ? 0 : DUR_EXIT, ease: EASE_IN_OUT } }}
      />

      <motion.div
        ref={panel}
        style={origin && !sheet ? { originX: origin.x, originY: origin.y } : undefined}
        initial={reduce ? false : sheet ? { y: "100%" } : { opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: DUR_BASE, ease: EASE_OUT } }}
        exit={reduce ? { opacity: 0, transition: { duration: 0 } } : sheet ? { y: "100%", transition: { duration: DUR_EXIT, ease: EASE_IN_OUT } } : { opacity: 0, scale: 0.2, transition: { duration: DUR_EXIT, ease: EASE_IN_OUT } }}
        data-testid="project-detail"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className="relative flex max-h-[90svh] w-full flex-col overflow-y-auto rounded-t-[28px] bg-paper-2 px-5 pb-8 pt-4 shadow-raised md:max-w-3xl md:rounded-[28px] md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-accent-strong">
            {project.kind}
          </p>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-2 transition-opacity duration-200 hover:opacity-70"
          >
            <X aria-hidden className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <h3 id={id} className="font-display text-2xl text-ink md:text-3xl">
          {project.title}
        </h3>

        {project.collaboration ? (
          <p className="mt-2 text-sm font-semibold text-ink-2">Team project</p>
        ) : null}

        {screens.length > 0 && screen ? (
          <div className="mt-6">
            <motion.div
              key={project.slug}
              initial={reduce ? false : { clipPath: "inset(0 0 100% 0 round 20px)", opacity: 0.4 }}
              animate={{ clipPath: "inset(0 0 0% 0 round 20px)", opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT }}
              className={
                phone
                  ? "relative mx-auto aspect-[9/16] max-h-[60svh] w-full max-w-sm overflow-hidden rounded-[20px] bg-accent-soft"
                  : "relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-accent-soft"
              }
            >
              <Image
                key={screen.src}
                src={screen.src}
                alt={`${project.title}: ${screen.caption}`}
                fill
                unoptimized
                sizes="(min-width: 768px) 48rem, 100vw"
                className="object-cover object-top"
              />
            </motion.div>
            <p className="mt-2 text-sm text-ink-2">{screen.caption}</p>

            {screens.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {screens.map((item, i) => (
                  <button
                    key={item.src}
                    type="button"
                    aria-label={`Show ${item.caption}`}
                    aria-pressed={i === index}
                    onClick={() => setIndex(i)}
                    className="relative aspect-[16/10] w-24 overflow-hidden rounded-xl bg-accent-soft transition-opacity duration-200 hover:opacity-80 aria-pressed:opacity-100 opacity-60"
                  >
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      unoptimized
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="mt-6 text-base text-ink-2">{project.summary}</p>

        {project.proof && project.proof.length > 0 ? (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Proof</h4>
            <motion.ul
              className="mt-3 space-y-2 text-sm text-ink-2"
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, root: panel, amount: 0.4 }}
              variants={{ hidden: {}, show: { transition: { delayChildren: 0.05, staggerChildren: 0.14 } } }}
            >
              {project.proof.map((line) => (
                <motion.li
                  key={line}
                  className="flex gap-3"
                  variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT } } }}
                >
                  <motion.span
                    aria-hidden
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                    variants={{ hidden: { scale: 0 }, show: { scale: 1, transition: { duration: 0.5, ease: EASE_OUT } } }}
                  />
                  <span>{line}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        ) : null}

        <motion.ul
          className="mt-5 flex flex-wrap gap-2"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, root: panel, amount: 0.6 }}
          variants={{ hidden: {}, show: { transition: { delayChildren: 0.05, staggerChildren: 0.06 } } }}
        >
          {project.stack.map((tech) => (
            <motion.li
              key={tech}
              className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-strong"
              variants={{ hidden: { opacity: 0, y: 10, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } } }}
            >
              {tech}
            </motion.li>
          ))}
        </motion.ul>

        {showLinks ? (
          <div className="mt-6">
            <ProjectLinks project={project} />
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Tag = "h1" | "h2" | "h3" | "p" | "div";

export default function BlurReveal({ text, as, className }: { text: string; as?: Tag; className?: string }) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const tag = (as ?? "h2") as Tag;
  const words = text.split(" ");
  const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];


  const Container = (motion as unknown as Record<Tag, typeof motion.div>)[tag] ?? motion.div;

  return (
    <Container
      data-testid="blur-reveal"
      className={className}
      initial="hidden"
      whileInView="show"
      animate={reduce ? "show" : undefined}
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.09 } } }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          data-word
          className="inline-block"
          variants={{
            hidden: { filter: "blur(8px)", opacity: 0 },
            show: { filter: "blur(0px)", opacity: 1, transition: { duration: reduce ? 0 : 0.6, ease: EASE } },
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Container>
  );
}

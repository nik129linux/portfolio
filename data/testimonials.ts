import type { Testimonial } from "./types";

// Minimum 3, real people only (not the teacher).
export const testimonials: Testimonial[] = [
  {
    name: "Camilo Duarte",
    role: "Software Engineering Teacher, UCC",
    quote:
      "Nicolas brings clarity and rigor to every project. His backend work is solid, and he has a real talent for integrating AI in practical, reliable ways.",
    highlight: "integrating AI in practical, reliable ways",
  },
  {
    name: "Ivonne Barco",
    role: "Software Engineering Teacher, UCC",
    quote:
      "Collaborating with Nicolas was seamless. He builds clean APIs, communicates clearly, and always thinks through the details that make a product dependable.",
    highlight: "builds clean APIs",
  },
  {
    name: "Andres Mejia",
    role: "Client",
    quote:
      "Nicolas is the kind of engineer you want on your team. He solves hard problems with calm focus and delivers work you can build on with confidence.",
    highlight: "solves hard problems",
  },
];

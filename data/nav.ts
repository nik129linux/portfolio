import type { NavItem } from "./types";

// Sections in the pill nav. Testimonials and Now stay on the page as chapters
// but are not nav entries (the CTA "Let's talk" goes to Contact).
export const nav: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

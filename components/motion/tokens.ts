// JS mirror of the motion tokens in app/globals.css (--ease-out, --ease-in-out, --dur-*), for
// framer-motion, which cannot read CSS variables. Change both together.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
export const DUR_BASE = 0.6;
export const DUR_EXIT = 0.32;

import SmoothScroll from "@/components/motion/SmoothScroll";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      {children}
    </>
  );
}

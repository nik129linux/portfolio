import Marquee from "@/components/motion/Marquee";
import { profile } from "@/data/profile";
import FlyApartText from "@/components/motion/FlyApartText";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Now from "@/components/sections/Now";
import Projects from "@/components/sections/Projects";
import Testimonials from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Marquee items={profile.stack.flatMap((g) => g.items)} />
        <Projects />
        <Testimonials />
        <Experience />
        <Now />
        <div className="overflow-hidden bg-cobalt px-4 py-32 text-paper sm:px-6 sm:py-40 lg:px-8">
          <div className="mx-auto max-w-none font-display text-6xl leading-none sm:text-8xl">
            <FlyApartText text="I design it, I build it, and I ship it." />
          </div>
        </div>
        <Contact />
      </main>
      <Footer />
    </>
  );
}

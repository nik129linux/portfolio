import About from "@/components/sections/About";
import Build from "@/components/sections/Build";
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
      {/* Real top of the page for "Back to top": #home sits below the 76px header, so it stops short. */}
      <div id="top" aria-hidden="true" />
      <Header />
      <main className="relative">
        <Hero />
        <About />
        <Build />
        <Projects />
        <Testimonials />
        <Experience />
        <Now />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

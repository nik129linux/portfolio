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
import StackIcons from "@/components/ui/StackIcons";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StackIcons />
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

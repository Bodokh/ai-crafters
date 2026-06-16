import { AboutUs } from './AboutUs';
import { Contact } from './Contact';
import { FAQ } from './FAQ';
import { Hero } from './Hero';
import { LogoSlider } from './LogoSlider';
import { Process } from './Process';
import { Projects } from './Projects';
import { Services } from './Services';
import { Testimonials } from './Testimonials';

export const AppContent = () => {
  return (
    <div className="relative overflow-x-hidden selection:bg-brand-500 selection:text-white font-sans">
      <main className="relative z-10 flex flex-col gap-0">
        <Hero />
        <Services />
        <Projects />
        <Process />
        <LogoSlider />
        <AboutUs />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
    </div>
  );
};

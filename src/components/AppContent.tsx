import { AboutUs } from './AboutUs';
import { Contact } from './Contact';
import { FAQ } from './FAQ';
import { Hero } from './Hero';
import { LogoSlider } from './LogoSlider';
import { Process } from './Process';
import { FeaturedUseCases } from './FeaturedUseCases';
import { Services } from './Services';
import { Testimonials } from './Testimonials';

export const AppContent = () => {
  return (
    <div className="relative overflow-x-hidden selection:bg-brand-500 selection:text-white font-sans">
      <main className="relative z-10 flex flex-col gap-0">
        <Hero />
        <Services />
        <div className="defer-rendering"><FeaturedUseCases /></div>
        <div className="defer-rendering"><Process /></div>
        <div className="defer-rendering"><LogoSlider /></div>
        <div className="defer-rendering"><AboutUs /></div>
        <div className="defer-rendering"><Testimonials /></div>
        <div className="defer-rendering"><FAQ /></div>
        <div className="defer-rendering"><Contact /></div>
      </main>
    </div>
  );
};

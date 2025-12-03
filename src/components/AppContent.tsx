'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { LogoSlider } from './LogoSlider';
import { Services } from './Services';
import { Process } from './Process';
import { AboutUs } from './AboutUs';
import { Projects } from './Projects';
import { TechStack } from './TechStack';
import { Testimonials } from './Testimonials';
import { Contact } from './Contact';
import { Footer } from './Footer';

export const AppContent = () => {
  const { scrollYProgress } = useScroll();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      dir={dir}
      className={`relative overflow-x-hidden selection:bg-brand-500 selection:text-white font-sans`}
    >
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-accent-500 origin-left z-50"
        style={{ scaleX }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(14, 165, 233, 0.06), transparent 40%)`
        }}
      />

      <main className="relative z-10 flex flex-col gap-0">
        <Hero />
        {/* <TechStack /> */}
        <Services />
        <Projects />
        <Process />
        <LogoSlider />
        <AboutUs />
        <Testimonials />
        <Contact />
      </main>

    </div>
  );
};

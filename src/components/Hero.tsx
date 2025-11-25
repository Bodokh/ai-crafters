'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bot, Zap, TrendingUp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

// --- Neural Network Background Component ---
const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Nodes
    const nodes: {x: number, y: number, vx: number, vy: number}[] = [];
    const numNodes = Math.floor((width * height) / 18000); // Slightly less dense

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3, // Slower movement for stability
        vy: (Math.random() - 0.5) * 0.3
      });
    }

    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0ea5e9'; // Brand 500
      ctx.strokeStyle = '#0ea5e9';

      // Update and Draw Nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Connect to neighbors
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.globalAlpha = (1 - dist / 120) * .8;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }

        // Connect to Mouse
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            ctx.globalAlpha = (1 - dist / 200) * 1;
            ctx.strokeStyle = '#22d3ee'; // Cyan
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.strokeStyle = '#0ea5e9'; // Reset
            ctx.globalAlpha = 1;
            
            // Push away slightly
            if (dist < 100) {
                node.x += dx * 0.01;
                node.y += dy * 0.01;
            }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-25" />;
};

// --- Decoding Text Effect ---
const DecodedText = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
    const [displayText, setDisplayText] = useState('');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    
    useEffect(() => {
        let iteration = 0;
        let interval: any = null;
        
        const start = setTimeout(() => {
            interval = setInterval(() => {
                setDisplayText(text.split("").map((letter, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join(""));
                
                if (iteration >= text.length) {
                    clearInterval(interval);
                }
                
                iteration += 1 / 3;
            }, 30);
        }, delay * 1000);

        return () => {
            clearTimeout(start);
            clearInterval(interval);
        };
    }, [text, delay]);

    return <span className={className}>{displayText}</span>;
}

export const Hero = () => {
  const t = useTranslations();
  const locale = useLocale();
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-950">
      <NeuralBackground />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90 pointer-events-none z-0"></div>

      {/* Cyber Grid Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[linear-gradient(to_right,#0ea5e910_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e910_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_top,black,transparent)] transform perspective-[1000px] rotateX(60deg) origin-bottom z-0"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-slate-900/80 border border-brand-500/30 backdrop-blur-md text-cyan-400 text-sm font-mono mb-8 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <DecodedText text={t('hero.badge')} delay={0.2} />
        </motion.div> */}

        <div className="font-display font-bold text-5xl md:text-7xl mt-10 lg:text-8xl tracking-tight text-white mb-8 leading-none">
          <div className="overflow-hidden mb-2">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "circOut" }} className="scanline-effect inline-block">
                {t('hero.title.1')}
            </motion.div>
          </div>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-brand-500 to-violet-500 pb-2 scanline-effect inline-block">
             <DecodedText text={t('hero.title.2')} delay={0.8} />
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-light font-sans"
        >
          {t('hero.desc')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a
            href="#contact"
            className="scanline-effect group relative px-8 py-4 bg-brand-600 rounded-none skew-x-[-10deg] text-white font-bold tracking-wider hover:bg-brand-500 transition-all border border-brand-400 shadow-[0_0_20px_rgba(14,165,233,0.4)]"
          >
            <div className="skew-x-[10deg] flex items-center gap-2">
               {t('hero.cta.primary')} <ArrowIcon size={18} />
            </div>
          </a>
          <a
            href="#services"
            className="scanline-effect group px-8 py-4 rounded-none skew-x-[-10deg] bg-slate-900/50 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-all backdrop-blur-sm"
          >
             <div className="skew-x-[10deg] flex items-center gap-2">
                {t('hero.cta.secondary')}
             </div>
          </a>
        </motion.div>

        {/* HUD Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            { icon: Bot, label: 'hero.feature.fast', desc: 'hero.feature.fastDesc' },
            { icon: Zap, label: 'hero.feature.secure', desc: 'hero.feature.secureDesc' },
            { icon: TrendingUp, label: 'hero.feature.global', desc: 'hero.feature.globalDesc' },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="relative p-6 group"
            >
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-slate-700 group-hover:border-cyan-500 transition-colors duration-300"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-slate-700 group-hover:border-cyan-500 transition-colors duration-300"></div>
              
              <div className="flex flex-col items-center">
                  <div className="p-4 rounded-full bg-slate-900/50 border border-slate-800 text-brand-400 mb-4 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                    <item.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="scanline-effect text-white font-mono font-bold text-lg mb-1 tracking-wide">{t(item.label)}</h3>
                  <p className="text-slate-500 text-sm font-sans">{t(item.desc)}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

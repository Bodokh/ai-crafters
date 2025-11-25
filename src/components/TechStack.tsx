'use client';

const techs = [
  "Insurnace", "Aerospace", "FinTech", "Logistics", "Healthcare", "Retail", "Marketing", "Sales", "Customer Support", "HR", "Legal", "Finance", "Education", "Entertainment", "Media", "Travel", "Food & Beverage", "Retail", "Marketing", "Sales", "Customer Support", "HR", "Legal", "Finance", "Education", "Entertainment", "Media", "Travel", "Food & Beverage"
];

export const TechStack = () => {
  return (
    <section className="py-8 border-y border-slate-800 bg-black overflow-hidden relative dir-ltr">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
        
        {/* Scan line overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] pointer-events-none z-20 opacity-20"></div>

        <div className="flex w-[200%]">
            <div className="flex gap-16 whitespace-nowrap py-2 animate-[marquee_40s_linear_infinite]">
                {[...techs, ...techs, ...techs].map((tech, i) => (
                    <div key={i} className="flex items-center gap-2 group cursor-default">
                        <span className="text-xl font-mono font-bold text-slate-600 uppercase tracking-widest group-hover:text-cyan-400 transition-colors duration-300">
                            {tech}
                        </span>
                        <div className="w-2 h-2 bg-slate-800 rotate-45 group-hover:bg-brand-500 transition-colors"></div>
                    </div>
                ))}
            </div>
        </div>
        
        <style>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
        `}</style>
    </section>
  );
};

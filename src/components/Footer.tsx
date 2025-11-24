'use client';

import Image from 'next/image';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const Footer = () => {
  const t = useTranslations();
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 text-sm">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="AI Crafters" width={100} height={64} className="h-18 w-auto object-contain" />
          </div>

          <div className="text-slate-500">
            &copy; {new Date().getFullYear()} {t('footer.rights')}
          </div>

          {/* <div className="flex gap-4">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Icon size={18} />
              </a>
            ))}
          </div> */}
        </div>
      </div>
    </footer>
  );
};

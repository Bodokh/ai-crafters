'use client';

import Image from 'next/image';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const Footer = () => {
  const t = useTranslations();
  return (
    <footer className="bg-background border-t border-border py-12 text-sm">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="AI Crafters" width={100} height={64} className="h-18 w-auto object-contain dark:brightness-100 brightness-0" />
          </div>

          <div className="text-muted-foreground">
            &copy; {new Date().getFullYear()} {t('footer.rights')}
          </div>

          {/* <div className="flex gap-4">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="p-2 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                <Icon size={18} />
              </a>
            ))}
          </div> */}
        </div>
      </div>
    </footer>
  );
};

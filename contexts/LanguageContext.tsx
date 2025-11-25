'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'he';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.services': 'Solutions',
    'nav.process': 'Approach',
    'nav.work': 'Projects',
    'nav.contact': 'Contact',
    'nav.start': 'Start Now',
    'hero.badge': 'AI Automation Agents v2.0',
    'hero.title.1': 'Smart Agents.',
    'hero.title.2': 'Real Efficiency.',
    'hero.desc': 'We build intelligent agents and integrate AI solutions for small, medium, and large companies. Improve efficiency, decrease manpower, and automate your workflow.',
    'hero.cta.primary': 'Automate Now',
    'hero.cta.secondary': 'View Solutions',
    'hero.feature.fast': 'Smart Automation',
    'hero.feature.fast.desc': 'Reduce manual tasks by 80%',
    'hero.feature.secure': 'Business Integration',
    'hero.feature.secure.desc': 'Seamless workflow connection',
    'hero.feature.global': 'Cost Efficiency',
    'hero.feature.global.desc': 'Maximize ROI & reduce staff',
    'services.title': 'Intelligent',
    'services.title.highlight': 'Solutions',
    'services.subtitle': 'We replace repetitive tasks with smart agents, allowing your team to focus on growth and strategy.',
    'service.web.title': 'Autonomous Agents',
    'service.web.desc': 'Deploy digital workers that handle customer support, data entry, and scheduling 24/7 without human intervention.',
    'service.mobile.title': 'Workflow Automation',
    'service.mobile.desc': 'Connect your existing tools (CRM, Email, Slack) into a unified, self-driving ecosystem.',
    'service.cloud.title': 'Business Intelligence',
    'service.cloud.desc': 'Turn raw data into actionable insights with predictive analytics and automated reporting systems.',
    'service.ai.title': 'Custom Integration',
    'service.ai.desc': 'Tailor-made AI solutions that fit perfectly into your company\'s specific operational needs and goals.',
    'service.backend.title': 'Knowledge Base',
    'service.backend.desc': 'Centralize your company knowledge, making it instantly accessible to employees and customers via chat.',
    'service.security.title': 'Scalable Growth',
    'service.security.desc': 'Grow your operations instantly without the need to hire, train, and manage large new teams.',
    'projects.title': 'Selected',
    'projects.title.highlight': 'Work',
    'projects.subtitle': 'A glimpse into the intelligent systems we\'ve deployed for our partners.',
    'project.1.title': 'SupportBot Prime',
    'project.1.desc': 'A Tier-1 customer support agent capable of resolving 70% of tickets autonomously using RAG technology.',
    'project.1.tag': 'FinTech',
    'project.2.title': 'LogiRoute AI',
    'project.2.desc': 'Dynamic supply chain optimization engine that reduced delivery times by 24% for a national courier.',
    'project.2.tag': 'Logistics',
    'project.3.title': 'MedScan Assist',
    'project.3.desc': 'Computer vision system for preliminary analysis of X-ray imagery to assist radiologists in triage.',
    'project.3.tag': 'Healthcare',
    'process.title': 'Our Approach',
    'process.subtitle': 'How we transform your business operations in four simple steps.',
    'process.1.title': 'Discovery',
    'process.1.desc': 'We analyze your current workflows to identify bottlenecks and opportunities for automation.',
    'process.2.title': 'Strategy',
    'process.2.desc': 'We design a custom AI roadmap tailored to your specific business size and goals.',
    'process.3.title': 'Integration',
    'process.3.desc': 'We build and plug in smart agents that work alongside your existing team and software.',
    'process.4.title': 'Optimization',
    'process.4.desc': 'Continuous monitoring and refining to ensure your agents are always improving efficiency.',
    'testimonials.title': 'Client Success',
    'testimonials.1.quote': 'AI Crafters\' agents took over our entire scheduling department. We saved 40 hours a week immediately.',
    'testimonials.1.role': 'CEO, TechFlow SMB',
    'testimonials.2.quote': 'We reduced our support staff overhead by 60% while increasing customer satisfaction. Unbelievable results.',
    'testimonials.2.role': 'Director, Global Retail',
    'testimonials.3.quote': 'Finally, an AI solution that actually solves business problems instead of just being a shiny toy.',
    'testimonials.3.role': 'Founder, StartScale',
    'contact.title.1': 'Ready to',
    'contact.title.2': 'Automate?',
    'contact.desc': 'Stop wasting time on manual tasks. Let\'s build your digital workforce today.',
    'contact.form.firstName': 'Name',
    'contact.form.lastName': 'Company',
    'contact.form.email': 'Email',
    'contact.form.message': 'How can we help?',
    'contact.form.submit': 'Get Efficiency',
    'footer.rights': 'AI Crafters. Intelligent Business Solutions.'
  },
  he: {
    'nav.services': 'פתרונות',
    'nav.process': 'תהליך',
    'nav.work': 'פרויקטים',
    'nav.contact': 'צור קשר',
    'nav.start': 'התחל עכשיו',
    'hero.badge': 'סוכנים חכמים ואוטומציה v2.0',
    'hero.title.1': 'סוכנים חכמים.',
    'hero.title.2': 'יעילות אמיתית.',
    'hero.desc': 'אנו בונים סוכנים חכמים ומטמיעים פתרונות AI לעסקים קטנים, בינוניים וגדולים. שפרו את היעילות, צמצמו כוח אדם ומכנו את העבודה.',
    'hero.cta.primary': 'התחל אוטומציה',
    'hero.cta.secondary': 'צפה בפתרונות',
    'hero.feature.fast': 'אוטומציה חכמה',
    'hero.feature.fast.desc': 'צמצום 80% מהמשימות הידניות',
    'hero.feature.secure': 'אינטגרציה עסקית',
    'hero.feature.secure.desc': 'חיבור חלק לזרימת העבודה',
    'hero.feature.global': 'התייעלות כלכלית',
    'hero.feature.global.desc': 'החזר השקעה מקסימלי',
    'services.title': 'פתרונות',
    'services.title.highlight': 'אינטליגנטיים',
    'services.subtitle': 'אנו מחליפים משימות חוזרות בסוכנים חכמים, ומאפשרים לצוות שלכם להתמקד בצמיחה ואסטרטגיה.',
    'service.web.title': 'סוכנים אוטונומיים',
    'service.web.desc': 'הפעילו עובדים דיגיטליים המטפלים בשירות לקוחות, הזנת נתונים ותיאום פגישות 24/7 ללא התערבות אדם.',
    'service.mobile.title': 'אוטומציה של תהליכים',
    'service.mobile.desc': 'חברו את הכלים הקיימים (CRM, מייל, סלאק) למערכת אקולוגית אחת מאוחדת ונוהגת-מעצמה.',
    'service.cloud.title': 'בינה עסקית',
    'service.cloud.desc': 'הפכו נתונים גולמיים לתובנות מעשיות באמצעות ניתוח חיזוי ומערכות דיווח אוטומטיות.',
    'service.ai.title': 'אינטגרציה מותאמת אישית',
    'service.ai.desc': 'פתרונות AI תפורים לפי מידה המותאמים בדיוק לצרכים התפעוליים והמטרות של החברה שלכם.',
    'service.backend.title': 'ניהול ידע',
    'service.backend.desc': 'ריכוז הידע הארגוני והנגשתו המיידית לעובדים וללקוחות באמצעות צ\'אט.',
    'service.security.title': 'צמיחה סקיילבילית',
    'service.security.desc': 'הגדילו את הפעילות באופן מיידי ללא צורך בגיוס, הכשרה וניהול של צוותים חדשים וגדולים.',
    'projects.title': 'פרויקטים',
    'projects.title.highlight': 'נבחרים',
    'projects.subtitle': 'הצצה למערכות החכמות שהטמענו עבור השותפים שלנו.',
    'project.1.title': 'SupportBot Prime',
    'project.1.desc': 'סוכן שירות לקוחות Tier-1 המסוגל לפתור 70% מהפניות באופן אוטונומי באמצעות טכנולוגיית RAG.',
    'project.1.tag': 'פינטק',
    'project.2.title': 'LogiRoute AI',
    'project.2.desc': 'מנוע אופטימיזציה לשרשרת האספקה שצמצם את זמני המשלוח ב-24% עבור חברת שליחויות ארצית.',
    'project.2.tag': 'לוגיסטיקה',
    'project.3.title': 'MedScan Assist',
    'project.3.desc': 'מערכת ראייה ממוחשבת לניתוח ראשוני של צילומי רנטגן לסיוע במיון רפואי.',
    'project.3.tag': 'רפואה',
    'process.title': 'הגישה שלנו',
    'process.subtitle': 'כיצד אנו משדרגים את הפעילות העסקית שלכם בארבעה צעדים פשוטים.',
    'process.1.title': 'גילוי ומיפוי',
    'process.1.desc': 'אנו מנתחים את תהליכי העבודה הנוכחיים כדי לזהות צווארי בקבוק והזדמנויות לאוטומציה.',
    'process.2.title': 'אסטרטגיה',
    'process.2.desc': 'אנו מתכננים מפת דרכים ל-AI המותאמת אישית לגודל העסק וליעדים שלכם.',
    'process.3.title': 'אינטגרציה',
    'process.3.desc': 'אנו בונים ומחברים סוכנים חכמים שעובדים לצד הצוות והתוכנות הקיימות שלכם.',
    'process.4.title': 'אופטימיזציה',
    'process.4.desc': 'ניטור ושיפור מתמיד כדי להבטיח שהסוכנים תמיד משפרים את היעילות.',
    'testimonials.title': 'סיפורי הצלחה',
    'testimonials.1.quote': 'הסוכנים של AI Crafters לקחו פיקוד על כל מחלקת התיאום שלנו. חסכנו 40 שעות שבועיות באופן מיידי.',
    'testimonials.1.role': 'מנכ"ל, TechFlow SMB',
    'testimonials.2.quote': 'צמצמנו את עלויות צוות התמיכה ב-60% תוך העלאת שביעות רצון הלקוחות. תוצאות מדהימות.',
    'testimonials.2.role': 'מנהלת, Global Retail',
    'testimonials.3.quote': 'סוף סוף, פתרון AI שבאמת פותר בעיות עסקיות במקום להיות סתם צעצוע נוצץ.',
    'testimonials.3.role': 'מייסד, StartScale',
    'contact.title.1': 'מוכנים',
    'contact.title.2': 'לאוטומציה?',
    'contact.desc': 'הפסיקו לבזבז זמן על משימות ידניות. בואו נבנה את כוח העבודה הדיגיטלי שלכם היום.',
    'contact.form.firstName': 'שם',
    'contact.form.lastName': 'חברה',
    'contact.form.email': 'אימייל',
    'contact.form.message': 'איך נוכל לעזור?',
    'contact.form.submit': 'קבל יעילות',
    'footer.rights': 'AI Crafters. פתרונות עסקיים חכמים.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'he' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
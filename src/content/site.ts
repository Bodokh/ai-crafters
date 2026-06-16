import type { LocaleKey, LocalizedText } from './useCases';

export const company = {
  name: 'AI Crafters',
  legalName: 'AI Crafters',
  email: 'automate@ai-crafters.com',
  phone: '+972 54-217-7133',
  location: {
    en: 'Tel Aviv, Israel',
    he: 'תל אביב, ישראל',
  },
  description: {
    en: 'AI Crafters designs and builds production-grade AI agents, workflow automation, business intelligence AI, and custom AI integrations for companies that need measurable operational impact.',
    he: 'AI Crafters מתכננת ובונה סוכני AI, אוטומציה של תהליכים, בינה עסקית ב-AI ואינטגרציות AI מותאמות אישית לחברות שצריכות אימפקט תפעולי מדיד.',
  },
  shortDescription: {
    en: 'Production-grade AI agents and workflow automation for business operations.',
    he: 'סוכני AI ואוטומציה תפעולית ברמת פרודקשן.',
  },
  valueProposition: {
    en: 'We turn repetitive, document-heavy, data-heavy, or call-heavy workflows into controlled AI systems that plug into the tools and procedures a company already uses.',
    he: 'אנחנו הופכים תהליכים חוזרים, עתירי מסמכים, דאטה או שיחות למערכות AI מבוקרות שמתחברות לכלים ולנהלים שכבר קיימים בארגון.',
  },
};

export const founders = [
  {
    key: 'saar',
    name: {
      en: 'Saar Litmanovich',
      he: "סער ליטמנוביץ'",
    },
    title: {
      en: 'CEO',
      he: 'מנכ"ל',
    },
    linkedin: 'https://www.linkedin.com/in/saar-litmanovich/',
  },
  {
    key: 'eran',
    name: {
      en: 'Eran Bodokh',
      he: 'ערן בודוק',
    },
    title: {
      en: 'CTO',
      he: 'סמנכ"ל טכנולוגיות',
    },
    linkedin: 'https://www.linkedin.com/in/eran-bodokh/',
  },
  {
    key: 'dvir',
    name: {
      en: 'Dvir Cohen',
      he: 'דביר כהן',
    },
    title: {
      en: 'COO',
      he: 'סמנכ"ל תפעול',
    },
    linkedin: 'https://www.linkedin.com/in/dvircohen1/',
  },
];

export type ServicePage = {
  slug: string;
  title: LocalizedText;
  metaTitle: LocalizedText;
  description: LocalizedText;
  eyebrow: LocalizedText;
  audience: LocalizedText;
  outcomes: Record<LocaleKey, string[]>;
  process: Record<LocaleKey, string[]>;
  relatedUseCaseSlugs: string[];
};

export const servicePages: ServicePage[] = [
  {
    slug: 'ai-agent-development',
    title: {
      en: 'AI Agent Development',
      he: 'פיתוח סוכני AI',
    },
    metaTitle: {
      en: 'AI Agent Development Services | AI Crafters',
      he: 'שירותי פיתוח סוכני AI | AI Crafters',
    },
    eyebrow: {
      en: 'Autonomous agents for real business workflows',
      he: 'סוכנים אוטונומיים לתהליכים עסקיים אמיתיים',
    },
    description: {
      en: 'We design AI agents that read documents, call tools, follow business procedures, and hand decisions back to human teams with clear controls.',
      he: 'אנחנו מתכננים סוכני AI שקוראים מסמכים, מפעילים כלים, עובדים לפי נהלים עסקיים ומחזירים החלטות לצוותים אנושיים עם בקרות ברורות.',
    },
    audience: {
      en: 'Best for teams with repeatable operational work, high-volume requests, document review, or decision support that depends on internal procedures.',
      he: 'מתאים לצוותים עם עבודה תפעולית חוזרת, נפח בקשות גבוה, בדיקת מסמכים או תמיכה בהחלטות שמבוססת על נהלים פנימיים.',
    },
    outcomes: {
      en: [
        'Lower handling time for repetitive work',
        'More consistent decisions across teams',
        'Human review where the business still needs judgment',
      ],
      he: [
        'קיצור זמן טיפול בעבודה חוזרת',
        'החלטות עקביות יותר בין צוותים',
        'בדיקה אנושית במקומות שבהם עדיין נדרש שיקול דעת',
      ],
    },
    process: {
      en: [
        'Map the workflow and decision policy',
        'Build the agent with retrieval, tools, and guardrails',
        'Evaluate outputs against real cases before rollout',
      ],
      he: [
        'מיפוי תהליך העבודה ומדיניות ההחלטה',
        'בניית הסוכן עם שליפה, כלים ו-guardrails',
        'בדיקת תוצרים מול מקרים אמיתיים לפני rollout',
      ],
    },
    relatedUseCaseSlugs: ['insurance-claim-settlements', 'vendor-bank-verification'],
  },
  {
    slug: 'workflow-automation',
    title: {
      en: 'Workflow Automation',
      he: 'אוטומציה של תהליכים',
    },
    metaTitle: {
      en: 'AI Workflow Automation Services | AI Crafters',
      he: 'שירותי אוטומציה מבוססת AI | AI Crafters',
    },
    eyebrow: {
      en: 'Automation that connects to the systems teams already use',
      he: 'אוטומציה שמתחברת למערכות שהצוותים כבר משתמשים בהן',
    },
    description: {
      en: 'We automate multi-step workflows across CRMs, email, operations tools, documents, data systems, and approval flows.',
      he: 'אנחנו ממכנים תהליכים מרובי שלבים בין CRM, אימייל, כלי תפעול, מסמכים, מערכות דאטה וזרימות אישור.',
    },
    audience: {
      en: 'Best for operations, finance, sales, support, and field teams that lose time moving information between systems.',
      he: 'מתאים לצוותי תפעול, כספים, מכירות, תמיכה ושטח שמאבדים זמן בהעברת מידע בין מערכות.',
    },
    outcomes: {
      en: [
        'Fewer manual handoffs',
        'Faster response times',
        'Cleaner audit trails and repeatable execution',
      ],
      he: [
        'פחות העברות ידניות',
        'זמני תגובה קצרים יותר',
        'תיעוד נקי וביצוע עקבי',
      ],
    },
    process: {
      en: [
        'Identify the bottleneck and source systems',
        'Design the automation with failure handling',
        'Ship a controlled rollout with monitoring',
      ],
      he: [
        'זיהוי צוואר הבקבוק ומערכות המקור',
        'תכנון האוטומציה עם טיפול בכשלים',
        'עלייה הדרגתית לפרודקשן עם ניטור',
      ],
    },
    relatedUseCaseSlugs: ['inspection-to-report', 'insurance-claim-settlements'],
  },
  {
    slug: 'enterprise-ai-agents',
    title: {
      en: 'Enterprise AI Agents',
      he: 'סוכני AI לארגונים',
    },
    metaTitle: {
      en: 'Enterprise AI Agents for Regulated Workflows | AI Crafters',
      he: 'סוכני AI לארגונים ותהליכים מבוקרים | AI Crafters',
    },
    eyebrow: {
      en: 'AI agents with governance, permissions, and evaluation',
      he: 'סוכני AI עם ממשל, הרשאות ובדיקות איכות',
    },
    description: {
      en: 'We build AI systems for teams that need role-based access, auditability, evaluation, and controlled deployment into production.',
      he: 'אנחנו בונים מערכות AI לצוותים שצריכים הרשאות לפי תפקיד, auditability, בדיקות איכות והטמעה מבוקרת בפרודקשן.',
    },
    audience: {
      en: 'Best for regulated, security-sensitive, or high-volume companies where AI must fit existing governance and risk controls.',
      he: 'מתאים לחברות מפוקחות, רגישות אבטחתית או בעלות נפח גבוה שבהן AI חייב להשתלב בבקרות ממשל וסיכון קיימות.',
    },
    outcomes: {
      en: [
        'Controlled production deployment',
        'Evaluation and guardrails before scale',
        'Clear ownership between AI and human reviewers',
      ],
      he: [
        'הטמעה מבוקרת בפרודקשן',
        'בדיקות ו-guardrails לפני סקייל',
        'חלוקת אחריות ברורה בין AI לבודקים אנושיים',
      ],
    },
    process: {
      en: [
        'Define risk, permissions, and audit requirements',
        'Build retrieval and tool use around approved sources',
        'Monitor quality and drift after rollout',
      ],
      he: [
        'הגדרת סיכון, הרשאות ודרישות audit',
        'בניית שליפה והפעלת כלים סביב מקורות מאושרים',
        'ניטור איכות ו-drift אחרי rollout',
      ],
    },
    relatedUseCaseSlugs: ['vendor-bank-verification', 'cim-generator'],
  },
  {
    slug: 'ai-business-intelligence',
    title: {
      en: 'AI Business Intelligence',
      he: 'בינה עסקית מבוססת AI',
    },
    metaTitle: {
      en: 'AI Business Intelligence and Natural-Language Analytics | AI Crafters',
      he: 'בינה עסקית מבוססת AI וניתוח בשפה טבעית | AI Crafters',
    },
    eyebrow: {
      en: 'Natural-language answers over trusted business data',
      he: 'תשובות בשפה טבעית מעל דאטה עסקי אמין',
    },
    description: {
      en: 'We add AI Q&A, charting, and analysis layers over existing data models so business users can ask precise questions without waiting for analysts.',
      he: 'אנחנו מוסיפים שכבות Q&A, גרפים וניתוח ב-AI מעל מודלי דאטה קיימים כדי שמשתמשים עסקיים יוכלו לשאול שאלות מדויקות בלי לחכות לאנליסטים.',
    },
    audience: {
      en: 'Best for SaaS, retail, operations, finance, and executive teams with structured data but slow ad-hoc analysis.',
      he: 'מתאים לצוותי SaaS, ריטייל, תפעול, כספים והנהלה עם דאטה מובנה אבל ניתוח אד-הוק איטי.',
    },
    outcomes: {
      en: [
        'Faster answers for business users',
        'Less spreadsheet and SQL dependency',
        'New product modules or internal analytics layers',
      ],
      he: [
        'תשובות מהירות יותר למשתמשים עסקיים',
        'פחות תלות באקסלים ו-SQL',
        'מודולים מוצריים חדשים או שכבות אנליטיקה פנימיות',
      ],
    },
    process: {
      en: [
        'Map the business data model and approved metrics',
        'Build retrieval and calculation logic',
        'Evaluate answers against known analyst outputs',
      ],
      he: [
        'מיפוי מודל הדאטה העסקי והמדדים המאושרים',
        'בניית לוגיקת שליפה וחישוב',
        'בדיקת תשובות מול תוצרי אנליסטים ידועים',
      ],
    },
    relatedUseCaseSlugs: ['business-intelligence-qa', 'cim-generator'],
  },
  {
    slug: 'custom-ai-integration',
    title: {
      en: 'Custom AI Integration',
      he: 'אינטגרציית AI מותאמת אישית',
    },
    metaTitle: {
      en: 'Custom AI Integration for Business Systems | AI Crafters',
      he: 'אינטגרציית AI מותאמת למערכות עסקיות | AI Crafters',
    },
    eyebrow: {
      en: 'AI connected to your data, tools, and product surface',
      he: 'AI שמחובר לדאטה, לכלים ולמוצר שלכם',
    },
    description: {
      en: 'We connect language models, retrieval systems, business logic, and internal tools into reliable product or operations workflows.',
      he: 'אנחנו מחברים מודלי שפה, מערכות שליפה, לוגיקה עסקית וכלים פנימיים לתהליכי מוצר או תפעול אמינים.',
    },
    audience: {
      en: 'Best for teams with an existing product or operation that needs AI capability without replacing the whole stack.',
      he: 'מתאים לצוותים עם מוצר או תפעול קיים שצריכים יכולות AI בלי להחליף את כל ה-stack.',
    },
    outcomes: {
      en: [
        'AI features embedded in existing products',
        'RAG and tool-use connected to trusted sources',
        'Practical deployment without platform rewrites',
      ],
      he: [
        'יכולות AI שמוטמעות במוצרים קיימים',
        'RAG והפעלת כלים שמחוברים למקורות אמינים',
        'הטמעה פרקטית בלי כתיבה מחדש של הפלטפורמה',
      ],
    },
    process: {
      en: [
        'Identify integration boundaries and data access',
        'Design a minimal production architecture',
        'Ship the AI capability behind controls and observability',
      ],
      he: [
        'זיהוי גבולות אינטגרציה וגישה לדאטה',
        'תכנון ארכיטקטורת פרודקשן מינימלית',
        'השקת יכולת AI מאחורי בקרות וניטור',
      ],
    },
    relatedUseCaseSlugs: ['cim-generator', 'inspection-to-report'],
  },
  {
    slug: 'knowledge-base-ai',
    title: {
      en: 'Knowledge Base AI',
      he: 'AI לניהול ידע',
    },
    metaTitle: {
      en: 'Knowledge Base AI and RAG Systems | AI Crafters',
      he: 'מערכות RAG ו-AI לניהול ידע | AI Crafters',
    },
    eyebrow: {
      en: 'Reliable answers from company-owned knowledge',
      he: 'תשובות אמינות מתוך ידע ארגוני',
    },
    description: {
      en: 'We create retrieval systems and assistant experiences that answer from company documents, procedures, product data, and support knowledge.',
      he: 'אנחנו יוצרים מערכות שליפה וחוויות assistant שעונות מתוך מסמכים, נהלים, דאטה מוצרי וידע תמיכה של החברה.',
    },
    audience: {
      en: 'Best for support, sales, operations, and employee enablement teams that need fast answers from scattered knowledge.',
      he: 'מתאים לצוותי תמיכה, מכירות, תפעול והדרכה שצריכים תשובות מהירות מתוך ידע מפוזר.',
    },
    outcomes: {
      en: [
        'Faster knowledge access',
        'Answers grounded in approved sources',
        'Reduced repeated questions to experts',
      ],
      he: [
        'גישה מהירה יותר לידע',
        'תשובות שמבוססות על מקורות מאושרים',
        'פחות שאלות חוזרות למומחים פנימיים',
      ],
    },
    process: {
      en: [
        'Select source systems and permission rules',
        'Build retrieval, citation, and answer policies',
        'Measure quality with real user questions',
      ],
      he: [
        'בחירת מערכות מקור וחוקי הרשאות',
        'בניית מדיניות שליפה, ציטוט ותשובה',
        'מדידת איכות מול שאלות משתמשים אמיתיות',
      ],
    },
    relatedUseCaseSlugs: ['business-intelligence-qa', 'insurance-claim-settlements'],
  },
];

export const faqs = [
  {
    question: {
      en: 'What does AI Crafters build?',
      he: 'מה AI Crafters בונה?',
    },
    answer: {
      en: 'AI Crafters builds production-grade AI agents, workflow automation, business intelligence AI, RAG systems, and custom AI integrations that connect to real business data and tools.',
      he: 'AI Crafters בונה סוכני AI, אוטומציה של תהליכים, בינה עסקית ב-AI, מערכות RAG ואינטגרציות AI שמתחברות לדאטה ולכלים עסקיים אמיתיים.',
    },
  },
  {
    question: {
      en: 'Who is AI Crafters best suited for?',
      he: 'למי AI Crafters מתאימה?',
    },
    answer: {
      en: 'The best fit is a company with repeatable workflows, internal data, documents, calls, or operational decisions that can be accelerated with a controlled AI system.',
      he: 'ההתאמה הטובה ביותר היא חברה עם תהליכים חוזרים, דאטה פנימי, מסמכים, שיחות או החלטות תפעוליות שאפשר להאיץ בעזרת מערכת AI מבוקרת.',
    },
  },
  {
    question: {
      en: 'How does AI Crafters reduce risk in AI projects?',
      he: 'איך AI Crafters מצמצמת סיכון בפרויקטי AI?',
    },
    answer: {
      en: 'Projects are scoped around a concrete workflow, approved data sources, human review where needed, evaluation on real examples, and guardrails before production rollout.',
      he: 'הפרויקטים מוגדרים סביב תהליך עבודה קונקרטי, מקורות דאטה מאושרים, בדיקה אנושית כשצריך, בדיקות מול דוגמאות אמיתיות ו-guardrails לפני עלייה לפרודקשן.',
    },
  },
];

export const comparisonPages = [
  {
    slug: 'ai-agency-vs-internal-ai-team',
    title: {
      en: 'AI Agency vs. Internal AI Team',
      he: 'סוכנות AI מול צוות AI פנימי',
    },
    metaTitle: {
      en: 'AI Agency vs Internal AI Team | AI Crafters',
      he: 'סוכנות AI מול צוות AI פנימי | AI Crafters',
    },
    description: {
      en: 'A practical comparison for companies deciding whether to hire an AI partner or build an internal AI team.',
      he: 'השוואה פרקטית לחברות שמתלבטות אם לשכור שותף AI או לבנות צוות AI פנימי.',
    },
    sections: {
      en: [
        'Use an AI agency when the workflow is clear, speed matters, and you need production architecture before committing to a full internal team.',
        'Build internally when AI is a permanent core product capability and you can support hiring, evaluation, infrastructure, and governance.',
        'A hybrid model works well when an external team ships the first production system and transfers ownership to internal engineering.',
      ],
      he: [
        'בחרו סוכנות AI כשהתהליך ברור, מהירות חשובה, ואתם צריכים ארכיטקטורת פרודקשן לפני התחייבות לצוות פנימי מלא.',
        'בנו פנימית כשה-AI הוא יכולת מוצרית קבועה בליבת החברה ויש יכולת לתמוך בגיוס, בדיקות, תשתיות וממשל.',
        'מודל היברידי מתאים כשהצוות החיצוני משיק מערכת ראשונה ומעביר בעלות להנדסה הפנימית.',
      ],
    },
  },
];

export const resourcePages = [
  {
    slug: 'ai-agent-rfp-checklist',
    title: {
      en: 'AI Agent RFP Checklist',
      he: 'צ׳קליסט RFP לסוכני AI',
    },
    metaTitle: {
      en: 'AI Agent RFP Checklist | AI Crafters',
      he: 'צ׳קליסט RFP לסוכני AI | AI Crafters',
    },
    description: {
      en: 'A checklist for evaluating AI agent vendors, implementation risk, data readiness, guardrails, and production ownership.',
      he: 'צ׳קליסט להערכת ספקי סוכני AI, סיכוני יישום, מוכנות דאטה, guardrails ובעלות בפרודקשן.',
    },
    items: {
      en: [
        'Define the workflow and measurable outcome before selecting tools.',
        'List approved data sources, permissions, and refresh cadence.',
        'Require evaluation on real historical cases.',
        'Define human review thresholds and escalation paths.',
        'Ask who owns monitoring, incident response, and future model changes.',
      ],
      he: [
        'הגדירו את תהליך העבודה והתוצאה המדידה לפני בחירת כלים.',
        'רשמו מקורות דאטה מאושרים, הרשאות וקצב עדכון.',
        'דרשו בדיקות מול מקרים היסטוריים אמיתיים.',
        'הגדירו ספי בדיקה אנושית ונתיבי escalation.',
        'שאלו מי אחראי לניטור, טיפול בתקלות ושינויי מודלים עתידיים.',
      ],
    },
  },
];

export const getServicePage = (slug: string) =>
  servicePages.find((page) => page.slug === slug);

export const getComparisonPage = (slug: string) =>
  comparisonPages.find((page) => page.slug === slug);

export const getResourcePage = (slug: string) =>
  resourcePages.find((page) => page.slug === slug);

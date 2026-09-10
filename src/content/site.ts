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
    en: 'AI Crafters designs and builds custom AI solutions around your business: AI agents, workflow automation, knowledge assistants, and integrations with your existing systems.',
    he: 'AI Crafters מפתחת פתרונות AI בהתאמה אישית לעסק: סוכני AI, אוטומציה של תהליכים, עוזרי ידע וחיבורים למערכות הקיימות שלכם.',
  },
  shortDescription: {
    en: 'Custom AI solutions built around your workflows, data, and business goals.',
    he: 'פתרונות AI בהתאמה אישית לתהליכים, למידע ולמטרות העסקיות שלכם.',
  },
  valueProposition: {
    en: 'We help your team spend less time handling documents, moving data, and chasing answers. Each solution is designed around a specific workflow, your existing tools, and the decisions that need human judgment.',
    he: 'אנחנו עוזרים לצוות שלכם לצמצם את הזמן שמושקע בטיפול במסמכים, בהעברת מידע ובחיפוש תשובות. כל פתרון נבנה סביב תהליך מוגדר, הכלים הקיימים וההחלטות שדורשות שיקול דעת אנושי.',
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
    linkedin: 'https://www.linkedin.com/in/bodokh/',
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
      en: 'Custom AI Agent Development',
      he: 'פיתוח סוכני AI בהתאמה אישית',
    },
    metaTitle: {
      en: 'Custom AI Agent Development for Business | AI Crafters',
      he: 'פיתוח סוכני AI בהתאמה אישית לעסקים | AI Crafters',
    },
    eyebrow: {
      en: 'Give your team a hand with work that keeps piling up',
      he: 'עזרה לצוות עם העבודה שלא מפסיקה להצטבר',
    },
    description: {
      en: 'Custom AI agents that process documents, handle requests, and act in your business systems, with clear rules for when your team takes over.',
      he: 'סוכני AI בהתאמה אישית לטיפול במסמכים ובבקשות ולביצוע פעולות במערכות העסק, עם כללים ברורים למקרים שדורשים טיפול אנושי.',
    },
    audience: {
      en: 'For operations, service, and finance teams handling recurring requests or documents. A strong starting point is a workflow with clear procedures, representative examples, and a person responsible for exceptions.',
      he: 'לצוותי תפעול, שירות וכספים שמטפלים שוב ושוב בבקשות או במסמכים. כדאי להתחיל מתהליך עם נהלים ברורים, דוגמאות מייצגות ואחראי לטיפול במקרים חריגים.',
    },
    outcomes: {
      en: [
        'Less manual reading, sorting, and information entry',
        'Requests handled according to defined business rules',
        'Exceptions and important decisions routed to your team',
      ],
      he: [
        'פחות קריאה, מיון והקלדה ידנית של מידע',
        'טיפול בבקשות לפי הכללים העסקיים שהוגדרו',
        'העברת מקרים חריגים והחלטות חשובות לצוות שלכם',
      ],
    },
    process: {
      en: [
        'Choose one workflow and define success, permitted actions, and human review',
        'Connect the agent to the relevant knowledge and business tools',
        'Test on representative cases, review failures, and plan a controlled rollout',
      ],
      he: [
        'בחירת תהליך והגדרת הצלחה, פעולות מותרות ובדיקה אנושית',
        'חיבור הסוכן למידע ולכלים העסקיים הרלוונטיים',
        'בדיקה על מקרים מייצגים, בחינת כשלים ותכנון הטמעה הדרגתית',
      ],
    },
    relatedUseCaseSlugs: ['insurance-claim-settlements', 'vendor-bank-verification'],
  },
  {
    slug: 'workflow-automation',
    title: {
      en: 'AI Workflow Automation',
      he: 'אוטומציה של תהליכים עסקיים עם AI',
    },
    metaTitle: {
      en: 'AI Workflow Automation Services | AI Crafters',
      he: 'שירותי אוטומציה מבוססת AI | AI Crafters',
    },
    eyebrow: {
      en: 'Keep work moving between your systems',
      he: 'פחות העתקה בין מערכות. יותר עבודה שמתקדמת.',
    },
    description: {
      en: 'Automate the handoffs between email, CRM, documents, and approvals. We build workflows around your process to reduce repetitive admin and missed follow-ups.',
      he: 'אוטומציה שמחברת בין מיילים, CRM, מסמכים ואישורים. אנחנו בונים את התהליך לפי דרך העבודה שלכם כדי לצמצם עבודה ידנית ומשימות שנופלות בין הכיסאות.',
    },
    audience: {
      en: 'For teams that copy data between tools, chase approvals, or track progress in spreadsheets. Start with a recurring handoff where delays or missing information create extra work.',
      he: 'לצוותים שמעתיקים מידע בין כלים, רודפים אחרי אישורים או עוקבים אחרי משימות באקסל. כדאי להתחיל משלב חוזר שבו עיכובים או מידע חסר יוצרים עבודה נוספת.',
    },
    outcomes: {
      en: [
        'Fewer copy-and-paste steps between business systems',
        'Requests and approvals sent to the right person',
        'Clearer tracking of completed steps and items needing attention',
      ],
      he: [
        'פחות העתקה והדבקה בין מערכות עסקיות',
        'העברת בקשות ואישורים לאדם המתאים',
        'מעקב ברור יותר אחרי שלבים שהושלמו ומשימות שדורשות טיפול',
      ],
    },
    process: {
      en: [
        'Map the trigger, systems, approvals, and points where work gets stuck',
        'Build the connections and define how to handle missing data or failed steps',
        'Test the full workflow with your team before expanding its use',
      ],
      he: [
        'מיפוי נקודת ההתחלה, המערכות, האישורים והשלבים שבהם העבודה נתקעת',
        'בניית החיבורים והגדרת טיפול במידע חסר ובפעולות שנכשלו',
        'בדיקת התהליך המלא עם הצוות לפני הרחבת השימוש',
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
      en: 'Enterprise AI Agents & Custom Implementation | AI Crafters',
      he: 'סוכני AI לארגונים ותהליכים מבוקרים | AI Crafters',
    },
    eyebrow: {
      en: 'Bring AI into workflows that need clear oversight',
      he: 'AI לתהליכים שדורשים בקרה ואחריות ברורה',
    },
    description: {
      en: 'Custom enterprise AI agents designed around your permission rules, review requirements, and existing systems, with a clear plan for testing and rollout.',
      he: 'סוכני AI לארגונים, בתכנון שמתחשב בהרשאות, בדרישות הבקרה ובמערכות הקיימות שלכם, עם תוכנית ברורה לבדיקות ולהטמעה.',
    },
    audience: {
      en: 'For organizations where several teams, permission levels, or approval policies shape how work gets done. Security, compliance, and operational requirements need to be assessed as part of the project scope.',
      he: 'לארגונים שבהם העבודה עוברת בין צוותים, רמות הרשאה ותהליכי אישור. דרישות אבטחת המידע, הרגולציה והתפעול נבחנות כחלק מהגדרת הפרויקט.',
    },
    outcomes: {
      en: [
        'AI actions designed around approved sources and permissions',
        'Documented criteria for testing and expanding use',
        'Defined responsibilities for review, exceptions, and ongoing operation',
      ],
      he: [
        'פעולות AI שמתוכננות לפי מקורות מידע והרשאות מאושרים',
        'קריטריונים מתועדים לבדיקות ולהרחבת השימוש',
        'חלוקת אחריות לבקרה, למקרים חריגים ולתפעול השוטף',
      ],
    },
    process: {
      en: [
        'Align business, technical, and review teams on requirements and limits',
        'Design access, action logging, and human approval around the workflow',
        'Evaluate representative and failure cases, then define rollout and monitoring',
      ],
      he: [
        'תיאום דרישות ומגבלות עם הצוותים העסקיים, הטכנולוגיים וגורמי הבקרה',
        'תכנון הרשאות, תיעוד פעולות ואישור אנושי בהתאם לתהליך',
        'בדיקת מקרים מייצגים ותרחישי כשל והגדרת תוכנית הטמעה וניטור',
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
      en: 'AI Business Intelligence Services | AI Crafters',
      he: 'בינה עסקית מבוססת AI וניתוח בשפה טבעית | AI Crafters',
    },
    eyebrow: {
      en: 'Ask business questions. Get answers from your data.',
      he: 'שאלות עסקיות בשפה רגילה. תשובות מתוך המידע שלכם.',
    },
    description: {
      en: 'Turn questions about sales, costs, and operations into answers and charts. We build AI analytics around your business data and agreed metric definitions.',
      he: 'הפכו שאלות על מכירות, עלויות ותפעול לתשובות ולגרפים. אנחנו בונים כלי ניתוח עם AI על בסיס המידע העסקי שלכם והגדרות מדדים מוסכמות.',
    },
    audience: {
      en: 'For business teams with structured data who depend on analysts for recurring questions, and product teams exploring analytics features for customers. Data quality and consistent metric definitions are essential to assess first.',
      he: 'לצוותים עסקיים עם נתונים מסודרים שתלויים באנליסטים גם בשאלות חוזרות, ולצוותי מוצר שרוצים להוסיף יכולות ניתוח ללקוחות. מתחילים בבדיקת איכות הנתונים והגדרות המדדים.',
    },
    outcomes: {
      en: [
        'Answers and charts for recurring business questions',
        'Less manual reporting for routine requests',
        'Analysis tied to agreed data sources and metric definitions',
      ],
      he: [
        'תשובות וגרפים לשאלות עסקיות חוזרות',
        'פחות הפקה ידנית של דוחות לבקשות שגרתיות',
        'ניתוח לפי מקורות מידע והגדרות מדדים מוסכמים',
      ],
    },
    process: {
      en: [
        'Collect real business questions and agree on data sources and metrics',
        'Build the query, calculation, and answer experience within access limits',
        'Compare answers with verified reports and test ambiguous questions',
      ],
      he: [
        'איסוף שאלות עסקיות אמיתיות והסכמה על מקורות המידע והמדדים',
        'בניית השאילתות, החישובים והצגת התשובות בהתאם להרשאות',
        'השוואת התשובות לדוחות שנבדקו ובחינת שאלות לא חד־משמעיות',
      ],
    },
    relatedUseCaseSlugs: ['business-intelligence-qa', 'cim-generator'],
  },
  {
    slug: 'custom-ai-integration',
    title: {
      en: 'Custom AI Integration Services',
      he: 'שילוב AI במערכות קיימות',
    },
    metaTitle: {
      en: 'Custom AI Integration for Business Systems | AI Crafters',
      he: 'אינטגרציית AI מותאמת למערכות עסקיות | AI Crafters',
    },
    eyebrow: {
      en: 'Add AI where your team already works',
      he: 'יכולות AI בתוך הכלים שכבר משמשים אתכם',
    },
    description: {
      en: 'Add AI features to your existing product, CRM, or internal tools. We connect models with your data and business logic around a clearly defined use case.',
      he: 'הוסיפו יכולות AI למוצר, ל-CRM או לכלים הפנימיים שלכם. אנחנו מחברים מודלים למידע ולכללים העסקיים בהתאם לצורך מוגדר.',
    },
    audience: {
      en: 'For product and engineering teams adding AI to an existing service, or operations teams connecting AI with internal tools. We assess available APIs, data access, and system constraints before defining the integration.',
      he: 'לצוותי מוצר ופיתוח שמוסיפים AI לשירות קיים, ולצוותי תפעול שרוצים לחבר AI לכלים פנימיים. בודקים ממשקי API, גישה למידע ומגבלות מערכת לפני שמגדירים את החיבור.',
    },
    outcomes: {
      en: [
        'AI features available inside familiar products and tools',
        'Responses and actions connected to relevant business data',
        'An integration plan that accounts for your existing architecture',
      ],
      he: [
        'יכולות AI בתוך מוצרים וכלים מוכרים',
        'תשובות ופעולות שמחוברות למידע העסקי הרלוונטי',
        'תוכנית חיבור שמתחשבת בארכיטקטורה הקיימת',
      ],
    },
    process: {
      en: [
        'Define the user journey, required data, and available system interfaces',
        'Build the integration with clear permission and failure-handling rules',
        'Test the complete experience and plan release with your technical team',
      ],
      he: [
        'הגדרת תהליך השימוש, המידע הנדרש והממשקים הזמינים',
        'בניית החיבור עם כללים ברורים להרשאות ולטיפול בכשלים',
        'בדיקת התהליך המלא ותכנון ההשקה עם הצוות הטכנולוגי שלכם',
      ],
    },
    relatedUseCaseSlugs: ['cim-generator', 'inspection-to-report'],
  },
  {
    slug: 'knowledge-base-ai',
    title: {
      en: 'AI Knowledge Assistants & RAG Systems',
      he: 'עוזרי AI לידע ארגוני ומערכות RAG',
    },
    metaTitle: {
      en: 'Knowledge Base AI and RAG Systems | AI Crafters',
      he: 'מערכות RAG ו-AI לניהול ידע | AI Crafters',
    },
    eyebrow: {
      en: 'Help your team find the answer, with the source',
      he: 'התשובה שהצוות צריך, עם המקור שעליו היא מבוססת',
    },
    description: {
      en: 'Build an AI knowledge assistant that finds answers in your documents, procedures, and support content, with source references and defined access rules.',
      he: 'עוזרי AI שמוצאים תשובות במסמכים, בנהלים ובתוכן התמיכה שלכם, עם הפניות למקורות וכללי גישה מוגדרים, כדי לצמצם חיפושים ושאלות חוזרות.',
    },
    audience: {
      en: 'For support, sales, and operations teams whose knowledge is spread across files and systems. RAG, or retrieval-augmented generation, helps an AI assistant use selected source material when forming an answer.',
      he: 'לצוותי שירות, מכירות ותפעול שהידע שלהם מפוזר בין קבצים ומערכות. במערכת RAG העוזר מאתר מידע במקורות שנבחרו ומשתמש בו כדי לנסח תשובה.',
    },
    outcomes: {
      en: [
        'Less searching through scattered documents and systems',
        'Answers with references your team can check',
        'Clear handling when sources are missing or do not support an answer',
      ],
      he: [
        'פחות חיפוש במסמכים ובמערכות נפרדות',
        'תשובות עם הפניות למקורות שהצוות יכול לבדוק',
        'טיפול מוגדר כשחסר מידע או כשהמקורות אינם תומכים בתשובה',
      ],
    },
    process: {
      en: [
        'Choose source content and define access, updates, and content responsibility',
        'Build search and answers with references and rules for insufficient evidence',
        'Test real questions, outdated content, and questions with no supported answer',
      ],
      he: [
        'בחירת מקורות המידע והגדרת הרשאות, עדכונים ואחריות לתוכן',
        'בניית חיפוש ותשובות עם הפניות למקורות וכללים למצבים שבהם אין מספיק מידע',
        'בדיקת שאלות אמיתיות, תוכן מיושן ושאלות שאין להן תשובה במקורות',
      ],
    },
    relatedUseCaseSlugs: ['business-intelligence-qa', 'insurance-claim-settlements'],
  },
];

export const faqs = [
  {
    question: {
      en: 'When do we need a custom AI solution instead of an off-the-shelf tool?',
      he: 'מתי צריך פתרון AI מותאם אישית במקום מוצר מוכן?',
    },
    answer: {
      en: 'A ready-made tool may be enough for a standard task. Custom development is worth exploring when your workflow depends on internal knowledge, several business systems, specific approval rules, or a product experience that a standard tool does not support. AI Crafters designs and builds AI agents, automation, knowledge assistants, and integrations around those needs.',
      he: 'מוצר מוכן יכול להספיק למשימה שגרתית. כדאי לבחון פיתוח מותאם כשהתהליך תלוי בידע פנימי, בכמה מערכות עסקיות, בכללי אישור ייחודיים או בחוויית מוצר שכלי מוכן לא מספק. AI Crafters מתכננת ובונה סוכני AI, אוטומציה, עוזרי ידע וחיבורים למערכות בהתאם לצרכים האלה.',
    },
  },
  {
    question: {
      en: 'How do we know which business process is a good fit for AI?',
      he: 'איך יודעים איזה תהליך בעסק מתאים ל-AI?',
    },
    answer: {
      en: 'Start with recurring work that costs your team time: reviewing documents, handling requests, finding information, or moving data between systems. A useful candidate has a clear business owner, examples of good outcomes, and a way to measure improvement. We assess whether AI, conventional automation, or a simpler process change fits the problem.',
      he: 'מתחילים מעבודה חוזרת שגוזלת זמן מהצוות: בדיקת מסמכים, טיפול בבקשות, חיפוש מידע או העברת נתונים בין מערכות. כדאי לבחור תהליך עם אחראי עסקי, דוגמאות לתוצאה טובה ודרך למדוד שיפור. בודקים אם הצורך מתאים ל-AI, לאוטומציה רגילה או לשינוי פשוט בתהליך.',
    },
  },
  {
    question: {
      en: 'Can a custom AI solution connect to our systems, and what data do we need?',
      he: 'אפשר לחבר AI למערכות שלנו, ואיזה מידע צריך להכין?',
    },
    answer: {
      en: 'Integration depends on the interfaces, access permissions, and data available in your systems. Useful starting materials include a workflow outline, a list of tools, and representative examples you are permitted to share. Data preparation, missing interfaces, and access restrictions are assessed during scoping so the proposed solution reflects your actual setup.',
      he: 'החיבור תלוי בממשקים, בהרשאות ובמידע הזמין במערכות שלכם. לשלב האפיון כדאי להכין תיאור של התהליך, רשימת כלים ודוגמאות שמותר לכם לשתף. בודקים את הכנת המידע, הממשקים החסרים ומגבלות הגישה כדי לתכנן פתרון שמתאים לסביבה הקיימת.',
    },
  },
  {
    question: {
      en: 'How much does a custom AI project cost, and how long does it take?',
      he: 'כמה עולה פרויקט AI מותאם אישית וכמה זמן הוא לוקח?',
    },
    answer: {
      en: 'Cost and timing depend on the workflow, data readiness, integrations, testing requirements, and rollout scope. A focused internal assistant and a system that takes actions across several tools require different work. We scope these requirements before proposing a budget and schedule, including the operating costs and maintenance responsibilities that need to be agreed.',
      he: 'העלות ולוח הזמנים תלויים בתהליך, במוכנות המידע, בחיבורים למערכות, בדרישות הבדיקה ובהיקף ההטמעה. עוזר ידע פנימי ומערכת שמבצעת פעולות בכמה כלים דורשים עבודה שונה. מגדירים את הדרישות לפני הצעת תקציב ולוח זמנים, ובוחנים גם עלויות שימוש ואחריות לתחזוקה שצריך להסדיר.',
    },
  },
  {
    question: {
      en: 'How do we keep control over AI decisions and actions?',
      he: 'איך שומרים על שליטה בהחלטות ובפעולות של ה-AI?',
    },
    answer: {
      en: 'The workflow should define which sources the AI can use, which actions it may take, and what requires human approval. We design around those boundaries and test representative cases and failures before rollout. Sensitive decisions, incomplete information, and unusual requests need explicit review rules; the controls and monitoring are scoped to the project.',
      he: 'מגדירים באילו מקורות ה-AI רשאי להשתמש, אילו פעולות מותר לו לבצע ומה דורש אישור אנושי. אנחנו מתכננים לפי הגבולות האלה ובודקים מקרים מייצגים וכשלים לפני ההטמעה. החלטות רגישות, מידע חסר ובקשות חריגות דורשים כללי בדיקה מפורשים. הבקרות והניטור מוגדרים לפי הפרויקט.',
    },
  },
  {
    question: {
      en: 'What should we bring to a first conversation with AI Crafters?',
      he: 'מה כדאי להכין לשיחה ראשונה עם AI Crafters?',
    },
    answer: {
      en: 'Bring one process you want to improve, who handles it today, the tools involved, and what a better result would look like. There is no need to choose a model or write a technical specification first. A clear business problem is enough to start a conversation about fit and the next step; sensitive records are not needed in the initial contact form.',
      he: 'כדאי להגיע עם תהליך אחד שרוצים לשפר, מי מטפל בו היום, אילו כלים מעורבים ומה ייחשב לתוצאה טובה יותר. אין צורך לבחור מודל או לכתוב אפיון טכני מראש. בעיה עסקית ברורה מספיקה כדי להתחיל לבדוק התאמה ואת הצעד הבא. אין צורך לצרף רשומות רגישות לטופס הפנייה הראשוני.',
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
      en: 'Compare an AI development partner, an internal team, and a hybrid approach by project scope, long-term capability, cost, and responsibility after launch.',
      he: 'שותף לפיתוח AI, צוות פנימי או שילוב ביניהם? השוו לפי היקף הפרויקט, היכולת הנדרשת לאורך זמן, העלות והאחריות אחרי ההשקה.',
    },
    sections: {
      en: [
        'Start with the role AI will play in your business. A defined workflow improvement calls for different staffing than an AI capability you will develop continuously. Compare an external partner, an internal team, and a hybrid approach against the work you expect after the first release as well as the initial build.',
        'An AI development partner can fit a defined project when your team lacks the capacity or specialist experience to deliver it. Assess how the partner understands your workflow, tests results, and works with your technical team. External delivery still needs an internal business owner who can make decisions, provide access, and review outcomes.',
        'An internal AI team can fit a long-term product capability with a steady roadmap and enough work to support dedicated roles. Plan for more than model development: product direction, data access, engineering, evaluation, and ongoing operation all need attention. Hiring only makes sense if the organization can support and manage that work.',
        'A hybrid approach combines internal business and product knowledge with external delivery capacity. It can help when your engineers need specialist support or want to build capability while delivering a project. Agree on documentation, access, knowledge transfer, and responsibility for changes at the start; these arrangements should be explicit in the project agreement.',
        'Compare total effort and cost over the same period. Include recruiting or partner fees, time from your own team, data preparation, integrations, model and infrastructure usage, testing, and maintenance. A lower initial quote does not settle the decision if it excludes work you will still have to do.',
        'Before choosing, ask each option to explain how it would deliver one representative workflow: what it needs from you, how success will be tested, what happens when it fails, and who will operate it after launch. At AI Crafters, this is the starting point for discussing whether a custom AI project fits your business.',
      ],
      he: [
        'מתחילים מהתפקיד של ה-AI בעסק. שיפור של תהליך מוגדר דורש כוח אדם שונה מיכולת AI שתפתחו באופן מתמשך. השוו בין שותף חיצוני, צוות פנימי ושילוב ביניהם לפי העבודה שצפויה אחרי ההשקה, לצד הפיתוח הראשוני.',
        'שותף לפיתוח AI יכול להתאים לפרויקט מוגדר כשחסרים בצוות זמן או ניסיון מקצועי לביצוע. בדקו איך השותף לומד את התהליך, בוחן תוצאות ועובד עם הצוות הטכנולוגי שלכם. גם עבודה עם ספק חיצוני דורשת אחראי עסקי פנימי שמקבל החלטות, מאפשר גישה למידע ובודק את התוצאות.',
        'צוות AI פנימי יכול להתאים ליכולת מוצרית ארוכת טווח עם תוכנית פיתוח רציפה ומספיק עבודה לתפקידים ייעודיים. צריך לתכנן מעבר לעבודה על מודלים: ניהול מוצר, גישה למידע, פיתוח, בדיקות ותפעול שוטף. גיוס מתאים כשהארגון יכול לתמוך בעבודה הזאת ולנהל אותה לאורך זמן.',
        'מודל משולב מחבר ידע עסקי ומוצרי פנימי עם יכולת ביצוע חיצונית. הוא יכול להתאים כשהמפתחים שלכם צריכים מומחיות נוספת או רוצים לצבור ניסיון תוך כדי פרויקט. הגדירו מראש תיעוד, הרשאות גישה, העברת ידע ואחריות לשינויים, ועגנו את ההסכמות בהסכם הפרויקט.',
        'השוו את העלות ואת היקף העבודה הכולל לאותה תקופה. כללו גיוס או שכר ספק, זמן של הצוות שלכם, הכנת מידע, חיבורים למערכות, שימוש במודלים ובתשתיות, בדיקות ותחזוקה. הצעה התחלתית זולה יותר לא מכריעה אם היא משאירה אצלכם עבודה נוספת.',
        'לפני הבחירה, בקשו מכל מועמד להסביר איך יבצע תהליך מייצג אחד: מה נדרש מכם, איך תיבדק ההצלחה, מה קורה כשמשהו נכשל ומי יתפעל את המערכת אחרי ההשקה. ב-AI Crafters זו נקודת ההתחלה לשיחה על התאמה של פרויקט AI לצרכים העסקיים שלכם.',
      ],
    },
  },
];

export const resourcePages = [
  {
    slug: 'ai-agent-rfp-checklist',
    title: {
      en: 'AI Agent Vendor Evaluation Checklist',
      he: 'צ׳קליסט לבחירת ספק לפיתוח סוכני AI',
    },
    metaTitle: {
      en: 'AI Agent RFP & Vendor Evaluation Checklist | AI Crafters',
      he: 'צ׳קליסט לבחירת ספק AI ולכתיבת RFP | AI Crafters',
    },
    description: {
      en: 'Preparing an AI agent RFP? Use these eight checks to compare proposals on business fit, integrations, testing, human control, and ongoing costs.',
      he: 'מכינים בקשה להצעת מחיר לפיתוח סוכן AI? שמונה בדיקות להשוואת ספקים לפי התאמה עסקית, חיבורים, בדיקות, בקרה אנושית ועלויות שוטפות.',
    },
    items: {
      en: [
        'Define the workflow and success criteria. Describe the trigger, users, current steps, volume, exceptions, and desired result. Record a baseline, such as handling time or manual steps, and ask each vendor how improvement will be measured.',
        'Document data readiness and access. List source systems, example inputs, content owners, permissions, and update frequency. Ask what cleanup or preparation is needed, who will do it, and how those tasks affect the scope.',
        'Check the integration plan. Identify the systems the agent must read from or update and the interfaces available. Ask vendors to explain permission requirements, approval steps, how duplicate actions are prevented, and recovery when a connected system is unavailable.',
        'Specify human control and exception handling. Define actions the AI may take, actions that need approval, and cases that must be routed to a person. Ask how users can review, stop, or correct work and what happens when information is incomplete.',
        'Agree on evaluation and acceptance. Provide representative examples and expected results, including difficult cases. Ask how correctness, unsupported answers, action failures, and access limits will be tested, and who decides whether the system is ready for use.',
        'Review data handling requirements. Ask which providers receive data, where processing and storage occur, what is retained, and which access or deletion controls are available. Have the relevant people in your organization check the proposal against your requirements.',
        'Compare the full commercial scope. Separate discovery, development, integrations, testing, and rollout from ongoing model, hosting, and support costs. Ask for assumptions, exclusions, dependencies, and the process for agreeing changes to scope or schedule.',
        'Define responsibilities after launch. Agree who monitors quality, handles incidents, updates source content, and tests model changes. Document the arrangements for code, accounts, documentation, knowledge transfer, and ending the engagement before selecting a vendor.',
      ],
      he: [
        'הגדירו את התהליך ואת מדדי ההצלחה. תארו מה מתחיל את התהליך, מי משתמש בו, מהם השלבים, מה נפח הפעילות ואילו מקרים חריגים קיימים. תעדו את המצב הנוכחי, למשל זמן טיפול או מספר פעולות ידניות, ובקשו מכל ספק להסביר איך יימדד השיפור.',
        'תעדו את מוכנות המידע ואת הגישה אליו. רשמו מערכות מקור, דוגמאות לקלט, אחראים לתוכן, הרשאות ותדירות עדכון. שאלו איזו הכנת מידע נדרשת, מי יבצע אותה ואיך היא משפיעה על היקף העבודה.',
        'בדקו את תוכנית החיבור למערכות. ציינו מאילו מערכות הסוכן צריך לקרוא מידע ואילו מערכות הוא צריך לעדכן. בקשו הסבר על הרשאות, שלבי אישור, מניעת פעולות כפולות והטיפול במערכת מחוברת שאינה זמינה.',
        'הגדירו שליטה אנושית וטיפול בחריגים. קבעו אילו פעולות ה-AI רשאי לבצע, מה דורש אישור ומה חייב לעבור לאדם. שאלו איך אפשר לבדוק, לעצור או לתקן עבודה ומה קורה כשחסר מידע.',
        'סכמו איך תיבדק המערכת ומתי תאושר לשימוש. העבירו דוגמאות מייצגות ותוצאות רצויות, כולל מקרים מורכבים. שאלו איך ייבדקו נכונות התשובות, תשובות ללא בסיס במקורות, כשלים בביצוע ומגבלות גישה, ומי יחליט שהמערכת מוכנה.',
        'בדקו את דרישות הטיפול במידע. שאלו אילו ספקים מקבלים מידע, היכן הוא מעובד ונשמר, מה נשמר לאורך זמן ואילו בקרות גישה ומחיקה זמינות. העבירו את ההצעה לבדיקה של הגורמים המתאימים בארגון מול הדרישות שלכם.',
        'השוו את היקף ההצעה המלא. הפרידו בין אפיון, פיתוח, חיבורים, בדיקות והטמעה לבין עלויות שימוש במודלים, אחסון ותמיכה. בקשו פירוט של הנחות, החרגות, תלויות והדרך להסכים על שינוי בהיקף או בלוח הזמנים.',
        'הגדירו אחריות אחרי ההשקה. סכמו מי מנטר איכות, מטפל בתקלות, מעדכן תוכן ובודק שינויים במודלים. לפני בחירת הספק, תעדו את ההסדרים לגבי קוד, חשבונות, תיעוד, העברת ידע וסיום ההתקשרות.',
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

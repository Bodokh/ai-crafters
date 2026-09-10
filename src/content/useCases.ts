export type LocaleKey = 'en' | 'he';

export type LocalizedText = Record<LocaleKey, string>;
export type LocalizedList = Record<LocaleKey, string[]>;

export type UseCase = {
  slug: string;
  status: LocalizedText;
  valueTheme: LocalizedText;
  title: LocalizedText;
  client: LocalizedText;
  eyebrow: LocalizedText;
  metric: LocalizedText;
  metricDetail: LocalizedText;
  summary: LocalizedText;
  problem: LocalizedText;
  built: LocalizedList;
  impact: LocalizedText;
  proof: LocalizedList;
};

export type LocalizedUseCase = {
  slug: string;
  status: string;
  valueTheme: string;
  title: string;
  client: string;
  eyebrow: string;
  metric: string;
  metricDetail: string;
  summary: string;
  problem: string;
  built: string[];
  impact: string;
  proof: string[];
};

export const useCasesOverview = {
  title: {
    en: 'Custom AI projects for business',
    he: 'פרויקטי AI בהתאמה אישית לעסקים',
  },
  eyebrow: {
    en: 'Selected client projects',
    he: 'פרויקטים נבחרים ללקוחות',
  },
  description: {
    en: 'Explore custom AI projects in insurance, retail analytics, fintech, M&A, and field services. Each solution is tailored to the client’s business and workflow.',
    he: 'פרויקטי AI בביטוח, בניתוח נתוני קמעונאות, בפינטק, במיזוגים ורכישות ובשירותי שטח. כל פתרון מותאם לעסק ולתהליכי העבודה של הלקוח.',
  },
  proofPoints: {
    en: [
      'Automating repetitive document work',
      'Answering questions from business data',
      'Voice agents for verification workflows',
      'AI expertise alongside internal teams',
    ],
    he: [
      'אוטומציה של עבודה חוזרת עם מסמכים',
      'תשובות לשאלות מתוך נתוני העסק',
      'סוכנים קוליים לתהליכי אימות',
      'מומחיות AI לצד צוותי הפיתוח שלכם',
    ],
  },
  cta: {
    en: 'Discuss your project',
    he: 'נדבר על הפרויקט שלכם',
  },
  viewCase: {
    en: 'Explore the project',
    he: 'לפרטי הפרויקט',
  },
  productionPattern: {
    en: 'Where custom AI can help',
    he: 'איפה AI מותאם יכול לעזור',
  },
  outcome: {
    en: 'Project highlight',
    he: 'במוקד הפרויקט',
  },
  backToUseCases: {
    en: 'Back to projects',
    he: 'חזרה לפרויקטים',
  },
  homepage: {
    title: {
      en: 'Custom AI',
      he: 'פרויקטי AI',
    },
    titleHighlight: {
      en: 'in Practice',
      he: 'נבחרים',
    },
    subtitle: {
      en: 'See how we tailor AI to client workflows, from insurance claims and business data to voice verification.',
      he: 'כך אנחנו מתאימים AI לתהליכי עבודה של לקוחות, מטיפול בתביעות ביטוח וניתוח נתונים ועד אימות קולי.',
    },
    showMore: {
      en: 'See more projects',
      he: 'לפרויקטים נוספים',
    },
    showLess: {
      en: 'Show fewer projects',
      he: 'הצגת פחות פרויקטים',
    },
  },
  sections: {
    problem: {
      en: 'The business challenge',
      he: 'האתגר העסקי',
    },
    built: {
      en: 'What we delivered',
      he: 'מה עשינו בפרויקט',
    },
    impact: {
      en: 'Business impact',
      he: 'הערך לעסק',
    },
    proof: {
      en: 'Project details',
      he: 'פרטי הפרויקט',
    },
    related: {
      en: 'More custom AI projects',
      he: 'עוד פרויקטי AI בהתאמה אישית',
    },
  },
};

export const useCases: UseCase[] = [
  {
    slug: 'insurance-claim-settlements',
    status: {
      en: 'In production',
      he: 'בשימוש פעיל',
    },
    valueTheme: {
      en: 'Less handling time + better service',
      he: 'חיסכון בזמן טיפול + שירות טוב יותר',
    },
    title: {
      en: 'AI Agent for Insurance Claim Settlements',
      he: 'סוכן AI לסילוק תביעות ביטוח',
    },
    client: {
      en: 'Health and medical insurer',
      he: 'חברת ביטוח בריאות ורפואה',
    },
    eyebrow: {
      en: 'Turn claim documents into payout recommendations for adjuster review.',
      he: 'ממסמכי התביעה להמלצת תשלום, לבדיקת מסלק התביעות.',
    },
    metric: {
      en: '~70% lower handling time',
      he: '~70% פחות זמן טיפול',
    },
    metricDetail: {
      en: 'Reported project outcome: average claim handling time fell from 10 minutes to 3.',
      he: 'תוצאה שדווחה בפרויקט: זמן הטיפול הממוצע בתביעה ירד מ-10 דקות ל-3.',
    },
    summary: {
      en: 'A custom AI agent reviews claim documents against the insurer’s procedures and prepares payout recommendations for an adjuster to review.',
      he: 'סוכן AI מותאם שבודק את מסמכי התביעה לפי נהלי חברת הביטוח ומכין המלצת תשלום לבדיקת מסלק התביעות.',
    },
    problem: {
      en: 'Claims were assessed by hand. Policyholders waited days for a decision while adjusters carried heavy, repetitive caseloads where small errors were easy to make.',
      he: 'תביעות נבדקו ידנית. מבוטחים חיכו ימים להחלטה, ומסלקים עבדו תחת עומס חוזר שבו קל לפספס פרט קטן.',
    },
    built: {
      en: [
        'A claims engine that accepts the policy, doctor summaries, invoices, and supporting paperwork.',
        'A workflow that follows the insurer’s own claims-processing procedure.',
        'A recommendation layer that prepares the proposed payout for adjuster review.',
      ],
      he: [
        'מנוע תביעות שמקבל פוליסה, סיכומי רופא, חשבוניות ומסמכים תומכים.',
        'תהליך עבודה שפועל לפי נוהל סילוק התביעות של חברת הביטוח.',
        'שכבת המלצה שמכינה את סכום התשלום המוצע לבדיקת המסלק.',
      ],
    },
    impact: {
      en: 'Less handling time per claim gives adjusters more capacity and helps policyholders receive decisions sooner. Consistent recommendations support a more efficient claims process.',
      he: 'פחות זמן טיפול בכל תביעה מאפשר למסלקים לטפל ביותר פניות ולמבוטחים לקבל החלטות מהר יותר. המלצות עקביות תומכות בתהליך סילוק יעיל יותר.',
    },
    proof: {
      en: [
        'Live in production',
        'Accuracy controls on every payout recommendation',
        'Grounded strictly in submitted policy terms',
      ],
      he: [
        'בשימוש פעיל',
        'בקרות דיוק על כל המלצת תשלום',
        'מבוסס רק על תנאי הפוליסה והמסמכים שהוגשו',
      ],
    },
  },
  {
    slug: 'business-intelligence-qa',
    status: {
      en: 'In production',
      he: 'בשימוש פעיל',
    },
    valueTheme: {
      en: 'Growth + new recurring revenue',
      he: 'צמיחה + הכנסה חוזרת חדשה',
    },
    title: {
      en: 'Custom AI Q&A for Business Intelligence',
      he: 'שאלות ותשובות עם AI על נתוני העסק',
    },
    client: {
      en: 'US retail analytics and business intelligence SaaS provider',
      he: 'חברת SaaS אמריקאית לניתוח נתוני קמעונאות ובינה עסקית',
    },
    eyebrow: {
      en: 'Let business users ask questions directly of their existing BI data.',
      he: 'מאפשרים למשתמשים עסקיים לשאול שאלות ישירות על הנתונים שכבר במערכת.',
    },
    metric: {
      en: 'New recurring-revenue module',
      he: 'רכיב מוצר חדש שמייצר הכנסה חוזרת',
    },
    metricDetail: {
      en: 'The reporting product gained a paid AI module that lets business users explore data through conversation.',
      he: 'למוצר הדוחות נוסף רכיב AI בתשלום, שמאפשר למשתמשים עסקיים לחקור את הנתונים באמצעות שיחה.',
    },
    summary: {
      en: 'An AI layer inside the existing BI product turns plain-language business questions into answers and charts from structured data.',
      he: 'שכבת AI בתוך מוצר הבינה העסקית הקיים הופכת שאלות בשפה יומיומית לתשובות ולגרפים מתוך הנתונים המובנים.',
    },
    problem: {
      en: 'Dashboards existed, but complex questions still required analysts to stitch together many queries in spreadsheets and pivot tables. Decision-makers waited on IT, and one quiet spreadsheet error could break the answer.',
      he: 'לוחות הבקרה כבר היו קיימים, אבל שאלות מורכבות עדיין דרשו עבודה של אנליסטים עם שאילתות, גיליונות נתונים וטבלאות ציר. מקבלי החלטות חיכו לתשובות, ושגיאה אחת בגיליון יכלה לשנות את התוצאה.',
    },
    built: {
      en: [
        'A natural-language AI layer over the existing BI data model.',
        'Precise retrieval and calculation logic for questions such as quarterly sell-through across top products.',
        'Charted answers delivered in seconds without SQL, exports, or spreadsheets.',
      ],
      he: [
        'שכבת AI שמאפשרת לשאול שאלות בשפה יומיומית על מודל הנתונים הקיים.',
        'מנגנון שליפה וחישוב לשאלות כמו איזה שיעור מהמלאי נמכר ברבעון בכל אחד מהמוצרים המובילים.',
        'תשובות וגרפים תוך שניות, בלי לכתוב שאילתות SQL, לייצא נתונים או לעבוד באקסל.',
      ],
    },
    impact: {
      en: 'The module makes BI accessible to merchandising, planning, operations, and leadership teams. It supports broader adoption and a paid upgrade path within the existing product.',
      he: 'הרכיב מרחיב את השימוש בנתונים לצוותי מסחר, תכנון, תפעול והנהלה. כך הוא תומך בהוספת משתמשים ובמעבר למסלולים בתשלום גבוה יותר במוצר הקיים.',
    },
    proof: {
      en: [
        'Live in production',
        'Precise natural-language retrieval over structured data',
        'Delivered as a productized revenue-generating module',
      ],
      he: [
        'בשימוש פעיל',
        'שליפה מדויקת של נתונים מובנים באמצעות שאלות בשפה יומיומית',
        'רכיב מוצר בתשלום שמייצר הכנסה',
      ],
    },
  },
  {
    slug: 'vendor-bank-verification',
    status: {
      en: 'In rollout',
      he: 'בתהליך הטמעה',
    },
    valueTheme: {
      en: 'Lower verification costs + market expansion',
      he: 'חיסכון בעלויות אימות + התרחבות לשווקים',
    },
    title: {
      en: 'AI Voice Agent for Vendor Bank Account Verification',
      he: 'סוכן AI קולי לאימות חשבונות בנק של ספקים',
    },
    client: {
      en: 'Fintech payment-security provider',
      he: 'חברת פינטק לאבטחת תשלומים',
    },
    eyebrow: {
      en: 'Automate vendor verification calls around a defined payment-security process.',
      he: 'אוטומציה של שיחות אימות לספקים, בהתאם לתהליך אבטחת התשלומים.',
    },
    metric: {
      en: 'Target: new markets without local callers',
      he: 'היעד: שווקים חדשים בלי נציגים מקומיים',
    },
    metricDetail: {
      en: 'The rollout aims to extend verification to markets that previously required local callers.',
      he: 'ההטמעה נועדה להרחיב את שירותי האימות לשווקים שבעבר דרשו נציגים מקומיים.',
    },
    summary: {
      en: 'A custom AI voice agent, now in rollout, conducts vendor callback checks with the aim of improving consistency and reducing cost per call.',
      he: 'סוכן AI קולי מותאם, שנמצא בתהליך הטמעה, מנהל שיחות חוזרות לאימות פרטי ספקים במטרה לשפר עקביות ולהפחית עלות לשיחה.',
    },
    problem: {
      en: 'Vendor bank verification uses callback calls to help detect business email compromise and fraudulent payment-detail changes before a new vendor is paid. Reliance on human callers made the process costly, inconsistent, and hard to scale internationally.',
      he: 'לפני תשלום לספק חדש, שיחות חוזרות לאימות חשבון הבנק עוזרות לזהות התחזות בדוא״ל ושינויים כוזבים בפרטי התשלום. התלות בנציגים אנושיים הפכה את התהליך ליקר, לא אחיד וקשה להרחבה למדינות נוספות.',
    },
    built: {
      en: [
        'An AI voice agent that conducts callback verification conversations itself.',
        'Conversation flows designed for natural interaction within a sensitive accounts-payable control.',
        'A repeatable verification workflow designed to follow the same standard on each call.',
      ],
      he: [
        'סוכן AI קולי שמנהל שיחות חוזרות לאימות פרטי ספקים.',
        'תהליכי שיחה טבעיים שמותאמים לבקרה רגישה לפני תשלום לספק.',
        'תהליך אימות שנועד לפעול לפי אותו נוהל בכל שיחה.',
      ],
    },
    impact: {
      en: 'The rollout targets a more consistent verification process, lower cost per call, and expansion into markets that previously required local callers.',
      he: 'יעדי ההטמעה הם תהליך אימות עקבי יותר, עלות נמוכה יותר לשיחה וכניסה לשווקים שבעבר דרשו נציגים מקומיים.',
    },
    proof: {
      en: [
        'In rollout',
        'Automates a previously manual fraud-control step before supplier payment',
        'Natural conversation designed around a consistent verification procedure',
      ],
      he: [
        'בתהליך הטמעה',
        'אוטומציה של שלב בקרת הונאה שבעבר בוצע על ידי נציגים בלבד',
        'שיחה טבעית שנבנתה סביב נוהל אימות אחיד',
      ],
    },
  },
  {
    slug: 'inspection-to-report',
    status: {
      en: 'In production',
      he: 'בשימוש פעיל',
    },
    valueTheme: {
      en: 'Growth + sales conversion',
      he: 'צמיחה + קידום עסקאות',
    },
    title: {
      en: 'AI Inspection-to-Report for Field Sales',
      he: 'AI שממיר בדיקת שטח לדוח מכירה',
    },
    client: {
      en: 'Home-services contractor for attic and crawl-space work',
      he: 'קבלן שירותי בית לעבודות עליות גג וחללי זחילה',
    },
    eyebrow: {
      en: 'Turn on-site inspection findings into a report and scope of work while the rep is still with the customer.',
      he: 'הופכים ממצאי בדיקת שטח לדוח ולהצעת עבודה, כשהנציג עדיין אצל הלקוח.',
    },
    metric: {
      en: '5 minutes to a finished report',
      he: '5 דקות לדוח מוכן',
    },
    metricDetail: {
      en: 'Reported project outcome: a finished report within 5 minutes of inspection, replacing a process that took more than a day or relied on a rough verbal offer.',
      he: 'תוצאה שדווחה בפרויקט: דוח מוכן תוך 5 דקות מהבדיקה, במקום להמתין יותר מיום או להסתפק בהצעה ראשונית בעל פה.',
    },
    summary: {
      en: 'Inspectors capture video and voice notes on site. A custom AI workflow turns those findings into a report and scope of work ready for signature.',
      he: 'בודקים מצלמים ומתעדים הערות קוליות בשטח. תהליך AI מותאם הופך את הממצאים לדוח ולהצעת עבודה מוכנה לחתימה.',
    },
    problem: {
      en: 'After an inspection, the rep either shared a preliminary report or waited more than a day to send a finished one. Prospects compared offers in the meantime, and deals were lost before the written proposal arrived.',
      he: 'אחרי בדיקה, הנציג היה מוסר דוח ראשוני או מחכה יותר מיום לשליחת דוח מסודר. בינתיים לקוחות השוו הצעות, ועסקאות אבדו עוד לפני שהגיעה ההצעה הכתובה.',
    },
    built: {
      en: [
        'An on-site app for capturing video and voice memos for each finding.',
        'AI-written report overview and finding descriptions.',
        'Severity classification, photo hazard annotation, and live transcription from voice memos.',
        'A scope of work ready for signature while the rep is still on site.',
      ],
      he: [
        'אפליקציית שטח לצילום וידאו ותיעוד הערות קוליות לכל ממצא.',
        'תקציר דוח ותיאורי ממצאים שנכתבים בעזרת AI.',
        'סיווג חומרה, סימון מפגעים בתמונות ותמלול חי מהערות קוליות.',
        'הצעת עבודה מפורטת ומוכנה לחתימה כשהנציג עדיין בבית הלקוח.',
      ],
    },
    impact: {
      en: 'A clear written proposal is available while the customer and rep can still discuss the findings together. The workflow is designed to shorten the sales cycle and help more inspections progress to signed orders.',
      he: 'הצעה כתובה וברורה זמינה כשהלקוח והנציג עדיין יכולים לעבור יחד על הממצאים. התהליך נועד לקצר את זמן המכירה ולעזור ליותר בדיקות להתקדם להזמנות חתומות.',
    },
    proof: {
      en: [
        'In production',
        'Finished report within 5 minutes of inspection',
        'Video and voice captured on site with no manual write-up',
      ],
      he: [
        'בשימוש פעיל',
        'דוח מוכן תוך 5 דקות מסיום הבדיקה',
        'וידאו וקול נאספים בשטח בלי כתיבה ידנית',
      ],
    },
  },
  {
    slug: 'cim-generator',
    status: {
      en: 'In production',
      he: 'בשימוש פעיל',
    },
    valueTheme: {
      en: 'Advisory + AI architecture',
      he: 'ייעוץ + תכנון מערכות AI',
    },
    title: {
      en: 'AI CIM Generator for M&A Advisory',
      he: 'יצירת מסמכי CIM עם AI למיזוגים ורכישות',
    },
    client: {
      en: 'Legacy AI, platform for business brokers and M&A advisors',
      he: 'Legacy AI, פלטפורמה למתווכים עסקיים וליועצי מיזוגים ורכישות',
    },
    eyebrow: {
      en: 'AI architecture and development support for Legacy AI’s flagship CIM generator.',
      he: 'תכנון ארכיטקטורה ופיתוח לצד הצוות של Legacy AI, במחולל מסמכי ה-CIM המרכזי של הפלטפורמה.',
    },
    metric: {
      en: 'From days to hours',
      he: 'מימים לשעות',
    },
    metricDetail: {
      en: 'Reported project outcome: CIM drafts are generated in 2 to 24 hours instead of days of manual work, depending on source-data quality.',
      he: 'תוצאה שדווחה בפרויקט: טיוטות CIM נוצרות בתוך 2 עד 24 שעות במקום ימים של עבודה ידנית, בהתאם לאיכות נתוני המקור.',
    },
    summary: {
      en: 'We advised on and helped build the next-generation architecture for Legacy AI’s flagship CIM generator, working alongside their internal product team.',
      he: 'ייעצנו ועזרנו לבנות את ארכיטקטורת הדור הבא למחולל ה-CIM של Legacy AI, לצד צוות המוצר הפנימי שלהם.',
    },
    problem: {
      en: 'A CIM presents a business to potential buyers and traditionally takes days of analyst work to prepare. For Legacy AI, improving the speed and quality of these drafts was central to its flagship product.',
      he: 'מסמך CIM מציג עסק לרוכשים פוטנציאליים, והכנתו הידנית דורשת בדרך כלל ימים של עבודת אנליסטים. עבור Legacy AI, שיפור מהירות היצירה ואיכות הטיוטות היה צורך מרכזי במוצר הדגל.',
    },
    built: {
      en: [
        'Specialist architecture leadership alongside Legacy AI’s in-house team.',
        'Hands-on development support for the new generation of the platform’s CIM generator.',
        'A product implementation that remains owned and operated by the client team.',
      ],
      he: [
        'הובלת ארכיטקטורה מקצועית לצד צוות הפיתוח הפנימי של Legacy AI.',
        'השתתפות בפיתוח הדור החדש של מחולל ה-CIM בפלטפורמה.',
        'מימוש שנשאר בבעלות ובהפעלה של צוות הלקוח.',
      ],
    },
    impact: {
      en: 'Generating drafts in 2 to 24 hours reduces the manual work needed to prepare a CIM and gives the platform capacity to support more clients. The client’s team owns and operates the product independently.',
      he: 'יצירת טיוטות בתוך 2 עד 24 שעות מצמצמת את העבודה הידנית בהכנת מסמכי CIM ומאפשרת לפלטפורמה לתמוך ביותר לקוחות. המוצר נשאר בבעלות צוות הלקוח ובהפעלתו העצמאית.',
    },
    proof: {
      en: [
        'In production and under active development',
        'Architecture led alongside the client’s product team',
        'The client team runs it independently',
      ],
      he: [
        'בשימוש פעיל וממשיך להתפתח',
        'הובלת ארכיטקטורה לצד צוות המוצר של הלקוח',
        'צוות הלקוח מפעיל את המערכת עצמאית',
      ],
    },
  },
];

const localizeUseCase = (useCase: UseCase, locale: LocaleKey): LocalizedUseCase => ({
  slug: useCase.slug,
  status: useCase.status[locale],
  valueTheme: useCase.valueTheme[locale],
  title: useCase.title[locale],
  client: useCase.client[locale],
  eyebrow: useCase.eyebrow[locale],
  metric: useCase.metric[locale],
  metricDetail: useCase.metricDetail[locale],
  summary: useCase.summary[locale],
  problem: useCase.problem[locale],
  built: useCase.built[locale],
  impact: useCase.impact[locale],
  proof: useCase.proof[locale],
});

export const useCaseSlugs = useCases.map((useCase) => useCase.slug);

export const FEATURED_USE_CASE_LIMIT = 3;

export const getUseCases = (locale: LocaleKey) =>
  useCases.map((useCase) => localizeUseCase(useCase, locale));

export const getFeaturedUseCases = (
  locale: LocaleKey,
  limit = FEATURED_USE_CASE_LIMIT,
) => getUseCases(locale).slice(0, limit);

export const getUseCase = (slug: string, locale: LocaleKey) => {
  const useCase = useCases.find((item) => item.slug === slug);

  if (!useCase) {
    return undefined;
  }

  return localizeUseCase(useCase, locale);
};

export const getRelatedUseCases = (slug: string, locale: LocaleKey, limit = 3) =>
  getUseCases(locale)
    .filter((useCase) => useCase.slug !== slug)
    .slice(0, limit);

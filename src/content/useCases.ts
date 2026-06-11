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
    en: 'AI systems shipped to production',
    he: 'מערכות AI שעלו לפרודקשן',
  },
  eyebrow: {
    en: 'Selected use cases',
    he: 'Use cases נבחרים',
  },
  description: {
    en: 'A sample of AI Crafters work across insurance, retail analytics, fintech, M&A software, and home services. Each system is grounded in the client data and workflow it needs to serve.',
    he: 'מדגם מעבודות AI Crafters בביטוח, אנליטיקת ריטייל, פינטק, תוכנות M&A ושירותי שטח. כל מערכת מבוססת על הדאטה, הנהלים ותהליכי העבודה של הלקוח.',
  },
  proofPoints: {
    en: [
      'Production-grade systems',
      'Grounded in client-owned data',
      'Accuracy controls and guardrails',
      'Measurable ROI on focused engagements',
    ],
    he: [
      'מערכות Production-grade',
      'מבוססות על דאטה של הלקוח',
      'בקרות דיוק ו-guardrails',
      'ROI מדיד בפרויקטים ממוקדים',
    ],
  },
  cta: {
    en: 'Talk to us',
    he: 'דברו איתנו',
  },
  viewCase: {
    en: 'View use case',
    he: 'לצפייה ב-use case',
  },
  productionPattern: {
    en: 'Production pattern',
    he: 'דפוסי פרודקשן',
  },
  outcome: {
    en: 'Outcome',
    he: 'תוצאה',
  },
  backToUseCases: {
    en: 'Back to use cases',
    he: 'חזרה ל-use cases',
  },
  sections: {
    problem: {
      en: 'The problem',
      he: 'הבעיה',
    },
    built: {
      en: 'What we built',
      he: 'מה בנינו',
    },
    impact: {
      en: 'Business impact',
      he: 'האימפקט העסקי',
    },
    proof: {
      en: 'Why it stands up',
      he: 'למה זה מחזיק',
    },
    related: {
      en: 'Related use cases',
      he: 'Use cases נוספים',
    },
  },
};

export const useCases: UseCase[] = [
  {
    slug: 'insurance-claim-settlements',
    status: {
      en: 'In production',
      he: 'בפרודקשן',
    },
    valueTheme: {
      en: 'Margin + customer experience',
      he: 'מרווחיות + חוויית לקוח',
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
      en: 'Document-grounded payout recommendations, handed straight to the adjuster.',
      he: 'המלצות תשלום מבוססות מסמכים, ישירות לשולחן של מסלק התביעות.',
    },
    metric: {
      en: '~70% lower handling time',
      he: '~70% פחות זמן טיפול',
    },
    metricDetail: {
      en: 'Average claim handling went from 10 minutes to 3. Work that once took days can now close in minutes.',
      he: 'זמן הטיפול הממוצע ירד מ-10 דקות ל-3. עבודה שבעבר נמרחה ימים נסגרת בדקות.',
    },
    summary: {
      en: 'The agent reads the same material a human adjuster receives, follows the insurer procedure, and returns the payout recommendation.',
      he: 'הסוכן קורא את אותם חומרים שמסלק אנושי מקבל, עובד לפי נוהל חברת הביטוח, ומחזיר המלצת תשלום.',
    },
    problem: {
      en: 'Claims were assessed by hand. Policyholders waited days for a decision while adjusters carried heavy, repetitive caseloads where small errors were easy to make.',
      he: 'תביעות נבדקו ידנית. מבוטחים חיכו ימים להחלטה, ומסלקים עבדו תחת עומס חוזר שבו קל לפספס פרט קטן.',
    },
    built: {
      en: [
        'A claims engine that accepts the policy, doctor summaries, invoices, and supporting paperwork.',
        'A workflow that runs the claim through the insurer own claims-processing procedure.',
        'A recommendation layer that returns the payout owed, ready for adjuster review.',
      ],
      he: [
        'מנוע תביעות שמקבל פוליסה, סיכומי רופא, חשבוניות ומסמכים תומכים.',
        'זרימת עבודה שמריצה את התביעה לפי נוהל סילוק התביעות של חברת הביטוח.',
        'שכבת המלצה שמחזירה את סכום התשלום המגיע למבוטח, מוכן לבדיקת המסלק.',
      ],
    },
    impact: {
      en: 'Faster settlements and more consistent payout recommendations reduce cost per claim while improving customer satisfaction and the insurer reputation for fast handling.',
      he: 'סילוק מהיר יותר והמלצות עקביות יותר מורידים עלות לתביעה, משפרים שביעות רצון, ובונים מוניטין של טיפול מהיר.',
    },
    proof: {
      en: [
        'Live in production',
        'Accuracy controls on every payout recommendation',
        'Grounded strictly in submitted policy terms',
      ],
      he: [
        'חי בפרודקשן',
        'בקרות דיוק על כל המלצת תשלום',
        'מבוסס רק על תנאי הפוליסה והמסמכים שהוגשו',
      ],
    },
  },
  {
    slug: 'business-intelligence-qa',
    status: {
      en: 'In production',
      he: 'בפרודקשן',
    },
    valueTheme: {
      en: 'Growth + new recurring revenue',
      he: 'צמיחה + הכנסה חוזרת חדשה',
    },
    title: {
      en: 'AI Q&A Layer over Business Intelligence',
      he: 'שכבת Q&A ב-AI מעל בינה עסקית',
    },
    client: {
      en: 'US retail-analytics / BI SaaS vendor',
      he: 'חברת SaaS אמריקאית לאנליטיקת ריטייל ו-BI',
    },
    eyebrow: {
      en: 'Plain-language answers over the existing data model, no analyst required.',
      he: 'תשובות בשפה טבעית מעל מודל הדאטה הקיים, בלי תלות באנליסט.',
    },
    metric: {
      en: 'New recurring-revenue module',
      he: 'מודול הכנסה חוזרת חדש',
    },
    metricDetail: {
      en: 'A passive reporting product became a paid AI layer that every business user can query.',
      he: 'מוצר דוחות פסיבי הפך לשכבת AI בתשלום שכל משתמש עסקי יכול לשאול.',
    },
    summary: {
      en: 'Users ask business questions in plain language and receive precise answers and charts from the existing structured data model.',
      he: 'משתמשים שואלים שאלות עסקיות בשפה טבעית ומקבלים תשובות וגרפים מדויקים מתוך מודל הדאטה המובנה.',
    },
    problem: {
      en: 'Dashboards existed, but complex questions still required analysts to stitch together many queries in spreadsheets and pivot tables. Decision-makers waited on IT, and one quiet spreadsheet error could break the answer.',
      he: 'היו דשבורדים, אבל שאלות מורכבות עדיין דרשו מאנליסטים לחבר עשרות שאילתות באקסלים וטבלאות ציר. מקבלי החלטות חיכו ל-IT, ושגיאה שקטה אחת יכלה לשבור את התשובה.',
    },
    built: {
      en: [
        'A natural-language AI layer over the existing BI data model.',
        'Precise retrieval and calculation logic for questions such as quarterly sell-through across top products.',
        'Charted answers delivered in seconds without SQL, exports, or spreadsheets.',
      ],
      he: [
        'שכבת AI בשפה טבעית מעל מודל ה-BI הקיים.',
        'לוגיקת שליפה וחישוב מדויקת לשאלות כמו sell-through רבעוני למוצרים מובילים.',
        'תשובות וגרפים תוך שניות, בלי SQL, ייצוא או אקסלים.',
      ],
    },
    impact: {
      en: 'Usage expands from a few analysts to merchandising, planning, operations, and executive teams. That supports seat expansion, higher-tier upsell, and stronger net revenue retention.',
      he: 'השימוש מתרחב ממספר אנליסטים לצוותי מרצנדייזינג, תכנון, תפעול והנהלה. זה תומך בהרחבת משתמשים, upsell למסלול גבוה יותר, ושיפור NRR.',
    },
    proof: {
      en: [
        'Live in production',
        'Precise natural-language retrieval over structured data',
        'Delivered as a productized revenue-generating module',
      ],
      he: [
        'חי בפרודקשן',
        'שליפה מדויקת בשפה טבעית מעל דאטה מובנה',
        'נארז כמודול מוצרי שמייצר הכנסה',
      ],
    },
  },
  {
    slug: 'vendor-bank-verification',
    status: {
      en: 'In rollout',
      he: 'ב-rollout',
    },
    valueTheme: {
      en: 'Margin + growth',
      he: 'מרווחיות + צמיחה',
    },
    title: {
      en: 'AI Voice Agent for Vendor Bank Account Verification',
      he: 'סוכן קול AI לאימות חשבונות בנק ספקים',
    },
    client: {
      en: 'Fintech payment-security provider',
      he: 'חברת פינטק לאבטחת תשלומים',
    },
    eyebrow: {
      en: 'Callback verification calls, automated end to end at human conversation level.',
      he: 'שיחות callback לאימות תשלום, אוטומטיות מקצה לקצה וברמת שיחה אנושית.',
    },
    metric: {
      en: 'New markets, no local callers',
      he: 'שווקים חדשים, בלי נציגים מקומיים',
    },
    metricDetail: {
      en: 'Verification coverage reaches markets that previously required on-the-ground callers.',
      he: 'כיסוי אימות מגיע לשווקים שבעבר דרשו נציגים מקומיים.',
    },
    summary: {
      en: 'The voice agent runs sensitive callback controls consistently and at lower cost per call, unlocking market expansion.',
      he: 'הסוכן הקולי מריץ בקרות callback רגישות בצורה עקבית ובעלות נמוכה יותר לשיחה, ופותח שווקים חדשים.',
    },
    problem: {
      en: 'Vendor bank account verification depends on callback calls that block business email compromise and payment-redirection fraud before a new vendor is paid. Human callers made the process costly, inconsistent, and hard to scale internationally.',
      he: 'אימות חשבון בנק ספק נשען על שיחות callback שחוסמות BEC והונאות שינוי פרטי תשלום לפני שמשלמים לספק חדש. נציגים אנושיים הפכו את התהליך ליקר, לא אחיד וקשה להרחבה בינלאומית.',
    },
    built: {
      en: [
        'An AI voice agent that conducts callback verification conversations itself.',
        'Conversation flows designed for human-level interaction in a sensitive AP / procure-to-pay control.',
        'Repeatable machine execution so every verification follows the same standard.',
      ],
      he: [
        'סוכן קול AI שמנהל בעצמו שיחות callback לאימות.',
        'זרימות שיחה שמתאימות לאינטראקציה אנושית בבקרה רגישה של AP / procure-to-pay.',
        'ביצוע מכונה עקבי כך שכל אימות עומד באותו סטנדרט.',
      ],
    },
    impact: {
      en: 'A sensitive fraud-control process becomes more consistent and cheaper per call, while expansion into markets that used to require local callers creates new customer and revenue opportunities.',
      he: 'בקרת הונאה רגישה הופכת עקבית וזולה יותר לשיחה, והתרחבות לשווקים שבעבר דרשו נציג מקומי מייצרת הזדמנויות ללקוחות ולהכנסה חדשה.',
    },
    proof: {
      en: [
        'In rollout',
        'Automates a human-only AP fraud-control stage',
        'Human-level conversation with machine-level consistency',
      ],
      he: [
        'ב-rollout',
        'ממכן שלב בקרת הונאה שבעבר היה אנושי בלבד',
        'שיחה ברמה אנושית עם עקביות של מכונה',
      ],
    },
  },
  {
    slug: 'inspection-to-report',
    status: {
      en: 'In production',
      he: 'בפרודקשן',
    },
    valueTheme: {
      en: 'Growth + sales conversion',
      he: 'צמיחה + המרת מכירות',
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
      en: 'Inspection findings become a signed-ready report before the rep leaves.',
      he: 'ממצאי בדיקה הופכים לדוח מוכן לחתימה לפני שנציג המכירות יוצא מהבית.',
    },
    metric: {
      en: '5 minutes to a clean report',
      he: '5 דקות לדוח נקי',
    },
    metricDetail: {
      en: 'The old flow took more than a day, or forced the rep to give a rough verbal offer on site.',
      he: 'התהליך הישן לקח יותר מיום, או הכריח את הנציג לתת הצעה מילולית גסה במקום.',
    },
    summary: {
      en: 'Inspectors capture video and voice findings on site, and the AI creates a signed-ready scope of work.',
      he: 'בודקים מצלמים ומתעדים ממצאים בקול בשטח, וה-AI יוצר scope of work מוכן לחתימה.',
    },
    problem: {
      en: 'After an inspection, the rep either handed over a rough report or waited more than a day to send a clean one. In that gap, prospects shopped the verbal offer to competitors and deals were lost.',
      he: 'אחרי בדיקה, הנציג היה מוסר דוח גס או מחכה יותר מיום לשלוח דוח נקי. בזמן הזה לקוחות השוו את ההצעה מול מתחרים, ועסקאות אבדו.',
    },
    built: {
      en: [
        'An on-site app for capturing video and voice memos for each finding.',
        'AI-written report overview and finding descriptions.',
        'Severity classification, photo hazard annotation, and live transcription from voice memos.',
        'A signed-ready scope of work delivered while the rep is still on site.',
      ],
      he: [
        'אפליקציית שטח ללכידת וידאו והערות קוליות לכל ממצא.',
        'סקירת דוח ותיאורי ממצאים שנכתבים על ידי AI.',
        'סיווג חומרה, סימון מפגעים בתמונות ותמלול חי מהערות קוליות.',
        'scope of work מוכן לחתימה בזמן שהנציג עדיין בבית הלקוח.',
      ],
    },
    impact: {
      en: 'The quote lands before the prospect can shop it around. That shortens the sales cycle and is built to turn more inspections into signed orders.',
      he: 'ההצעה מגיעה לפני שהלקוח מספיק להשוות אותה החוצה. זה מקצר את מחזור המכירה ונועד להפוך יותר בדיקות להזמנות חתומות.',
    },
    proof: {
      en: [
        'In production',
        'Clean report within 5 minutes of inspection',
        'Video and voice captured on site with no manual write-up',
      ],
      he: [
        'בפרודקשן',
        'דוח נקי תוך 5 דקות מסיום הבדיקה',
        'וידאו וקול נאספים בשטח בלי כתיבה ידנית',
      ],
    },
  },
  {
    slug: 'cim-generator',
    status: {
      en: 'In production',
      he: 'בפרודקשן',
    },
    valueTheme: {
      en: 'Advisory + AI architecture',
      he: 'ייעוץ + ארכיטקטורת AI',
    },
    title: {
      en: 'AI CIM Generator for M&A Advisory',
      he: 'מחולל CIM ב-AI לייעוץ M&A',
    },
    client: {
      en: 'Legacy AI, platform for business brokers and M&A advisors',
      he: 'Legacy AI, פלטפורמה לברוקרים עסקיים ויועצי M&A',
    },
    eyebrow: {
      en: 'Architecture leadership and hands-on build behind the platform flagship CIM generator.',
      he: 'הובלת ארכיטקטורה ובנייה Hands-on מאחורי מחולל ה-CIM המרכזי של הפלטפורמה.',
    },
    metric: {
      en: 'From days to hours',
      he: 'מימים לשעות',
    },
    metricDetail: {
      en: 'CIM drafts that take days by hand are generated in 2 to 24 hours, depending on source-data quality.',
      he: 'טיוטות CIM שלוקחות ימים ידנית נוצרות בתוך 2 עד 24 שעות, בהתאם לאיכות הדאטה שהלקוח מספק.',
    },
    summary: {
      en: 'We consulted on and helped build the next-generation architecture for Legacy AI flagship CIM generator, inside their product team.',
      he: 'ייעצנו ועזרנו לבנות את ארכיטקטורת הדור הבא למחולל ה-CIM המרכזי של Legacy AI, בתוך צוות המוצר שלהם.',
    },
    problem: {
      en: 'A CIM, the document that markets a business to buyers, traditionally takes days of junior-analyst work. For a platform whose flagship feature is CIM generation, generation speed and quality are the product.',
      he: 'CIM, המסמך שמשווק עסק לרוכשים, דורש באופן מסורתי ימים של עבודת אנליסטים. עבור פלטפורמה שמחולל CIM הוא מוצר הדגל שלה, מהירות ואיכות היצירה הן המוצר.',
    },
    built: {
      en: [
        'Specialist architecture leadership alongside Legacy AI in-house team.',
        'Hands-on work on the new generation of the platform CIM generator.',
        'A product implementation that remains owned and operated by the client team.',
      ],
      he: [
        'הובלת ארכיטקטורה מקצועית לצד צוות הפיתוח הפנימי של Legacy AI.',
        'עבודה Hands-on על הדור החדש של מחולל ה-CIM בפלטפורמה.',
        'מימוש מוצרי שנשאר בבעלות ובהפעלה של צוות הלקוח.',
      ],
    },
    impact: {
      en: 'Drafts that took days by hand now come out in 2 to 24 hours with repeatable quality. That gives the platform more capacity per engagement and room to serve more clients at once.',
      he: 'טיוטות שלקחו ימים ידנית יוצאות עכשיו בתוך 2 עד 24 שעות באיכות עקבית. זה נותן לפלטפורמה יותר קיבולת לכל התקשרות ויכולת לשרת יותר לקוחות במקביל.',
    },
    proof: {
      en: [
        'In production and under active development',
        'Architecture led inside the client product team',
        'The client team runs it independently',
      ],
      he: [
        'בפרודקשן ובפיתוח פעיל',
        'ארכיטקטורה שהובלה בתוך צוות המוצר של הלקוח',
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

export const getUseCases = (locale: LocaleKey) =>
  useCases.map((useCase) => localizeUseCase(useCase, locale));

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

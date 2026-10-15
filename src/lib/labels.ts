/** Arabic labels for every enum value used across the tools. */

export const NEWS_TYPES = {
  hard: "خبر مباشر",
  breaking: "خبر عاجل",
  feature: "قصة خبرية",
  press: "بيان صحفي",
  event: "تغطية فعالية",
} as const;

export const NEWS_AUDIENCES = {
  general: "الجمهور العام",
  specialists: "المختصون والمهنيون",
  youth: "الشباب",
  officials: "صناع القرار",
  internal: "منسوبو الجهة (اتصال داخلي)",
} as const;

export const EDITOR_ACTIONS = {
  rephrase: "إعادة صياغة",
  shorten: "اختصار",
  proofread: "تدقيق لغوي",
  headlines: "اقتراح عناوين",
} as const;

export const EDITOR_TONES = {
  neutral: "محايد",
  formal: "رسمي",
  simple: "مبسّط",
  engaging: "جاذب",
} as const;

export const SHORTEN_LENGTHS = {
  half: "إلى النصف تقريبًا",
  third: "إلى الثلث تقريبًا",
  tweet: "بطول تغريدة (280 حرفًا)",
} as const;

export const VIDEO_FORMATS = {
  report: "تقرير إخباري",
  explainer: "فيديو تفسيري",
  promo: "فيديو ترويجي",
  documentary: "فيلم وثائقي قصير",
  reel: "مقطع قصير (ريلز)",
} as const;

export const VIDEO_PLATFORMS = {
  youtube: "يوتيوب",
  instagram: "إنستغرام",
  tiktok: "تيك توك",
  x: "إكس",
  tv: "شاشة تلفزيونية",
  website: "الموقع الإلكتروني",
} as const;

export const VIDEO_TONES = {
  calm: "هادئ ورصين",
  energetic: "حيوي وسريع",
  formal: "رسمي",
  inspiring: "ملهم",
} as const;

export const SECTORS = {
  government: "القطاع الحكومي",
  media: "المؤسسات الإعلامية",
  education: "التعليم",
  health: "الصحة",
  private: "القطاع الخاص",
  nonprofit: "القطاع غير الربحي",
} as const;

export const LEVELS = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
} as const;

export const DELIVERY = {
  "in-person": "حضوري",
  online: "عن بُعد",
  hybrid: "مدمج",
} as const;

export const IDEA_PLATFORMS = {
  x: "إكس",
  instagram: "إنستغرام",
  tiktok: "تيك توك",
  youtube: "يوتيوب",
  linkedin: "لينكدإن",
  snapchat: "سناب شات",
  website: "الموقع الإلكتروني",
  tv: "التلفزيون",
} as const;

export const IDEA_AUDIENCES = {
  general: "الجمهور العام",
  youth: "الشباب",
  professionals: "المهنيون",
  families: "الأسر",
  "decision-makers": "صناع القرار",
  students: "الطلاب",
} as const;

export const IDEA_PURPOSES = {
  awareness: "التوعية",
  engagement: "رفع التفاعل",
  behavior: "تغيير السلوك",
  promotion: "الترويج لخدمة أو منتج",
  crisis: "اتصال الأزمات",
  education: "التثقيف والتعليم",
} as const;
